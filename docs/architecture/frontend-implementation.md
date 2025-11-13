## Frontend Implementation Guide

> **Related Documentation**: [Architecture Overview](./architecture-overview.md) | [Database Schema](./database-schema.md)

This document provides implementation details for the Reddit Monitor dashboard frontend.

---

## **Tech Stack**

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (with Realtime)
- **Routing**: React Router
- **UI Components**: Custom components built with Tailwind

---

## **Project Structure**

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── NavBar.tsx
│   ├── monitoring/
│   │   ├── SubredditList.tsx
│   │   ├── AddSubredditModal.tsx
│   │   ├── OpportunityCard.tsx
│   │   └── OpportunityList.tsx
│   └── modal/
│       └── Modal.tsx
├── views/
│   ├── DashboardView.tsx
│   ├── SubredditsView.tsx
│   └── AnalyticsView.tsx
├── store/
│   ├── monitoringStore.ts
│   └── authStore.ts
├── types/
│   └── monitoring.ts
├── config/
│   └── supabaseClient.ts
└── App.tsx
```

---

## **Core Features**

### **1. Subreddit Management**

#### `src/views/SubredditsView.tsx`
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { MonitoredSubreddit } from '../types/monitoring';
import SubredditList from '../components/monitoring/SubredditList';
import AddSubredditModal from '../components/monitoring/AddSubredditModal';

export default function SubredditsView() {
  const [subreddits, setSubreddits] = useState<MonitoredSubreddit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchSubreddits();
  }, []);

  async function fetchSubreddits() {
    setLoading(true);
    const { data, error } = await supabase
      .from('monitored_subreddits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subreddits:', error);
    } else {
      setSubreddits(data || []);
    }
    setLoading(false);
  }

  async function handleAddSubreddit(name: string, config: any) {
    const { data, error } = await supabase
      .from('monitored_subreddits')
      .insert({
        name,
        min_upvotes: config.minUpvotes,
        min_comments: config.minComments,
        keywords: config.keywords,
      })
      .select()
      .single();

    if (error) {
      alert('Error adding subreddit: ' + error.message);
    } else {
      setSubreddits([data, ...subreddits]);
      setShowAddModal(false);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('monitored_subreddits')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      alert('Error updating subreddit');
    } else {
      fetchSubreddits();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this subreddit?')) return;

    const { error } = await supabase
      .from('monitored_subreddits')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting subreddit');
    } else {
      setSubreddits(subreddits.filter(s => s.id !== id));
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Monitored Subreddits</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Subreddit
        </button>
      </div>

      <SubredditList
        subreddits={subreddits}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      {showAddModal && (
        <AddSubredditModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSubreddit}
        />
      )}
    </div>
  );
}
```

