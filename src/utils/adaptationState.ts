import { AdaptationMetrics, PlannerHistorySnapshot, DifficultyFeedback, WorkoutHistory } from '@/types/workout';

// ============================================================
// PURE HELPER FUNCTIONS (NEW - USE THESE!)
// ============================================================

/**
 * Pure function: Compute adaptation metrics from workout history.
 * No side effects, no async, no localStorage, no DB calls.
 */
export function computeAdaptationMetricsFromHistory(
  history: WorkoutHistory
): AdaptationMetrics {
  const entries = history?.entries ?? [];
  
  if (entries.length === 0) {
    return {
      totalSessions: 0,
      tooEasyCount: 0,
      tooHardCount: 0,
      couldntFinishCount: 0,
      lastFeedback: undefined,
      lastWorkoutDate: undefined,
      lastRpe: undefined,
      avgRpe: undefined,
    };
  }

  let tooEasyCount = 0;
  let tooHardCount = 0;
  let couldntFinishCount = 0;
  let lastFeedback: DifficultyFeedback | undefined = undefined;

  let rpeSum = 0;
  let rpeCount = 0;
  let lastRpe: number | undefined = undefined;

  // Assuming entries are in reverse-chronological order (newest first)
  for (const entry of entries) {
    if (entry.feedbackDifficulty) {
      lastFeedback ??= entry.feedbackDifficulty;

      if (entry.feedbackDifficulty === 'too_easy') tooEasyCount++;
      if (entry.feedbackDifficulty === 'too_hard') tooHardCount++;
      if (entry.feedbackDifficulty === 'couldnt_finish') couldntFinishCount++;
    }

    if (typeof entry.rpe === 'number') {
      rpeSum += entry.rpe;
      rpeCount++;
      if (lastRpe === undefined) {
        lastRpe = entry.rpe;
      }
    }
  }

  const lastEntry = entries[0];
  const lastWorkoutDate = lastEntry?.date;

  const avgRpe = rpeCount > 0 ? rpeSum / rpeCount : undefined;

  return {
    totalSessions: entries.length,
    tooEasyCount,
    tooHardCount,
    couldntFinishCount,
    lastFeedback,
    lastWorkoutDate,
    lastRpe,
    avgRpe,
  };
}

/**
 * Pure function: Generate planner history snapshot from adaptation metrics.
 * No side effects, no async, no localStorage, no DB calls.
 */
export function generatePlannerHistorySnapshotFromMetrics(
  metrics: AdaptationMetrics
): PlannerHistorySnapshot {
  const { 
    totalSessions,
    tooEasyCount,
    tooHardCount,
    couldntFinishCount,
    lastFeedback,
    lastWorkoutDate,
    lastRpe,
    avgRpe
  } = metrics;

  // Calculate difficulty bias
  // If couldn't finish recently, definitely too hard
  let difficulty_bias: -1 | 0 | 1 = 0;
  if (couldntFinishCount > 0 && couldntFinishCount >= tooEasyCount) {
    difficulty_bias = -1;
  } else {
    // Calculate net difficulty score
    const netScore = tooEasyCount - (tooHardCount + couldntFinishCount);
    
    // Thresholds
    if (netScore >= 2) {
      difficulty_bias = 1;  // Too easy
    } else if (netScore <= -2) {
      difficulty_bias = -1; // Too hard
    } else {
      difficulty_bias = 0; // Balanced
    }
  }

  // Calculate days since last workout
  const days_since_last_workout = lastWorkoutDate
    ? Math.floor((Date.now() - new Date(lastWorkoutDate).getTime()) / 86400000)
    : null;

  return {
    sessions_completed: totalSessions,
    difficulty_bias,
    days_since_last_workout,
    last_feedback: lastFeedback,
    avg_rpe: avgRpe,
    last_rpe: lastRpe,
  };
}

