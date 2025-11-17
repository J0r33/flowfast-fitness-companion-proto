import { WorkoutHistory, WorkoutHistoryEntry, WorkoutPlan, DifficultyFeedback, WorkoutStatsSummary } from '@/types/workout';

const STORAGE_KEY = 'flowfast_workout_history';

// Default empty history
const DEFAULT_HISTORY: WorkoutHistory = {
  entries: [],
};

// Read from localStorage
export function loadWorkoutHistory(): WorkoutHistory {
  if (typeof window === 'undefined') return DEFAULT_HISTORY;
  
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
  if (typeof window === 'undefined') return;
  
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
  
  history.entries.unshift(entry); // Newest first
  saveWorkoutHistory(history);
}

// Alternative append helper (matches original spec)
export function appendWorkoutHistoryEntry(entry: WorkoutHistoryEntry): void {
  const history = loadWorkoutHistory();
  history.entries.unshift(entry); // Newest first
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

// Unified stats computation (matches original spec)
export function computeWorkoutStats(
  history?: WorkoutHistory,
  today: Date = new Date()
): WorkoutStatsSummary {
  const hist = history || loadWorkoutHistory();
  
  const totalWorkouts = hist.entries.length;
  let totalMinutesPlanned = 0;
  let totalEstimatedCalories = 0;
  let thisWeekWorkouts = 0;

  // Calculate start of week (Monday)
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diffToMonday = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const todayCopy = new Date(today);
  todayCopy.setHours(23, 59, 59, 999);

  for (const entry of hist.entries) {
    totalMinutesPlanned += entry.timeMinutesPlanned ?? 0;
    totalEstimatedCalories += entry.totalEstimatedCalories ?? 0;

    const d = new Date(entry.date);
    if (d >= startOfWeek && d <= todayCopy) {
      thisWeekWorkouts += 1;
    }
  }

  return {
    totalWorkouts,
    totalMinutesPlanned,
    totalEstimatedCalories,
    lastWorkoutDate: hist.entries[0]?.date,
    thisWeekWorkouts,
    currentStreak: getCurrentStreak(),
  };
}
