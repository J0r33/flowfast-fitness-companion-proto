import { WorkoutHistory, WorkoutHistoryEntry, WorkoutPlan, DifficultyFeedback, WorkoutStatsSummary } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'flowfast_workout_history';

// Default empty history
const DEFAULT_HISTORY: WorkoutHistory = {
  entries: [],
};

// Load from database (authenticated users)
export async function loadWorkoutHistoryFromDB(userId: string): Promise<WorkoutHistory> {
  try {
    const { data, error } = await supabase
      .from('workout_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    const entries: WorkoutHistoryEntry[] = (data || []).map((row) => ({
      id: row.id,
      date: row.date,
      energy: row.energy as 'low' | 'medium' | 'high',
      timeMinutesPlanned: row.time_minutes_planned,
      timeMinutesActual: row.time_minutes_actual ?? undefined,
      focusAreas: row.focus_areas || [],
      equipment: row.equipment || [],
      exercisesCount: row.exercises_count,
      totalSets: row.total_sets,
      totalEstimatedCalories: row.total_estimated_calories ?? undefined,
      feedbackDifficulty: row.feedback_difficulty as DifficultyFeedback | undefined,
      rpe: row.rpe ?? undefined,
    }));

    return { entries };
  } catch (error) {
    console.error('Failed to load workout history from DB:', error);
    return DEFAULT_HISTORY;
  }
}

// Save to database (authenticated users)
export async function saveWorkoutHistoryToDB(userId: string, entry: WorkoutHistoryEntry): Promise<void> {
  try {
    const { error } = await supabase
      .from('workout_history')
      .insert({
        user_id: userId,
        date: entry.date,
        energy: entry.energy,
        time_minutes_planned: entry.timeMinutesPlanned,
        time_minutes_actual: entry.timeMinutesActual ?? null,
        focus_areas: entry.focusAreas,
        equipment: entry.equipment,
        exercises_count: entry.exercisesCount,
        total_sets: entry.totalSets,
        total_estimated_calories: entry.totalEstimatedCalories ?? null,
        feedback_difficulty: entry.feedbackDifficulty ?? null,
        rpe: entry.rpe ?? null,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save workout history to DB:', error);
    throw error;
  }
}

// Read from localStorage (fallback for anonymous users)
export function loadWorkoutHistoryFromLocalStorage(): WorkoutHistory {
  if (typeof window === 'undefined') return DEFAULT_HISTORY;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HISTORY;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load workout history from localStorage:', error);
    return DEFAULT_HISTORY;
  }
}

// Write to localStorage (fallback for anonymous users)
export function saveWorkoutHistoryToLocalStorage(history: WorkoutHistory): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save workout history to localStorage:', error);
  }
}

// Hybrid load function (uses DB if user provided, otherwise localStorage)
export async function loadWorkoutHistory(userId?: string): Promise<WorkoutHistory> {
  if (userId) {
    return await loadWorkoutHistoryFromDB(userId);
  }
  return loadWorkoutHistoryFromLocalStorage();
}

// Hybrid save function (uses DB if user provided, otherwise localStorage)
export async function saveWorkoutHistory(entry: WorkoutHistoryEntry, userId?: string): Promise<void> {
  if (userId) {
    await saveWorkoutHistoryToDB(userId, entry);
  } else {
    const history = loadWorkoutHistoryFromLocalStorage();
    history.entries.unshift(entry);
    saveWorkoutHistoryToLocalStorage(history);
  }
}

// Add a new history entry
export async function addWorkoutHistoryEntry(
  workoutPlan: WorkoutPlan,
  userId?: string,
  feedbackDifficulty?: DifficultyFeedback,
  rpe?: number
): Promise<void> {
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
    rpe: rpe ?? undefined,
  };
  
  await saveWorkoutHistory(entry, userId);
}

// Alternative append helper (matches original spec)
export async function appendWorkoutHistoryEntry(entry: WorkoutHistoryEntry, userId?: string): Promise<void> {
  await saveWorkoutHistory(entry, userId);
}

// Get total workouts completed
export async function getTotalWorkouts(userId?: string): Promise<number> {
  const history = await loadWorkoutHistory(userId);
  return history.entries.length;
}

// Get current streak (consecutive days with workouts)
export async function getCurrentStreak(userId?: string): Promise<number> {
  const history = await loadWorkoutHistory(userId);
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
export async function getWorkoutsThisWeek(userId?: string): Promise<number> {
  const history = await loadWorkoutHistory(userId);
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
