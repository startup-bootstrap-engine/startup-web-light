-- Multi-Platform Refactor Migration
-- Created: 2025-01-13
-- Description: Refactors the database schema to support multiple platforms (Reddit, Hacker News, Product Hunt, etc.)

-- ============================================================================
-- Step 1: Rename tables to be platform-agnostic
-- ============================================================================

-- Rename monitored_subreddits to monitored_sources
ALTER TABLE monitored_subreddits RENAME TO monitored_sources;

-- Rename processed_posts to processed_content
ALTER TABLE processed_posts RENAME TO processed_content;

-- ============================================================================
-- Step 2: Add platform column and update constraints
-- ============================================================================

-- Add platform column to monitored_sources (default to 'reddit' for backward compatibility)
ALTER TABLE monitored_sources
  ADD COLUMN platform TEXT NOT NULL DEFAULT 'reddit' CHECK (platform IN ('reddit', 'hackernews', 'producthunt', 'stackoverflow', 'twitter', 'github', 'discord'));

-- Rename 'name' to 'source_identifier' (more generic)
ALTER TABLE monitored_sources RENAME COLUMN name TO source_identifier;

-- Drop old unique constraint on name
ALTER TABLE monitored_sources DROP CONSTRAINT IF EXISTS monitored_subreddits_name_key;

-- Add new unique constraint on platform + source_identifier
ALTER TABLE monitored_sources
  ADD CONSTRAINT unique_platform_source UNIQUE (platform, source_identifier);

-- Add platform_specific_config JSONB column for flexible platform-specific settings
ALTER TABLE monitored_sources
  ADD COLUMN platform_specific_config JSONB DEFAULT '{}'::jsonb;

-- Rename min_upvotes to min_engagement_score (more generic)
ALTER TABLE monitored_sources RENAME COLUMN min_upvotes TO min_engagement_score;

-- ============================================================================
-- Step 3: Update processed_content table for multi-platform support
-- ============================================================================

-- Add platform column
ALTER TABLE processed_content
  ADD COLUMN platform TEXT NOT NULL DEFAULT 'reddit' CHECK (platform IN ('reddit', 'hackernews', 'producthunt', 'stackoverflow', 'twitter', 'github', 'discord'));

-- Rename reddit_post_id to external_content_id
ALTER TABLE processed_content RENAME COLUMN reddit_post_id TO external_content_id;

-- Drop old unique constraint
ALTER TABLE processed_content DROP CONSTRAINT IF EXISTS processed_posts_reddit_post_id_key;

-- Add new unique constraint on platform + external_content_id
ALTER TABLE processed_content
  ADD CONSTRAINT unique_platform_content UNIQUE (platform, external_content_id);

-- Rename subreddit_id to source_id (generic reference)
ALTER TABLE processed_content RENAME COLUMN subreddit_id TO source_id;

-- Rename 'subreddit' column to 'source_name' (more generic)
ALTER TABLE processed_content RENAME COLUMN subreddit TO source_name;

-- Rename 'upvotes' to 'engagement_score' (generic metric)
ALTER TABLE processed_content RENAME COLUMN upvotes TO engagement_score;

-- Add content_type column (post, comment, question, discussion, etc.)
ALTER TABLE processed_content
  ADD COLUMN content_type TEXT DEFAULT 'post';

-- Add platform_specific_data JSONB for flexible platform-specific fields
ALTER TABLE processed_content
  ADD COLUMN platform_specific_data JSONB DEFAULT '{}'::jsonb;

-- Update foreign key reference (table was renamed)
ALTER TABLE processed_content
  DROP CONSTRAINT IF EXISTS processed_posts_subreddit_id_fkey,
  ADD CONSTRAINT processed_content_source_id_fkey
    FOREIGN KEY (source_id) REFERENCES monitored_sources(id) ON DELETE CASCADE;

-- ============================================================================
-- Step 4: Update indexes to reflect new columns
-- ============================================================================

-- Drop old indexes
DROP INDEX IF EXISTS idx_monitored_subreddits_active;
DROP INDEX IF EXISTS idx_monitored_subreddits_name;
DROP INDEX IF EXISTS idx_processed_posts_reddit_id;
DROP INDEX IF EXISTS idx_processed_posts_subreddit;
DROP INDEX IF EXISTS idx_processed_posts_fetched_at;
DROP INDEX IF EXISTS idx_processed_posts_upvotes;

-- Create new indexes for monitored_sources
CREATE INDEX idx_monitored_sources_active ON monitored_sources(is_active);
CREATE INDEX idx_monitored_sources_platform ON monitored_sources(platform);
CREATE INDEX idx_monitored_sources_platform_active ON monitored_sources(platform, is_active);
CREATE INDEX idx_monitored_sources_source_identifier ON monitored_sources(source_identifier);

-- Create new indexes for processed_content
CREATE INDEX idx_processed_content_external_id ON processed_content(external_content_id);
CREATE INDEX idx_processed_content_platform ON processed_content(platform);
CREATE INDEX idx_processed_content_source_name ON processed_content(source_name);
CREATE INDEX idx_processed_content_fetched_at ON processed_content(fetched_at DESC);
CREATE INDEX idx_processed_content_engagement_score ON processed_content(engagement_score DESC);
CREATE INDEX idx_processed_content_platform_source ON processed_content(platform, source_name);

