## Cloudflare Workers Implementation

> **Related Documentation**: [Architecture Overview](./architecture-overview.md) | [API Integrations](./api-integrations.md) | [Deployment Guide](./deployment-guide.md)

This document provides implementation details for the Cloudflare Workers that power the Reddit monitoring system.

---

## **Architecture**

Two main workers handle different responsibilities:

1. **Reddit Monitor Worker** - Scheduled (cron-triggered) job that fetches posts
2. **AI Processor Worker** - Processes posts through OpenRouter for analysis
3. **Telegram Webhook Worker** - Handles Telegram bot interactions

---

## **Worker 1: Reddit Monitor**

### **Purpose**
Fetches new posts from monitored subreddits every 5-10 minutes and stores them in Supabase.

### **Trigger**
Cron schedule: `*/10 * * * *` (every 10 minutes)

### **Implementation**

#### `wrangler.toml`
```toml
name = "reddit-monitor"
main = "src/reddit-monitor.ts"
compatibility_date = "2024-01-01"

[triggers]
crons = ["*/10 * * * *"]

[vars]
ENVIRONMENT = "production"
USER_AGENT = "RedditMonitor/1.0 (Monitoring Tool)"
```

#### `src/reddit-monitor.ts`
```typescript
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  url: string;
  permalink: string;
  created_utc: number;
}

interface MonitoredSubreddit {
  id: string;
  name: string;
  min_upvotes: number;
  min_comments: number;
  keywords: string[];
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Reddit monitor cron triggered:', new Date().toISOString());

    try {
      // 1. Fetch monitored subreddits from Supabase
      const subreddits = await fetchMonitoredSubreddits(env);
      console.log(`Monitoring ${subreddits.length} subreddits`);

      // 2. Process each subreddit
      for (const subreddit of subreddits) {
        await processSubreddit(subreddit, env);
      }

      console.log('Reddit monitor completed successfully');
    } catch (error) {
      console.error('Reddit monitor error:', error);
      // Don't throw - we want the worker to complete even if one iteration fails
    }
  },
};

async function fetchMonitoredSubreddits(env: Env): Promise<MonitoredSubreddit[]> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/monitored_subreddits?is_active=eq.true`, {
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subreddits: ${response.status}`);
  }

  return await response.json();
}

async function processSubreddit(subreddit: MonitoredSubreddit, env: Env) {
  console.log(`Processing r/${subreddit.name}`);

  try {
    // 1. Fetch posts from Reddit
    const posts = await fetchRedditPosts(subreddit.name);
    console.log(`Fetched ${posts.length} posts from r/${subreddit.name}`);

    // 2. Filter posts
    const filteredPosts = posts.filter(post => {
      // Check engagement thresholds
      if (post.score < subreddit.min_upvotes) return false;
      if (post.num_comments < subreddit.min_comments) return false;

      // Check keywords (if any)
      if (subreddit.keywords && subreddit.keywords.length > 0) {
        const text = `${post.title} ${post.selftext}`.toLowerCase();
        const hasKeyword = subreddit.keywords.some(keyword =>
          text.includes(keyword.toLowerCase())
        );
        if (!hasKeyword) return false;
      }

      return true;
    });

    console.log(`${filteredPosts.length} posts passed filters`);

    // 3. Check for duplicates and insert new posts
    for (const post of filteredPosts) {
      await insertPostIfNew(post, subreddit.id, env);
    }
  } catch (error) {
    console.error(`Error processing r/${subreddit.name}:`, error);
  }
}

async function fetchRedditPosts(subreddit: string): Promise<RedditPost[]> {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/new.json?limit=50`,
    {
      headers: {
        'User-Agent': 'RedditMonitor/1.0',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limited by Reddit');
    }
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.children.map((child: any) => child.data);
}

async function insertPostIfNew(post: RedditPost, subredditId: string, env: Env) {
  // Check if post already exists
  const checkResponse = await fetch(
    `${env.SUPABASE_URL}/rest/v1/processed_posts?reddit_post_id=eq.${post.id}`,
    {
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const existing = await checkResponse.json();
  if (existing.length > 0) {
    return; // Post already processed
  }

  // Insert new post
  const insertResponse = await fetch(
    `${env.SUPABASE_URL}/rest/v1/processed_posts`,
    {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        reddit_post_id: post.id,
        subreddit_id: subredditId,
        title: post.title,
        content: post.selftext,
        author: post.author,
        subreddit: post.subreddit,
        upvotes: post.score,
        comment_count: post.num_comments,
        url: post.url,
        permalink: post.permalink,
        created_utc: new Date(post.created_utc * 1000).toISOString(),
      }),
    }
  );

  if (insertResponse.ok) {
    console.log(`Inserted new post: ${post.title.substring(0, 50)}...`);
  } else {
    console.error(`Failed to insert post: ${insertResponse.status}`);
  }
}
```

---

## **Worker 2: AI Processor**

### **Purpose**
Processes new posts through OpenRouter for AI analysis and sends notifications.

### **Trigger**
Either:
- Supabase webhook on `processed_posts` INSERT
- Separate cron job that queries for unanalyzed posts

### **Implementation (Webhook Version)**

#### `wrangler.toml`
```toml
name = "ai-processor"
main = "src/ai-processor.ts"
compatibility_date = "2024-01-01"
```

#### `src/ai-processor.ts`
```typescript
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  OPENROUTER_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  subreddit: string;
  upvotes: number;
  comment_count: number;
  permalink: string;
}

