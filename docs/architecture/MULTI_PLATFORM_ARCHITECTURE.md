# Multi-Platform Architecture Guide

## Overview

This document describes the architectural changes made to transform the system from a Reddit-only monitor to a multi-platform community monitoring system.

---

## Supported Platforms

The system now supports monitoring across the following platforms:

| Platform | Identifier Example | Engagement Metric | Content Types |
|----------|-------------------|-------------------|---------------|
| **Reddit** | `webdev` (subreddit) | Upvotes | post, comment |
| **Hacker News** | `newest`, `front`, `ask` | Points | story, comment, job |
| **Product Hunt** | `developer-tools` | Votes | post |
| **Stack Overflow** | `javascript` (tag) | Score | question, answer |
| **Twitter/X** | `@username` or `#hashtag` | Likes | tweet |
| **GitHub** | `facebook/react` | Reactions | issue, PR, discussion |
| **Discord** | `123456789` (channel ID) | Reactions | message |

---

## Database Schema Changes

### Key Changes

1. **Table Renames**
   - `monitored_subreddits` → `monitored_sources`
   - `processed_posts` → `processed_content`

2. **New Platform-Agnostic Columns**
   - Added `platform` column (enum type)
   - `name` → `source_identifier` (generic identifier)
   - `reddit_post_id` → `external_content_id` (platform-specific ID)
   - `min_upvotes` → `min_engagement_score` (generic metric)
   - `upvotes` → `engagement_score`
   - `subreddit` → `source_name`
   - Added `content_type` for different content formats
   - Added `platform_specific_config` (JSONB) for flexible configuration
   - Added `platform_specific_data` (JSONB) for platform-unique fields

3. **Unique Constraints**
   - Changed from single-field unique to composite: `(platform, source_identifier)`
   - Changed from single-field unique to composite: `(platform, external_content_id)`

4. **Backward Compatibility**
   - Created SQL views (`monitored_subreddits`, `processed_posts`) for existing code
   - Deprecated TypeScript types with `@deprecated` annotations

---

## TypeScript Type System

### Core Types

```typescript
// Platform enum
export type Platform = 'reddit' | 'hackernews' | 'producthunt' |
                       'stackoverflow' | 'twitter' | 'github' | 'discord';

// Content type enum
export type ContentType = 'post' | 'comment' | 'question' |
                          'discussion' | 'issue' | 'tweet' | 'message';

// Generic content interface
export interface Content {
  id: string;
  platform: Platform;
  externalContentId: string;
  sourceName: string;
  contentType: ContentType;
  engagementScore: number;
  platformSpecificData?: PlatformSpecificData;
  // ... other fields
}
```

### Platform-Specific Configuration

Each platform can have unique configuration stored in JSONB:

```typescript
export interface RedditConfig {
  sortBy?: 'new' | 'hot' | 'top' | 'rising';
  timeFilter?: 'hour' | 'day' | 'week';
  includeNSFW?: boolean;
}

export interface HackerNewsConfig {
  section?: 'newest' | 'front' | 'ask' | 'show';
  minScore?: number;
}

// Union type for all platform configs
export type PlatformSpecificConfig =
  RedditConfig | HackerNewsConfig | ProductHuntConfig | ...;
```

### Helper Functions

```typescript
// Get appropriate label based on platform
getEngagementLabel('reddit')      // "Upvotes"
getEngagementLabel('hackernews')  // "Points"
getEngagementLabel('twitter')     // "Likes"

// Construct platform-specific URLs
getContentUrl(content) // Returns correct URL for any platform
```

---

## Worker Architecture

### Platform Adapter Pattern

Each platform gets its own specialized worker that implements a common interface:

```
workers/
├── common/
│   └── base-monitor.ts        # Abstract base class
├── reddit/
│   └── reddit-monitor.ts      # Reddit implementation
├── hackernews/
│   └── hn-monitor.ts          # Hacker News implementation
├── producthunt/
│   └── ph-monitor.ts          # Product Hunt implementation
└── ai-processor/
    └── ai-processor.ts        # Platform-agnostic AI analysis
```

### Base Monitor Interface

```typescript
abstract class BaseMonitor {
  abstract platform: Platform;

  abstract fetchContent(source: MonitoredSource): Promise<Content[]>;
  abstract validateSourceIdentifier(identifier: string): boolean;
  abstract getRateLimit(): RateLimitConfig;

  // Shared logic
  async processContent(content: Content[]): Promise<void> {
    // Deduplication, filtering, database insertion
  }
}
```

### Platform Workers

Each platform worker:
1. **Fetches** content from platform API
2. **Transforms** platform-specific data to generic `Content` format
3. **Filters** based on engagement thresholds and keywords
4. **Deduplicates** against existing content
5. **Inserts** into `processed_content` table
6. **Triggers** AI processor for analysis

---

## AI Processing (Platform-Agnostic)

The AI processor is completely platform-agnostic. It:

1. Receives a trigger when new content is inserted (any platform)
2. Fetches content details from `processed_content`
3. Builds a prompt that includes:
   - Content title and body
   - Platform context (e.g., "This is a Reddit post in r/webdev")
   - Engagement metrics (using platform-appropriate terminology)
   - Brand guidelines
4. Sends to OpenRouter (Claude 3.5 Sonnet)
5. Stores analysis in `ai_analysis` table
6. Sends Telegram notification if confidence >= 0.6

**Key Insight:** The AI doesn't care about the platform. It analyzes engagement opportunities the same way regardless of source.

---

## Frontend Architecture

### Platform Selection

