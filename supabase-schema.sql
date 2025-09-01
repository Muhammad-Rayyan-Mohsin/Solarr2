-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Surveys table
CREATE TABLE surveys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    surveyor_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    site_address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    grid_reference TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    secondary_contact_name TEXT,
    secondary_contact_phone TEXT,
    survey_date DATE NOT NULL,
    current_electricity_supplier TEXT,
    current_electricity_tariff TEXT,
    current_electricity_usage NUMERIC,
    mpan_number TEXT,
    main_fuse_rating TEXT,
    earthing_system TEXT,
    roof_type TEXT,
    roof_material TEXT,
    roof_condition TEXT,
    roof_orientation TEXT,
    roof_pitch NUMERIC,
    roof_area NUMERIC,
    shading_analysis TEXT,
    obstructions TEXT,
    gutter_height NUMERIC,
    membrane_condition TEXT,
    structural_defects TEXT,
    loft_access BOOLEAN DEFAULT false,
    loft_insulation TEXT,
    loft_ventilation TEXT,
    electrical_supply_type TEXT,
    ev_charger_load NUMERIC,
    battery_required BOOLEAN DEFAULT false,
    battery_capacity NUMERIC,
    install_location TEXT,
    mounting_surface TEXT,
    ip_rating TEXT,
    temperature_range_min NUMERIC,
    temperature_range_max NUMERIC,
    asbestos_presence BOOLEAN DEFAULT false,
    livestock_pets TEXT,
    contact_method TEXT,
    budget_range TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'synced')),
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    last_synced TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey photos table
CREATE TABLE survey_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    field TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    file_size BIGINT NOT NULL,
    metadata JSONB,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey audio table
CREATE TABLE survey_audio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    field TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    transcription TEXT,
    duration NUMERIC,
    file_size BIGINT NOT NULL,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync queue table
CREATE TABLE sync_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL CHECK (table_name IN ('surveys', 'survey_photos', 'survey_audio')),
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    data JSONB NOT NULL,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_surveys_created_at ON surveys(created_at DESC);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_sync_status ON surveys(sync_status);
CREATE INDEX idx_survey_photos_survey_id ON survey_photos(survey_id);
CREATE INDEX idx_survey_audio_survey_id ON survey_audio(survey_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status);
CREATE INDEX idx_sync_queue_survey_id ON sync_queue(survey_id);

-- Row Level Security (RLS) policies
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later with authentication)
CREATE POLICY "Allow all operations on surveys" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all operations on survey_photos" ON survey_photos FOR ALL USING (true);
CREATE POLICY "Allow all operations on survey_audio" ON survey_audio FOR ALL USING (true);
CREATE POLICY "Allow all operations on sync_queue" ON sync_queue FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
