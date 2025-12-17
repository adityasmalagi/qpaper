-- Add institute_name column to question_papers table
ALTER TABLE question_papers ADD COLUMN institute_name text;

-- Add CHECK constraint for length validation (max 200 characters)
ALTER TABLE question_papers ADD CONSTRAINT institute_name_length CHECK (institute_name IS NULL OR length(institute_name) <= 200);