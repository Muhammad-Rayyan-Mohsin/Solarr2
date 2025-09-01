import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for TypeScript
export interface Survey {
  id?: string;
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
  current_electricity_supplier?: string;
  current_electricity_tariff?: string;
  current_electricity_usage?: number;
  mpan_number?: string;
  main_fuse_rating?: string;
  earthing_system?: string;
  roof_type?: string;
  roof_material?: string;
  roof_condition?: string;
  roof_orientation?: string;
  roof_pitch?: number;
  roof_area?: number;
  shading_analysis?: string;
  obstructions?: string;
  gutter_height?: number;
  membrane_condition?: string;
  structural_defects?: string;
  loft_access?: boolean;
  loft_insulation?: string;
  loft_ventilation?: string;
  electrical_supply_type?: string;
  ev_charger_load?: number;
  battery_required?: boolean;
  battery_capacity?: number;
  install_location?: string;
  mounting_surface?: string;
  ip_rating?: string;
  temperature_range_min?: number;
  temperature_range_max?: number;
  asbestos_presence?: boolean;
  livestock_pets?: string;
  contact_method?: string;
  budget_range?: string;
  additional_notes?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'draft' | 'completed' | 'synced';
  sync_status?: 'pending' | 'synced' | 'failed';
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
  sync_status?: 'pending' | 'synced' | 'failed';
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
  sync_status?: 'pending' | 'synced' | 'failed';
}

export interface SyncQueueItem {
  id?: string;
  survey_id: string;
  table_name: 'surveys' | 'survey_photos' | 'survey_audio';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  created_at?: string;
  retry_count?: number;
  max_retries?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}
