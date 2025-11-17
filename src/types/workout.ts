// Mock data types for FlowFast prototype
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusArea = 'cardio' | 'strength' | 'flexibility' | 'recovery' | 'full-body' | 'upper-body' | 'lower-body' | 'core';
export type ExerciseType = 'cardio' | 'strength' | 'stretch' | 'breathing';

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
