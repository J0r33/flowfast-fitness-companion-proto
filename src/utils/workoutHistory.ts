import { WorkoutHistory, WorkoutHistoryEntry, WorkoutPlan, DifficultyFeedback, WorkoutStatsSummary } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'flowfast_workout_history';

// Default empty history
const DEFAULT_HISTORY: WorkoutHistory = {
  entries: [],
};

// ============================================================
// LOCAL STORAGE FUNCTIONS (for backward compatibility & fallback)
// ============================================================

// Read from localStorage
export function loadWorkoutHistoryLocal(): WorkoutHistory {
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
export function saveWorkoutHistoryLocal(history: WorkoutHistory): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save workout history:', error);
  }
}

// Add a new history entry to localStorage
export function addWorkoutHistoryEntryLocal(entry: WorkoutHistoryEntry): void {
  const history = loadWorkoutHistoryLocal();
  history.entries.unshift(entry); // Newest first
  saveWorkoutHistoryLocal(history);
}

// ============================================================
// SUPABASE DATABASE FUNCTIONS
// ============================================================

// Load workout history from database for a specific user
export async function loadWorkoutHistoryFromDb(userId: string): Promise<WorkoutHistory> {
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
      energy: (row.energy || 'medium') as any,
      timeMinutesPlanned: row.time_minutes_planned || 0,
      timeMinutesActual: row.time_minutes_actual,
      focusAreas: (row.focus_areas || []) as any[],
      equipment: row.equipment || [],
      exercisesCount: row.exercises_count || 0,
      totalSets: row.total_sets || 0,
      totalEstimatedCalories: row.total_estimated_calories,
      feedbackDifficulty: row.feedback_difficulty as any,
      rpe: row.rpe,
      exercises: (row.exercises || []) as any[],
    }));

    return { entries };
  } catch (error) {
    console.error('Failed to load workout history from DB:', error);
    throw error;
  }
}

// Save a single workout history entry to database
export async function saveWorkoutHistoryEntryToDb(
  userId: string,
  entry: WorkoutHistoryEntry
): Promise<void> {
  try {
    // Build insert data - only include id if it exists
    const insertData: any = {
      user_id: userId,
      date: entry.date,
      energy: entry.energy,
      time_minutes_planned: entry.timeMinutesPlanned,
      time_minutes_actual: entry.timeMinutesActual,
      focus_areas: entry.focusAreas,
      equipment: entry.equipment,
      exercises_count: entry.exercisesCount,
      total_sets: entry.totalSets,
      total_estimated_calories: entry.totalEstimatedCalories,
      feedback_difficulty: entry.feedbackDifficulty,
      rpe: entry.rpe,
      exercises: entry.exercises ?? [],
    };

    // Only include id if it exists (for backward compatibility)
    if (entry.id) {
      insertData.id = entry.id;
    }

    const { error } = await supabase
      .from('workout_history')
      .insert(insertData);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to save workout history to DB:', error);
    throw error;
  }
}

// ============================================================
// UNIFIED FUNCTIONS (DB with localStorage fallback)
// ============================================================

// Load workout history: from DB if user is authenticated, otherwise from localStorage
export async function loadWorkoutHistoryUnified(userId?: string): Promise<WorkoutHistory> {
  if (!userId) {
    return loadWorkoutHistoryLocal();
  }

  try {
    return await loadWorkoutHistoryFromDb(userId);
  } catch (error) {
    console.error('DB load failed, falling back to localStorage:', error);
    return loadWorkoutHistoryLocal();
  }
}

// Save workout history entry: always mirror to localStorage, and save to DB if user is authenticated
export async function saveWorkoutHistoryEntryUnified(
  entry: WorkoutHistoryEntry,
  userId?: string
): Promise<void> {
  // Always mirror to localStorage for backward compatibility
  addWorkoutHistoryEntryLocal(entry);

  if (!userId) return;

  try {
    await saveWorkoutHistoryEntryToDb(userId, entry);
  } catch (error) {
    console.error('Failed to save workout history to DB, localStorage already updated:', error);
  }
}

// ============================================================
// LEGACY WRAPPER FUNCTIONS (for backward compatibility)
// ============================================================

// Synchronous load for legacy code (adaptation state, etc.)
export function loadWorkoutHistory(): WorkoutHistory {
  return loadWorkoutHistoryLocal();
}

// Legacy add entry function (converts WorkoutPlan to entry and saves to localStorage only)
export function addWorkoutHistoryEntry(
  workoutPlan: WorkoutPlan,
  feedbackDifficulty?: DifficultyFeedback,
  rpe?: number
): void {
  const history = loadWorkoutHistoryLocal();
  
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
  
  history.entries.unshift(entry); // Newest first
  saveWorkoutHistoryLocal(history);
}

// Alternative append helper (matches original spec)
export function appendWorkoutHistoryEntry(entry: WorkoutHistoryEntry): void {
  const history = loadWorkoutHistoryLocal();
  history.entries.unshift(entry); // Newest first
  saveWorkoutHistoryLocal(history);
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
