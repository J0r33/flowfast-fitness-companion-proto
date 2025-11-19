import { WorkoutHistory, WeeklyGoals, TodayRecommendation } from '@/types/workout';
import { computeWorkoutStats, loadWorkoutHistoryUnified } from '@/utils/workoutHistory';
import { computeAdaptationMetricsFromHistory } from '@/utils/adaptationState';
import { loadGoals } from '@/utils/profileSync';

/**
 * Pure function: Get today's recommendation from workout history and goals.
 * No side effects, no async, no localStorage, no DB calls.
 */
export function getTodayRecommendationFromHistory(
  history: WorkoutHistory,
  goals: WeeklyGoals
): TodayRecommendation {
  const stats = computeWorkoutStats(history);
  const metrics = computeAdaptationMetricsFromHistory(history);

  // --- Collect Inputs ---
  const workoutsThisWeek = stats.thisWeekWorkouts;
  const targetWorkouts = goals.targetWorkoutsPerWeek;

  const lastRPE = metrics.lastRpe ?? null;
  const avgRPE = metrics.avgRpe ?? null;

  // Calculate days since last workout
  let daysSinceLast = 99; // High default = "no recent workout"
  if (metrics.lastWorkoutDate) {
    const last = new Date(metrics.lastWorkoutDate);
    const now = new Date();
    daysSinceLast = Math.floor((now.getTime() - last.getTime()) / 86400000);
  }

  // --- Decision Rules (Priority Order) ---

  // 1. CRITICAL: Behind on weekly goals by 2+ workouts → catch_up
  if (workoutsThisWeek < targetWorkouts - 1) {
    return "catch_up";
  }

  // 2. HIGH PRIORITY: Recent high effort → recovery
  if ((lastRPE !== null && lastRPE >= 8) || (avgRPE !== null && avgRPE >= 8)) {
    return "recovery";
  }

  // 3. MODERATE: Long gap since last workout → maintain (ease back in)
  if (daysSinceLast >= 3) {
    return "maintain";
  }

  // 4. OPTIMAL: On track + moderate effort → push
  if (workoutsThisWeek >= targetWorkouts && (lastRPE ?? 5) <= 6) {
    return "push";
  }

  // 5. DEFAULT: Balanced approach
  return "maintain";
}

/**
 * Async wrapper: Load data and compute today's recommendation.
 * @deprecated Prefer getTodayRecommendationFromHistory with pre-loaded data for better separation of concerns.
 */
export async function getTodayRecommendation(userId?: string): Promise<TodayRecommendation> {
  const history = await loadWorkoutHistoryUnified(userId);
  const goals = await loadGoals();
  return getTodayRecommendationFromHistory(history, goals);
}
