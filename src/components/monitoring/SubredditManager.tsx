import { Plus, Settings, Trash2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { useMonitoringStore } from '../../store/monitoringStore';

export const SubredditManager = (): JSX.Element => {
  const { subreddits, addSubreddit, removeSubreddit, toggleSubreddit, updateSubreddit } =
    useMonitoringStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-reddit-orange" />
          Subreddit Monitors
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-reddit-orange hover:bg-reddit-orange-dark px-4 py-2 rounded-lg transition-all transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Subreddit
        </button>
      </div>

      {showAddForm && (
        <AddSubredditForm
          onAdd={(data) => {
            addSubreddit(data);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-3">
        {subreddits.map((subreddit) => (
          <div
            key={subreddit.id}
            className={`bg-white/5 border rounded-xl p-4 transition-all ${
              subreddit.isActive ? 'border-reddit-orange/30' : 'border-white/10'
            }`}
          >
            {editingId === subreddit.id ? (
              <EditSubredditForm
                subreddit={subreddit}
                onSave={(updates) => {
                  updateSubreddit(subreddit.id, updates);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-reddit-orange">
                      r/{subreddit.name}
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subreddit.isActive}
                        onChange={() => toggleSubreddit(subreddit.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-reddit-orange"></div>
                    </label>
                    <span className="text-xs text-gray-400">
                      {subreddit.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {subreddit.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Min upvotes: {subreddit.minUpvotes}</span>
                    <span>Min comments: {subreddit.minComments}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(subreddit.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => removeSubreddit(subreddit.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface AddSubredditFormProps {
  onAdd: (data: {
    name: string;
    keywords: string[];
    minUpvotes: number;
    minComments: number;
    isActive: boolean;
  }) => void;
  onCancel: () => void;
}

const AddSubredditForm = ({ onAdd, onCancel }: AddSubredditFormProps): JSX.Element => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minUpvotes, setMinUpvotes] = useState(10);
  const [minComments, setMinComments] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: name.replace(/^r\//, ''),
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      minUpvotes,
      minComments,
      isActive: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 border border-reddit-orange/30 rounded-xl p-4 mb-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Subreddit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., webdev or r/webdev"
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
          <label className="block text-sm text-gray-300 mb-1">Min Upvotes</label>
          <input
            type="number"
            value={minUpvotes}
            onChange={(e) => setMinUpvotes(Number(e.target.value))}
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

interface EditSubredditFormProps {
  subreddit: {
    name: string;
    keywords: string[];
    minUpvotes: number;
    minComments: number;
  };
  onSave: (updates: {
    keywords: string[];
    minUpvotes: number;
    minComments: number;
  }) => void;
  onCancel: () => void;
}

const EditSubredditForm = ({ subreddit, onSave, onCancel }: EditSubredditFormProps): JSX.Element => {
  const [keywords, setKeywords] = useState(subreddit.keywords.join(', '));
  const [minUpvotes, setMinUpvotes] = useState(subreddit.minUpvotes);
  const [minComments, setMinComments] = useState(subreddit.minComments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      minUpvotes,
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
          <label className="block text-sm text-gray-300 mb-1">Min Upvotes</label>
          <input
            type="number"
            value={minUpvotes}
            onChange={(e) => setMinUpvotes(Number(e.target.value))}
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
