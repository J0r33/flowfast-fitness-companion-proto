import { AdaptationState, PlannerHistorySnapshot, DifficultyFeedback } from '@/types/workout';

const STORAGE_KEY = 'flowfast_adaptation_state';

// Default empty state
const DEFAULT_STATE: AdaptationState = {
  totalSessions: 0,
  tooEasyCount: 0,
  tooHardCount: 0,
  couldntFinishCount: 0,
};

// Read from localStorage
export function loadAdaptationState(): AdaptationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load adaptation state:', error);
    return DEFAULT_STATE;
  }
}

// Write to localStorage
export function saveAdaptationState(state: AdaptationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save adaptation state:', error);
  }
}

// Update state with new feedback
export function recordWorkoutFeedback(
  rating: number,
  energyAfter: string
): void {
  const state = loadAdaptationState();
  
  // Increment total sessions
  state.totalSessions += 1;
  state.lastWorkoutDate = new Date().toISOString();
  
  // Derive difficulty feedback from rating (1-5 stars)
  let difficultyFeedback: DifficultyFeedback;
  if (rating <= 2) {
    difficultyFeedback = 'too_hard';
    state.tooHardCount += 1;
  } else if (rating === 3) {
    difficultyFeedback = 'just_right';
  } else if (rating === 4) {
    difficultyFeedback = 'too_easy';
    state.tooEasyCount += 1;
  } else {
    // rating === 5
    difficultyFeedback = 'too_easy';
    state.tooEasyCount += 1;
  }
  
  // Special case: if energy after is 'low', consider it couldn't finish
  if (energyAfter === 'low' && rating <= 3) {
    difficultyFeedback = 'couldnt_finish';
    state.couldntFinishCount += 1;
  }
  
  state.lastFeedback = difficultyFeedback;
  saveAdaptationState(state);
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

// Generate snapshot for planner
export function generatePlannerHistorySnapshot(): PlannerHistorySnapshot {
  const state = loadAdaptationState();
  
  return {
    sessions_completed: state.totalSessions,
    difficulty_bias: calculateDifficultyBias(state),
    days_since_last_workout: calculateDaysSinceLastWorkout(state.lastWorkoutDate),
    last_feedback: state.lastFeedback,
  };
}
