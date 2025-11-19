import { AdaptationState, AdaptationMetrics, PlannerHistorySnapshot, DifficultyFeedback, WorkoutHistory } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'flowfast_adaptation_state';

// Default empty state
const DEFAULT_STATE: AdaptationState = {
  totalSessions: 0,
  tooEasyCount: 0,
  tooHardCount: 0,
  couldntFinishCount: 0,
  lastRpe: undefined,
  rpeSum: 0,
  rpeCount: 0,
};

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
  const entries = history.entries || [];
  
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

// ============================================================
// DEPRECATED LOCAL STORAGE FUNCTIONS (for backward compatibility)
// ============================================================

/**
 * @deprecated Use computeAdaptationMetricsFromHistory with loadWorkoutHistoryUnified instead
 */
export function loadAdaptationStateLocal(): AdaptationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load adaptation state:', error);
    return DEFAULT_STATE;
  }
}

/**
 * @deprecated Adaptation state is now derived from workout_history
 */
export function saveAdaptationStateLocal(state: AdaptationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save adaptation state:', error);
  }
}

/**
 * @deprecated Adaptation state is now derived from workout_history
 */
export function recordWorkoutFeedback(
  rating: number,
  energyAfter: string,
  rpe?: number
): void {
  // No-op: state is now calculated from workout_history table
  console.warn('recordWorkoutFeedback is deprecated - state is derived from workout_history');
}

// ============================================================
// DATABASE-BACKED FUNCTIONS (DEPRECATED - use pure functions above)
// ============================================================

/**
 * @deprecated Use computeAdaptationMetricsFromHistory with loadWorkoutHistoryUnified instead
 */
export async function loadAdaptationStateFromDb(userId: string): Promise<AdaptationState> {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return DEFAULT_STATE;
    }

    const state: AdaptationState = {
      totalSessions: data.length,
      tooEasyCount: 0,
      tooHardCount: 0,
      couldntFinishCount: 0,
      lastRpe: undefined,
      rpeSum: 0,
      rpeCount: 0,
      lastWorkoutDate: data[0]?.date,
      lastFeedback: undefined,
    };

    // Calculate counts and RPE stats
    data.forEach((entry) => {
      // Count difficulty feedback
      if (entry.feedback_difficulty === 'too_easy') {
        state.tooEasyCount++;
      } else if (entry.feedback_difficulty === 'too_hard') {
        state.tooHardCount++;
      } else if (entry.feedback_difficulty === 'couldnt_finish') {
        state.couldntFinishCount++;
      }

      // Track RPE
      if (typeof entry.rpe === 'number') {
        state.rpeSum = (state.rpeSum ?? 0) + entry.rpe;
        state.rpeCount = (state.rpeCount ?? 0) + 1;
      }
    });

    // Set last RPE and feedback from most recent entry
    if (data[0]) {
      state.lastRpe = data[0].rpe ?? undefined;
      state.lastFeedback = data[0].feedback_difficulty as DifficultyFeedback | undefined;
    }

    return state;
  } catch (error) {
    console.error('Failed to load adaptation state from DB:', error);
    throw error;
  }
}

/**
 * @deprecated Use computeAdaptationMetricsFromHistory with loadWorkoutHistoryUnified instead
 */
export async function loadAdaptationStateUnified(userId?: string): Promise<AdaptationState> {
  if (!userId) {
    return loadAdaptationStateLocal();
  }

  try {
    return await loadAdaptationStateFromDb(userId);
  } catch (error) {
    console.error('DB load failed, falling back to localStorage:', error);
    return loadAdaptationStateLocal();
  }
}

// Legacy sync function for backward compatibility
export function loadAdaptationState(): AdaptationState {
  return loadAdaptationStateLocal();
}

