-- =============================================
-- PHASE 2: Social & Collaboration Features
-- =============================================

-- Feature 2: Paper Comments & Discussions
-- =============================================

-- Comments table with nested replies support
CREATE TABLE paper_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id UUID NOT NULL REFERENCES question_papers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES paper_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comment upvotes for tracking
CREATE TABLE comment_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES paper_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE paper_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS policies for paper_comments
CREATE POLICY "Anyone can view comments" ON paper_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON paper_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON paper_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON paper_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comment_upvotes
CREATE POLICY "Anyone can view upvotes" ON comment_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upvote" ON comment_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvotes" ON comment_upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update upvotes count
CREATE OR REPLACE FUNCTION update_comment_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE paper_comments SET upvotes_count = upvotes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE paper_comments SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_comment_upvotes
AFTER INSERT OR DELETE ON comment_upvotes
FOR EACH ROW EXECUTE FUNCTION update_comment_upvotes_count();

-- Feature 3: Paper Collections/Folders
-- =============================================

-- Collections table
CREATE TABLE paper_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#6366f1',
  papers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Collection items (many-to-many)
CREATE TABLE collection_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES paper_collections(id) ON DELETE CASCADE,
  paper_id UUID NOT NULL REFERENCES question_papers(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(collection_id, paper_id)
);

-- Enable RLS
ALTER TABLE paper_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_papers ENABLE ROW LEVEL SECURITY;

-- RLS policies for paper_collections
CREATE POLICY "Users can view their own collections" ON paper_collections
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own collections" ON paper_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON paper_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON paper_collections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for collection_papers
CREATE POLICY "Users can view papers in accessible collections" ON collection_papers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM paper_collections 
      WHERE id = collection_papers.collection_id 
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

CREATE POLICY "Users can add papers to their collections" ON collection_papers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM paper_collections 
      WHERE id = collection_papers.collection_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove papers from their collections" ON collection_papers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM paper_collections 
      WHERE id = collection_papers.collection_id 
      AND user_id = auth.uid()
    )
  );

-- Trigger to update papers count
CREATE OR REPLACE FUNCTION update_collection_papers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE paper_collections SET papers_count = papers_count + 1 WHERE id = NEW.collection_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE paper_collections SET papers_count = GREATEST(0, papers_count - 1) WHERE id = OLD.collection_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_collection_papers_count
AFTER INSERT OR DELETE ON collection_papers
FOR EACH ROW EXECUTE FUNCTION update_collection_papers_count();

-- Feature 8: Progress Tracking
-- =============================================

-- User paper progress table
CREATE TABLE user_paper_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  paper_id UUID NOT NULL REFERENCES question_papers(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('want_to_attempt', 'in_progress', 'completed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, paper_id)
);

-- Study streaks for gamification
CREATE TABLE study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_paper_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_paper_progress
CREATE POLICY "Users can view their own progress" ON user_paper_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON user_paper_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_paper_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON user_paper_progress
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for study_streaks
CREATE POLICY "Users can view their own streaks" ON study_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streaks" ON study_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON study_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update study streak
CREATE OR REPLACE FUNCTION update_study_streak()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
  streak_record study_streaks%ROWTYPE;
BEGIN
  -- Get or create streak record
  SELECT * INTO streak_record FROM study_streaks WHERE user_id = NEW.user_id;
  
  IF NOT FOUND THEN
    INSERT INTO study_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 1, 1, today);
  ELSE
    IF streak_record.last_activity_date = today THEN
      -- Already logged activity today, no update needed
      NULL;
    ELSIF streak_record.last_activity_date = today - INTERVAL '1 day' THEN
      -- Consecutive day, increment streak
      UPDATE study_streaks 
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = today,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE study_streaks 
      SET current_streak = 1,
          last_activity_date = today,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_study_streak
AFTER INSERT OR UPDATE ON user_paper_progress
FOR EACH ROW EXECUTE FUNCTION update_study_streak();

-- Indexes for better performance
CREATE INDEX idx_paper_comments_paper_id ON paper_comments(paper_id);
CREATE INDEX idx_paper_comments_parent_id ON paper_comments(parent_id);
CREATE INDEX idx_collection_papers_collection_id ON collection_papers(collection_id);
CREATE INDEX idx_collection_papers_paper_id ON collection_papers(paper_id);
CREATE INDEX idx_user_paper_progress_user_id ON user_paper_progress(user_id);
CREATE INDEX idx_user_paper_progress_status ON user_paper_progress(status);