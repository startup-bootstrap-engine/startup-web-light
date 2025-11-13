// ============================================================================
// Platform Types
// ============================================================================

export type Platform =
  | 'reddit'
  | 'hackernews'
  | 'producthunt'
  | 'stackoverflow'
  | 'twitter'
  | 'github'
  | 'discord';

export type ContentType =
  | 'post'
  | 'comment'
  | 'question'
  | 'discussion'
  | 'issue'
  | 'tweet'
  | 'message';

export type Priority = 'low' | 'medium' | 'high';

// ============================================================================
// Platform-Specific Configurations
// ============================================================================

export interface RedditConfig {
  sortBy?: 'new' | 'hot' | 'top' | 'rising';
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  includeNSFW?: boolean;
}

export interface HackerNewsConfig {
  section?: 'newest' | 'front' | 'ask' | 'show' | 'jobs';
  minScore?: number;
}

export interface ProductHuntConfig {
  category?: string;
  featured?: boolean;
}

export interface StackOverflowConfig {
  tags?: string[];
  minScore?: number;
  hasAcceptedAnswer?: boolean;
}

export interface TwitterConfig {
  searchType?: 'recent' | 'popular' | 'mixed';
  verified?: boolean;
  minFollowers?: number;
}

export interface GitHubConfig {
  includeIssues?: boolean;
  includePRs?: boolean;
  includeDiscussions?: boolean;
  labels?: string[];
}

export interface DiscordConfig {
  guildId?: string;
  channelIds?: string[];
  includeThreads?: boolean;
}

export type PlatformSpecificConfig =
  | RedditConfig
  | HackerNewsConfig
  | ProductHuntConfig
  | StackOverflowConfig
  | TwitterConfig
  | GitHubConfig
  | DiscordConfig;

// ============================================================================
// Platform-Specific Data
// ============================================================================

export interface RedditData {
  subreddit: string;
  flair?: string;
  gilded?: number;
  over18?: boolean;
  distinguished?: string;
  stickied?: boolean;
}

export interface HackerNewsData {
  hnId: number;
  descendants?: number;
  type?: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
  by?: string;
}

export interface ProductHuntData {
  productId?: string;
  tagline?: string;
  votesCount?: number;
  commentsCount?: number;
  featured?: boolean;
}

export interface StackOverflowData {
  questionId?: number;
  tags?: string[];
  isAnswered?: boolean;
  viewCount?: number;
  answerCount?: number;
  score?: number;
}

export interface TwitterData {
  tweetId?: string;
  isRetweet?: boolean;
  retweetCount?: number;
  likeCount?: number;
  replyCount?: number;
  hashtags?: string[];
  mentions?: string[];
}

export interface GitHubData {
  repoFullName?: string;
  issueNumber?: number;
  state?: 'open' | 'closed';
  labels?: string[];
  reactions?: {
    plusOne?: number;
    minusOne?: number;
    laugh?: number;
    hooray?: number;
    confused?: number;
    heart?: number;
    rocket?: number;
    eyes?: number;
  };
}

export interface DiscordData {
  guildId?: string;
  channelId?: string;
  messageId?: string;
  isThread?: boolean;
  threadName?: string;
  reactions?: Array<{ emoji: string; count: number }>;
}

export type PlatformSpecificData =
  | RedditData
  | HackerNewsData
  | ProductHuntData
  | StackOverflowData
  | TwitterData
  | GitHubData
  | DiscordData;

// ============================================================================
// Core Monitoring Types
// ============================================================================

export interface MonitoredSource {
  id: string;
  platform: Platform;
  sourceIdentifier: string; // subreddit name, HN section, hashtag, repo name, etc.
  keywords: string[];
  minEngagementScore: number; // upvotes, points, stars, etc.
  minComments: number;
  isActive: boolean;
  platformSpecificConfig?: PlatformSpecificConfig;
  createdAt: string;
  updatedAt: string;
  lastChecked?: string;
}

export interface Content {
  id: string;
  platform: Platform;
  externalContentId: string; // platform-specific ID
  sourceId: string; // reference to MonitoredSource
  sourceName: string; // display name of the source
  contentType: ContentType;
  title: string;
  content: string;
  author: string;
  engagementScore: number; // generic engagement metric
  commentCount: number;
  url: string;
  permalink?: string;
  platformSpecificData?: PlatformSpecificData;
  createdAt: string; // when content was created on the platform
  fetchedAt: string; // when we fetched it
}

