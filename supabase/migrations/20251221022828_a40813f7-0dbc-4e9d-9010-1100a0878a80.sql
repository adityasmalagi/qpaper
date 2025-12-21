
-- Fix 1: Update profiles RLS to only allow authenticated users to view other profiles
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Add RLS policies for paper_metric_events table
-- Only admins can view metric events (analytics data)
CREATE POLICY "Admins can view metric events"
ON public.paper_metric_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Only system (via security definer functions) can insert metric events
-- The increment_views and increment_downloads functions already handle this
-- No direct user access needed for INSERT/UPDATE/DELETE
