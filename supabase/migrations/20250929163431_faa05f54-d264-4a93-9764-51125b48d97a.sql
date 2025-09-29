-- Broaden assets RLS to support anonymous surveys (created_by = 00000000-0000-0000-0000-000000000000 or NULL)
-- Drop existing assets policies
DROP POLICY IF EXISTS assets_select ON public.assets;
DROP POLICY IF EXISTS assets_ins ON public.assets;
DROP POLICY IF EXISTS assets_upd ON public.assets;
DROP POLICY IF EXISTS assets_del ON public.assets;

-- Helper condition reused in all policies
-- Note: cannot define a variable, so repeat condition

-- SELECT
CREATE POLICY assets_select
ON public.assets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = assets.survey_id
      AND (
        s.created_by = auth.uid()
        OR s.created_by = '00000000-0000-0000-0000-000000000000'::uuid
        OR s.created_by IS NULL
      )
  )
);

-- INSERT
CREATE POLICY assets_ins
ON public.assets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = assets.survey_id
      AND (
        s.created_by = auth.uid()
        OR s.created_by = '00000000-0000-0000-0000-000000000000'::uuid
        OR s.created_by IS NULL
      )
  )
);

-- UPDATE
CREATE POLICY assets_upd
ON public.assets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = assets.survey_id
      AND (
        s.created_by = auth.uid()
        OR s.created_by = '00000000-0000-0000-0000-000000000000'::uuid
        OR s.created_by IS NULL
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = assets.survey_id
      AND (
        s.created_by = auth.uid()
        OR s.created_by = '00000000-0000-0000-0000-000000000000'::uuid
        OR s.created_by IS NULL
      )
  )
);

-- DELETE
CREATE POLICY assets_del
ON public.assets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id = assets.survey_id
      AND (
        s.created_by = auth.uid()
        OR s.created_by = '00000000-0000-0000-0000-000000000000'::uuid
        OR s.created_by IS NULL
      )
  )
);
