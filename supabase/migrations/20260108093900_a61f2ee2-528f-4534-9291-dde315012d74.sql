-- Create group_invites table for shareable invite links
CREATE TABLE public.group_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL,
  use_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast invite code lookups
CREATE INDEX idx_group_invites_code ON public.group_invites(invite_code);
CREATE INDEX idx_group_invites_group_id ON public.group_invites(group_id);

-- Enable Row Level Security
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active invites (needed for join page)
CREATE POLICY "Anyone can view active invites"
ON public.group_invites
FOR SELECT
USING (is_active = true);

-- Policy: Group admins can create invites
CREATE POLICY "Group admins can create invites"
ON public.group_invites
FOR INSERT
WITH CHECK (is_group_admin(auth.uid(), group_id));

-- Policy: Group admins can update invites (deactivate, etc.)
CREATE POLICY "Group admins can manage invites"
ON public.group_invites
FOR UPDATE
USING (is_group_admin(auth.uid(), group_id));

-- Policy: Group admins can delete invites
CREATE POLICY "Group admins can delete invites"
ON public.group_invites
FOR DELETE
USING (is_group_admin(auth.uid(), group_id));

-- Function to increment invite use count
CREATE OR REPLACE FUNCTION public.use_group_invite(p_invite_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite group_invites%ROWTYPE;
  v_group_id UUID;
BEGIN
  -- Get and lock the invite
  SELECT * INTO v_invite 
  FROM group_invites 
  WHERE invite_code = p_invite_code 
  AND is_active = true
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite link';
  END IF;
  
  -- Check expiration
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RAISE EXCEPTION 'Invite link has expired';
  END IF;
  
  -- Check max uses
  IF v_invite.max_uses IS NOT NULL AND v_invite.use_count >= v_invite.max_uses THEN
    RAISE EXCEPTION 'Invite link has reached maximum uses';
  END IF;
  
  -- Increment use count
  UPDATE group_invites 
  SET use_count = use_count + 1 
  WHERE id = v_invite.id;
  
  RETURN v_invite.group_id;
END;
$$;