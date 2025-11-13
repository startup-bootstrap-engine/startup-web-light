import { BarChart3, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { JSX, useState, useMemo } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';
import { Platform, PLATFORM_DISPLAY_NAMES, PLATFORM_COLORS, PLATFORM_ICONS } from '../../types/monitoring';

type DateRange = '7d' | '30d' | '90d' | 'all';

export const AnalyticsDashboard = (): JSX.Element => {
  const { opportunities } = useMonitoringStore();
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Filter opportunities by date range
  const filteredOpportunities = useMemo(() => {
    if (dateRange === 'all') return opportunities;

    const now = Date.now();
    const rangeMs = dateRange === '7d' ? 7 * 24 * 60 * 60 * 1000
                  : dateRange === '30d' ? 30 * 24 * 60 * 60 * 1000
                  : 90 * 24 * 60 * 60 * 1000;

    return opportunities.filter(opp => {
      const oppDate = new Date(opp.analysis.createdAt).getTime();
      return now - oppDate <= rangeMs;
    });
  }, [opportunities, dateRange]);

  // Calculate platform metrics
  const platformMetrics = useMemo(() => {
    const metrics: Record<Platform, {
      contentCount: number;
      avgEngagement: number;
      opportunityCount: number;
      totalEngagement: number;
    }> = {} as any;

    // Initialize metrics for all platforms
    Object.keys(PLATFORM_DISPLAY_NAMES).forEach((platform) => {
      metrics[platform as Platform] = {
        contentCount: 0,
        avgEngagement: 0,
        opportunityCount: 0,
        totalEngagement: 0,
      };
    });

    // Calculate from filtered opportunities
    filteredOpportunities.forEach((opp) => {
      const platform = opp.content.platform;
      if (!metrics[platform]) return;

      metrics[platform].contentCount++;
      metrics[platform].opportunityCount++;
      metrics[platform].totalEngagement += opp.content.engagementScore;
    });

    // Calculate averages
    Object.keys(metrics).forEach((platform) => {
      const p = platform as Platform;
      if (metrics[p].contentCount > 0) {
        metrics[p].avgEngagement = Math.round(
          metrics[p].totalEngagement / metrics[p].contentCount
        );
      }
    });

    return metrics;
  }, [filteredOpportunities]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const total = filteredOpportunities.length;
    const engaged = filteredOpportunities.filter(opp => opp.analysis.isRead).length;
    const avgConfidence = total > 0
      ? filteredOpportunities.reduce((sum, opp) => sum + opp.analysis.confidenceScore, 0) / total
      : 0;

    return {
      totalOpportunities: total,
      engagementRate: total > 0 ? (engaged / total) * 100 : 0,
      avgConfidence: avgConfidence * 100,
    };
  }, [filteredOpportunities]);

  // Get top platforms by opportunity count
  const topPlatforms = useMemo(() => {
    return Object.entries(platformMetrics)
      .map(([platform, metrics]) => ({
        platform: platform as Platform,
        ...metrics,
      }))
      .filter(p => p.opportunityCount > 0)
      .sort((a, b) => b.opportunityCount - a.opportunityCount);
  }, [platformMetrics]);

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analytics</h2>
          <p className="text-xs text-gray-400 mt-1">
            Performance insights across all platforms
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Calendar className="w-4 h-4 text-gray-400" />
          {(['7d', '30d', '90d', 'all'] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                dateRange === range
                  ? 'bg-reddit-orange text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          icon={<Target className="w-5 h-5" />}
          label="Total Opportunities"
          value={overallMetrics.totalOpportunities.toString()}
          trend="+12%"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Engagement Rate"
          value={`${Math.round(overallMetrics.engagementRate)}%`}
          trend="+5%"
        />
        <MetricCard
          icon={<Award className="w-5 h-5" />}
          label="Avg Confidence"
          value={`${Math.round(overallMetrics.avgConfidence)}%`}
          trend="+3%"
        />
      </div>

      {/* Platform Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Platform Performance
        </h3>

        {/* Bar Chart */}
        <div className="space-y-3 mb-6">
          {topPlatforms.map((platform) => (
            <PlatformBar
              key={platform.platform}
              platform={platform.platform}
              count={platform.opportunityCount}
              maxCount={topPlatforms[0]?.opportunityCount || 1}
            />
          ))}
        </div>

        {/* Platform Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-white/10">
                <th className="pb-2 font-medium">Platform</th>
                <th className="pb-2 font-medium text-right">Content</th>
                <th className="pb-2 font-medium text-right">Avg Engagement</th>
                <th className="pb-2 font-medium text-right">Opportunities</th>
              </tr>
            </thead>
            <tbody>
              {topPlatforms.map((platform) => (
                <tr key={platform.platform} className="border-b border-white/5">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PLATFORM_ICONS[platform.platform]}</span>
                      <span className="text-white">{PLATFORM_DISPLAY_NAMES[platform.platform]}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-300">{platform.contentCount}</td>
                  <td className="py-3 text-right text-gray-300">{platform.avgEngagement}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-1 bg-reddit-orange/20 text-reddit-orange rounded text-xs font-medium">
                      {platform.opportunityCount}
                    </span>
                  </td>
                </tr>
              ))}
              {topPlatforms.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                    No data available for selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confidence Score Trends */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4">AI Confidence Distribution</h3>
        <ConfidenceDistribution opportunities={filteredOpportunities} />
      </div>

      {/* Performance Leaderboard */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-400" />
          Platform Leaderboard
        </h3>
        <div className="space-y-3">
          {topPlatforms.slice(0, 5).map((platform, index) => (
            <LeaderboardItem
              key={platform.platform}
              rank={index + 1}
              platform={platform.platform}
              score={platform.opportunityCount}
              avgEngagement={platform.avgEngagement}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
}

const MetricCard = ({ icon, label, value, trend }: MetricCardProps): JSX.Element => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        {trend && (
          <div className="text-xs text-green-400">{trend}</div>
        )}
      </div>
    </div>
  );
};

interface PlatformBarProps {
  platform: Platform;
  count: number;
  maxCount: number;
}

const PlatformBar = ({ platform, count, maxCount }: PlatformBarProps): JSX.Element => {
  const percentage = (count / maxCount) * 100;
  const color = PLATFORM_COLORS[platform];

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-2">
          <span>{PLATFORM_ICONS[platform]}</span>
          <span className="text-gray-300">{PLATFORM_DISPLAY_NAMES[platform]}</span>
        </div>
        <span className="text-gray-400">{count}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

interface ConfidenceDistributionProps {
  opportunities: any[];
}

const ConfidenceDistribution = ({ opportunities }: ConfidenceDistributionProps): JSX.Element => {
  const distribution = useMemo(() => {
    const ranges = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0,
    };

    opportunities.forEach((opp) => {
      const score = opp.analysis.confidenceScore * 100;
      if (score <= 20) ranges['0-20%']++;
      else if (score <= 40) ranges['21-40%']++;
      else if (score <= 60) ranges['41-60%']++;
      else if (score <= 80) ranges['61-80%']++;
      else ranges['81-100%']++;
    });

    return ranges;
  }, [opportunities]);

  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="space-y-2">
      {Object.entries(distribution).map(([range, count]) => (
        <div key={range} className="flex items-center gap-3">
          <div className="w-16 text-xs text-gray-400">{range}</div>
          <div className="flex-1 h-6 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-reddit-orange to-purple-500 transition-all duration-500"
              style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
            />
          </div>
          <div className="w-8 text-xs text-right text-gray-300">{count}</div>
        </div>
      ))}
    </div>
  );
};

interface LeaderboardItemProps {
  rank: number;
  platform: Platform;
  score: number;
  avgEngagement: number;
}

const LeaderboardItem = ({ rank, platform, score, avgEngagement }: LeaderboardItemProps): JSX.Element => {
  const medalColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-600' : 'text-gray-500';

  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
      <div className={`text-xl font-bold ${medalColor} w-8 text-center`}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{PLATFORM_ICONS[platform]}</span>
          <span className="font-medium text-white">{PLATFORM_DISPLAY_NAMES[platform]}</span>
        </div>
        <div className="text-xs text-gray-400">
          Avg Engagement: {avgEngagement}
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-reddit-orange">{score}</div>
        <div className="text-xs text-gray-400">opportunities</div>
      </div>
    </div>
  );
};
