-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_sync_status ON surveys(sync_status);
CREATE INDEX IF NOT EXISTS idx_survey_photos_survey_id ON survey_photos(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_audio_survey_id ON survey_audio(survey_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_survey_id ON sync_queue(survey_id);

-- Enable Row Level Security (RLS)
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now)
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
DROP TRIGGER IF EXISTS update_surveys_updated_at ON surveys;
CREATE TRIGGER update_surveys_updated_at 
    BEFORE UPDATE ON surveys
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
