-- 1. Change default status for question_papers from 'pending' to 'approved'
ALTER TABLE public.question_papers ALTER COLUMN status SET DEFAULT 'approved';

-- 2. Update RLS policy to allow anyone to view all papers (not just approved ones)
DROP POLICY IF EXISTS "Anyone can view approved papers" ON public.question_papers;
CREATE POLICY "Anyone can view papers" ON public.question_papers
FOR SELECT USING (true);

-- 3. Allow anyone (including unauthenticated) to view profiles
DROP POLICY IF EXISTS "Authenticated users can view profile names" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles
FOR SELECT USING (true);