#### `src/components/monitoring/SubredditList.tsx`
```typescript
import { MonitoredSubreddit } from '../../types/monitoring';

interface Props {
  subreddits: MonitoredSubreddit[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

export default function SubredditList({ subreddits, onToggleActive, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subreddits.map(subreddit => (
        <div
          key={subreddit.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">r/{subreddit.name}</h3>
            <span
              className={`px-2 py-1 rounded text-xs ${
                subreddit.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {subreddit.is_active ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1 mb-4">
            <p>Min Upvotes: {subreddit.min_upvotes}</p>
            <p>Min Comments: {subreddit.min_comments}</p>
            {subreddit.keywords && subreddit.keywords.length > 0 && (
              <div>
                <p>Keywords:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {subreddit.keywords.map(keyword => (
                    <span
                      key={keyword}
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onToggleActive(subreddit.id, subreddit.is_active)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
            >
              {subreddit.is_active ? 'Pause' : 'Activate'}
            </button>
            <button
              onClick={() => onDelete(subreddit.id)}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### **2. Opportunities Dashboard**

#### `src/views/DashboardView.tsx`
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { Opportunity } from '../types/monitoring';
import OpportunityList from '../components/monitoring/OpportunityList';

export default function DashboardView() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high-confidence'>('all');

  useEffect(() => {
    fetchOpportunities();
    subscribeToNewOpportunities();
  }, [filter]);

  async function fetchOpportunities() {
    setLoading(true);

    let query = supabase
      .from('ai_analysis')
      .select(`
        *,
        post:processed_posts(*),
        notification:notifications(*)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'unread') {
      query = query.eq('notifications.is_read', false);
    } else if (filter === 'high-confidence') {
      query = query.gte('confidence_score', 0.7);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching opportunities:', error);
    } else {
      setOpportunities(data || []);
    }

    setLoading(false);
  }

  function subscribeToNewOpportunities() {
    const channel = supabase
      .channel('ai_analysis_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_analysis',
        },
        async (payload) => {
          console.log('New opportunity:', payload);

          // Fetch full record with relations
          const { data } = await supabase
            .from('ai_analysis')
            .select(`
              *,
              post:processed_posts(*),
              notification:notifications(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setOpportunities(prev => [data, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('analysis_id', id);

    if (!error) {
      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === id
            ? { ...opp, notification: { ...opp.notification, is_read: true } }
            : opp
        )
      );
    }
  }

  async function markAsEngaged(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_engaged: true })
      .eq('analysis_id', id);

    if (!error) {
      fetchOpportunities();
    }
  }

  if (loading) {
    return <div className="p-8">Loading opportunities...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Opportunities</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('high-confidence')}
            className={`px-4 py-2 rounded ${
              filter === 'high-confidence'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            High Confidence
          </button>
        </div>
      </div>

      <OpportunityList
        opportunities={opportunities}
        onMarkAsRead={markAsRead}
        onMarkAsEngaged={markAsEngaged}
      />
    </div>
  );
}
```

#### `src/components/monitoring/OpportunityCard.tsx`
```typescript
import { Opportunity } from '../../types/monitoring';

interface Props {
  opportunity: Opportunity;
  onMarkAsRead: (id: string) => void;
  onMarkAsEngaged: (id: string) => void;
}

export default function OpportunityCard({ opportunity, onMarkAsRead, onMarkAsEngaged }: Props) {
  const confidencePercent = (opportunity.confidence_score * 100).toFixed(0);
  const isUnread = opportunity.notification && !opportunity.notification.is_read;

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }

  return (
    <div
      className={`border rounded-lg p-6 ${
        isUnread ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{opportunity.post.title}</h3>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>r/{opportunity.post.subreddit}</span>
            <span>{opportunity.post.upvotes} upvotes</span>
            <span>{opportunity.post.comment_count} comments</span>
          </div>
        </div>
        <div className="ml-4">
          <div className={`text-2xl font-bold ${
            opportunity.confidence_score >= 0.8 ? 'text-green-600' :
            opportunity.confidence_score >= 0.6 ? 'text-yellow-600' :
            'text-gray-600'
          }`}>
            {confidencePercent}%
          </div>
          <div className="text-xs text-gray-500">confidence</div>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-1">Engagement Strategy</h4>
          <p className="text-gray-800">{opportunity.engagement_strategy}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-1">Brand Opportunity</h4>
          <p className="text-gray-800">{opportunity.brand_opportunity}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
            Recommended Action
            <button
              onClick={() => copyToClipboard(opportunity.recommended_action)}
              className="text-blue-600 hover:text-blue-700 text-xs"
            >
              Copy
            </button>
          </h4>
          <p className="text-gray-800 bg-gray-50 p-3 rounded">
            {opportunity.recommended_action}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <a
          href={`https://reddit.com${opportunity.post.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded"
        >
          View Post
        </a>
        {isUnread && (
          <button
            onClick={() => onMarkAsRead(opportunity.id)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          >
            Mark Read
          </button>
        )}
        <button
          onClick={() => onMarkAsEngaged(opportunity.id)}
          className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded"
        >
          Engaged
        </button>
      </div>
    </div>
  );
}
```

---

### **3. Realtime Updates**

#### `src/config/supabaseClient.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

---

### **4. Type Definitions**

#### `src/types/monitoring.ts`
```typescript
export interface MonitoredSubreddit {
  id: string;
  name: string;
  min_upvotes: number;
  min_comments: number;
  keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessedPost {
  id: string;
  reddit_post_id: string;
  subreddit_id: string;
  title: string;
  content: string | null;
  author: string;
  subreddit: string;
  upvotes: number;
  comment_count: number;
  url: string;
  permalink: string;
  created_utc: string;
  fetched_at: string;
}

export interface AIAnalysis {
  id: string;
  post_id: string;
  engagement_strategy: string;
  brand_opportunity: string;
  recommended_action: string;
  confidence_score: number;
  ai_model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  created_at: string;
}

export interface Notification {
  id: string;
  analysis_id: string;
  sent_to_telegram: boolean;
  telegram_message_id: string | null;
  is_read: boolean;
  is_engaged: boolean;
  priority: number;
  sent_at: string | null;
  created_at: string;
}

export interface Opportunity extends AIAnalysis {
  post: ProcessedPost;
  notification: Notification | null;
}
```

---

### **5. State Management (Optional)**

#### `src/store/monitoringStore.ts`
```typescript
import { create } from 'zustand';
import { Opportunity, MonitoredSubreddit } from '../types/monitoring';

interface MonitoringState {
  opportunities: Opportunity[];
  subreddits: MonitoredSubreddit[];
  setOpportunities: (opportunities: Opportunity[]) => void;
  addOpportunity: (opportunity: Opportunity) => void;
  setSubreddits: (subreddits: MonitoredSubreddit[]) => void;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  opportunities: [],
  subreddits: [],
  setOpportunities: (opportunities) => set({ opportunities }),
  addOpportunity: (opportunity) =>
    set((state) => ({ opportunities: [opportunity, ...state.opportunities] })),
  setSubreddits: (subreddits) => set({ subreddits }),
}));
```

---

## **Deployment**

### **Environment Variables**
Create `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME="Reddit Monitor"
```

### **Build and Deploy**
```bash
# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=reddit-monitor

# Or deploy to Vercel
vercel --prod
```

---

## **Future Enhancements**

- Analytics dashboard with charts
- Subreddit performance comparison
- Export opportunities to CSV
- Custom AI prompt configuration
- Multi-brand support
- Engagement tracking metrics

See [deployment-guide.md](./deployment-guide.md) for complete deployment instructions.
