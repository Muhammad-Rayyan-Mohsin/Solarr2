-- Create a SECURITY DEFINER function to delete a full survey and return asset storage paths
-- This bypasses RLS safely for the specific deletion operation

CREATE OR REPLACE FUNCTION public.delete_full_survey(p_survey_id uuid)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paths text[];
BEGIN
  -- Gather storage paths before deleting DB rows
  SELECT array_agg(storage_object_path)
  INTO v_paths
  FROM public.assets
  WHERE survey_id = p_survey_id;

  -- Delete the survey (CASCADE removes child rows)
  DELETE FROM public.surveys WHERE id = p_survey_id;

  RETURN COALESCE(v_paths, ARRAY[]::text[]);
END;
$$;

-- Allow web clients to call this function
GRANT EXECUTE ON FUNCTION public.delete_full_survey(uuid) TO anon, authenticated;