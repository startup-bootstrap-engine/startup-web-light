# Multi-Platform Migration Guide

This guide helps you migrate from the Reddit-only version to the multi-platform architecture.

## Summary of Changes

We've refactored the system to support multiple platforms (Reddit, Hacker News, Product Hunt, Stack Overflow, Twitter, GitHub, Discord) while maintaining backward compatibility with existing Reddit functionality.

## Database Migration

### Step 1: Run the Migration Script

```bash
# Connect to your Supabase project
supabase db reset  # If starting fresh

# Or apply the migration
supabase migration up
```

The migration script will:
- Rename `monitored_subreddits` → `monitored_sources`
- Rename `processed_posts` → `processed_content`
- Add `platform` column to both tables
- Add `platform_specific_config` and `platform_specific_data` JSONB columns
- Create backward compatibility views
- Update indexes and constraints

### Step 2: Verify Migration

```sql
-- Check that new tables exist
SELECT * FROM monitored_sources LIMIT 1;
SELECT * FROM processed_content LIMIT 1;

-- Check that backward compatibility views work
SELECT * FROM monitored_subreddits LIMIT 1;
SELECT * FROM processed_posts LIMIT 1;

-- Verify platform enum constraint
SELECT DISTINCT platform FROM monitored_sources;
```

## Code Changes

### TypeScript Types

The type system has been updated to be platform-agnostic:

**Old (Deprecated):**
```typescript
import { Subreddit, RedditPost } from './types/monitoring';

const subreddit: Subreddit = {
  name: 'webdev',
  minUpvotes: 10,
  // ...
};
```

**New (Recommended):**
```typescript
import { MonitoredSource, Content } from './types/monitoring';

const source: MonitoredSource = {
  platform: 'reddit',
  sourceIdentifier: 'webdev',
  minEngagementScore: 10,
  // ...
};
```

### Backward Compatibility

Old code will continue to work thanks to:
1. **SQL Views**: `monitored_subreddits` and `processed_posts` views map to new tables
2. **Deprecated Types**: `Subreddit` and `RedditPost` types still exist with `@deprecated` warnings

### Updating Your Code

If you want to update to the new types:

**Before:**
```typescript
interface Subreddit {
  name: string;
  minUpvotes: number;
}

const subreddit: Subreddit = {
  name: 'webdev',
  minUpvotes: 10,
};
```

**After:**
```typescript
interface MonitoredSource {
  platform: Platform;
  sourceIdentifier: string;
  minEngagementScore: number;
}

const source: MonitoredSource = {
  platform: 'reddit',
  sourceIdentifier: 'webdev',
  minEngagementScore: 10,
};
```

## Frontend Updates Needed

### 1. Update Zustand Store

**File:** `src/store/monitoringStore.ts`

- Replace `Subreddit` with `MonitoredSource`
- Replace `RedditPost` with `Content`
- Update mock data to include `platform` field

### 2. Update Components

**Add Platform Selector:**
```typescript
import { Platform, PLATFORM_DISPLAY_NAMES } from '../types/monitoring';

<select name="platform">
  {Object.entries(PLATFORM_DISPLAY_NAMES).map(([key, label]) => (
    <option key={key} value={key}>{label}</option>
  ))}
</select>
```

**Dynamic Labels:**
```typescript
import { getEngagementLabel, getSourceIdentifierLabel } from '../types/monitoring';

// Instead of hardcoded "Upvotes"
<label>{getEngagementLabel(platform)}</label>

// Instead of hardcoded "Subreddit"
<label>{getSourceIdentifierLabel(platform)}</label>
```

**Platform Badges:**
```typescript
import { PLATFORM_ICONS, PLATFORM_COLORS } from '../types/monitoring';

<span style={{ color: PLATFORM_COLORS[content.platform] }}>
  {PLATFORM_ICONS[content.platform]} {content.platform}
</span>
```

### 3. Update API Calls

**Before:**
```typescript
const { data, error } = await supabase
  .from('monitored_subreddits')
  .select('*');
```