interface Analysis {
  engagement_strategy: string;
  brand_opportunity: string;
  recommended_action: string;
  confidence_score: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle webhook from Supabase
    if (request.method === 'POST') {
      const webhook = await request.json();

      // Process the new post
      if (webhook.type === 'INSERT' && webhook.record) {
        await processPost(webhook.record, env);
        return new Response('OK', { status: 200 });
      }
    }

    return new Response('Method not allowed', { status: 405 });
  },
};

async function processPost(post: Post, env: Env) {
  console.log(`Processing post: ${post.title}`);

  try {
    // 1. Analyze with AI
    const analysis = await analyzeWithAI(post, env);
    console.log(`Analysis complete. Confidence: ${analysis.confidence_score}`);

    // 2. Save analysis to database
    const analysisId = await saveAnalysis(post.id, analysis, env);

    // 3. Send notification if confidence is high enough
    if (analysis.confidence_score >= 0.6) {
      await sendTelegramNotification(post, analysis, analysisId, env);
    }
  } catch (error) {
    console.error('Error processing post:', error);
  }
}

async function analyzeWithAI(post: Post, env: Env): Promise<Analysis> {
  const prompt = `Analyze this Reddit post and suggest how to authentically engage while subtly promoting a brand.

Title: ${post.title}
Content: ${post.content || '(link post)'}
Subreddit: r/${post.subreddit}
Engagement: ${post.upvotes} upvotes, ${post.comment_count} comments

Provide your response in this exact format:

ENGAGEMENT STRATEGY:
[How to add value and engage authentically]

BRAND OPPORTUNITY:
[Natural way to mention the brand without being spammy]

RECOMMENDED ACTION:
[Specific comment or reply to post]

CONFIDENCE SCORE:
[0.0 to 1.0 - how good is this opportunity]`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing assistant helping identify authentic engagement opportunities on Reddit. Always prioritize adding value over promotion.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Parse the structured response
  const analysis = parseAnalysis(content);

  return {
    ...analysis,
    // Store token usage for cost tracking
    prompt_tokens: data.usage.prompt_tokens,
    completion_tokens: data.usage.completion_tokens,
  };
}

function parseAnalysis(content: string): Analysis {
  const extractSection = (label: string) => {
    const regex = new RegExp(`${label}:\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  };

  const confidenceMatch = content.match(/CONFIDENCE SCORE:\\s*([0-9.]+)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;

  return {
    engagement_strategy: extractSection('ENGAGEMENT STRATEGY'),
    brand_opportunity: extractSection('BRAND OPPORTUNITY'),
    recommended_action: extractSection('RECOMMENDED ACTION'),
    confidence_score: Math.min(Math.max(confidence, 0), 1), // Clamp 0-1
  };
}

async function saveAnalysis(postId: string, analysis: Analysis, env: Env): Promise<string> {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/ai_analysis`,
    {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        post_id: postId,
        engagement_strategy: analysis.engagement_strategy,
        brand_opportunity: analysis.brand_opportunity,
        recommended_action: analysis.recommended_action,
        confidence_score: analysis.confidence_score,
        ai_model: 'anthropic/claude-3.5-sonnet',
      }),
    }
  );

  const data = await response.json();
  return data[0].id;
}