export interface AIAnalysis {
  id: string;
  contentId: string; // reference to Content
  engagementStrategy: string;
  brandOpportunity: string;
  recommendedAction: string;
  confidenceScore: number;
  priority: Priority;
  aiModel?: string;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: string;
  isRead: boolean;
}

export interface Opportunity {
  content: Content;
  analysis: AIAnalysis;
}

export interface MonitoringStats {
  activeMonitors: number;
  contentToday: number;
  opportunities: number;
  engaged: number;
  statsByPlatform?: {
    [key in Platform]?: {
      activeMonitors: number;
      contentToday: number;
      opportunities: number;
    };
  };
}

// ============================================================================
// Backward Compatibility Types (Legacy Reddit-specific)
// ============================================================================

/**
 * @deprecated Use MonitoredSource with platform='reddit' instead
 */
export interface Subreddit extends Omit<MonitoredSource, 'platform' | 'sourceIdentifier' | 'minEngagementScore' | 'platformSpecificConfig'> {
  name: string;
  minUpvotes: number;
}

/**
 * @deprecated Use Content with platform='reddit' instead
 */
export interface RedditPost extends Omit<Content, 'platform' | 'externalContentId' | 'sourceId' | 'sourceName' | 'engagementScore' | 'platformSpecificData' | 'contentType'> {
  redditId: string;
  subreddit: string;
  upvotes: number;
}

// ============================================================================
// Platform Display Utilities
// ============================================================================

export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  producthunt: 'Product Hunt',
  stackoverflow: 'Stack Overflow',
  twitter: 'Twitter/X',
  github: 'GitHub',
  discord: 'Discord',
};

export const PLATFORM_ICONS: Record<Platform, string> = {
  reddit: '🔴',
  hackernews: '🟠',
  producthunt: '🚀',
  stackoverflow: '📚',
  twitter: '🐦',
  github: '⚫',
  discord: '💬',
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  reddit: '#FF4500',
  hackernews: '#FF6600',
  producthunt: '#DA552F',
  stackoverflow: '#F48024',
  twitter: '#1DA1F2',
  github: '#181717',
  discord: '#5865F2',
};

// ============================================================================
// Type Guards
// ============================================================================

export function isRedditSource(source: MonitoredSource): source is MonitoredSource & { platform: 'reddit' } {
  return source.platform === 'reddit';
}

export function isHackerNewsSource(source: MonitoredSource): source is MonitoredSource & { platform: 'hackernews' } {
  return source.platform === 'hackernews';
}

export function isProductHuntSource(source: MonitoredSource): source is MonitoredSource & { platform: 'producthunt' } {
  return source.platform === 'producthunt';
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getEngagementLabel(platform: Platform): string {
  switch (platform) {
    case 'reddit':
      return 'Upvotes';
    case 'hackernews':
      return 'Points';
    case 'producthunt':
      return 'Votes';
    case 'stackoverflow':
      return 'Score';
    case 'twitter':
      return 'Likes';
    case 'github':
      return 'Reactions';
    case 'discord':
      return 'Reactions';
    default:
      return 'Engagement';
  }
}

export function getSourceIdentifierLabel(platform: Platform): string {
  switch (platform) {
    case 'reddit':
      return 'Subreddit';
    case 'hackernews':
      return 'Section';
    case 'producthunt':
      return 'Category';
    case 'stackoverflow':
      return 'Tag';
    case 'twitter':
      return 'Account/Hashtag';
    case 'github':
      return 'Repository';
    case 'discord':
      return 'Channel';
    default:
      return 'Source';
  }
}

export function getContentUrl(content: Content): string {
  // If we have a URL, use it
  if (content.url) {
    return content.url;
  }

  // Otherwise, construct URL based on platform
  const { platform, externalContentId, sourceName } = content;

  switch (platform) {
    case 'reddit':
      return `https://reddit.com/r/${sourceName}/comments/${externalContentId}`;
    case 'hackernews':
      return `https://news.ycombinator.com/item?id=${externalContentId}`;
    case 'producthunt':
      return `https://www.producthunt.com/posts/${externalContentId}`;
    case 'stackoverflow':
      return `https://stackoverflow.com/questions/${externalContentId}`;
    case 'twitter':
      return `https://twitter.com/${sourceName}/status/${externalContentId}`;
    case 'github':
      return `https://github.com/${sourceName}/issues/${externalContentId}`;
    case 'discord':
      // Discord requires guild ID and channel ID
      const discordData = content.platformSpecificData as DiscordData;
      return `https://discord.com/channels/${discordData?.guildId}/${discordData?.channelId}/${externalContentId}`;
    default:
      return content.url || '#';
  }
}
