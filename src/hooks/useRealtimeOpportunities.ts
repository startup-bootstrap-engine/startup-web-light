import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/supabaseClient';
import { useMonitoringStore } from '../store/monitoringStore';
import { Opportunity, Content, AIAnalysis } from '../types/monitoring';

export interface RealtimeStatus {
  isConnected: boolean;
  error: string | null;
}

export const useRealtimeOpportunities = () => {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    error: null,
  });
  const { addOpportunity } = useMonitoringStore();

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      try {
        // Subscribe to new AI analyses
        channel = supabase
          .channel('ai_analysis_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ai_analysis',
            },
            async (payload) => {
              console.log('New AI analysis received:', payload);

              // Fetch the related content
              const { data: contentData, error: contentError } = await supabase
                .from('processed_content')
                .select('*')
                .eq('id', payload.new.content_id)
                .single();

              if (contentError || !contentData) {
                console.error('Error fetching content:', contentError);
                return;
              }

              // Transform database records to application types
              const content: Content = {
                id: contentData.id,
                platform: contentData.platform as any,
                externalContentId: contentData.external_content_id,
                sourceId: contentData.source_id || '',
                sourceName: contentData.source_name,
                contentType: (contentData.content_type || 'post') as any,
                title: contentData.title,
                content: contentData.content || '',
                author: contentData.author || 'unknown',
                engagementScore: contentData.engagement_score || 0,
                commentCount: contentData.comment_count || 0,
                url: contentData.url,
                permalink: contentData.permalink || undefined,
                platformSpecificData: contentData.platform_specific_data as any,
                createdAt: contentData.created_utc || new Date().toISOString(),
                fetchedAt: contentData.fetched_at || new Date().toISOString(),
              };

              const analysis: AIAnalysis = {
                id: payload.new.id,
                contentId: payload.new.content_id,
                engagementStrategy: payload.new.engagement_strategy,
                brandOpportunity: payload.new.brand_opportunity || '',
                recommendedAction: payload.new.recommended_action || '',
                confidenceScore: payload.new.confidence_score || 0,
                priority: determinePriority(payload.new.confidence_score || 0),
                aiModel: payload.new.ai_model || undefined,
                promptTokens: payload.new.prompt_tokens || undefined,
                completionTokens: payload.new.completion_tokens || undefined,
                createdAt: payload.new.created_at || new Date().toISOString(),
                isRead: false,
              };

              const opportunity: Opportunity = {
                content,
                analysis,
              };

              // Add to store
              addOpportunity(opportunity);

              // Show browser notification if permitted
              if (Notification.permission === 'granted') {
                new Notification('New Opportunity Found!', {
                  body: `${content.platform}: ${content.title.substring(0, 100)}...`,
                  icon: '/favicon.ico',
                });
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setStatus({ isConnected: true, error: null });
              console.log('✅ Realtime subscription active');
            } else if (status === 'CHANNEL_ERROR') {
              setStatus({ isConnected: false, error: 'Connection error' });
              console.error('❌ Realtime subscription error');
            } else if (status === 'TIMED_OUT') {
              setStatus({ isConnected: false, error: 'Connection timeout' });
              console.error('⏱️ Realtime subscription timeout');
            } else if (status === 'CLOSED') {
              setStatus({ isConnected: false, error: 'Connection closed' });
              console.log('🔌 Realtime subscription closed');
            }
          });

        // Request notification permission
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.error('Error setting up realtime:', error);
        setStatus({ isConnected: false, error: String(error) });
      }
    };

    setupRealtime();

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log('🧹 Cleaned up realtime subscription');
      }
    };
  }, [addOpportunity]);

  return status;
};

// Helper function to determine priority based on confidence score
function determinePriority(confidenceScore: number): 'low' | 'medium' | 'high' {
  if (confidenceScore >= 0.8) return 'high';
  if (confidenceScore >= 0.6) return 'medium';
  return 'low';
}
