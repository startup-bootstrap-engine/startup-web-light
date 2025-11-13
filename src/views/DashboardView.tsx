import { Bell, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { OpportunitiesFeed } from '../components/monitoring/OpportunitiesFeed';
import { StatsOverview } from '../components/monitoring/StatsOverview';
import { SourceManager } from '../components/monitoring/SourceManager';
import { AnalyticsDashboard } from '../components/monitoring/AnalyticsDashboard';
import { RealtimeStatus } from '../components/monitoring/RealtimeStatus';
import { useAuthStore } from '../store/authStore';
import { useModalStore } from '../store/modalStore';
import { useRealtimeOpportunities } from '../hooks/useRealtimeOpportunities';

export const DashboardView = (): JSX.Element => {
  const { isAuthenticated } = useAuthStore();
  const [animationOffset, setAnimationOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return <LandingHero animationOffset={animationOffset} />;
  }

  return <MonitoringDashboard />;
};

interface LandingHeroProps {
  animationOffset: number;
}

const LandingHero = ({ animationOffset }: LandingHeroProps): JSX.Element => {
  const { open } = useModalStore();

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center gap-8 opacity-5"
          style={{ transform: `translateY(${Math.sin(animationOffset / 10) * 20}px)` }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
              <div className="w-48 h-64 bg-gradient-to-br from-reddit-orange to-purple-600 rounded-xl opacity-50" />
              <div className="w-48 h-64 bg-gradient-to-br from-blue-500 to-reddit-orange rounded-xl opacity-50" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-reddit-orange/10 border border-reddit-orange/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-reddit-orange" />
          <span className="text-sm text-reddit-orange-light">AI-Powered Reddit Monitoring</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up">
          Monitor conversations across
          <span className="block mt-2 bg-gradient-to-r from-reddit-orange via-pink-500 to-purple-500 bg-clip-text text-transparent">
            multiple platforms
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
          Track Reddit, Hacker News, Product Hunt, and more. Get AI-powered engagement strategies for authentic opportunities.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-300">
          <button
            onClick={() => open('authenticationModal')}
            className="group bg-reddit-orange hover:bg-reddit-orange-dark px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-reddit-orange/30 flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Start Monitoring for Free
          </button>
          <button className="group border border-white/20 hover:border-white/40 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            See How It Works
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center animate-fade-in-up animation-delay-400">
          <div>
            <div className="text-3xl font-bold text-reddit-orange mb-1">50K+</div>
            <div className="text-sm text-gray-400">Posts Monitored</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-reddit-orange mb-1">95%</div>
            <div className="text-sm text-gray-400">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-reddit-orange mb-1">24/7</div>
            <div className="text-sm text-gray-400">Auto Monitoring</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 animate-fade-in-up animation-delay-500">
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-reddit-orange" />}
            title="Real-time Monitoring"
            description="Track multiple subreddits automatically and get instant notifications for relevant posts"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-purple-500" />}
            title="AI Analysis"
            description="Get intelligent engagement strategies and brand promotion suggestions for each post"
          />
          <FeatureCard
            icon={<Bell className="w-8 h-8 text-pink-500" />}
            title="Smart Notifications"
            description="Receive Telegram alerts with actionable insights to engage at the perfect moment"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps): JSX.Element => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all transform hover:scale-105 hover:border-reddit-orange/30">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

const MonitoringDashboard = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'monitors' | 'analytics'>('overview');
  const realtimeStatus = useRealtimeOpportunities();

  return (
    <div className="animate-fade-in">
      {/* Dashboard Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-white">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm">Track opportunities across multiple platforms</p>
        </div>
        <RealtimeStatus status={realtimeStatus} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-reddit-orange text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            activeTab === 'opportunities'
              ? 'bg-reddit-orange text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Opportunities
        </button>
        <button
          onClick={() => setActiveTab('monitors')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            activeTab === 'monitors'
              ? 'bg-reddit-orange text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Monitors
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
            activeTab === 'analytics'
              ? 'bg-reddit-orange text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'opportunities' && <OpportunitiesTab />}
      {activeTab === 'monitors' && <MonitorsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
};

const OverviewTab = (): JSX.Element => {
  return (
    <div className="space-y-6">
      <StatsOverview />
      <OpportunitiesFeed />
    </div>
  );
};

const OpportunitiesTab = (): JSX.Element => {
  return (
    <div>
      <OpportunitiesFeed />
    </div>
  );
};

const MonitorsTab = (): JSX.Element => {
  return (
    <div>
      <SourceManager />
    </div>
  );
};

const AnalyticsTab = (): JSX.Element => {
  return (
    <div>
      <AnalyticsDashboard />
    </div>
  );
};
