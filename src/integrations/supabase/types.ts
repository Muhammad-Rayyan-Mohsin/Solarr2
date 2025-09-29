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
      assets: {
        Row: {
          byte_size: number | null
          created_at: string
          created_by: string | null
          field: string
          id: string
          kind: string
          mime_type: string | null
          roof_face_id: string | null
          section: string
          storage_object_path: string
          survey_id: string
        }
        Insert: {
          byte_size?: number | null
          created_at?: string
          created_by?: string | null
          field: string
          id?: string
          kind: string
          mime_type?: string | null
          roof_face_id?: string | null
          section: string
          storage_object_path: string
          survey_id: string
        }
        Update: {
          byte_size?: number | null
          created_at?: string
          created_by?: string | null
          field?: string
          id?: string
          kind?: string
          mime_type?: string | null
          roof_face_id?: string | null
          section?: string
          storage_object_path?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_roof_face_id_fkey"
            columns: ["roof_face_id"]
            isOneToOne: false
            referencedRelation: "roof_faces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      battery_storage: {
        Row: {
          ambient_temp_max: number | null
          ambient_temp_min: number | null
          battery_required: string | null
          distance_from_cu: string | null
          fire_egress_compliance: string | null
          ip_rating_required: string | null
          mounting_surface: string | null
          preferred_install_location: string | null
          survey_id: string
          ventilation_adequate: string | null
        }
        Insert: {
          ambient_temp_max?: number | null
          ambient_temp_min?: number | null
          battery_required?: string | null
          distance_from_cu?: string | null
          fire_egress_compliance?: string | null
          ip_rating_required?: string | null
          mounting_surface?: string | null
          preferred_install_location?: string | null
          survey_id: string
          ventilation_adequate?: string | null
        }
        Update: {
          ambient_temp_max?: number | null
          ambient_temp_min?: number | null
          battery_required?: string | null
          distance_from_cu?: string | null
          fire_egress_compliance?: string | null
          ip_rating_required?: string | null
          mounting_surface?: string | null
          preferred_install_location?: string | null
          survey_id?: string
          ventilation_adequate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battery_storage_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battery_storage_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_preferences: {
        Row: {
          additional_notes: string | null
          budget_range: string | null
          customer_away: boolean | null
          customer_away_notes: string | null
          installation_end_date: string | null
          installation_start_date: string | null
          interested_in_energy_monitoring: string | null
          interested_in_ev_charger: string | null
          preferred_contact_method: string | null
          survey_id: string
        }
        Insert: {
          additional_notes?: string | null
          budget_range?: string | null
          customer_away?: boolean | null
          customer_away_notes?: string | null
          installation_end_date?: string | null
          installation_start_date?: string | null
          interested_in_energy_monitoring?: string | null
          interested_in_ev_charger?: string | null
          preferred_contact_method?: string | null
          survey_id: string
        }
        Update: {
          additional_notes?: string | null
          budget_range?: string | null
          customer_away?: boolean | null
          customer_away_notes?: string | null
          installation_end_date?: string | null
          installation_start_date?: string | null
          interested_in_energy_monitoring?: string | null
          interested_in_ev_charger?: string | null
          preferred_contact_method?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_preferences_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      electrical_supply: {
        Row: {
          cable_route_to_battery: string[] | null
          cable_route_to_roof: string[] | null
          consumer_unit_location: string | null
          consumer_unit_make: string | null
          dno_notification_required: boolean | null
          earth_bonding_verified: string | null
          earthing_system_type: string | null
          ev_charger_installed: string | null
          ev_charger_load: number | null
          existing_surge_protection: string | null
          main_fuse_rating: string | null
          spare_fuse_ways: number | null
          supply_type: string | null
          survey_id: string
        }
        Insert: {
          cable_route_to_battery?: string[] | null
          cable_route_to_roof?: string[] | null
          consumer_unit_location?: string | null
          consumer_unit_make?: string | null
          dno_notification_required?: boolean | null
          earth_bonding_verified?: string | null
          earthing_system_type?: string | null
          ev_charger_installed?: string | null
          ev_charger_load?: number | null
          existing_surge_protection?: string | null
          main_fuse_rating?: string | null
          spare_fuse_ways?: number | null
          supply_type?: string | null
          survey_id: string
        }
        Update: {
          cable_route_to_battery?: string[] | null
          cable_route_to_roof?: string[] | null
          consumer_unit_location?: string | null
          consumer_unit_make?: string | null
          dno_notification_required?: boolean | null
          earth_bonding_verified?: string | null
          earthing_system_type?: string | null
          ev_charger_installed?: string | null
          ev_charger_load?: number | null
          existing_surge_protection?: string | null
          main_fuse_rating?: string | null
          spare_fuse_ways?: number | null
          supply_type?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "electrical_supply_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "electrical_supply_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      electricity_baseline: {
        Row: {
          annual_consumption: number | null
          customer_permission_granted: boolean | null
          daytime_import_rate: number | null
          electricity_provider: string | null
          mpan_number: string | null
          network_operator: string | null
          nighttime_import_rate: number | null
          seg_tariff_available: string | null
          seg_tariff_explanation: string | null
          smart_meter_present: string | null
          smart_tariff_available: string | null
          standing_charge: number | null
          survey_id: string
          tariff_type: string | null
        }
        Insert: {
          annual_consumption?: number | null
          customer_permission_granted?: boolean | null
          daytime_import_rate?: number | null
          electricity_provider?: string | null
          mpan_number?: string | null
          network_operator?: string | null
          nighttime_import_rate?: number | null
          seg_tariff_available?: string | null
          seg_tariff_explanation?: string | null
          smart_meter_present?: string | null
          smart_tariff_available?: string | null
          standing_charge?: number | null
          survey_id: string
          tariff_type?: string | null
        }
        Update: {
          annual_consumption?: number | null
          customer_permission_granted?: boolean | null
          daytime_import_rate?: number | null
          electricity_provider?: string | null
          mpan_number?: string | null
          network_operator?: string | null
          nighttime_import_rate?: number | null
          seg_tariff_available?: string | null
          seg_tariff_explanation?: string | null
          smart_meter_present?: string | null
          smart_tariff_available?: string | null
          standing_charge?: number | null
          survey_id?: string
          tariff_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "electricity_baseline_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "electricity_baseline_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      health_safety: {
        Row: {
          asbestos_presence: string | null
          fragile_roof_areas: string[] | null
          livestock_pets_notes: string | null
          livestock_pets_on_site: string | null
          special_access_instructions: string | null
          survey_id: string
          working_at_height_difficulties: string | null
        }
        Insert: {
          asbestos_presence?: string | null
          fragile_roof_areas?: string[] | null
          livestock_pets_notes?: string | null
          livestock_pets_on_site?: string | null
          special_access_instructions?: string | null
          survey_id: string
          working_at_height_difficulties?: string | null
        }
        Update: {
          asbestos_presence?: string | null
          fragile_roof_areas?: string[] | null
          livestock_pets_notes?: string | null
          livestock_pets_on_site?: string | null
          special_access_instructions?: string | null
          survey_id?: string
          working_at_height_difficulties?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_safety_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_safety_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      loft_attic: {
        Row: {
          loft_access_type: string | null
          loft_boards_in_place: string | null
          loft_hatch_height: number | null
          loft_hatch_width: number | null
          loft_headroom: string | null
          loft_insulation_thickness: number | null
          loft_lighting: string | null
          loft_power_socket: string | null
          roof_timber_condition: string | null
          roof_timber_notes: string | null
          survey_id: string
          wall_space_battery: string | null
          wall_space_battery_notes: string | null
          wall_space_inverter: string | null
          wall_space_inverter_notes: string | null
        }
        Insert: {
          loft_access_type?: string | null
          loft_boards_in_place?: string | null
          loft_hatch_height?: number | null
          loft_hatch_width?: number | null
          loft_headroom?: string | null
          loft_insulation_thickness?: number | null
          loft_lighting?: string | null
          loft_power_socket?: string | null
          roof_timber_condition?: string | null
          roof_timber_notes?: string | null
          survey_id: string
          wall_space_battery?: string | null
          wall_space_battery_notes?: string | null
          wall_space_inverter?: string | null
          wall_space_inverter_notes?: string | null
        }
        Update: {
          loft_access_type?: string | null
          loft_boards_in_place?: string | null
          loft_hatch_height?: number | null
          loft_hatch_width?: number | null
          loft_headroom?: string | null
          loft_insulation_thickness?: number | null
          loft_lighting?: string | null
          loft_power_socket?: string | null
          roof_timber_condition?: string | null
          roof_timber_notes?: string | null
          survey_id?: string
          wall_space_battery?: string | null
          wall_space_battery_notes?: string | null
          wall_space_inverter?: string | null
          wall_space_inverter_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loft_attic_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loft_attic_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      property_overview: {
        Row: {
          conservation_area: string | null
          listed_building: string | null
          new_build: string | null
          property_age: string | null
          property_type: string | null
          restricted_parking: string | null
          scaffold_access: string | null
          shared_roof: string | null
          storage_area: string | null
          survey_id: string
        }
        Insert: {
          conservation_area?: string | null
          listed_building?: string | null
          new_build?: string | null
          property_age?: string | null
          property_type?: string | null
          restricted_parking?: string | null
          scaffold_access?: string | null
          shared_roof?: string | null
          storage_area?: string | null
          survey_id: string
        }
        Update: {
          conservation_area?: string | null
          listed_building?: string | null
          new_build?: string | null
          property_age?: string | null
          property_type?: string | null
          restricted_parking?: string | null
          scaffold_access?: string | null
          shared_roof?: string | null
          storage_area?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_overview_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_overview_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: true
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      roof_faces: {
        Row: {
          area: number | null
          batten_depth: string | null
          covering: string | null
          covering_condition: string | null
          gutter_height: string | null
          id: string
          label: string | null
          length: number | null
          membrane_condition: string | null
          membrane_type: string | null
          obstructions: string[] | null
          orientation: number | null
          pitch: number | null
          planned_panel_count: number | null
          rafter_depth: string | null
          rafter_spacing: string | null
          shading: string[] | null
          structural_defects: string | null
          survey_id: string
          width: number | null
        }
        Insert: {
          area?: number | null
          batten_depth?: string | null
          covering?: string | null
          covering_condition?: string | null
          gutter_height?: string | null
          id?: string
          label?: string | null
          length?: number | null
          membrane_condition?: string | null
          membrane_type?: string | null
          obstructions?: string[] | null
          orientation?: number | null
          pitch?: number | null
          planned_panel_count?: number | null
          rafter_depth?: string | null
          rafter_spacing?: string | null
          shading?: string[] | null
          structural_defects?: string | null
          survey_id: string
          width?: number | null
        }
        Update: {
          area?: number | null
          batten_depth?: string | null
          covering?: string | null
          covering_condition?: string | null
          gutter_height?: string | null
          id?: string
          label?: string | null
          length?: number | null
          membrane_condition?: string | null
          membrane_type?: string | null
          obstructions?: string[] | null
          orientation?: number | null
          pitch?: number | null
          planned_panel_count?: number | null
          rafter_depth?: string | null
          rafter_spacing?: string | null
          shading?: string[] | null
          structural_defects?: string | null
          survey_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roof_faces_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roof_faces_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys_list"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string
          email: string
          grid_reference: string | null
          id: string
          pdf_generated_at: string | null
          pdf_path: string | null
          phone: string
          postcode: string
          secondary_contact_name: string | null
          secondary_contact_phone: string | null
          site_address: string
          status: string
          survey_date: string
          surveyor_email: string
          surveyor_name: string
          surveyor_telephone: string
          updated_at: string
          what3words: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name: string
          email: string
          grid_reference?: string | null
          id?: string
          pdf_generated_at?: string | null
          pdf_path?: string | null
          phone: string
          postcode: string
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          site_address: string
          status?: string
          survey_date: string
          surveyor_email: string
          surveyor_name: string
          surveyor_telephone: string
          updated_at?: string
          what3words?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string
          email?: string
          grid_reference?: string | null
          id?: string
          pdf_generated_at?: string | null
          pdf_path?: string | null
          phone?: string
          postcode?: string
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          site_address?: string
          status?: string
          survey_date?: string
          surveyor_email?: string
          surveyor_name?: string
          surveyor_telephone?: string
          updated_at?: string
          what3words?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      surveys_list: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string | null
          mpan_number: string | null
          postcode: string | null
          site_address: string | null
          status: string | null
          survey_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_full_survey: {
        Args: { payload: Json }
        Returns: string
      }
      delete_full_survey: {
        Args: { p_survey_id: string }
        Returns: string[]
      }
      get_full_survey: {
        Args: { p_survey_id: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
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
