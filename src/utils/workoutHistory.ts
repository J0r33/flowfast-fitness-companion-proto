import { WorkoutHistory, WorkoutHistoryEntry, WorkoutPlan, DifficultyFeedback } from '@/types/workout';

const STORAGE_KEY = 'flowfast_workout_history';

// Default empty history
const DEFAULT_HISTORY: WorkoutHistory = {
  entries: [],
};

// Read from localStorage
export function loadWorkoutHistory(): WorkoutHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HISTORY;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load workout history:', error);
    return DEFAULT_HISTORY;
  }
}

// Write to localStorage
export function saveWorkoutHistory(history: WorkoutHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save workout history:', error);
  }
}

// Add a new history entry
export function addWorkoutHistoryEntry(
  workoutPlan: WorkoutPlan,
  feedbackDifficulty?: DifficultyFeedback
): void {
  const history = loadWorkoutHistory();
  
  // Calculate total sets
  const totalSets = workoutPlan.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
  
  // Calculate total calories
  const totalEstimatedCalories = workoutPlan.exercises.reduce(
    (sum, ex) => sum + (ex.caloriesEstimate || 0), 
    0
  );
  
  const entry: WorkoutHistoryEntry = {
    id: workoutPlan.id,
    date: new Date().toISOString(),
    energy: workoutPlan.context?.energy || 'medium',
    timeMinutesPlanned: workoutPlan.context?.timeMinutes || workoutPlan.totalTime,
    focusAreas: workoutPlan.context?.focusAreas || workoutPlan.focusAreas,
    equipment: workoutPlan.context?.equipment || [],
    exercisesCount: workoutPlan.exercises.length,
    totalSets,
    totalEstimatedCalories: totalEstimatedCalories > 0 ? totalEstimatedCalories : undefined,
    feedbackDifficulty,
  };
  
  history.entries.push(entry);
  saveWorkoutHistory(history);
}

// Get total workouts completed
export function getTotalWorkouts(): number {
  const history = loadWorkoutHistory();
  return history.entries.length;
}

// Get current streak (consecutive days with workouts)
export function getCurrentStreak(): number {
  const history = loadWorkoutHistory();
  if (history.entries.length === 0) return 0;
  
  // Sort entries by date descending
  const sorted = [...history.entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
}

// Get workouts completed this week
export function getWorkoutsThisWeek(): number {
  const history = loadWorkoutHistory();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return history.entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= weekAgo;
  }).length;
}

// Get total calories burned (all time)
export function getTotalCalories(): number {
  const history = loadWorkoutHistory();
  return history.entries.reduce(
    (sum, entry) => sum + (entry.totalEstimatedCalories || 0),
    0
  );
}

// Get total minutes worked out (all time)
export function getTotalMinutes(): number {
  const history = loadWorkoutHistory();
  return history.entries.reduce(
    (sum, entry) => sum + entry.timeMinutesPlanned,
    0
  );
}
