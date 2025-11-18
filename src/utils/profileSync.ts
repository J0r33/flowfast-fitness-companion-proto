import { supabase } from '@/integrations/supabase/client';
import { WeeklyGoals, DEFAULT_WEEKLY_GOALS, TrainingGoal } from '@/utils/weeklyGoals';

const EQUIPMENT_STORAGE_KEY = 'userEquipment';
const GOALS_STORAGE_KEY = 'flowfast_weekly_goals';

interface UserProfile {
  display_name: string | null;
  primary_goal: string | null;
  equipment: string[] | null;
  target_workouts_per_week: number | null;
  target_minutes_per_week: number | null;
}

/**
 * Load user profile from Supabase if authenticated, otherwise from localStorage
 */
export async function loadUserProfile(): Promise<{
  equipment: string[];
  goals: WeeklyGoals;
  displayName: string | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Load from Supabase
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile from Supabase:', error);
      // Fallback to localStorage
      return loadFromLocalStorage();
    }

    if (data) {
      return {
        equipment: data.equipment || [],
        goals: {
          primaryGoal: (data.primary_goal as TrainingGoal) || DEFAULT_WEEKLY_GOALS.primaryGoal,
          targetWorkoutsPerWeek: data.target_workouts_per_week || DEFAULT_WEEKLY_GOALS.targetWorkoutsPerWeek,
          targetMinutesPerWeek: data.target_minutes_per_week || DEFAULT_WEEKLY_GOALS.targetMinutesPerWeek,
        },
        displayName: data.display_name,
      };
    }
  }

  // Fallback to localStorage
  return loadFromLocalStorage();
}

/**
 * Save user profile to Supabase if authenticated, otherwise to localStorage
 */
export async function saveUserProfile(
  equipment: string[],
  goals: WeeklyGoals,
  displayName?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Save to Supabase
    const updates: Partial<UserProfile> = {
      equipment,
      primary_goal: goals.primaryGoal,
      target_workouts_per_week: goals.targetWorkoutsPerWeek,
      target_minutes_per_week: goals.targetMinutesPerWeek,
    };

    if (displayName !== undefined) {
      updates.display_name = displayName;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('Error saving profile to Supabase:', error);
      throw error;
    }
  } else {
    // Save to localStorage
    localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(equipment));
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }
}

/**
 * Load equipment from Supabase if authenticated, otherwise from localStorage
 */
export async function loadEquipment(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('equipment')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading equipment from Supabase:', error);
      return loadEquipmentFromLocalStorage();
    }

    return data?.equipment || [];
  }

  return loadEquipmentFromLocalStorage();
}

/**
 * Load weekly goals from Supabase if authenticated, otherwise from localStorage
 */
export async function loadGoals(): Promise<WeeklyGoals> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('primary_goal, target_workouts_per_week, target_minutes_per_week')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading goals from Supabase:', error);
      return loadGoalsFromLocalStorage();
    }

    if (data) {
      return {
        primaryGoal: (data.primary_goal as TrainingGoal) || DEFAULT_WEEKLY_GOALS.primaryGoal,
        targetWorkoutsPerWeek: data.target_workouts_per_week || DEFAULT_WEEKLY_GOALS.targetWorkoutsPerWeek,
        targetMinutesPerWeek: data.target_minutes_per_week || DEFAULT_WEEKLY_GOALS.targetMinutesPerWeek,
      };
    }
  }

  return loadGoalsFromLocalStorage();
}

// Helper functions for localStorage fallback
function loadFromLocalStorage() {
  return {
    equipment: loadEquipmentFromLocalStorage(),
    goals: loadGoalsFromLocalStorage(),
    displayName: null,
  };
}

function loadEquipmentFromLocalStorage(): string[] {
  try {
    const stored = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadGoalsFromLocalStorage(): WeeklyGoals {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!stored) return DEFAULT_WEEKLY_GOALS;
    
    const parsed = JSON.parse(stored);
    return {
      targetWorkoutsPerWeek: parsed?.targetWorkoutsPerWeek || DEFAULT_WEEKLY_GOALS.targetWorkoutsPerWeek,
      targetMinutesPerWeek: parsed?.targetMinutesPerWeek || DEFAULT_WEEKLY_GOALS.targetMinutesPerWeek,
      primaryGoal: parsed?.primaryGoal || DEFAULT_WEEKLY_GOALS.primaryGoal,
    };
  } catch {
    return DEFAULT_WEEKLY_GOALS;
  }
}
