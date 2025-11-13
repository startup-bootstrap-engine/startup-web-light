## API Integrations

> **Related Documentation**: [Architecture Overview](./architecture-overview.md) | [Cloudflare Workers](./cloudflare-workers.md)

This document details the external API integrations used in the Reddit monitoring system.

---

### **Overview**

The system integrates with three main external APIs:
1. **Reddit API** - Fetch posts from subreddits
2. **OpenRouter API** - AI analysis of posts
3. **Telegram Bot API** - Send notifications

---

## **1. Reddit API**

### **Endpoint**
```
GET https://www.reddit.com/r/{subreddit}/new.json?limit=50
```

### **Authentication**
Reddit's public JSON API doesn't require OAuth for read-only access. However, you **must** include a custom User-Agent header.

### **Request Example**
```javascript
const response = await fetch(
  `https://www.reddit.com/r/${subreddit}/new.json?limit=50`,
  {
    headers: {
      'User-Agent': 'RedditMonitor/1.0 (by /u/YourRedditUsername)'
    }
  }
);
const data = await response.json();
```

### **Response Structure**
```json
{
  "kind": "Listing",
  "data": {
    "children": [
      {
        "kind": "t3",
        "data": {
          "id": "abc123",
          "title": "Post Title",
          "selftext": "Post content...",
          "author": "username",
          "subreddit": "javascript",
          "score": 42,
          "num_comments": 10,
          "url": "https://reddit.com/...",
          "permalink": "/r/javascript/comments/abc123/...",
          "created_utc": 1704067200
        }
      }
    ]
  }
}
```

### **Key Fields to Extract**
- `data.id` - Unique post identifier
- `data.title` - Post title
- `data.selftext` - Text content (empty for link posts)
- `data.author` - Username
- `data.subreddit` - Subreddit name
- `data.score` - Upvote count
- `data.num_comments` - Comment count
- `data.url` - Link URL
- `data.permalink` - Reddit permalink
- `data.created_utc` - Unix timestamp

### **Rate Limits**
- **60 requests per minute** per IP
- **Recommendation**: Cache responses and implement exponential backoff
- **Best Practice**: Fetch every 5-10 minutes to stay well within limits

### **Error Handling**
```javascript
async function fetchRedditPosts(subreddit) {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/new.json?limit=50`,
      {
        headers: {
          'User-Agent': 'RedditMonitor/1.0'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('Retry-After') || 60;
        throw new Error(`Rate limited. Retry after ${retryAfter}s`);
      }
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.children.map(child => child.data);
  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw error;
  }
}
```

---

## **2. OpenRouter API**

### **Endpoint**
```
POST https://openrouter.ai/api/v1/chat/completions
```

### **Authentication**
Requires API key in Authorization header.

### **Request Example**
```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://your-domain.com', // Optional
    'X-Title': 'Reddit Monitor' // Optional
  },
  body: JSON.stringify({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: 'You are a marketing assistant helping identify authentic engagement opportunities.'
      },
      {
        role: 'user',
        content: `Analyze this Reddit post and suggest how to authentically engage while subtly promoting [BRAND_NAME].

Title: ${post.title}
Content: ${post.selftext}
Subreddit: r/${post.subreddit}
Engagement: ${post.score} upvotes, ${post.num_comments} comments

Provide:
1. Engagement Strategy (how to add value first)
2. Brand Opportunity (natural way to mention brand)
3. Recommended Action (specific comment/reply suggestion)
4. Confidence Score (0-1, how good is this opportunity)`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
const analysis = data.choices[0].message.content;
```

### **Response Structure**
```json
{
  "id": "gen-abc123",
  "model": "anthropic/claude-3.5-sonnet",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "1. Engagement Strategy:\n..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  }
}
```

### **Recommended Models**
- **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`) - Best quality
- **GPT-4 Turbo** (`openai/gpt-4-turbo`) - Good alternative
- **Claude 3 Haiku** (`anthropic/claude-3-haiku`) - Faster, cheaper

### **Cost Management**
```javascript
// Track token usage for cost monitoring
const { prompt_tokens, completion_tokens } = data.usage;

await supabase
  .from('ai_analysis')
  .insert({
    post_id: postId,
    engagement_strategy: parsedStrategy,
    prompt_tokens,
    completion_tokens,
    ai_model: 'anthropic/claude-3.5-sonnet'
  });
```

### **Error Handling**
```javascript
async function analyzeWithAI(post, apiKey) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [/* ... */]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}
```

---

## **3. Telegram Bot API**

### **Setup**
1. Message `@BotFather` on Telegram
2. Create new bot with `/newbot`
3. Save the bot token
4. Get your chat ID by messaging `@userinfobot`

### **Send Message Endpoint**
```
POST https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
```

### **Request Example**
```javascript
async function sendTelegramNotification(botToken, chatId, analysis, post) {
  const text = `🔥 *Reddit Opportunity Detected*

*Post:* ${post.title}
*Subreddit:* r/${post.subreddit}
*Engagement:* ${post.score} upvotes, ${post.num_comments} comments

*Strategy:* ${analysis.engagement_strategy}

*Brand Opportunity:* ${analysis.brand_opportunity}

*Recommended Action:* ${analysis.recommended_action}

*Confidence:* ${(analysis.confidence_score * 100).toFixed(0)}%`;

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔗 View Post", url: `https://reddit.com${post.permalink}` },
              { text: "✅ Mark Engaged", callback_data: `engaged_${analysis.id}` }
            ],
            [
              { text: "🚫 Dismiss", callback_data: `dismiss_${analysis.id}` }
            ]
          ]
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Telegram error: ${response.status}`);
  }

  const data = await response.json();
  return data.result.message_id;
}
```

### **Handle Callback Queries**
```javascript
// In your Telegram webhook worker
async function handleCallbackQuery(callbackQuery, supabase) {
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

  if (data.startsWith('engaged_')) {
    const analysisId = data.replace('engaged_', '');

    // Update notification status
    await supabase
      .from('notifications')
      .update({ is_engaged: true })
      .eq('analysis_id', analysisId);

    // Acknowledge callback
    await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: '✅ Marked as engaged!'
        })
      }
    );
  }
}
```

### **Rate Limits**
- **30 messages per second** to the same chat
- **20 messages per minute** to different chats
- **Recommendation**: Queue notifications if sending many at once

### **Message Formatting**
Telegram supports Markdown and HTML:
- **Bold**: `*text*` or `<b>text</b>`
- **Italic**: `_text_` or `<i>text</i>`
- **Code**: `` `code` ``
- **Link**: `[text](url)`

---

## **API Keys Management**

### **Cloudflare Workers Secrets**
```bash
# Set secrets (do NOT commit to git)
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_KEY
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

### **Access in Worker**
```javascript
export default {
  async scheduled(event, env, ctx) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_KEY;
    const openRouterKey = env.OPENROUTER_API_KEY;
    // Use secrets...
  }
};
```

---

## **Error Handling Best Practices**

### **Retry Logic**
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      if (response.status === 429) {
        // Exponential backoff
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
        continue;
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### **Logging**
```javascript
// Log API calls for debugging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  api: 'reddit',
  subreddit,
  status: response.status,
  posts_fetched: posts.length
}));
```

---

## **Testing APIs**

See [deployment-guide.md](./deployment-guide.md#testing-apis) for testing instructions.
