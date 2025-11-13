-- Reddit Monitor - Initial Database Schema
-- Created: 2025-01-13

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: monitored_subreddits
-- Description: Stores configuration for subreddits being monitored
-- ============================================================================

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

-- Indexes for monitored_subreddits
CREATE INDEX idx_monitored_subreddits_active ON monitored_subreddits(is_active);
CREATE INDEX idx_monitored_subreddits_name ON monitored_subreddits(name);

-- ============================================================================
-- Table: processed_posts
-- Description: Stores Reddit posts that have been fetched and processed
-- ============================================================================

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

-- Indexes for processed_posts
CREATE INDEX idx_processed_posts_reddit_id ON processed_posts(reddit_post_id);
CREATE INDEX idx_processed_posts_subreddit ON processed_posts(subreddit);
CREATE INDEX idx_processed_posts_fetched_at ON processed_posts(fetched_at DESC);
CREATE INDEX idx_processed_posts_upvotes ON processed_posts(upvotes DESC);

-- ============================================================================
-- Table: ai_analysis
-- Description: Stores AI-generated analysis and engagement strategies for posts
-- ============================================================================

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

-- Indexes for ai_analysis
CREATE INDEX idx_ai_analysis_post_id ON ai_analysis(post_id);
CREATE INDEX idx_ai_analysis_confidence ON ai_analysis(confidence_score DESC);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis(created_at DESC);

-- ============================================================================
-- Table: notifications
-- Description: Tracks notification delivery status
-- ============================================================================

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

-- Indexes for notifications
CREATE INDEX idx_notifications_analysis_id ON notifications(analysis_id);
CREATE INDEX idx_notifications_sent ON notifications(sent_to_telegram);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE monitored_subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for monitored_subreddits
CREATE POLICY "Enable read access for authenticated users" ON monitored_subreddits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON monitored_subreddits
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON monitored_subreddits
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON monitored_subreddits
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for processed_posts
CREATE POLICY "Enable read access for authenticated users" ON processed_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON processed_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON processed_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON processed_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for ai_analysis
CREATE POLICY "Enable read access for authenticated users" ON ai_analysis
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ai_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON ai_analysis
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON ai_analysis
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for notifications
CREATE POLICY "Enable read access for authenticated users" ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON notifications
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Realtime Configuration
-- Description: Enable real-time updates for specific tables
-- ============================================================================

-- Enable Realtime for ai_analysis (new opportunities)
ALTER PUBLICATION supabase_realtime ADD TABLE ai_analysis;

-- Enable Realtime for notifications (delivery status)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
