import { Plus, Settings, Trash2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';
import {
  Platform,
  PLATFORM_DISPLAY_NAMES,
  PLATFORM_ICONS,
  getSourceIdentifierLabel,
  getEngagementLabel
} from '../../types/monitoring';

export const SourceManager = (): JSX.Element => {
  const { sources, addSource, removeSource, toggleSource, updateSource } = useMonitoringStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  const filteredSources = platformFilter === 'all'
    ? sources
    : sources.filter(s => s.platform === platformFilter);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-reddit-orange" />
            Source Monitors
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Monitor multiple platforms for opportunities
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-reddit-orange hover:bg-reddit-orange-dark px-4 py-2 rounded-lg transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Platform Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setPlatformFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
            platformFilter === 'all'
              ? 'bg-reddit-orange text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          All Platforms
        </button>
        {(Object.keys(PLATFORM_DISPLAY_NAMES) as Platform[]).map((platform) => (
          <button
            key={platform}
            onClick={() => setPlatformFilter(platform)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
              platformFilter === platform
                ? 'bg-reddit-orange text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{PLATFORM_ICONS[platform]}</span>
            <span>{PLATFORM_DISPLAY_NAMES[platform]}</span>
          </button>
        ))}
      </div>

      {showAddForm && (
        <AddSourceForm
          onAdd={(data) => {
            addSource(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-3">
        {filteredSources.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <p className="text-gray-400">
              No sources found for {platformFilter === 'all' ? 'any platform' : PLATFORM_DISPLAY_NAMES[platformFilter]}
            </p>
          </div>
        ) : (
          filteredSources.map((source) => (
            <div
              key={source.id}
              className={`bg-white/5 border rounded-xl p-4 transition-all ${
                source.isActive ? 'border-reddit-orange/30' : 'border-white/10'
              }`}
            >
              {editingId === source.id ? (
                <EditSourceForm
                  source={source}
                  onSave={(updates) => {
                    updateSource(source.id, updates);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{PLATFORM_ICONS[source.platform]}</span>
                      <h3 className="text-lg font-semibold text-reddit-orange">
                        {source.sourceIdentifier}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded-full">
                        {PLATFORM_DISPLAY_NAMES[source.platform]}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={source.isActive}
                          onChange={() => toggleSource(source.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-reddit-orange"></div>
                      </label>
                      <span className="text-xs text-gray-400">
                        {source.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {source.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>Min {getEngagementLabel(source.platform).toLowerCase()}: {source.minEngagementScore}</span>
                      <span>Min comments: {source.minComments}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(source.id)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => removeSource(source.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface AddSourceFormProps {
  onAdd: (data: {
    platform: Platform;
    sourceIdentifier: string;
    keywords: string[];
    minEngagementScore: number;
    minComments: number;
    isActive: boolean;
  }) => void;
  onCancel: () => void;
}

const AddSourceForm = ({ onAdd, onCancel }: AddSourceFormProps): JSX.Element => {
  const [platform, setPlatform] = useState<Platform>('reddit');
  const [sourceIdentifier, setSourceIdentifier] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minEngagementScore, setMinEngagementScore] = useState(10);
  const [minComments, setMinComments] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      platform,
      sourceIdentifier: sourceIdentifier.replace(/^(r\/|@|#)/, ''),
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      minEngagementScore,
      minComments,
      isActive: true,
    });
  };

  const getPlaceholder = () => {
    switch (platform) {
      case 'reddit':
        return 'e.g., webdev or r/webdev';
      case 'hackernews':
        return 'e.g., newest, front, ask, show, jobs';
      case 'producthunt':
        return 'e.g., productivity, dev-tools';
      case 'stackoverflow':
        return 'e.g., javascript, react, nodejs';
      case 'twitter':
        return 'e.g., @username or #hashtag';
      case 'github':
        return 'e.g., facebook/react';
      case 'discord':
        return 'e.g., 1234567890123456789 (channel ID)';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 border border-reddit-orange/30 rounded-xl p-4 mb-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="col-span-2">
          <label className="block text-sm text-gray-300 mb-2">Platform</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(PLATFORM_DISPLAY_NAMES) as [Platform, string][]).map(([key, name]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPlatform(key)}
                className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                  platform === key
                    ? 'bg-reddit-orange text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span>{PLATFORM_ICONS[key]}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {getSourceIdentifierLabel(platform)}
          </label>
          <input
            type="text"
            value={sourceIdentifier}
            onChange={(e) => setSourceIdentifier(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Keywords (comma-separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="react, portfolio, feedback"
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Min {getEngagementLabel(platform)}
          </label>
          <input
            type="number"
            value={minEngagementScore}
            onChange={(e) => setMinEngagementScore(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Min Comments</label>
          <input
            type="number"
            value={minComments}
            onChange={(e) => setMinComments(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="0"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-reddit-orange hover:bg-reddit-orange-dark rounded-lg transition-colors"
        >
          Add Monitor
        </button>
      </div>
    </form>
  );
};

interface EditSourceFormProps {
  source: {
    platform: Platform;
    sourceIdentifier: string;
    keywords: string[];
    minEngagementScore: number;
    minComments: number;
  };
  onSave: (updates: {
    keywords: string[];
    minEngagementScore: number;
    minComments: number;
  }) => void;
  onCancel: () => void;
}

const EditSourceForm = ({ source, onSave, onCancel }: EditSourceFormProps): JSX.Element => {
  const [keywords, setKeywords] = useState(source.keywords.join(', '));
  const [minEngagementScore, setMinEngagementScore] = useState(source.minEngagementScore);
  const [minComments, setMinComments] = useState(source.minComments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      minEngagementScore,
      minComments,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Min {getEngagementLabel(source.platform)}
          </label>
          <input
            type="number"
            value={minEngagementScore}
            onChange={(e) => setMinEngagementScore(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Min Comments</label>
          <input
            type="number"
            value={minComments}
            onChange={(e) => setMinComments(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white"
            min="0"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-reddit-orange hover:bg-reddit-orange-dark rounded-lg transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
};
