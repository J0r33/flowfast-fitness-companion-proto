import { WeeklyGoals } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'flowfast_weekly_goals';

export const DEFAULT_WEEKLY_GOALS: WeeklyGoals = {
  targetWorkoutsPerWeek: 3,
  targetMinutesPerWeek: 90,
  primaryGoal: 'get_toned',
};

// ==================== DATABASE OPERATIONS ====================

// Load weekly goals from database
export async function loadWeeklyGoalsFromDB(userId: string): Promise<WeeklyGoals> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('primary_goal, equipment, target_workouts_per_week, target_minutes_per_week, updated_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return DEFAULT_WEEKLY_GOALS;

    return {
      primaryGoal: (data.primary_goal as TrainingGoal) || DEFAULT_WEEKLY_GOALS.primaryGoal,
      targetWorkoutsPerWeek: data.target_workouts_per_week || DEFAULT_WEEKLY_GOALS.targetWorkoutsPerWeek,
      targetMinutesPerWeek: data.target_minutes_per_week || DEFAULT_WEEKLY_GOALS.targetMinutesPerWeek,
      lastUpdated: data.updated_at,
    };
  } catch (error) {
    console.error('Failed to load weekly goals from DB:', error);
    return DEFAULT_WEEKLY_GOALS;
  }
}

// Save weekly goals to database
export async function saveWeeklyGoalsToDB(userId: string, goals: WeeklyGoals): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        primary_goal: goals.primaryGoal,
        target_workouts_per_week: goals.targetWorkoutsPerWeek,
        target_minutes_per_week: goals.targetMinutesPerWeek,
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save weekly goals to DB:', error);
    throw error;
  }
}

// ==================== LOCALSTORAGE OPERATIONS (SYNC) ====================

/**
 * Load weekly goals from localStorage (synchronous).
 * Returns default goals if none exist or if parsing fails.
 */
export function loadWeeklyGoalsLocal(): WeeklyGoals {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_WEEKLY_GOALS;
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate and merge with defaults for backward compatibility
    return {
      targetWorkoutsPerWeek:
        typeof parsed?.targetWorkoutsPerWeek === 'number'
          ? parsed.targetWorkoutsPerWeek
          : DEFAULT_WEEKLY_GOALS.targetWorkoutsPerWeek,
      targetMinutesPerWeek:
        typeof parsed?.targetMinutesPerWeek === 'number'
          ? parsed.targetMinutesPerWeek
          : DEFAULT_WEEKLY_GOALS.targetMinutesPerWeek,
      primaryGoal:
        parsed?.primaryGoal ?? DEFAULT_WEEKLY_GOALS.primaryGoal,
      lastUpdated: parsed?.lastUpdated,
    };
  } catch (error) {
    console.error('Failed to load weekly goals:', error);
    return DEFAULT_WEEKLY_GOALS;
  }
}

/**
 * Save weekly goals to localStorage (synchronous).
 * Automatically adds lastUpdated timestamp.
 */
export function saveWeeklyGoalsLocal(goals: WeeklyGoals): void {
  try {
    const goalsWithTimestamp: WeeklyGoals = {
      ...goals,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goalsWithTimestamp));
  } catch (error) {
    console.error('Failed to save weekly goals:', error);
    throw error;
  }
}

// ==================== HYBRID OPERATIONS (ASYNC) ====================

/**
 * Load weekly goals - unified loader (DB with localStorage fallback)
 */
export async function loadWeeklyGoalsUnified(userId?: string): Promise<WeeklyGoals> {
  if (userId) {
    try {
      return await loadWeeklyGoalsFromDB(userId);
    } catch (error) {
      console.error('DB load failed, falling back to localStorage:', error);
      return loadWeeklyGoalsLocal();
    }
  }
  return loadWeeklyGoalsLocal();
}

/**
 * Save weekly goals - unified saver
 */
export async function saveWeeklyGoalsUnified(
  goals: WeeklyGoals,
  userId?: string
): Promise<void> {
  if (userId) {
    await saveWeeklyGoalsToDB(userId, goals);
  } else {
    saveWeeklyGoalsLocal(goals);
  }
}
