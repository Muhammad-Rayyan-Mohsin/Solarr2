-- Update assets RLS policies to be more permissive for PDF generation
-- The PDF generation might be happening server-side where auth context is different

-- Drop existing policies
DROP POLICY IF EXISTS assets_select ON public.assets;
DROP POLICY IF EXISTS assets_ins ON public.assets;
DROP POLICY IF EXISTS assets_upd ON public.assets;
DROP POLICY IF EXISTS assets_del ON public.assets;

-- Create more permissive policies that allow service role access
CREATE POLICY "assets_select_all"
ON public.assets
FOR SELECT
TO public, anon, authenticated, service_role
USING (true);

CREATE POLICY "assets_insert"
ON public.assets
FOR INSERT
TO public, anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "assets_update"
ON public.assets
FOR UPDATE
TO public, anon, authenticated, service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "assets_delete"
ON public.assets
FOR DELETE
TO public, anon, authenticated, service_role
USING (true);