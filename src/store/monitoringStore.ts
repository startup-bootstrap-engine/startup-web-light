import { create } from 'zustand';
import { MonitoringStats, Opportunity, Subreddit } from '../types/monitoring';

interface MonitoringState {
  subreddits: Subreddit[];
  opportunities: Opportunity[];
  stats: MonitoringStats;

  // Subreddit actions (backward compatibility)
  addSubreddit: (subreddit: Omit<Subreddit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSubreddit: (id: string, updates: Partial<Subreddit>) => void;
  removeSubreddit: (id: string) => void;
  toggleSubreddit: (id: string) => void;

  // Opportunity actions
  addOpportunity: (opportunity: Opportunity) => void;
  markOpportunityAsRead: (analysisId: string) => void;
  removeOpportunity: (analysisId: string) => void;

  // Stats actions
  updateStats: (stats: Partial<MonitoringStats>) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  subreddits: [
    {
      id: '1',
      name: 'webdev',
      keywords: ['portfolio', 'feedback', 'react', 'nextjs'],
      minUpvotes: 10,
      minComments: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'startups',
      keywords: ['saas', 'tools', 'growth', 'mvp'],
      minUpvotes: 20,
      minComments: 10,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'marketing',
      keywords: ['seo', 'traffic', 'content', 'social media'],
      minUpvotes: 15,
      minComments: 8,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    },
  ],
  opportunities: [
    {
      content: {
        id: '1',
        platform: 'reddit',
        externalContentId: 'abc123',
        sourceId: '1',
        sourceName: 'webdev',
        contentType: 'post',
        title: 'Looking for feedback on my portfolio website',
        content: 'I just finished my portfolio and would love some feedback...',
        author: 'webdev_newbie',
        engagementScore: 45,
        commentCount: 23,
        url: 'https://reddit.com/r/webdev/comments/abc123',
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
      analysis: {
        id: 'a1',
        contentId: '1',
        engagementStrategy: 'Offer constructive feedback on specific aspects of the portfolio, then mention how your tool helps with similar improvements',
        brandOpportunity: 'This user is actively seeking improvement, perfect opportunity to showcase monitoring/analytics tools',
        recommendedAction: 'Comment with 2-3 specific portfolio tips, then casually mention your relevant service',
        confidenceScore: 0.87,
        priority: 'high',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    },
    {
      content: {
        id: '2',
        platform: 'reddit',
        externalContentId: 'def456',
        sourceId: '2',
        sourceName: 'startups',
        contentType: 'post',
        title: 'Best tools for early-stage SaaS?',
        content: 'What tools do you recommend for a bootstrapped SaaS startup?',
        author: 'founder_mike',
        engagementScore: 67,
        commentCount: 45,
        url: 'https://reddit.com/r/startups/comments/def456',
        createdAt: new Date(Date.now() - 23 * 60000).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
      analysis: {
        id: 'a2',
        contentId: '2',
        engagementStrategy: 'Share a comprehensive list of tools you use, position yours as part of the stack without being pushy',
        brandOpportunity: 'High-intent founder actively building, looking for solutions',
        recommendedAction: 'Provide 5-7 tool recommendations with brief explanations, include yours naturally in the list',
        confidenceScore: 0.92,
        priority: 'high',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    },
    {
      content: {
        id: '3',
        platform: 'reddit',
        externalContentId: 'ghi789',
        sourceId: '3',
        sourceName: 'marketing',
        contentType: 'post',
        title: 'How to grow organic traffic in 2024?',
        content: 'My blog has been stagnant for months. What strategies are working for you?',
        author: 'content_creator_jane',
        engagementScore: 89,
        commentCount: 56,
        url: 'https://reddit.com/r/marketing/comments/ghi789',
        createdAt: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
      analysis: {
        id: 'a3',
        contentId: '3',
        engagementStrategy: 'Share 3-4 actionable SEO strategies that worked for you, build credibility before any mention',
        brandOpportunity: 'Content creator struggling with growth - good fit for monitoring/analytics tools',
        recommendedAction: 'Lead with value - share your best organic growth tactics, then mention tool in context',
        confidenceScore: 0.78,
        priority: 'high',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    },
  ],
  stats: {
    activeMonitors: 3,
    contentToday: 127,
    opportunities: 8,
    engaged: 12,
  },

  addSubreddit: (subreddit) =>
    set((state) => ({
      subreddits: [
        ...state.subreddits,
        {
          ...subreddit,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      stats: {
        ...state.stats,
        activeMonitors: state.stats.activeMonitors + (subreddit.isActive ? 1 : 0),
      },
    })),

  updateSubreddit: (id, updates) =>
    set((state) => ({
      subreddits: state.subreddits.map((sub) =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    })),

  removeSubreddit: (id) =>
    set((state) => ({
      subreddits: state.subreddits.filter((sub) => sub.id !== id),
      stats: {
        ...state.stats,
        activeMonitors: Math.max(
          0,
          state.stats.activeMonitors -
            (state.subreddits.find((s) => s.id === id)?.isActive ? 1 : 0)
        ),
      },
    })),

  toggleSubreddit: (id) =>
    set((state) => ({
      subreddits: state.subreddits.map((sub) =>
        sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
      ),
      stats: {
        ...state.stats,
        activeMonitors:
          state.stats.activeMonitors +
          (state.subreddits.find((s) => s.id === id)?.isActive ? -1 : 1),
      },
    })),

  addOpportunity: (opportunity) =>
    set((state) => ({
      opportunities: [opportunity, ...state.opportunities],
      stats: {
        ...state.stats,
        opportunities: state.stats.opportunities + 1,
      },
    })),

  markOpportunityAsRead: (analysisId) =>
    set((state) => ({
      opportunities: state.opportunities.map((opp) =>
        opp.analysis.id === analysisId
          ? { ...opp, analysis: { ...opp.analysis, isRead: true } }
          : opp
      ),
    })),

  removeOpportunity: (analysisId) =>
    set((state) => ({
      opportunities: state.opportunities.filter(
        (opp) => opp.analysis.id !== analysisId
      ),
    })),

  updateStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),
}));