**After:**
```typescript
const { data, error } = await supabase
  .from('monitored_sources')
  .select('*')
  .eq('platform', 'reddit'); // Optional: filter by platform
```

## Worker Updates Needed

### 1. Refactor Reddit Worker

Transform Reddit-specific data to generic format:

```typescript
// Fetch from Reddit
const redditPost = await fetchRedditPost(subreddit);

// Transform to generic Content
const content: Content = {
  platform: 'reddit',
  externalContentId: redditPost.id,
  sourceIdentifier: subreddit,
  sourceName: redditPost.subreddit,
  title: redditPost.title,
  content: redditPost.selftext,
  engagementScore: redditPost.ups,
  platformSpecificData: {
    subreddit: redditPost.subreddit,
    flair: redditPost.link_flair_text,
    gilded: redditPost.gilded,
  }
};

// Insert into processed_content (not processed_posts)
await supabase.from('processed_content').insert(content);
```

### 2. Add New Platform Workers

Use the adapter pattern:

```typescript
abstract class BaseMonitor {
  abstract platform: Platform;
  abstract fetchContent(source: MonitoredSource): Promise<Content[]>;

  async processContent(content: Content[]): Promise<void> {
    // Shared logic: deduplication, filtering, insertion
  }
}

class RedditMonitor extends BaseMonitor {
  platform = 'reddit';

  async fetchContent(source: MonitoredSource): Promise<Content[]> {
    // Reddit-specific implementation
  }
}

class HackerNewsMonitor extends BaseMonitor {
  platform = 'hackernews';

  async fetchContent(source: MonitoredSource): Promise<Content[]> {
    // HackerNews-specific implementation
  }
}
```

## Testing

### 1. Test Database Migration

```sql
-- Insert a test Reddit source
INSERT INTO monitored_sources (platform, source_identifier, min_engagement_score, min_comments, keywords)
VALUES ('reddit', 'webdev', 10, 5, ARRAY['react', 'nextjs']);

-- Insert a test HN source
INSERT INTO monitored_sources (platform, source_identifier, min_engagement_score, min_comments, keywords)
VALUES ('hackernews', 'newest', 20, 5, ARRAY['startup', 'saas']);

-- Verify backward compatibility view
SELECT * FROM monitored_subreddits;
```

### 2. Test Frontend

1. Add a Reddit monitor - should work as before
2. Try adding a new Hacker News monitor
3. Verify platform badges display correctly
4. Check that filtering by platform works

### 3. Test Workers

1. Run Reddit worker - should insert into `processed_content`
2. Verify AI processor works with new table structure
3. Check Telegram notifications include platform info

## Rollback Plan

If you need to rollback:

```sql
-- The migration includes backward compatibility views
-- Your existing code using monitored_subreddits and processed_posts will continue to work

-- To fully rollback (destructive):
DROP TABLE IF EXISTS monitored_sources CASCADE;
DROP TABLE IF EXISTS processed_content CASCADE;

-- Then restore from backup
```

## FAQs

**Q: Will my existing Reddit monitors still work?**
A: Yes! The backward compatibility views ensure existing code continues to work.

**Q: Do I need to update my frontend immediately?**
A: No, but it's recommended. You can gradually migrate components to use new types.

**Q: How do I add a new platform?**
A: See the `MULTI_PLATFORM_ARCHITECTURE.md` guide for detailed instructions.

**Q: What happens to existing data?**
A: All existing Reddit data is preserved. The migration adds a `platform='reddit'` column to existing rows.

**Q: Can I still use the old type names?**
A: Yes, but they're deprecated. You'll see TypeScript warnings encouraging migration.

## Support

For issues or questions:
- Check `docs/architecture/MULTI_PLATFORM_ARCHITECTURE.md` for detailed architecture
- Review migration script: `supabase/migrations/20250113000001_refactor_to_multi_platform.sql`
- Open an issue on GitHub

## Next Steps

After migration:
1. Review the multi-platform architecture guide
2. Update frontend components to use new types
3. Implement additional platform workers (HN, PH, etc.)
4. Add platform filters to your dashboard
5. Create platform-specific analytics