// Calculate difficulty bias
function calculateDifficultyBias(state: AdaptationState): -1 | 0 | 1 {
  const { tooEasyCount, tooHardCount, couldntFinishCount } = state;
  
  // If couldn't finish recently, definitely too hard
  if (couldntFinishCount > 0 && couldntFinishCount >= tooEasyCount) {
    return -1;
  }
  
  // Calculate net difficulty score
  const netScore = tooEasyCount - (tooHardCount + couldntFinishCount);
  
  // Thresholds
  if (netScore >= 2) return 1;  // Too easy
  if (netScore <= -2) return -1; // Too hard
  return 0; // Balanced
}

// Calculate days since last workout
function calculateDaysSinceLastWorkout(lastWorkoutDate?: string): number | null {
  if (!lastWorkoutDate) return null;
  
  const lastDate = new Date(lastWorkoutDate);
  const today = new Date();
  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * @deprecated Use generatePlannerHistorySnapshotFromMetrics with computeAdaptationMetricsFromHistory instead
 */
export async function generatePlannerHistorySnapshotFromDb(userId: string): Promise<PlannerHistorySnapshot> {
  const state = await loadAdaptationStateFromDb(userId);
  
  // Calculate average RPE
  const avg_rpe = 
    state.rpeCount && state.rpeCount > 0
      ? (state.rpeSum ?? 0) / state.rpeCount
      : undefined;
  
  return {
    sessions_completed: state.totalSessions,
    difficulty_bias: calculateDifficultyBias(state),
    days_since_last_workout: calculateDaysSinceLastWorkout(state.lastWorkoutDate),
    last_feedback: state.lastFeedback,
    avg_rpe,
    last_rpe: state.lastRpe,
  };
}

/**
 * @deprecated Use generatePlannerHistorySnapshotFromMetrics with computeAdaptationMetricsFromHistory instead
 */
export async function generatePlannerHistorySnapshotUnified(userId?: string): Promise<PlannerHistorySnapshot> {
  if (!userId) {
    const state = loadAdaptationStateLocal();
    const avg_rpe = 
      state.rpeCount && state.rpeCount > 0
        ? (state.rpeSum ?? 0) / state.rpeCount
        : undefined;
    
    return {
      sessions_completed: state.totalSessions,
      difficulty_bias: calculateDifficultyBias(state),
      days_since_last_workout: calculateDaysSinceLastWorkout(state.lastWorkoutDate),
      last_feedback: state.lastFeedback,
      avg_rpe,
      last_rpe: state.lastRpe,
    };
  }

  try {
    return await generatePlannerHistorySnapshotFromDb(userId);
  } catch (error) {
    console.error('DB snapshot failed, falling back to localStorage:', error);
    const state = loadAdaptationStateLocal();
    const avg_rpe = 
      state.rpeCount && state.rpeCount > 0
        ? (state.rpeSum ?? 0) / state.rpeCount
        : undefined;
    
    return {
      sessions_completed: state.totalSessions,
      difficulty_bias: calculateDifficultyBias(state),
      days_since_last_workout: calculateDaysSinceLastWorkout(state.lastWorkoutDate),
      last_feedback: state.lastFeedback,
      avg_rpe,
      last_rpe: state.lastRpe,
    };
  }
}

/**
 * @deprecated Use generatePlannerHistorySnapshotFromMetrics with computeAdaptationMetricsFromHistory instead
 */
export function generatePlannerHistorySnapshot(): PlannerHistorySnapshot {
  const state = loadAdaptationStateLocal();
  
  // Calculate average RPE
  const avg_rpe = 
    state.rpeCount && state.rpeCount > 0
      ? (state.rpeSum ?? 0) / state.rpeCount
      : undefined;
  
  return {
    sessions_completed: state.totalSessions,
    difficulty_bias: calculateDifficultyBias(state),
    days_since_last_workout: calculateDaysSinceLastWorkout(state.lastWorkoutDate),
    last_feedback: state.lastFeedback,
    avg_rpe,
    last_rpe: state.lastRpe,
  };
}
