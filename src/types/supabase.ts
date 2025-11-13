export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          ai_model: string | null
          brand_opportunity: string | null
          completion_tokens: number | null
          confidence_score: number | null
          content_id: string | null
          created_at: string | null
          engagement_strategy: string
          id: string
          prompt_tokens: number | null
          recommended_action: string | null
        }
        Insert: {
          ai_model?: string | null
          brand_opportunity?: string | null
          completion_tokens?: number | null
          confidence_score?: number | null
          content_id?: string | null
          created_at?: string | null
          engagement_strategy: string
          id?: string
          prompt_tokens?: number | null
          recommended_action?: string | null
        }
        Update: {
          ai_model?: string | null
          brand_opportunity?: string | null
          completion_tokens?: number | null
          confidence_score?: number | null
          content_id?: string | null
          created_at?: string | null
          engagement_strategy?: string
          id?: string
          prompt_tokens?: number | null
          recommended_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "processed_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "processed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          min_comments: number | null
          min_engagement_score: number | null
          platform: string
          platform_specific_config: Json | null
          source_identifier: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          min_comments?: number | null
          min_engagement_score?: number | null
          platform?: string
          platform_specific_config?: Json | null
          source_identifier: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          min_comments?: number | null
          min_engagement_score?: number | null
          platform?: string
          platform_specific_config?: Json | null
          source_identifier?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          analysis_id: string | null
          created_at: string | null
          id: string
          is_engaged: boolean | null
          is_read: boolean | null
          priority: number | null
          sent_at: string | null
          sent_to_telegram: boolean | null
          telegram_message_id: string | null
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          is_engaged?: boolean | null
          is_read?: boolean | null
          priority?: number | null
          sent_at?: string | null
          sent_to_telegram?: boolean | null
          telegram_message_id?: string | null
        }
        Update: {
          analysis_id?: string | null
          created_at?: string | null
          id?: string
          is_engaged?: boolean | null
          is_read?: boolean | null
          priority?: number | null
          sent_at?: string | null
          sent_to_telegram?: boolean | null
          telegram_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_content: {
        Row: {
          author: string | null
          comment_count: number | null
          content: string | null
          content_type: string | null
          created_utc: string | null
          engagement_score: number | null
          external_content_id: string
          fetched_at: string | null
          id: string
          permalink: string | null
          platform: string
          platform_specific_data: Json | null
          source_id: string | null
          source_name: string
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          comment_count?: number | null
          content?: string | null
          content_type?: string | null
          created_utc?: string | null
          engagement_score?: number | null
          external_content_id: string
          fetched_at?: string | null
          id?: string
          permalink?: string | null
          platform?: string
          platform_specific_data?: Json | null
          source_id?: string | null
          source_name: string
          title: string
          url: string
        }
        Update: {
          author?: string | null
          comment_count?: number | null
          content?: string | null
          content_type?: string | null
          created_utc?: string | null
          engagement_score?: number | null
          external_content_id?: string
          fetched_at?: string | null
          id?: string
          permalink?: string | null
          platform?: string
          platform_specific_data?: Json | null
          source_id?: string | null
          source_name?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "monitored_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processed_content_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "monitored_subreddits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      monitored_subreddits: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          keywords: string[] | null
          min_comments: number | null
          min_upvotes: number | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          min_comments?: number | null
          min_upvotes?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          keywords?: string[] | null
          min_comments?: number | null
          min_upvotes?: number | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      processed_posts: {
        Row: {
          author: string | null
          comment_count: number | null
          content: string | null
          created_utc: string | null
          fetched_at: string | null
          id: string | null
          permalink: string | null
          reddit_post_id: string | null
          subreddit: string | null
          subreddit_id: string | null
          title: string | null
          upvotes: number | null
          url: string | null
        }
        Insert: {
          author?: string | null
          comment_count?: number | null
          content?: string | null
          created_utc?: string | null
          fetched_at?: string | null
          id?: string | null
          permalink?: string | null
          reddit_post_id?: string | null
          subreddit?: string | null
          subreddit_id?: string | null
          title?: string | null
          upvotes?: number | null
          url?: string | null
        }
        Update: {
          author?: string | null
          comment_count?: number | null
          content?: string | null
          created_utc?: string | null
          fetched_at?: string | null
          id?: string | null
          permalink?: string | null
          reddit_post_id?: string | null
          subreddit?: string | null
          subreddit_id?: string | null
          title?: string | null
          upvotes?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processed_content_source_id_fkey"
            columns: ["subreddit_id"]
            isOneToOne: false
            referencedRelation: "monitored_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processed_content_source_id_fkey"
            columns: ["subreddit_id"]
            isOneToOne: false
            referencedRelation: "monitored_subreddits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_platform_display_name: {
        Args: { p_platform: string }
        Returns: string
      }
      validate_source_identifier: {
        Args: { p_identifier: string; p_platform: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
