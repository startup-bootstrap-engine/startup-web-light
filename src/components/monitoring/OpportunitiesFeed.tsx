import { ArrowUpRight, Check, Copy, ExternalLink, Sparkles, TrendingUp, X } from 'lucide-react';
import { JSX, useState } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';
import { Opportunity } from '../../types/monitoring';

export const OpportunitiesFeed = (): JSX.Element => {
  const { opportunities, markOpportunityAsRead, removeOpportunity, stats } = useMonitoringStore();
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredOpportunities = opportunities.filter(
    (opp) => filter === 'all' || opp.analysis.priority === filter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-reddit-orange" />
            Opportunities
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {stats.opportunities} opportunities found today
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setFilter(priority)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
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

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No opportunities found</p>
            <p className="text-sm text-gray-500 mt-2">
              Opportunities will appear here when relevant posts are detected
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
}

const OpportunityCard = ({
  opportunity,
  onView,
  onMarkRead,
  onRemove,
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
      className={`bg-white/5 border rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer ${
        analysis.isRead ? 'opacity-60' : ''
      }`}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-purple-400 font-medium">r/{content.sourceName}</span>
            <span className="text-xs text-gray-500">{formatTimeAgo(content.createdAt)}</span>
            {!analysis.isRead && (
              <span className="w-2 h-2 bg-reddit-orange rounded-full animate-pulse"></span>
            )}
          </div>
          <h3 className="font-semibold text-white mb-2 line-clamp-2">{content.title}</h3>
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead();
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4 text-green-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" />
          {content.engagementScore} upvotes
        </span>
        <span>{content.commentCount} comments</span>
        <span>by u/{content.author}</span>
      </div>

      {/* AI Analysis Preview */}
      <div className="bg-white/5 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-300 line-clamp-2">{analysis.engagementStrategy}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full border ${priorityColors[analysis.priority]}`}
          >
            {analysis.priority.toUpperCase()} Priority
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(analysis.confidenceScore * 100)}% confidence
          </span>
        </div>
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-sm text-reddit-orange hover:underline flex items-center gap-1"
        >
          View Post
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
}

const OpportunityDetailModal = ({
  opportunity,
  onClose,
  onMarkRead,
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
              <span className="text-sm text-purple-400 font-medium">r/{content.sourceName}</span>
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
                {content.engagementScore} upvotes
              </span>
              <span>{content.commentCount} comments</span>
              <span>by u/{content.author}</span>
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
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-reddit-orange hover:bg-reddit-orange-dark px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Open Reddit Post
          </a>
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
