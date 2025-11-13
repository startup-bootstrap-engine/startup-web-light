## Database Schema

> **Related Documentation**: [Architecture Overview](./architecture-overview.md)

This document details the Supabase database schema for the Reddit monitoring system.

---

### **Schema Overview**

The system uses four main tables to manage subreddit monitoring, post processing, AI analysis, and notifications.

---

### **Table Definitions**

#### **1. monitored_subreddits**

Stores configuration for subreddits being monitored.

```sql
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

-- Indexes
CREATE INDEX idx_monitored_subreddits_active ON monitored_subreddits(is_active);
CREATE INDEX idx_monitored_subreddits_name ON monitored_subreddits(name);
```

**Fields:**
- `id`: Unique identifier
- `name`: Subreddit name (without r/ prefix)
- `min_upvotes`: Minimum upvotes threshold for post filtering
- `min_comments`: Minimum comment count threshold
- `keywords`: Array of keywords to filter posts (optional)
- `is_active`: Enable/disable monitoring for this subreddit
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

#### **2. processed_posts**

Stores Reddit posts that have been fetched and processed.

```sql
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

-- Indexes
CREATE INDEX idx_processed_posts_reddit_id ON processed_posts(reddit_post_id);
CREATE INDEX idx_processed_posts_subreddit ON processed_posts(subreddit);
CREATE INDEX idx_processed_posts_fetched_at ON processed_posts(fetched_at DESC);
CREATE INDEX idx_processed_posts_upvotes ON processed_posts(upvotes DESC);
```

**Fields:**
- `id`: Unique identifier
- `reddit_post_id`: Reddit's unique post ID (for deduplication)
- `subreddit_id`: Foreign key to monitored_subreddits
- `title`: Post title
- `content`: Post text content (self posts only)
- `author`: Reddit username of post author
- `subreddit`: Subreddit name
- `upvotes`: Upvote count at fetch time
- `comment_count`: Comment count at fetch time
- `url`: Full Reddit URL
- `permalink`: Reddit permalink
- `created_utc`: Post creation time on Reddit
- `fetched_at`: When this post was fetched by our system

---

#### **3. ai_analysis**

Stores AI-generated analysis and engagement strategies for posts.

```sql
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

-- Indexes
CREATE INDEX idx_ai_analysis_post_id ON ai_analysis(post_id);
CREATE INDEX idx_ai_analysis_confidence ON ai_analysis(confidence_score DESC);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ai_analysis;
```

**Fields:**
- `id`: Unique identifier
- `post_id`: Foreign key to processed_posts
- `engagement_strategy`: AI-generated strategy for engaging with the post
- `brand_opportunity`: How the brand can be naturally mentioned
- `recommended_action`: Specific action to take
- `confidence_score`: AI confidence in the recommendation (0-1)
- `ai_model`: Which AI model was used for analysis
- `prompt_tokens`: Token count for cost tracking
- `completion_tokens`: Token count for cost tracking
- `created_at`: Analysis timestamp

---

#### **4. notifications**

Tracks notification delivery status.

```sql
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
CREATE INDEX idx_notifications_analysis_id ON notifications(analysis_id);
CREATE INDEX idx_notifications_sent ON notifications(sent_to_telegram);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority DESC);
```

**Fields:**
- `id`: Unique identifier
- `analysis_id`: Foreign key to ai_analysis
- `sent_to_telegram`: Whether notification was sent
- `telegram_message_id`: Telegram message ID for tracking
- `is_read`: User has viewed the notification
- `is_engaged`: User has engaged with the Reddit post
- `priority`: Higher values = more important (for sorting)
- `sent_at`: When notification was sent
- `created_at`: Record creation timestamp

---

### **Row Level Security (RLS) Policies**

Enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE monitored_subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example policy (authenticated users can read all)
CREATE POLICY "Enable read access for authenticated users" ON monitored_subreddits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON monitored_subreddits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Similar policies for other tables...
```

---

### **Realtime Configuration**

Enable Realtime on tables that need instant updates:

```sql
-- Enable Realtime for ai_analysis (new opportunities)
ALTER PUBLICATION supabase_realtime ADD TABLE ai_analysis;

-- Enable Realtime for notifications (delivery status)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

### **Useful Queries**

#### Get Recent High-Confidence Opportunities
```sql
SELECT
  p.title,
  p.url,
  a.engagement_strategy,
  a.confidence_score,
  n.is_read,
  n.is_engaged
FROM ai_analysis a
JOIN processed_posts p ON a.post_id = p.id
LEFT JOIN notifications n ON a.id = n.analysis_id
WHERE a.confidence_score > 0.7
ORDER BY a.created_at DESC
LIMIT 20;
```

#### Get Subreddit Performance Stats
```sql
SELECT
  ms.name,
  COUNT(DISTINCT pp.id) as posts_processed,
  COUNT(DISTINCT aa.id) as analyses_created,
  AVG(aa.confidence_score) as avg_confidence,
  COUNT(DISTINCT CASE WHEN n.is_engaged THEN n.id END) as engagements
FROM monitored_subreddits ms
LEFT JOIN processed_posts pp ON ms.id = pp.subreddit_id
LEFT JOIN ai_analysis aa ON pp.id = aa.post_id
LEFT JOIN notifications n ON aa.id = n.analysis_id
GROUP BY ms.id, ms.name
ORDER BY posts_processed DESC;
```

---

### **Migration Scripts**

See [deployment-guide.md](./deployment-guide.md) for complete migration setup instructions.
