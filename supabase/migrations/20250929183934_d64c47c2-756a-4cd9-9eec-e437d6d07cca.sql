-- Add CASCADE DELETE constraints for complete survey deletion
-- This ensures when a survey is deleted, all related data is also deleted

-- Add foreign key constraints with CASCADE DELETE for all survey-related tables
-- (These may already exist, but we'll add them if they don't)

-- Electricity baseline
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'electricity_baseline_survey_id_fkey'
    ) THEN
        ALTER TABLE public.electricity_baseline 
        ADD CONSTRAINT electricity_baseline_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Property overview
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'property_overview_survey_id_fkey'
    ) THEN
        ALTER TABLE public.property_overview 
        ADD CONSTRAINT property_overview_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Roof faces
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'roof_faces_survey_id_fkey'
    ) THEN
        ALTER TABLE public.roof_faces 
        ADD CONSTRAINT roof_faces_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Loft attic
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'loft_attic_survey_id_fkey'
    ) THEN
        ALTER TABLE public.loft_attic 
        ADD CONSTRAINT loft_attic_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Electrical supply
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'electrical_supply_survey_id_fkey'
    ) THEN
        ALTER TABLE public.electrical_supply 
        ADD CONSTRAINT electrical_supply_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Battery storage
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'battery_storage_survey_id_fkey'
    ) THEN
        ALTER TABLE public.battery_storage 
        ADD CONSTRAINT battery_storage_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Health safety
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'health_safety_survey_id_fkey'
    ) THEN
        ALTER TABLE public.health_safety 
        ADD CONSTRAINT health_safety_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Customer preferences
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'customer_preferences_survey_id_fkey'
    ) THEN
        ALTER TABLE public.customer_preferences 
        ADD CONSTRAINT customer_preferences_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Assets table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'assets_survey_id_fkey'
    ) THEN
        ALTER TABLE public.assets 
        ADD CONSTRAINT assets_survey_id_fkey 
        FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Also add constraint for roof_face_id in assets table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'assets_roof_face_id_fkey'
    ) THEN
        ALTER TABLE public.assets 
        ADD CONSTRAINT assets_roof_face_id_fkey 
        FOREIGN KEY (roof_face_id) REFERENCES public.roof_faces(id) ON DELETE CASCADE;
    END IF;
END $$;