Users can now:
- Add monitors for different platforms
- Select platform from dropdown when creating a monitor
- View opportunities filtered by platform
- See platform-specific icons and colors

### Dynamic UI Elements

```typescript
// Platform-aware labels
<label>{getSourceIdentifierLabel(platform)}</label>
// Shows "Subreddit" for Reddit, "Repository" for GitHub, etc.

<label>{getEngagementLabel(platform)}</label>
// Shows "Upvotes" for Reddit, "Points" for HN, etc.

// Platform badges
<PlatformBadge platform={content.platform} />
// Renders with appropriate icon and color
```

### Opportunity Cards

Opportunity cards now show:
- Platform icon/badge
- Source name (subreddit, repo, hashtag, etc.)
- Platform-appropriate engagement metrics
- Content type indicator (post, question, issue, etc.)

---

## Migration Strategy

### Phase 1: Database Migration ✅
1. Run migration script: `20250113000001_refactor_to_multi_platform.sql`
2. Creates new tables and views
3. Maintains backward compatibility with existing Reddit data

### Phase 2: TypeScript Types ✅
1. Update `src/types/monitoring.ts`
2. Add platform-agnostic interfaces
3. Deprecate old types but keep for compatibility

### Phase 3: Frontend Updates (In Progress)
1. Update Zustand stores to use new types
2. Update components to handle multiple platforms
3. Add platform selector to forms
4. Update opportunity cards with platform badges

### Phase 4: Worker Implementation (Planned)
1. Implement `BaseMonitor` abstract class
2. Build Reddit worker (refactor existing)
3. Build Hacker News worker
4. Build Product Hunt worker
5. Add additional platforms incrementally

---

## API Examples

### Adding a Reddit Monitor

```typescript
const monitor: MonitoredSource = {
  platform: 'reddit',
  sourceIdentifier: 'webdev',
  minEngagementScore: 10,
  minComments: 5,
  keywords: ['react', 'nextjs'],
  platformSpecificConfig: {
    sortBy: 'new',
    includeNSFW: false
  }
};
```

### Adding a Hacker News Monitor

```typescript
const monitor: MonitoredSource = {
  platform: 'hackernews',
  sourceIdentifier: 'newest',
  minEngagementScore: 20,
  minComments: 5,
  keywords: ['startup', 'saas'],
  platformSpecificConfig: {
    section: 'newest',
    minScore: 50
  }
};
```

### Adding a GitHub Monitor

```typescript
const monitor: MonitoredSource = {
  platform: 'github',
  sourceIdentifier: 'facebook/react',
  minEngagementScore: 5,
  minComments: 2,
  keywords: ['bug', 'hooks', 'performance'],
  platformSpecificConfig: {
    includeIssues: true,
    includePRs: false,
    includeDiscussions: true,
    labels: ['help wanted']
  }
};
```

---

## Querying Multi-Platform Data

### Get All Opportunities Across Platforms

```sql
SELECT
  c.platform,
  c.source_name,
  c.title,
  c.engagement_score,
  a.confidence_score
FROM processed_content c
JOIN ai_analysis a ON c.id = a.content_id
WHERE a.confidence_score > 0.7
ORDER BY a.created_at DESC;
```

### Get Platform Statistics

```sql
SELECT
  platform,
  COUNT(*) as total_content,
  AVG(engagement_score) as avg_engagement,
  COUNT(DISTINCT source_id) as unique_sources
FROM processed_content
GROUP BY platform;
```

### Filter by Specific Platform

```sql
-- Get only Hacker News opportunities
SELECT * FROM processed_content
WHERE platform = 'hackernews';

-- Get only Reddit opportunities (legacy view still works)
SELECT * FROM processed_posts;
```

---

## Platform-Specific Rate Limits

Each worker respects platform-specific rate limits:

| Platform | Rate Limit | Strategy |
|----------|-----------|----------|
| Reddit | 60 req/min | 1 request per second with backoff |
| Hacker News | ~60 req/min | Batch fetching with Firebase API |
| Product Hunt | 500 req/hour | Token bucket algorithm |
| Stack Overflow | 300 req/day | Quota tracking |
| GitHub | 5000 req/hour (authenticated) | GraphQL batching |
| Twitter | Varies by tier | Exponential backoff |
| Discord | 50 req/sec per bot | Queue with rate limiting |

---

## Benefits of Multi-Platform Architecture

1. **Broader Coverage**: Monitor all relevant communities, not just Reddit
2. **Reduced Platform Risk**: Not dependent on a single platform's API
3. **Better Targeting**: Different platforms have different audiences
4. **Competitive Advantage**: Multi-platform monitoring is rare
5. **Scalable**: Easy to add new platforms using adapter pattern
6. **Maintainable**: Shared AI processor and database schema
7. **Flexible**: Platform-specific configuration via JSONB

---

## Next Steps

1. **Implement Base Worker Classes**: Create abstract base monitor
2. **Build Platform Adapters**: Start with Reddit (refactor), then HN, PH
3. **Update Frontend**: Add platform selector and badges
4. **Test Multi-Platform**: Verify data flows correctly across platforms
5. **Documentation**: API documentation for each platform adapter
6. **Monitoring**: Add platform-specific metrics and alerts

---

## Technical Debt Considerations

### Removed in Migration
- Reddit-specific terminology in database schema
- Hard-coded Reddit logic in workers
- Single-platform assumptions in frontend

### Maintained for Compatibility
- SQL views for old table names
- Deprecated TypeScript types
- Existing Reddit monitor functionality

### Future Improvements
- GraphQL API for frontend
- Real-time platform health monitoring
- Automatic platform detection/recommendation
- Machine learning for platform-specific engagement prediction
