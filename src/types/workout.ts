// Mock data types for FlowFast prototype
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusArea = 'cardio' | 'strength' | 'flexibility' | 'recovery' | 'full-body';
export type ExerciseType = 'cardio' | 'strength' | 'stretch' | 'breathing';

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
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
}

export interface AdjustmentPreferences {
  energy: EnergyLevel;
  availableTime: number;
  focusAreas: FocusArea[];
}
