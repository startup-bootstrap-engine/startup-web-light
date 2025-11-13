import { Activity, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';
import { JSX } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';

export const StatsOverview = (): JSX.Element => {
  const { stats } = useMonitoringStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={<Activity className="w-6 h-6" />}
        title="Active Monitors"
        value={stats.activeMonitors}
        trend="+1 this week"
        color="reddit-orange"
      />
      <StatCard
        icon={<MessageSquare className="w-6 h-6" />}
        title="Posts Today"
        value={stats.postsToday}
        trend="+23 from yesterday"
        color="purple-500"
      />
      <StatCard
        icon={<TrendingUp className="w-6 h-6" />}
        title="Opportunities"
        value={stats.opportunities}
        trend="+5 this hour"
        color="pink-500"
      />
      <StatCard
        icon={<CheckCircle className="w-6 h-6" />}
        title="Engaged"
        value={stats.engaged}
        trend="+4 today"
        color="green-500"
      />
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
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all hover:scale-105 transform">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-${color}/20 rounded-lg text-${color}`}>{icon}</div>
      </div>
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className={`text-3xl font-bold text-${color} mb-2`}>{value}</div>
      <div className="text-xs text-green-500">{trend}</div>
    </div>
  );
};
