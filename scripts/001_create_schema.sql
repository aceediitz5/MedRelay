-- MedRelay Database Schema

-- Topics table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  program_type TEXT DEFAULT 'medical_student',
  avatar_url TEXT,
  xp_points INTEGER DEFAULT 0,
  study_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  is_pro BOOLEAN DEFAULT FALSE,
  is_instructor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flashcards_select_all" ON public.flashcards FOR SELECT TO authenticated USING (true);

-- User flashcard progress
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  times_reviewed INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ,
  last_reviewed_at TIMESTAMPTZ,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, flashcard_id)
);

ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_flashcard_progress_select_own" ON public.user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_flashcard_progress_insert_own" ON public.user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_flashcard_progress_update_own" ON public.user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  vignette TEXT NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select_all" ON public.questions FOR SELECT TO authenticated USING (true);

-- User question progress
CREATE TABLE IF NOT EXISTS public.user_question_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_answer TEXT CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_question_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_question_progress_select_own" ON public.user_question_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_question_progress_insert_own" ON public.user_question_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_question_progress_update_own" ON public.user_question_progress FOR UPDATE USING (auth.uid() = user_id);

-- Case simulations table
CREATE TABLE IF NOT EXISTS public.case_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  patient_history TEXT NOT NULL,
  vital_signs JSONB NOT NULL,
  physical_exam TEXT NOT NULL,
  lab_results JSONB,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "case_simulations_select_all" ON public.case_simulations FOR SELECT TO authenticated USING (true);

-- User case progress
CREATE TABLE IF NOT EXISTS public.user_case_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.case_simulations(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, case_id)
);

ALTER TABLE public.user_case_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_case_progress_select_own" ON public.user_case_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_case_progress_insert_own" ON public.user_case_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_case_progress_update_own" ON public.user_case_progress FOR UPDATE USING (auth.uid() = user_id);

-- Daily study logs
CREATE TABLE IF NOT EXISTS public.daily_study_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_date DATE NOT NULL DEFAULT CURRENT_DATE,
  flashcards_reviewed INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  cases_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, study_date)
);

ALTER TABLE public.daily_study_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_study_logs_select_own" ON public.daily_study_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_study_logs_insert_own" ON public.daily_study_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_study_logs_update_own" ON public.daily_study_logs FOR UPDATE USING (auth.uid() = user_id);

-- Instructor class assignments
CREATE TABLE IF NOT EXISTS public.instructor_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.instructor_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instructor_classes_select_own" ON public.instructor_classes FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "instructor_classes_insert_own" ON public.instructor_classes FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "instructor_classes_update_own" ON public.instructor_classes FOR UPDATE USING (auth.uid() = instructor_id);

-- Class students
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.instructor_classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "class_students_select_instructor" ON public.class_students FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.instructor_classes 
    WHERE id = class_id AND instructor_id = auth.uid()
  )
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
