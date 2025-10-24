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
      crops: {
        Row: {
          available: boolean
          category: Database["public"]["Enums"]["crop_category"]
          created_at: string
          crop_name: string
          description: string | null
          farmer_id: string
          id: string
          image_url: string | null
          location_district: string
          location_state: string
          location_taluk: string | null
          location_village: string
          price_per_kg: number
          quantity_kg: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category: Database["public"]["Enums"]["crop_category"]
          created_at?: string
          crop_name: string
          description?: string | null
          farmer_id: string
          id?: string
          image_url?: string | null
          location_district: string
          location_state: string
          location_taluk?: string | null
          location_village: string
          price_per_kg: number
          quantity_kg: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: Database["public"]["Enums"]["crop_category"]
          created_at?: string
          crop_name?: string
          description?: string | null
          farmer_id?: string
          id?: string
          image_url?: string | null
          location_district?: string
          location_state?: string
          location_taluk?: string | null
          location_village?: string
          price_per_kg?: number
          quantity_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      price_predictions: {
        Row: {
          category: Database["public"]["Enums"]["crop_category"]
          confidence_score: number | null
          created_at: string
          crop_name: string
          id: string
          location_state: string
          predicted_price_per_kg: number
          season: string
          user_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["crop_category"]
          confidence_score?: number | null
          created_at?: string
          crop_name: string
          id?: string
          location_state: string
          predicted_price_per_kg: number
          season: string
          user_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["crop_category"]
          confidence_score?: number | null
          created_at?: string
          crop_name?: string
          id?: string
          location_state?: string
          predicted_price_per_kg?: number
          season?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string
          id: string
          phone: string | null
          profile_photo_url: string | null
          state: string | null
          taluk: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name: string
          id: string
          phone?: string | null
          profile_photo_url?: string | null
          state?: string | null
          taluk?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          profile_photo_url?: string | null
          state?: string | null
          taluk?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          buyer_id: string
          created_at: string
          farmer_id: string
          id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          farmer_id: string
          id?: string
          rating: number
          review_text?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          farmer_id?: string
          id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: []
      }
      transportation_requests: {
        Row: {
          buyer_id: string | null
          crop_id: string
          delivered_at: string | null
          delivery_location: string | null
          farmer_id: string
          id: string
          picked_up_at: string | null
          pickup_location: string
          requested_at: string
          status: Database["public"]["Enums"]["order_status"]
          tracking_notes: string | null
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          crop_id: string
          delivered_at?: string | null
          delivery_location?: string | null
          farmer_id: string
          id?: string
          picked_up_at?: string | null
          pickup_location: string
          requested_at?: string
          status?: Database["public"]["Enums"]["order_status"]
          tracking_notes?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          crop_id?: string
          delivered_at?: string | null
          delivery_location?: string | null
          farmer_id?: string
          id?: string
          picked_up_at?: string | null
          pickup_location?: string
          requested_at?: string
          status?: Database["public"]["Enums"]["order_status"]
          tracking_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transportation_requests_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "buyer"
      crop_category:
        | "grains"
        | "vegetables"
        | "fruits"
        | "pulses"
        | "spices"
        | "others"
      order_status:
        | "pending"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "cancelled"
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
    Enums: {
      app_role: ["farmer", "buyer"],
      crop_category: [
        "grains",
        "vegetables",
        "fruits",
        "pulses",
        "spices",
        "others",
      ],
      order_status: [
        "pending",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
