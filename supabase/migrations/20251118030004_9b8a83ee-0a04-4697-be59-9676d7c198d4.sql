-- Create user_profiles table (1:1 with auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  display_name TEXT,
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'get_stronger', 'get_toned', 'general_fitness')),
  equipment TEXT[] DEFAULT '{}',
  target_workouts_per_week INTEGER DEFAULT 3,
  target_minutes_per_week INTEGER DEFAULT 90
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create workout_history table
CREATE TABLE public.workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  energy TEXT CHECK (energy IN ('low', 'medium', 'high')),
  time_minutes_planned INTEGER,
  time_minutes_actual INTEGER,
  focus_areas TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  exercises_count INTEGER,
  total_sets INTEGER,
  total_estimated_calories INTEGER,
  feedback_difficulty TEXT CHECK (feedback_difficulty IN ('too_easy', 'just_right', 'too_hard', 'couldnt_finish')),
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10)
);

-- Enable RLS on workout_history
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_history
CREATE POLICY "Users can view their own workout history"
  ON public.workout_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout history"
  ON public.workout_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout history"
  ON public.workout_history
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout history"
  ON public.workout_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_workout_history_user_date ON public.workout_history(user_id, date DESC);
CREATE INDEX idx_workout_history_date ON public.workout_history(date DESC);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update updated_at on user_profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger function to auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, primary_goal, equipment, target_workouts_per_week, target_minutes_per_week)
  VALUES (
    NEW.id,
    'general_fitness',
    '{}',
    3,
    90
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper function to get user workout stats (for future use)
CREATE OR REPLACE FUNCTION public.get_user_workout_stats(user_uuid UUID)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_workouts', COUNT(*),
    'total_minutes', COALESCE(SUM(time_minutes_actual), SUM(time_minutes_planned), 0),
    'total_calories', COALESCE(SUM(total_estimated_calories), 0),
    'last_workout_date', MAX(date),
    'avg_rpe', ROUND(AVG(rpe), 1)
  )
  FROM public.workout_history
  WHERE user_id = user_uuid;
$$;