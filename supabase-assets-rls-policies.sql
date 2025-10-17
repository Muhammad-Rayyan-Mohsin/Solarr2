-- ============================================
-- RLS POLICIES FOR ASSETS TABLE
-- ============================================
-- Run this SQL in your Supabase SQL Editor to fix permission errors

-- 1. Enable Row Level Security on assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Allow authenticated users to read all assets
CREATE POLICY "Allow authenticated users to read assets"
ON public.assets
FOR SELECT
TO authenticated
USING (true);

-- 3. Policy: Allow authenticated users to insert assets
CREATE POLICY "Allow authenticated users to insert assets"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Policy: Allow users to update their own assets (optional, based on created_by)
CREATE POLICY "Allow users to update their own assets"
ON public.assets
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 5. Policy: Allow users to delete their own assets (optional, based on created_by)
CREATE POLICY "Allow users to delete their own assets"
ON public.assets
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- 6. Policy: Allow anonymous access for reading (if you want unauthenticated access)
-- UNCOMMENT if you need public read access:
-- CREATE POLICY "Allow anonymous read access to assets"
-- ON public.assets
-- FOR SELECT
-- TO anon
-- USING (true);

-- ============================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================
-- These ensure proper access to files in the staging-uploads bucket

-- Enable RLS on storage.objects if not already enabled
-- (This is usually enabled by default but just to be safe)

-- 1. Policy: Allow authenticated users to upload to staging-uploads
CREATE POLICY "Allow authenticated uploads to staging-uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staging-uploads');

-- 2. Policy: Allow authenticated users to read from staging-uploads
CREATE POLICY "Allow authenticated reads from staging-uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'staging-uploads');

-- 3. Policy: Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates in staging-uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'staging-uploads' AND owner = auth.uid())
WITH CHECK (bucket_id = 'staging-uploads' AND owner = auth.uid());

-- 4. Policy: Allow authenticated users to delete their files
CREATE POLICY "Allow authenticated deletes in staging-uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'staging-uploads' AND owner = auth.uid());

-- 5. Policy: Allow public read access (if you want public files)
-- UNCOMMENT if you need public read access:
-- CREATE POLICY "Allow public reads from staging-uploads"
-- ON storage.objects
-- FOR SELECT
-- TO anon
-- USING (bucket_id = 'staging-uploads');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the policies were created successfully

-- Check assets table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'assets';

-- Check storage.objects policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- NOTES
-- ============================================
-- 1. These policies allow authenticated users to read/write assets
-- 2. Update and delete policies are restricted to the asset creator
-- 3. Storage policies ensure files can be uploaded and retrieved
-- 4. If you need more granular control, adjust the policies accordingly
-- 5. For production, consider stricter policies based on your security requirements

