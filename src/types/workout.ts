// Mock data types for FlowFast prototype
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusArea = 'cardio' | 'strength' | 'flexibility' | 'recovery' | 'full-body' | 'upper-body' | 'lower-body' | 'core';
export type ExerciseType = 'cardio' | 'strength' | 'stretch' | 'breathing';
export type DifficultyFeedback = 'too_easy' | 'just_right' | 'too_hard' | 'couldnt_finish';
export type RPE = number; // 1-10 scale
export type TrainingGoal = 'lose_weight' | 'get_stronger' | 'get_toned' | 'general_fitness';
export type TodayRecommendation = 'push' | 'maintain' | 'recovery' | 'catch_up';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  mode?: 'reps' | 'time';  // NEW: explicitly track the exercise mode
  equipment?: string[];     // NEW: track which equipment is needed
  sets?: number;
  reps?: number;
  duration?: number; // in seconds
  notes?: string;
  caloriesEstimate?: number;
}

export interface WorkoutPlan {
  id: string;
  date: string;
  exercises: Exercise[];
  totalTime: number; // in minutes
  intensity: 'low' | 'medium' | 'high';
  focusAreas: FocusArea[];
  adaptedFor?: {
    energy: EnergyLevel;
    availableTime: number;
  };
  context?: {
    energy: EnergyLevel;
    timeMinutes: number;
    focusAreas: FocusArea[];
    equipment: string[];
  };
  completed?: boolean;
  feedback?: WorkoutFeedback;
}

export interface WorkoutFeedback {
  rating: number; // 1-5
  energyAfter: EnergyLevel;
  notes?: string;
  completedAt: string;
}

export interface UserProfile {
  name: string;
  currentStreak: number;
  totalWorkouts: number;
  preferredFocusAreas: FocusArea[];
  defaultTime: number;
  equipment: string[];
}

export interface AdjustmentPreferences {
  energy: EnergyLevel;
  availableTime: number;
  focusAreas: FocusArea[];
}

export interface WorkoutStep {
  id: string;
  exerciseName: string;
  type: 'time' | 'reps' | 'rest';
  durationSeconds?: number;
  reps?: number;
  setIndex: number;
  totalSets: number;
  groupType?: 'superset' | 'circuit' | null;
  groupLabel?: string;
  animationAssetId?: string;
  tooltipInstructions?: string;
  isRest?: boolean;
}

export interface WorkoutSession {
  id: string;
  title: string;
  steps: WorkoutStep[];
  workoutPlan: WorkoutPlan;
}

export interface AdaptationState {
  totalSessions: number;
  tooEasyCount: number;
  tooHardCount: number;
  couldntFinishCount: number;
  lastFeedback?: DifficultyFeedback;
  lastWorkoutDate?: string; // ISO string
  lastRpe?: number;        // Most recent RPE score (1-10)
  rpeSum?: number;         // Sum of all RPE scores for averaging
  rpeCount?: number;       // Number of sessions with valid RPE
}

// Pure adaptation metrics derived from workout history
export interface AdaptationMetrics {
  totalSessions: number;
  tooEasyCount: number;
  tooHardCount: number;
  couldntFinishCount: number;
  lastFeedback?: DifficultyFeedback;
  lastWorkoutDate?: string; // ISO date string
  lastRpe?: number;         // Most recent RPE score (1-10)
  avgRpe?: number;          // Average RPE across all sessions
}

export interface PlannerHistorySnapshot {
  sessions_completed: number;
  difficulty_bias: -1 | 0 | 1; // -1 = too hard, 0 = balanced, 1 = too easy
  days_since_last_workout: number | null; // null if none yet
  last_feedback?: DifficultyFeedback;
  avg_rpe?: number;  // Average RPE across all sessions
  last_rpe?: number; // Most recent RPE score
}

export interface WorkoutHistoryEntry {
  id?: string;
  date: string;
  energy: EnergyLevel;
  timeMinutesPlanned: number;
  timeMinutesActual?: number;
  focusAreas: FocusArea[];
  equipment: string[];
  exercisesCount: number;
  totalSets: number;
  totalEstimatedCalories?: number;
  feedbackDifficulty?: DifficultyFeedback;
  rpe?: number; // Rate of Perceived Effort (1-10)
  exercises?: Exercise[]; // Full exercise details for history detail view
}

export interface WorkoutHistory {
  entries: WorkoutHistoryEntry[];
}

export interface WorkoutStatsSummary {
  totalWorkouts: number;
  totalMinutesPlanned: number;
  totalEstimatedCalories: number;
  lastWorkoutDate?: string;
  thisWeekWorkouts: number;
  currentStreak: number;
}

export interface WeeklyGoals {
  targetWorkoutsPerWeek: number;    // e.g. 3
  targetMinutesPerWeek: number;     // e.g. 90
  primaryGoal: TrainingGoal;        // e.g. 'get_toned'
  lastUpdated?: string;             // ISO date string
}
