import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Survey {
  id?: string;
  // Section 0 - General & Contact
  surveyor_name: string;
  customer_name: string;
  site_address: string;
  postcode: string;
  grid_reference: string;
  phone: string;
  email: string;
  secondary_contact_name?: string;
  secondary_contact_phone?: string;
  survey_date: string;

  // Section 1 - Electricity Baseline
  current_electricity_usage?: number;
  mpan_number?: string;
  current_electricity_supplier?: string;
  network_operator?: string;
  customer_permission_granted?: boolean;
  daytime_import_rate?: number;
  nighttime_import_rate?: number;
  standing_charge?: number;
  current_electricity_tariff?: string;
  smart_meter_present?: string;
  export_tariff_available?: string;

  // Section 2 - Property Overview
  property_type?: string;
  property_age?: string;
  listed_building?: string;
  conservation_area?: string;
  new_build?: string;
  shared_roof?: string;
  scaffold_access?: string;
  storage_area?: string;
  restricted_parking?: string;

  // Section 3 - Roof Inspection
  roof_faces?: any[]; // Complex type, simplified for now

  // Section 4 - Loft/Attic
  loft_hatch_width?: number;
  loft_hatch_height?: number;
  loft_access_quality?: string;
  loft_headroom?: number;
  roof_timber_condition?: string;
  wall_space_inverter?: string;
  wall_space_battery?: string;
  loft_insulation_thickness?: number;
  loft_lighting?: string;
  loft_power_socket?: string;

  // Section 5 - Electrical Supply
  electrical_supply_type?: string;
  main_fuse_rating?: string;
  consumer_unit_make?: string;
  consumer_unit_location?: string;
  spare_fuse_ways?: number;
  existing_surge_protection?: string;
  earth_bonding_verified?: string;
  earthing_system?: string;
  dno_notification_required?: boolean;
  ev_charger_installed?: string;
  ev_charger_load?: number;

  // Section 6 - Battery & Storage
  battery_required?: boolean;
  install_location?: string;
  distance_from_cu?: number;
  mounting_surface?: string;
  ventilation_adequate?: string;
  fire_egress_compliance?: string;
  temperature_range_min?: number;
  temperature_range_max?: number;
  ip_rating?: string;

  // Section 7 - Health & Safety
  asbestos_presence?: boolean;
  working_at_height_difficulties?: string;
  livestock_pets?: string;
  livestock_pets_notes?: string;
  special_access_instructions?: string;

  // Section 8 - Customer Preferences
  contact_method?: string;
  installation_start_date?: string;
  installation_end_date?: string;
  customer_away?: boolean;
  customer_away_notes?: string;
  budget_range?: string;
  interested_in_ev_charger?: string;
  interested_in_energy_monitoring?: string;
  additional_notes?: string;

  // Metadata
  created_at?: string;
  updated_at?: string;
  status?: "draft" | "completed" | "synced";
  sync_status?: "pending" | "synced" | "failed";
  last_synced?: string;
}

export interface SurveyPhoto {
  id?: string;
  survey_id: string;
  section: string;
  field: string;
  filename: string;
  file_path: string;
  thumbnail_path?: string;
  file_size: number;
  metadata?: any;
  created_at?: string;
  sync_status?: "pending" | "synced" | "failed";
}

export interface SurveyAudio {
  id?: string;
  survey_id: string;
  section: string;
  field: string;
  filename: string;
  file_path: string;
  transcription?: string;
  duration?: number;
  file_size: number;
  created_at?: string;
  sync_status?: "pending" | "synced" | "failed";
}

export interface SyncQueueItem {
  id?: string;
  survey_id: string;
  table_name: "surveys" | "survey_photos" | "survey_audio";
  operation: "INSERT" | "UPDATE" | "DELETE";
  data: any;
  created_at?: string;
  retry_count?: number;
  max_retries?: number;
  status?: "pending" | "processing" | "completed" | "failed";
}
