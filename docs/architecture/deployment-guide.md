## Deployment Guide

> **Related Documentation**: [Architecture Overview](./architecture-overview.md) | [Cloudflare Workers](./cloudflare-workers.md) | [Database Schema](./database-schema.md)

This guide walks through deploying the Reddit monitoring system from scratch.

---

## **Prerequisites**

- **Node.js** 18+ installed
- **Git** installed
- **Accounts**:
  - [Cloudflare](https://dash.cloudflare.com/sign-up) (free tier)
  - [Supabase](https://supabase.com) (free tier)
  - [OpenRouter](https://openrouter.ai) (pay-per-use)
  - Telegram account

---

## **Phase 1: Foundation Setup**

### **1.1 Supabase Setup**

#### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set database password (save it!)
5. Wait for provisioning (~2 minutes)

#### Create Database Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: monitored_subreddits
CREATE TABLE monitored_subreddits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  min_upvotes INTEGER DEFAULT 10,
  min_comments INTEGER DEFAULT 5,
  keywords TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: processed_posts
CREATE TABLE processed_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reddit_post_id TEXT NOT NULL UNIQUE,
  subreddit_id UUID REFERENCES monitored_subreddits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  author TEXT,
  subreddit TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  url TEXT NOT NULL,
  permalink TEXT,
  created_utc TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: ai_analysis
CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES processed_posts(id) ON DELETE CASCADE,
  engagement_strategy TEXT NOT NULL,
  brand_opportunity TEXT,
  recommended_action TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES ai_analysis(id) ON DELETE CASCADE,
  sent_to_telegram BOOLEAN DEFAULT false,
  telegram_message_id TEXT,
  is_read BOOLEAN DEFAULT false,
  is_engaged BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_monitored_subreddits_active ON monitored_subreddits(is_active);
CREATE INDEX idx_processed_posts_reddit_id ON processed_posts(reddit_post_id);
CREATE INDEX idx_processed_posts_fetched_at ON processed_posts(fetched_at DESC);
CREATE INDEX idx_ai_analysis_post_id ON ai_analysis(post_id);
CREATE INDEX idx_ai_analysis_confidence ON ai_analysis(confidence_score DESC);
CREATE INDEX idx_notifications_analysis_id ON notifications(analysis_id);
```

#### Enable Row Level Security
```sql
-- Enable RLS
ALTER TABLE monitored_subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (adjust based on your needs)
CREATE POLICY "Enable all for authenticated users" ON monitored_subreddits
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON processed_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON ai_analysis
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON notifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role full access (for workers)
CREATE POLICY "Enable all for service role" ON monitored_subreddits
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON processed_posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON ai_analysis
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON notifications
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

#### Enable Realtime
1. Go to **Database** → **Replication**
2. Enable replication for:
   - `ai_analysis`
   - `notifications`

#### Save Connection Details
Go to **Settings** → **API** and save:
- `Project URL` (SUPABASE_URL)
- `anon public` key (SUPABASE_ANON_KEY)
- `service_role` key (SUPABASE_SERVICE_KEY) - use this for workers

---

### **1.2 Telegram Bot Setup**

#### Create Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow prompts to name your bot
4. Save the **bot token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Get Your Chat ID
1. Search for `@userinfobot` on Telegram
2. Send `/start`
3. Save your **chat ID** (a number like `123456789`)

---

### **1.3 OpenRouter Setup**

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign in with Google/GitHub
3. Go to **Keys** → **Create Key**
4. Save your **API key**
5. Add credits (minimum $5)

---

### **1.4 Cloudflare Workers Setup**

#### Install Wrangler CLI
```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Create Workers Project
```bash
# Create directory
mkdir reddit-monitor-workers
cd reddit-monitor-workers

# Initialize project
npm init -y
npm install -D wrangler

# Create worker files (we'll add code later)
mkdir -p src
touch src/reddit-monitor.ts
touch src/ai-processor.ts
touch wrangler.toml
```

---

## **Phase 2: Deploy Workers**

### **2.1 Configure wrangler.toml**

Create `wrangler.toml`:
```toml
name = "reddit-monitor"
main = "src/reddit-monitor.ts"
compatibility_date = "2024-01-01"

[triggers]
crons = ["*/10 * * * *"]  # Every 10 minutes

[[d1_databases]]
binding = "DB"
database_name = "reddit-monitor-db"
database_id = "your-d1-id"  # Optional: if using D1 for caching

# Environment variables (non-sensitive)
[vars]
ENVIRONMENT = "production"
```

### **2.2 Set Secrets**

```bash
# Set all secrets (you'll be prompted to enter each)
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_KEY
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

### **2.3 Deploy Reddit Monitor Worker**

Create `src/reddit-monitor.ts` (see [cloudflare-workers.md](./cloudflare-workers.md) for full code).

Deploy:
```bash
npx wrangler deploy
```

### **2.4 Deploy AI Processor Worker**

For the AI processor, you can either:
- Use the same worker with different routes
- Create a separate worker triggered by Supabase webhooks

**Option: Supabase Webhook Trigger**
1. Go to Supabase Dashboard → **Database** → **Webhooks**
2. Create webhook for `processed_posts` table on `INSERT`
3. Set webhook URL to your worker: `https://ai-processor.your-subdomain.workers.dev`

---

## **Phase 3: Frontend Deployment**

### **3.1 Environment Variables**

Create `.env.local`:
```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME="Reddit Monitor"
```

### **3.2 Deploy to Cloudflare Pages**

```bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=reddit-monitor
```

Or connect to GitHub for automatic deployments:
1. Go to Cloudflare Dashboard → **Pages**
2. **Create a project** → **Connect to Git**
3. Select your repository
4. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables
6. Deploy

---

## **Phase 4: Initial Configuration**

### **4.1 Add Test Subreddits**

Go to Supabase SQL Editor:
```sql
INSERT INTO monitored_subreddits (name, min_upvotes, min_comments, keywords)
VALUES
  ('javascript', 20, 5, ARRAY['react', 'vue', 'typescript']),
  ('webdev', 15, 3, ARRAY['frontend', 'backend', 'fullstack']),
  ('programming', 50, 10, ARRAY['career', 'learning', 'tutorial']);
```

### **4.2 Test Worker Manually**

Trigger the cron job manually:
```bash
npx wrangler dev

# In another terminal
curl http://localhost:8787/__scheduled?cron=*/10+*+*+*+*
```

---

## **Phase 5: Monitoring & Verification**

### **5.1 Check Worker Logs**

```bash
# Live tail logs
npx wrangler tail

# View in dashboard
# Go to Cloudflare Dashboard → Workers → reddit-monitor → Logs
```

### **5.2 Verify Database**

Check that posts are being fetched:
```sql
SELECT COUNT(*) FROM processed_posts;
SELECT * FROM processed_posts ORDER BY fetched_at DESC LIMIT 10;
```

### **5.3 Test Telegram Notifications**

After first AI analysis runs, check:
1. Telegram for notification
2. Supabase `notifications` table for records

```sql
SELECT
  n.*,
  a.confidence_score,
  p.title
FROM notifications n
JOIN ai_analysis a ON n.analysis_id = a.id
JOIN processed_posts p ON a.post_id = p.id
ORDER BY n.created_at DESC;
```

---

## **Testing APIs**

### **Test Reddit API**
```bash
curl -H "User-Agent: RedditMonitor/1.0" \
  "https://www.reddit.com/r/javascript/new.json?limit=5"
```

### **Test OpenRouter API**
```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

### **Test Telegram API**
```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "text": "Test message from Reddit Monitor"
  }'
```

---

## **Troubleshooting**

### **Workers Not Running**
```bash
# Check cron schedule
npx wrangler deployments list

# Check worker status
npx wrangler tail --format=pretty
```

### **Database Connection Issues**
- Verify `SUPABASE_SERVICE_KEY` is set (not anon key)
- Check RLS policies allow service role access
- Verify Supabase project is not paused (free tier pauses after 1 week inactivity)

### **No Telegram Notifications**
- Verify bot token with: `https://api.telegram.org/botYOUR_TOKEN/getMe`
- Verify chat ID is correct
- Check `notifications` table for `sent_to_telegram = false`

### **High OpenRouter Costs**
- Reduce AI analysis frequency
- Add confidence threshold to only analyze high-engagement posts
- Switch to cheaper model (Claude Haiku instead of Sonnet)

---

## **Production Checklist**

- [ ] All secrets set in Cloudflare Workers
- [ ] RLS policies enabled on all Supabase tables
- [ ] Realtime enabled for `ai_analysis` and `notifications`
- [ ] Cron schedule set to reasonable frequency (5-10 min)
- [ ] Rate limiting implemented for Reddit API
- [ ] Error handling and logging in place
- [ ] Telegram bot responding to commands
- [ ] Frontend deployed and accessible
- [ ] At least 2-3 test subreddits configured
- [ ] Monitoring/alerting configured (Cloudflare Analytics)

---

## **Next Steps**

Once deployed:
1. Monitor for 24 hours to verify everything works
2. Adjust subreddit filters based on quality of opportunities
3. Fine-tune AI prompts for better analysis
4. Add more subreddits gradually
5. Review costs and optimize if needed

See [frontend-implementation.md](./frontend-implementation.md) for building the dashboard.
