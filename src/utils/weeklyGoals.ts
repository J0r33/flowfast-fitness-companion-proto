import { WeeklyGoals as WorkoutWeeklyGoals, TrainingGoal } from '@/types/workout';

export type WeeklyGoals = WorkoutWeeklyGoals;
export type { TrainingGoal };

const STORAGE_KEY = 'flowfast_weekly_goals';

export const DEFAULT_WEEKLY_GOALS: WeeklyGoals = {
  targetWorkoutsPerWeek: 3,
  targetMinutesPerWeek: 90,
  primaryGoal: 'get_toned',
};

/**
 * Load weekly goals from localStorage.
 * Returns default goals if none exist or if parsing fails.
 */
export function loadWeeklyGoals(): WeeklyGoals {
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
 * Save weekly goals to localStorage.
 * Automatically adds lastUpdated timestamp.
 */
export function saveWeeklyGoals(goals: WeeklyGoals): void {
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
