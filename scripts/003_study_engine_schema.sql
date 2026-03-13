-- MedRelay Study Engine Schema Updates
-- Adds spaced repetition, XP system, and education levels

-- Add education_level and difficulty_level to flashcards
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'all';
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium';

-- Add education_level and difficulty_level to questions  
ALTER TABLE questions ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'all';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium';

-- Add education_level to case_simulations
ALTER TABLE case_simulations ADD COLUMN IF NOT EXISTS education_level TEXT DEFAULT 'all';

-- Update user_flashcard_progress for spaced repetition
ALTER TABLE user_flashcard_progress ADD COLUMN IF NOT EXISTS ease_factor DECIMAL(3,2) DEFAULT 2.5;
ALTER TABLE user_flashcard_progress ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0;
ALTER TABLE user_flashcard_progress ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;

-- Add XP tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create study_sessions table to track daily sessions
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  flashcards_reviewed INTEGER DEFAULT 0,
  flashcards_correct INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  cases_completed INTEGER DEFAULT 0,
  cases_score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  session_type TEXT DEFAULT 'daily', -- daily, flashcards, questions, cases, custom
  UNIQUE(user_id, session_date, session_type)
);

-- Enable RLS on study_sessions
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_sessions_select_own" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "study_sessions_insert_own" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "study_sessions_update_own" ON study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL, -- streak, cards_mastered, accuracy, xp_total, cases_completed, etc.
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_achievements_select_own" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_insert_own" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (slug, title, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('first_steps', 'First Steps', 'Complete your first study session', 'Trophy', 50, 'sessions_completed', 1),
  ('streak_3', '3 Day Streak', 'Study for 3 consecutive days', 'Flame', 100, 'streak', 3),
  ('streak_7', 'Week Warrior', 'Study for 7 consecutive days', 'Flame', 250, 'streak', 7),
  ('streak_30', 'Month Master', 'Study for 30 consecutive days', 'Flame', 1000, 'streak', 30),
  ('cards_50', 'Card Apprentice', 'Review 50 flashcards', 'BookOpen', 100, 'cards_reviewed', 50),
  ('cards_250', 'Card Scholar', 'Review 250 flashcards', 'BookOpen', 250, 'cards_reviewed', 250),
  ('cards_1000', 'Card Master', 'Review 1000 flashcards', 'BookOpen', 500, 'cards_reviewed', 1000),
  ('accuracy_80', 'Sharp Mind', 'Achieve 80% question accuracy', 'Target', 200, 'accuracy', 80),
  ('cases_5', 'Clinical Thinker', 'Complete 5 case simulations', 'Stethoscope', 200, 'cases_completed', 5),
  ('cases_25', 'Clinical Expert', 'Complete 25 case simulations', 'Stethoscope', 500, 'cases_completed', 25),
  ('xp_1000', 'Rising Star', 'Earn 1000 XP', 'Star', 100, 'xp_total', 1000),
  ('xp_5000', 'Scholar', 'Earn 5000 XP', 'Star', 250, 'xp_total', 5000),
  ('xp_10000', 'Expert', 'Earn 10000 XP', 'Star', 500, 'xp_total', 10000)
ON CONFLICT (slug) DO NOTHING;

-- Create function to update user XP and check achievements
CREATE OR REPLACE FUNCTION update_user_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS void AS $$
BEGIN
  -- Update total XP
  UPDATE profiles 
  SET total_xp = COALESCE(total_xp, 0) + p_xp_amount,
      level = FLOOR((COALESCE(total_xp, 0) + p_xp_amount) / 1000) + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update study streak
CREATE OR REPLACE FUNCTION update_study_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_current_streak INTEGER;
  v_last_study_date DATE;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
BEGIN
  -- Get current profile data
  SELECT study_streak, last_study_date, longest_streak
  INTO v_current_streak, v_last_study_date
  FROM profiles WHERE id = p_user_id;
  
  -- Calculate new streak
  IF v_last_study_date IS NULL OR v_last_study_date < v_today - INTERVAL '1 day' THEN
    -- Streak broken or first time
    v_new_streak := 1;
  ELSIF v_last_study_date = v_today - INTERVAL '1 day' THEN
    -- Consecutive day
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSIF v_last_study_date = v_today THEN
    -- Same day, no change
    v_new_streak := COALESCE(v_current_streak, 1);
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET study_streak = v_new_streak,
      last_study_date = v_today,
      longest_streak = GREATEST(COALESCE(longest_streak, 0), v_new_streak)
  WHERE id = p_user_id;
  
  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
