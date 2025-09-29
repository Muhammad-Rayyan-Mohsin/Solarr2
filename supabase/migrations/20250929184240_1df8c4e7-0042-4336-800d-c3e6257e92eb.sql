-- Add DELETE policy for anonymous users to match INSERT and SELECT policies
-- This allows deletion of surveys created by anonymous users

CREATE POLICY "surveys_anon_del"
ON public.surveys
FOR DELETE
TO anon
USING ((created_by = '00000000-0000-0000-0000-000000000000'::uuid) OR (created_by IS NULL));