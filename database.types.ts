export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event: {
        Row: {
          day: number
          location: string
          post_id: string
          time: string
        }
        Insert: {
          day: number
          location: string
          post_id: string
          time: string
        }
        Update: {
          day?: number
          location?: string
          post_id?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["post_id"]
          },
        ]
      }
      itinerary: {
        Row: {
          description: string | null
          destination: string
          duration: number | null
          group_size: number | null
          image_url: string | null
          is_family_friendly: boolean
          itinerary_status:
            | Database["public"]["Enums"]["itinerary_status"]
            | null
          post_id: string
          post_name: string | null
          price_high: number | null
          price_low: number | null
          user_id: string
        }
        Insert: {
          description?: string | null
          destination: string
          duration?: number | null
          group_size?: number | null
          image_url?: string | null
          is_family_friendly?: boolean
          itinerary_status?:
            | Database["public"]["Enums"]["itinerary_status"]
            | null
          post_id?: string
          post_name?: string | null
          price_high?: number | null
          price_low?: number | null
          user_id: string
        }
        Update: {
          description?: string | null
          destination?: string
          duration?: number | null
          group_size?: number | null
          image_url?: string | null
          is_family_friendly?: boolean
          itinerary_status?:
            | Database["public"]["Enums"]["itinerary_status"]
            | null
          post_id?: string
          post_name?: string | null
          price_high?: number | null
          price_low?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profile: {
        Row: {
          first_name: string
          last_name: string
          profile_status: Database["public"]["Enums"]["profile_status"]
          role: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Insert: {
          first_name: string
          last_name: string
          profile_status?: Database["public"]["Enums"]["profile_status"]
          role?: Database["public"]["Enums"]["role"]
          user_id: string
        }
        Update: {
          first_name?: string
          last_name?: string
          profile_status?: Database["public"]["Enums"]["profile_status"]
          role?: Database["public"]["Enums"]["role"]
          user_id?: string
        }
        Relationships: []
      }
      rating: {
        Row: {
          comment: string | null
          comment_date: string
          is_good: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          comment_date?: string
          is_good: boolean
          post_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          comment_date?: string
          is_good?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rating_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "rating_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      report: {
        Row: {
          post_id: string
          reason: string
          report_date: string
          user_id: string
        }
        Insert: {
          post_id: string
          reason: string
          report_date?: string
          user_id: string
        }
        Update: {
          post_id?: string
          reason?: string
          report_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "report_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      saved: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "saved_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      post_ratings: {
        Row: {
          is_good: boolean | null
          post_id: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rating_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "itinerary"
            referencedColumns: ["post_id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      itinerary_status: "normal" | "banned"
      profile_status: "normal" | "banned"
      role: "traveller" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
