export interface Subreddit {
  id: string;
  name: string;
  keywords: string[];
  minUpvotes: number;
  minComments: number;
  isActive: boolean;
  createdAt: string;
  lastChecked?: string;
}

export interface RedditPost {
  id: string;
  redditId: string;
  subreddit: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  commentCount: number;
  url: string;
  createdAt: string;
  fetchedAt: string;
}

export interface AIAnalysis {
  id: string;
  postId: string;
  engagementStrategy: string;
  brandOpportunity: string;
  recommendedAction: string;
  confidenceScore: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
}

export interface MonitoringStats {
  activeMonitors: number;
  postsToday: number;
  opportunities: number;
  engaged: number;
}

export interface Opportunity {
  post: RedditPost;
  analysis: AIAnalysis;
}