-- ============================================================================
-- Step 5: Update ai_analysis table references
-- ============================================================================

-- Rename foreign key constraint for clarity
ALTER TABLE ai_analysis
  DROP CONSTRAINT IF EXISTS ai_analysis_post_id_fkey,
  ADD CONSTRAINT ai_analysis_content_id_fkey
    FOREIGN KEY (post_id) REFERENCES processed_content(id) ON DELETE CASCADE;

-- Rename post_id to content_id for clarity (optional, but more accurate)
ALTER TABLE ai_analysis RENAME COLUMN post_id TO content_id;

-- ============================================================================
-- Step 6: Update RLS policies with new table names
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON monitored_sources;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON monitored_sources;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON monitored_sources;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON monitored_sources;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON processed_content;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON processed_content;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON processed_content;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON processed_content;

-- Recreate policies for monitored_sources
CREATE POLICY "Enable read access for authenticated users" ON monitored_sources
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON monitored_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON monitored_sources
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON monitored_sources
  FOR DELETE
  TO authenticated
  USING (true);

-- Recreate policies for processed_content
CREATE POLICY "Enable read access for authenticated users" ON processed_content
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON processed_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON processed_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON processed_content
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Step 7: Create views for backward compatibility (optional)
-- ============================================================================

-- Create a view that maintains the old 'monitored_subreddits' interface
CREATE OR REPLACE VIEW monitored_subreddits AS
SELECT
  id,
  source_identifier AS name,
  min_engagement_score AS min_upvotes,
  min_comments,
  keywords,
  is_active,
  created_at,
  updated_at
FROM monitored_sources
WHERE platform = 'reddit';

-- Create a view that maintains the old 'processed_posts' interface
CREATE OR REPLACE VIEW processed_posts AS
SELECT
  id,
  external_content_id AS reddit_post_id,
  source_id AS subreddit_id,
  title,
  content,
  author,
  source_name AS subreddit,
  engagement_score AS upvotes,
  comment_count,
  url,
  permalink,
  created_utc,
  fetched_at
FROM processed_content
WHERE platform = 'reddit';

-- ============================================================================
-- Step 8: Add helper functions for platform-specific operations
-- ============================================================================

-- Function to get platform-specific display name
CREATE OR REPLACE FUNCTION get_platform_display_name(p_platform TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE p_platform
    WHEN 'reddit' THEN 'Reddit'
    WHEN 'hackernews' THEN 'Hacker News'
    WHEN 'producthunt' THEN 'Product Hunt'
    WHEN 'stackoverflow' THEN 'Stack Overflow'
    WHEN 'twitter' THEN 'Twitter/X'
    WHEN 'github' THEN 'GitHub Discussions'
    WHEN 'discord' THEN 'Discord'
    ELSE p_platform
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate platform-specific source identifier format
CREATE OR REPLACE FUNCTION validate_source_identifier(p_platform TEXT, p_identifier TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE p_platform
    WHEN 'reddit' THEN p_identifier ~ '^[A-Za-z0-9_]{3,21}$'  -- Reddit subreddit naming rules
    WHEN 'hackernews' THEN p_identifier IN ('newest', 'front', 'ask', 'show', 'jobs')
    WHEN 'producthunt' THEN p_identifier ~ '^[a-z0-9-]+$'
    WHEN 'stackoverflow' THEN p_identifier ~ '^[a-z0-9-]+$'  -- Tags
    WHEN 'twitter' THEN p_identifier ~ '^@?[A-Za-z0-9_]{1,15}$'  -- Twitter handle or hashtag
    WHEN 'github' THEN p_identifier ~ '^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$'  -- owner/repo format
    WHEN 'discord' THEN p_identifier ~ '^[0-9]{17,19}$'  -- Discord channel ID
    ELSE true  -- Allow any identifier for unknown platforms
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Step 9: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE monitored_sources IS 'Stores configuration for sources being monitored across multiple platforms';
COMMENT ON COLUMN monitored_sources.platform IS 'Platform type: reddit, hackernews, producthunt, stackoverflow, twitter, github, discord';
COMMENT ON COLUMN monitored_sources.source_identifier IS 'Platform-specific source identifier (e.g., subreddit name, HN section, hashtag)';
COMMENT ON COLUMN monitored_sources.min_engagement_score IS 'Minimum engagement score threshold (upvotes for Reddit, points for HN, etc.)';
COMMENT ON COLUMN monitored_sources.platform_specific_config IS 'JSONB field for platform-specific configuration options';

COMMENT ON TABLE processed_content IS 'Stores content from multiple platforms that has been fetched and processed';
COMMENT ON COLUMN processed_content.platform IS 'Source platform of this content';
COMMENT ON COLUMN processed_content.external_content_id IS 'Platform-specific unique content identifier';
COMMENT ON COLUMN processed_content.content_type IS 'Type of content: post, comment, question, discussion, issue, etc.';
COMMENT ON COLUMN processed_content.engagement_score IS 'Generic engagement metric (upvotes, points, stars, etc.)';
COMMENT ON COLUMN processed_content.platform_specific_data IS 'JSONB field for platform-specific data that does not fit standard schema';

COMMENT ON TABLE ai_analysis IS 'AI-generated analysis and engagement strategies for content across all platforms';
COMMENT ON COLUMN ai_analysis.content_id IS 'Reference to the content being analyzed (formerly post_id)';
