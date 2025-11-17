import { WeeklyGoals } from '@/types/workout';

const STORAGE_KEY = 'flowfast_weekly_goals';

export const DEFAULT_WEEKLY_GOALS: WeeklyGoals = {
  targetWorkoutsPerWeek: 3,
  targetMinutesPerWeek: 90,
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
    
    const parsed = JSON.parse(stored) as WeeklyGoals;
    
    // Validate the data structure
    if (
      typeof parsed.targetWorkoutsPerWeek === 'number' &&
      typeof parsed.targetMinutesPerWeek === 'number'
    ) {
      return parsed;
    }
    
    console.warn('Invalid weekly goals data structure, using defaults');
    return DEFAULT_WEEKLY_GOALS;
  } catch (error) {
    console.error('Failed to load weekly goals:', error);
    return DEFAULT_WEEKLY_GOALS;
  }
}

/**
 * Save weekly goals to localStorage.
 * Automatically adds lastUpdated timestamp.
 */
export function saveWeeklyGoals(goals: Omit<WeeklyGoals, 'lastUpdated'>): void {
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
