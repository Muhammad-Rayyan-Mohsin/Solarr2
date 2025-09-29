-- Update storage policies to allow anonymous uploads for surveys bucket
-- This will allow the survey app to work without authentication

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "surveys_storage_read_own" ON storage.objects;
DROP POLICY IF EXISTS "surveys_storage_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "surveys_storage_update_own" ON storage.objects;
DROP POLICY IF EXISTS "surveys_storage_delete_own" ON storage.objects;

-- Create policies that allow anonymous uploads for surveys bucket
-- Allow anyone to upload to surveys bucket
CREATE POLICY "surveys_storage_insert_anonymous" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'surveys');

-- Allow anyone to read from surveys bucket  
CREATE POLICY "surveys_storage_select_anonymous"
ON storage.objects FOR SELECT 
USING (bucket_id = 'surveys');

-- Allow anyone to update in surveys bucket
CREATE POLICY "surveys_storage_update_anonymous"
ON storage.objects FOR UPDATE 
USING (bucket_id = 'surveys')
WITH CHECK (bucket_id = 'surveys');

-- Allow anyone to delete from surveys bucket
CREATE POLICY "surveys_storage_delete_anonymous"
ON storage.objects FOR DELETE 
USING (bucket_id = 'surveys');