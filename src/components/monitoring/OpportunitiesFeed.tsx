import { ArrowUpRight, Check, Copy, ExternalLink, RefreshCw, Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { JSX, useState } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';
import { Opportunity, Platform, PLATFORM_DISPLAY_NAMES, PLATFORM_ICONS, getEngagementLabel, getContentUrl, ContentType } from '../../types/monitoring';

export const OpportunitiesFeed = (): JSX.Element => {
  const { opportunities, markOpportunityAsRead, removeOpportunity, reprocessOpportunity, stats } = useMonitoringStore();
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [minEngagement, setMinEngagement] = useState<number>(0);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredOpportunities = opportunities.filter(
    (opp) =>
      (filter === 'all' || opp.analysis.priority === filter) &&
      (platformFilter === 'all' || opp.content.platform === platformFilter) &&
      (contentTypeFilter === 'all' || opp.content.contentType === contentTypeFilter) &&
      opp.content.engagementScore >= minEngagement &&
      opp.analysis.confidenceScore >= minConfidence / 100 &&
      (searchQuery === '' ||
        opp.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.content.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Opportunities
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            {filteredOpportunities.length} of {stats.opportunities} opportunities
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search opportunities by title, content, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-reddit-orange/50"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          {/* Priority Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Priority</label>
            <div className="flex gap-2 flex-wrap items-center">
              {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFilter(priority)}
                  className={`px-2.5 py-1 rounded text-xs transition-all ${
                    filter === priority
                      ? 'bg-reddit-orange text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Platform</label>
            <div className="flex gap-2 flex-wrap items-center">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  platformFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {(Object.keys(PLATFORM_DISPLAY_NAMES) as Platform[]).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(platform)}
                  className={`px-2.5 py-1 rounded text-xs transition-all ${
                    platformFilter === platform
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {PLATFORM_DISPLAY_NAMES[platform]}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Content Type</label>
            <div className="flex gap-2 flex-wrap items-center">
              {(['all', 'post', 'comment', 'question', 'discussion', 'issue', 'tweet', 'message'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentTypeFilter(type as ContentType | 'all')}
                  className={`px-2.5 py-1 rounded text-xs transition-all ${
                    contentTypeFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Engagement & Confidence Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Min Engagement: {minEngagement}
              </label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={minEngagement}
                onChange={(e) => setMinEngagement(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Min Confidence: {minConfidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilter('all');
              setPlatformFilter('all');
              setContentTypeFilter('all');
              setMinEngagement(0);
              setMinConfidence(0);
              setSearchQuery('');
            }}
            className="text-xs text-reddit-orange hover:underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Opportunities List */}
      <div className="space-y-3">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-sm">No opportunities found</p>
            <p className="text-xs text-gray-500 mt-1">
              Opportunities will appear when relevant content is detected
            </p>
          </div>
        ) : (
          filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.analysis.id}
              opportunity={opp}
              onView={() => setSelectedOpp(opp)}
              onMarkRead={() => markOpportunityAsRead(opp.analysis.id)}
              onRemove={() => removeOpportunity(opp.analysis.id)}
              onReprocess={() => reprocessOpportunity(opp.analysis.id)}
            />
          ))
        )}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpp && (
        <OpportunityDetailModal
          opportunity={selectedOpp}
          onClose={() => setSelectedOpp(null)}
          onMarkRead={() => {
            markOpportunityAsRead(selectedOpp.analysis.id);
            setSelectedOpp(null);
          }}
          onReprocess={() => {
            reprocessOpportunity(selectedOpp.analysis.id);
          }}
        />
      )}
    </div>
  );
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onView: () => void;
  onMarkRead: () => void;
  onRemove: () => void;
  onReprocess: () => void;
}

const OpportunityCard = ({
  opportunity,
  onView,
  onMarkRead,
  onRemove,
  onReprocess,
}: OpportunityCardProps): JSX.Element => {
  const { content, analysis } = opportunity;
  const priorityColors = {
    high: 'text-reddit-orange border-reddit-orange/30',
    medium: 'text-yellow-500 border-yellow-500/30',
    low: 'text-blue-500 border-blue-500/30',
  };

  const formatTimeAgo = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div
      className={`bg-white/5 border rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer ${
        analysis.isRead ? 'opacity-60' : ''
      }`}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{PLATFORM_ICONS[content.platform]}</span>
            <span className="text-xs px-2 py-0.5 bg-white/10 text-gray-400 rounded">
              {PLATFORM_DISPLAY_NAMES[content.platform]}
            </span>
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
              {content.contentType}
            </span>
            <span className="text-xs text-gray-400">{content.sourceName}</span>
            <span className="text-xs text-gray-500">{formatTimeAgo(content.createdAt)}</span>
            {!analysis.isRead && (
              <span className="w-1.5 h-1.5 bg-reddit-orange rounded-full"></span>
            )}
          </div>
          <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">{content.title}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {content.engagementScore}
            </span>
            <span>{content.commentCount} comments</span>
            <span>by {content.author}</span>
          </div>
        </div>
        <div className="flex gap-1 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReprocess();
            }}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Reprocess with AI"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5 text-green-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
            title="Remove"
          >
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>

      {/* AI Analysis Preview */}
      <div className="bg-white/5 rounded p-2 mb-2">
        <p className="text-xs text-gray-300 line-clamp-2">{analysis.engagementStrategy}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded border ${priorityColors[analysis.priority]}`}
          >
            {analysis.priority.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(analysis.confidenceScore * 100)}%
          </span>
        </div>
        <a
          href={getContentUrl(content)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-reddit-orange hover:underline flex items-center gap-1"
        >
          View
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

interface OpportunityDetailModalProps {
  opportunity: Opportunity;
  onClose: () => void;
  onMarkRead: () => void;
  onReprocess: () => void;
}

const OpportunityDetailModal = ({
  opportunity,
  onClose,
  onMarkRead,
  onReprocess,
}: OpportunityDetailModalProps): JSX.Element => {
  const { content, analysis } = opportunity;
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-11/12 max-w-3xl z-[101] bg-base-200 border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{PLATFORM_ICONS[content.platform]}</span>
              <span className="text-sm text-purple-400 font-medium">{content.sourceName}</span>
              <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded-full">
                {PLATFORM_DISPLAY_NAMES[content.platform]}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                {content.contentType}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  analysis.priority === 'high'
                    ? 'bg-reddit-orange/20 text-reddit-orange'
                    : analysis.priority === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-blue-500/20 text-blue-500'
                }`}
              >
                {analysis.priority.toUpperCase()} Priority
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {content.engagementScore} {getEngagementLabel(content.platform).toLowerCase()}
              </span>
              <span>{content.commentCount} comments</span>
              <span>by {content.author}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Post Content</h3>
          <p className="text-gray-400 text-sm whitespace-pre-wrap">{content.content}</p>
        </div>

        {/* AI Analysis */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-reddit-orange/10 to-purple-500/10 rounded-xl p-4 border border-reddit-orange/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-reddit-orange" />
              <h3 className="font-semibold text-white">AI Engagement Strategy</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">{analysis.engagementStrategy}</p>
            <button
              onClick={() => handleCopy(analysis.engagementStrategy)}
              className="flex items-center gap-2 text-sm text-reddit-orange hover:underline"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Strategy'}
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">Brand Opportunity</h3>
            <p className="text-gray-300 text-sm">{analysis.brandOpportunity}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">Recommended Action</h3>
            <p className="text-gray-300 text-sm mb-3">{analysis.recommendedAction}</p>
            <button
              onClick={() => handleCopy(analysis.recommendedAction)}
              className="flex items-center gap-2 text-sm text-reddit-orange hover:underline"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Action'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Confidence Score:</span>
            <div className="flex-1 bg-white/10 rounded-full h-2">
              <div
                className="bg-reddit-orange h-2 rounded-full"
                style={{ width: `${analysis.confidenceScore * 100}%` }}
              />
            </div>
            <span>{Math.round(analysis.confidenceScore * 100)}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href={getContentUrl(content)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-reddit-orange hover:bg-reddit-orange-dark px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Open on {PLATFORM_DISPLAY_NAMES[content.platform]}
          </a>
          <button
            onClick={onReprocess}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all flex items-center gap-2"
            title="Reanalyze with AI"
          >
            <RefreshCw className="w-5 h-5" />
            Reprocess
          </button>
          <button
            onClick={onMarkRead}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  );
};
