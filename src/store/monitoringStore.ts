import { create } from 'zustand';
import { MonitoringStats, Opportunity, MonitoredSource } from '../types/monitoring';

interface MonitoringState {
  sources: MonitoredSource[];
  opportunities: Opportunity[];
  stats: MonitoringStats;

  // Source actions (new multi-platform)
  addSource: (source: Omit<MonitoredSource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSource: (id: string, updates: Partial<MonitoredSource>) => void;
  removeSource: (id: string) => void;
  toggleSource: (id: string) => void;

  // Backward compatibility (legacy)
  get subreddits(): any[];
  addSubreddit: (subreddit: any) => void;
  updateSubreddit: (id: string, updates: any) => void;
  removeSubreddit: (id: string) => void;
  toggleSubreddit: (id: string) => void;

  // Opportunity actions
  addOpportunity: (opportunity: Opportunity) => void;
  markOpportunityAsRead: (analysisId: string) => void;
  removeOpportunity: (analysisId: string) => void;
  reprocessOpportunity: (analysisId: string) => void;

  // Stats actions
  updateStats: (stats: Partial<MonitoringStats>) => void;
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  sources: [
    {
      id: '1',
      platform: 'reddit',
      sourceIdentifier: 'webdev',
      keywords: ['portfolio', 'feedback', 'react', 'nextjs'],
      minEngagementScore: 10,
      minComments: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    },
    {
      id: '2',
      platform: 'reddit',
      sourceIdentifier: 'startups',
      keywords: ['saas', 'tools', 'growth', 'mvp'],
      minEngagementScore: 20,
      minComments: 10,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    },
    {
      id: '3',
      platform: 'hackernews',
      sourceIdentifier: 'newest',
      keywords: ['saas', 'startup', 'mvp'],
      minEngagementScore: 50,
      minComments: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    },
    {
      id: '4',
      platform: 'producthunt',
      sourceIdentifier: 'dev-tools',
      keywords: ['productivity', 'developer', 'tools'],
      minEngagementScore: 30,
      minComments: 3,
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
        platform: 'hackernews',
        externalContentId: '38492813',
        sourceId: '3',
        sourceName: 'newest',
        contentType: 'post',
        title: 'Show HN: Built a tool to monitor mentions across the web',
        content: 'After struggling to track mentions of our product, I built this...',
        author: 'hn_builder',
        engagementScore: 127,
        commentCount: 45,
        url: 'https://news.ycombinator.com/item?id=38492813',
        createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
      analysis: {
        id: 'a2',
        contentId: '2',
        engagementStrategy: 'Congratulate them on their launch and share how you solved similar problems in your implementation',
        brandOpportunity: 'Direct competitor or complementary tool - engage authentically to build community goodwill',
        recommendedAction: 'Share a genuine insight from your experience, possibly mention your approach as comparison',
        confidenceScore: 0.73,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    },
    {
      content: {
        id: '3',
        platform: 'producthunt',
        externalContentId: 'dev-productivity-2024',
        sourceId: '4',
        sourceName: 'dev-tools',
        contentType: 'post',
        title: 'What are your must-have developer tools in 2024?',
        content: 'Looking to upgrade my dev stack. What tools do you swear by?',
        author: 'product_hunter',
        engagementScore: 89,
        commentCount: 67,
        url: 'https://www.producthunt.com/discussions/dev-productivity-2024',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        fetchedAt: new Date().toISOString(),
      },
      analysis: {
        id: 'a3',
        contentId: '3',
        engagementStrategy: 'Share a thoughtful list of tools you actually use, positioning yours naturally among them',
        brandOpportunity: 'High-intent user actively researching tools - perfect for authentic recommendation',
        recommendedAction: 'Provide value first with 5-7 genuine recommendations, include yours as part of stack',
        confidenceScore: 0.91,
        priority: 'high',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    },
  ],
  stats: {
    activeMonitors: 4,
    contentToday: 247,
    opportunities: 12,
    engaged: 18,
    statsByPlatform: {
      reddit: {
        activeMonitors: 2,
        contentToday: 127,
        opportunities: 5,
      },
      hackernews: {
        activeMonitors: 1,
        contentToday: 78,
        opportunities: 4,
      },
      producthunt: {
        activeMonitors: 1,
        contentToday: 42,
        opportunities: 3,
      },
    },
  },

  // New multi-platform actions
  addSource: (source) =>
    set((state) => ({
      sources: [
        ...state.sources,
        {
          ...source,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      stats: {
        ...state.stats,
        activeMonitors: state.stats.activeMonitors + (source.isActive ? 1 : 0),
      },
    })),

  updateSource: (id, updates) =>
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === id ? { ...source, ...updates, updatedAt: new Date().toISOString() } : source
      ),
    })),

  removeSource: (id) =>
    set((state) => ({
      sources: state.sources.filter((source) => source.id !== id),
      stats: {
        ...state.stats,
        activeMonitors: Math.max(
          0,
          state.stats.activeMonitors - (state.sources.find((s) => s.id === id)?.isActive ? 1 : 0)
        ),
      },
    })),

  toggleSource: (id) =>
    set((state) => ({
      sources: state.sources.map((source) =>
        source.id === id ? { ...source, isActive: !source.isActive } : source
      ),
      stats: {
        ...state.stats,
        activeMonitors:
          state.stats.activeMonitors + (state.sources.find((s) => s.id === id)?.isActive ? -1 : 1),
      },
    })),

  // Backward compatibility getters and setters
  get subreddits() {
    return get().sources
      .filter(s => s.platform === 'reddit')
      .map(s => ({
        id: s.id,
        name: s.sourceIdentifier,
        keywords: s.keywords,
        minUpvotes: s.minEngagementScore,
        minComments: s.minComments,
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        lastChecked: s.lastChecked,
      }));
  },

  addSubreddit: (subreddit) => {
    get().addSource({
      platform: 'reddit',
      sourceIdentifier: subreddit.name,
      keywords: subreddit.keywords,
      minEngagementScore: subreddit.minUpvotes,
      minComments: subreddit.minComments,
      isActive: subreddit.isActive,
    });
  },

  updateSubreddit: (id, updates) => {
    get().updateSource(id, {
      ...(updates.name && { sourceIdentifier: updates.name }),
      ...(updates.minUpvotes !== undefined && { minEngagementScore: updates.minUpvotes }),
      ...updates,
    });
  },

  removeSubreddit: (id) => {
    get().removeSource(id);
  },

  toggleSubreddit: (id) => {
    get().toggleSource(id);
  },

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
      opportunities: state.opportunities.filter((opp) => opp.analysis.id !== analysisId),
    })),

  reprocessOpportunity: (analysisId) =>
    set((state) => {
      // In a real implementation, this would trigger an API call to reprocess the content
      // For now, we'll just mark it as unread to simulate reprocessing
      return {
        opportunities: state.opportunities.map((opp) =>
          opp.analysis.id === analysisId
            ? { ...opp, analysis: { ...opp.analysis, isRead: false } }
            : opp
        ),
      };
    }),

  updateStats: (stats) =>
    set((state) => ({
      stats: { ...state.stats, ...stats },
    })),
}));