async function sendTelegramNotification(
  post: Post,
  analysis: Analysis,
  analysisId: string,
  env: Env
) {
  const confidencePercent = (analysis.confidence_score * 100).toFixed(0);

  const text = `🔥 *Reddit Opportunity Detected*

*Post:* ${post.title}
*Subreddit:* r/${post.subreddit}
*Engagement:* ${post.upvotes} upvotes, ${post.comment_count} comments

*Strategy:*
${analysis.engagement_strategy}

*Brand Opportunity:*
${analysis.brand_opportunity}

*Recommended Action:*
${analysis.recommended_action}

*Confidence:* ${confidencePercent}%`;

  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔗 View Post', url: `https://reddit.com${post.permalink}` },
              { text: '✅ Engaged', callback_data: `engaged_${analysisId}` },
            ],
            [
              { text: '🚫 Dismiss', callback_data: `dismiss_${analysisId}` },
            ],
          ],
        },
      }),
    }
  );

  if (response.ok) {
    const data = await response.json();

    // Save notification record
    await fetch(`${env.SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysis_id: analysisId,
        sent_to_telegram: true,
        telegram_message_id: data.result.message_id.toString(),
        sent_at: new Date().toISOString(),
      }),
    });
  }
}
```

---

## **Worker 3: Telegram Webhook**

### **Purpose**
Handles Telegram bot commands and callback queries (button clicks).

### **Implementation**

```typescript
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('OK', { status: 200 });
    }

    const update = await request.json();

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, env);
    }

    // Handle commands
    if (update.message?.text) {
      await handleCommand(update.message, env);
    }

    return new Response('OK', { status: 200 });
  },
};

async function handleCallbackQuery(callbackQuery: any, env: Env) {
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  if (data.startsWith('engaged_')) {
    const analysisId = data.replace('engaged_', '');

    // Update notification
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/notifications?analysis_id=eq.${analysisId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_engaged: true }),
      }
    );

    // Acknowledge
    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: '✅ Marked as engaged!',
        }),
      }
    );
  } else if (data.startsWith('dismiss_')) {
    const analysisId = data.replace('dismiss_', '');

    await fetch(
      `${env.SUPABASE_URL}/rest/v1/notifications?analysis_id=eq.${analysisId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      }
    );

    await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: 'Dismissed',
        }),
      }
    );
  }
}

async function handleCommand(message: any, env: Env) {
  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    await sendMessage(
      chatId,
      'Welcome to Reddit Monitor! You will receive notifications when new opportunities are found.',
      env
    );
  } else if (text === '/stats') {
    // Fetch stats from database
    const stats = await fetchStats(env);
    await sendMessage(chatId, stats, env);
  }
}

async function sendMessage(chatId: number, text: string, env: Env) {
  await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  );
}

async function fetchStats(env: Env): Promise<string> {
  // Query database for statistics
  // Return formatted string
  return 'Statistics coming soon!';
}
```

---

## **Deployment**

```bash
# Deploy all workers
npx wrangler deploy --name reddit-monitor
npx wrangler deploy --name ai-processor
npx wrangler deploy --name telegram-webhook

# Set webhook for Telegram
curl -X POST "https://api.telegram.org/botYOUR_TOKEN/setWebhook" \
  -d "url=https://telegram-webhook.your-subdomain.workers.dev"
```

---

## **Monitoring**

### **View Logs**
```bash
npx wrangler tail reddit-monitor
npx wrangler tail ai-processor
```

### **Metrics**
- Cloudflare Dashboard → Workers → Analytics
- Track: Requests, Errors, CPU time

---

## **Cost Optimization**

- Use appropriate cron frequency (don't over-poll)
- Cache Reddit responses where possible
- Only analyze high-engagement posts
- Use cheaper AI models for initial filtering

See [deployment-guide.md](./deployment-guide.md) for complete deployment instructions.
