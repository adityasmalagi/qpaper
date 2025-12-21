-- Add CHECK constraint for bio length (max 500 characters)
ALTER TABLE profiles ADD CONSTRAINT bio_length CHECK (bio IS NULL OR length(bio) <= 500);