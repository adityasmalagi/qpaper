-- Create a limited public profile table (safe fields only)
CREATE TABLE IF NOT EXISTS public.public_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  class_level TEXT,
  board TEXT,
  course TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Public profiles are readable by any authenticated user
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.public_profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.public_profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (true);

-- Users can manage their own public profile row
DROP POLICY IF EXISTS "Users can insert their own public profile" ON public.public_profiles;
CREATE POLICY "Users can insert their own public profile"
ON public.public_profiles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own public profile" ON public.public_profiles;
CREATE POLICY "Users can update their own public profile"
ON public.public_profiles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own public profile" ON public.public_profiles;
CREATE POLICY "Users can delete their own public profile"
ON public.public_profiles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Admins can manage all public profiles
DROP POLICY IF EXISTS "Admins can manage all public profiles" ON public.public_profiles;
CREATE POLICY "Admins can manage all public profiles"
ON public.public_profiles
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::public.app_role));

-- Backfill from existing profiles
INSERT INTO public.public_profiles (id, full_name, avatar_url, class_level, board, course)
SELECT p.id, p.full_name, p.avatar_url, p.class_level, p.board, p.course
FROM public.profiles p
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  class_level = EXCLUDED.class_level,
  board = EXCLUDED.board,
  course = EXCLUDED.course,
  updated_at = now();

-- Keep public_profiles in sync with profiles
CREATE OR REPLACE FUNCTION public.sync_public_profiles_from_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.public_profiles (id, full_name, avatar_url, class_level, board, course)
  VALUES (NEW.id, NEW.full_name, NEW.avatar_url, NEW.class_level, NEW.board, NEW.course)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    class_level = EXCLUDED.class_level,
    board = EXCLUDED.board,
    course = EXCLUDED.course,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_public_profiles_from_profiles ON public.profiles;
CREATE TRIGGER sync_public_profiles_from_profiles
AFTER INSERT OR UPDATE OF full_name, avatar_url, class_level, board, course
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_public_profiles_from_profiles();

CREATE OR REPLACE FUNCTION public.delete_public_profile_on_profile_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.public_profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS delete_public_profile_on_profile_delete ON public.profiles;
CREATE TRIGGER delete_public_profile_on_profile_delete
AFTER DELETE
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.delete_public_profile_on_profile_delete();

-- Tighten profiles table: remove broad read access
DROP POLICY IF EXISTS "Authenticated users can view public profile data" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Ensure owner-only read policy exists (recreate for determinism)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (auth.uid() = id);
