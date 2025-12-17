-- Create atomic increment functions for views and downloads to prevent race conditions
CREATE OR REPLACE FUNCTION public.increment_views(_paper_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE question_papers 
  SET views_count = views_count + 1 
  WHERE id = _paper_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_downloads(_paper_id uuid)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE question_papers 
  SET downloads_count = downloads_count + 1 
  WHERE id = _paper_id;
$$;