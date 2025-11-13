import { Activity, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { JSX } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';
import { Platform, PLATFORM_DISPLAY_NAMES, PLATFORM_COLORS } from '../../types/monitoring';

export const StatsOverview = (): JSX.Element => {
  const { stats } = useMonitoringStore();

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          title="Active Monitors"
          value={stats.activeMonitors}
          trend="+1 this week"
          color="reddit-orange"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5" />}
          title="Content Today"
          value={stats.contentToday}
          trend="+23 from yesterday"
          color="purple-500"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Opportunities"
          value={stats.opportunities}
          trend="+5 this hour"
          color="pink-500"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5" />}
          title="Engaged"
          value={stats.engaged}
          trend="+4 today"
          color="green-500"
        />
      </div>

      {/* Platform-Specific Stats */}
      {stats.statsByPlatform && Object.keys(stats.statsByPlatform).length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Platform Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(stats.statsByPlatform) as [Platform, any][]).map(([platform, platformStats]) => (
              <PlatformStatCard key={platform} platform={platform} stats={platformStats} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  trend: string;
  color: string;
}

const StatCard = ({ icon, title, value, trend, color }: StatCardProps): JSX.Element => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-${color}/20 rounded text-${color}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-400 mb-0.5">{title}</div>
          <div className={`text-2xl font-bold text-${color}`}>{value}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">{trend}</div>
    </div>
  );
};

interface PlatformStatCardProps {
  platform: Platform;
  stats: {
    activeMonitors: number;
    contentToday: number;
    opportunities: number;
  };
}

const PlatformStatCard = ({ platform, stats }: PlatformStatCardProps): JSX.Element => {
  return (
    <div
      className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all"
      style={{ borderColor: `${PLATFORM_COLORS[platform]}40` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-medium text-white text-sm">{PLATFORM_DISPLAY_NAMES[platform]}</h4>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Monitors:</span>
          <span className="text-white font-medium">{stats.activeMonitors}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Content:</span>
          <span className="text-white font-medium">{stats.contentToday}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Opportunities:</span>
          <span className="text-reddit-orange font-medium">{stats.opportunities}</span>
        </div>
      </div>
    </div>
  );
};
