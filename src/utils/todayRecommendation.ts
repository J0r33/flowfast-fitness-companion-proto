import {
  computeWorkoutStats,
  loadWorkoutHistoryUnified
} from "@/utils/workoutHistory";
import { loadAdaptationStateUnified } from "@/utils/adaptationState";
import { loadGoals } from "@/utils/profileSync";
import { TodayRecommendation } from "@/types/workout";

export async function getTodayRecommendation(userId?: string): Promise<TodayRecommendation> {
  const history = await loadWorkoutHistoryUnified(userId);
  const stats = computeWorkoutStats(history);
  const adaptation = await loadAdaptationStateUnified(userId);
  const goals = await loadGoals();

  // --- Collect Inputs ---
  const workoutsThisWeek = stats.thisWeekWorkouts;
  const targetWorkouts = goals.targetWorkoutsPerWeek;

  const lastRPE = adaptation.lastRpe ?? null;
  const avgRPE = adaptation.rpeCount && adaptation.rpeCount > 0
    ? (adaptation.rpeSum ?? 0) / adaptation.rpeCount
    : null;

  // Calculate days since last workout
  let daysSinceLast = 99; // High default = "no recent workout"
  if (adaptation.lastWorkoutDate) {
    const last = new Date(adaptation.lastWorkoutDate);
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
