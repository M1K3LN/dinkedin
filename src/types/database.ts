export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      matches: {
        Row: {
          created_at: string
          division_id: string
          id: string
          played_at: string | null
          player_1_id: string | null
          player_2_id: string | null
          round_name: string | null
          score: string | null
          status: Database["public"]["Enums"]["match_status"]
          team_1_partner_id: string | null
          team_2_partner_id: string | null
          tournament_id: string
          updated_at: string
          winner_player_id: string | null
          winner_team: Database["public"]["Enums"]["winner_team"] | null
        }
        Insert: {
          created_at?: string
          division_id: string
          id?: string
          played_at?: string | null
          player_1_id?: string | null
          player_2_id?: string | null
          round_name?: string | null
          score?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team_1_partner_id?: string | null
          team_2_partner_id?: string | null
          tournament_id: string
          updated_at?: string
          winner_player_id?: string | null
          winner_team?: Database["public"]["Enums"]["winner_team"] | null
        }
        Update: {
          created_at?: string
          division_id?: string
          id?: string
          played_at?: string | null
          player_1_id?: string | null
          player_2_id?: string | null
          round_name?: string | null
          score?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          team_1_partner_id?: string | null
          team_2_partner_id?: string | null
          tournament_id?: string
          updated_at?: string
          winner_player_id?: string | null
          winner_team?: Database["public"]["Enums"]["winner_team"] | null
        }
        Relationships: []
      }
      player_profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          dominant_hand: string | null
          home_court: string | null
          id: string
          losses: number
          preferred_play_type: Database["public"]["Enums"]["play_type"] | null
          skill_level: number | null
          total_ranking_points: number
          total_reward_points: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          dominant_hand?: string | null
          home_court?: string | null
          id?: string
          losses?: number
          preferred_play_type?: Database["public"]["Enums"]["play_type"] | null
          skill_level?: number | null
          total_ranking_points?: number
          total_reward_points?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          dominant_hand?: string | null
          home_court?: string | null
          id?: string
          losses?: number
          preferred_play_type?: Database["public"]["Enums"]["play_type"] | null
          skill_level?: number | null
          total_ranking_points?: number
          total_reward_points?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ranking_events: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          player_id: string
          points: number
          reason: Database["public"]["Enums"]["ranking_event_reason"]
          tournament_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          player_id: string
          points: number
          reason: Database["public"]["Enums"]["ranking_event_reason"]
          tournament_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          player_id?: string
          points?: number
          reason?: Database["public"]["Enums"]["ranking_event_reason"]
          tournament_id?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          player_id: string
          status: Database["public"]["Enums"]["referral_code_status"]
          total_uses: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          player_id: string
          status?: Database["public"]["Enums"]["referral_code_status"]
          total_uses?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          player_id?: string
          status?: Database["public"]["Enums"]["referral_code_status"]
          total_uses?: number
          updated_at?: string
        }
        Relationships: []
      }
      reward_events: {
        Row: {
          created_at: string
          id: string
          player_id: string
          points: number
          reason: Database["public"]["Enums"]["reward_event_reason"]
          source: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          points: number
          reason: Database["public"]["Enums"]["reward_event_reason"]
          source?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          points?: number
          reason?: Database["public"]["Enums"]["reward_event_reason"]
          source?: string | null
        }
        Relationships: []
      }
      shopify_discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["shopify_discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          player_id: string
          reward_points_used: number
          shopify_discount_id: string | null
          status: Database["public"]["Enums"]["shopify_code_status"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: Database["public"]["Enums"]["shopify_discount_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          player_id: string
          reward_points_used: number
          shopify_discount_id?: string | null
          status?: Database["public"]["Enums"]["shopify_code_status"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["shopify_discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          player_id?: string
          reward_points_used?: number
          shopify_discount_id?: string | null
          status?: Database["public"]["Enums"]["shopify_code_status"]
          updated_at?: string
        }
        Relationships: []
      }
      tournament_divisions: {
        Row: {
          created_at: string
          entry_fee: number
          gender_type: Database["public"]["Enums"]["gender_type"]
          id: string
          max_players: number | null
          name: string
          play_type: Database["public"]["Enums"]["play_type"]
          skill_level: number | null
          tournament_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entry_fee?: number
          gender_type?: Database["public"]["Enums"]["gender_type"]
          id?: string
          max_players?: number | null
          name: string
          play_type: Database["public"]["Enums"]["play_type"]
          skill_level?: number | null
          tournament_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entry_fee?: number
          gender_type?: Database["public"]["Enums"]["gender_type"]
          id?: string
          max_players?: number | null
          name?: string
          play_type?: Database["public"]["Enums"]["play_type"]
          skill_level?: number | null
          tournament_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_registrations: {
        Row: {
          created_at: string
          division_id: string
          id: string
          partner_player_id: string | null
          player_id: string
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"]
          tournament_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          division_id: string
          id?: string
          partner_player_id?: string | null
          player_id: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
          tournament_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          division_id?: string
          id?: string
          partner_player_id?: string | null
          player_id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
          tournament_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          location_name: string | null
          name: string
          registration_deadline: string | null
          start_date: string | null
          state: string | null
          status: Database["public"]["Enums"]["tournament_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          location_name?: string | null
          name: string
          registration_deadline?: string | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          location_name?: string | null
          name?: string
          registration_deadline?: string | null
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      current_user_role: { Args: never; Returns: Database["public"]["Enums"]["user_role"] }
      find_user_id_by_email: { Args: { p_email: string }; Returns: string | null }
      is_admin: { Args: never; Returns: boolean }
      is_organizer_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      gender_type: "mens" | "womens" | "mixed" | "open"
      match_status: "scheduled" | "completed" | "disputed" | "canceled"
      play_type: "singles" | "doubles" | "mixed_doubles"
      ranking_event_reason:
        | "tournament_registration"
        | "match_win"
        | "first_place"
        | "second_place"
        | "third_place"
        | "admin_adjustment"
      referral_code_status: "active" | "inactive" | "expired"
      registration_status: "registered" | "waitlisted" | "canceled" | "completed"
      reward_event_reason:
        | "account_created"
        | "tournament_registration"
        | "match_win"
        | "tournament_placement"
        | "referral_signup"
        | "admin_adjustment"
        | "shopify_redemption"
      shopify_code_status: "pending" | "active" | "used" | "expired" | "revoked" | "failed"
      shopify_discount_type: "percentage" | "fixed_amount"
      tournament_status: "draft" | "published" | "active" | "completed" | "canceled"
      user_role: "player" | "organizer" | "admin"
      winner_team: "team_1" | "team_2"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

export type UserRole = Database["public"]["Enums"]["user_role"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type PlayerProfile = Database["public"]["Tables"]["player_profiles"]["Row"]
export type Tournament = Database["public"]["Tables"]["tournaments"]["Row"]
