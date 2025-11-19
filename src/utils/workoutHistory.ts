import { WorkoutHistory, WorkoutHistoryEntry, WorkoutStatsSummary } from '@/types/workout';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// SUPABASE DATABASE FUNCTIONS
// ============================================================

// Load workout history from database for a specific user
export async function loadWorkoutHistory(userId: string): Promise<WorkoutHistory> {
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
export async function saveWorkoutHistoryEntry(
  userId: string,
  entry: WorkoutHistoryEntry
): Promise<void> {
  try {
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
// STATISTICS COMPUTATION (Pure Functions)
// ============================================================

/**
 * Compute all statistics from workout history.
 * Pure function - requires history to be passed in.
 */
export function computeWorkoutStats(
  history: WorkoutHistory,
  today: Date = new Date()
): WorkoutStatsSummary {
  const entries = history.entries || [];

  if (entries.length === 0) {
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      thisWeekWorkouts: 0,
      totalMinutesPlanned: 0,
      totalEstimatedCalories: 0,
      lastWorkoutDate: undefined,
    };
  }

  const totalWorkouts = entries.length;

  // Total minutes (planned)
  const totalMinutesPlanned = entries.reduce(
    (sum, e) => sum + (e.timeMinutesPlanned ?? 0),
    0
  );

  // Total calories
  const totalEstimatedCalories = entries.reduce(
    (sum, e) => sum + (e.totalEstimatedCalories ?? 0),
    0
  );

  // Last workout date
  const lastWorkoutDate = entries.length > 0 ? entries[0].date : null;

  // Current streak (consecutive workout days until a gap)
  let currentStreak = 0;
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const seenDates = new Set<string>();
  let checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 30; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const hasWorkout = sortedEntries.some((e) => {
      const ed = new Date(e.date);
      ed.setHours(0, 0, 0, 0);
      return ed.toISOString().split('T')[0] === dateStr;
    });

    if (hasWorkout && !seenDates.has(dateStr)) {
      seenDates.add(dateStr);
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // If no workout today, check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (prevDate.getTime() - entryDate.getTime()) / 86400000
      );
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    prevDate = entryDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // This week workouts
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diffToMonday = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= startOfWeek;
  }).length;

  return {
    totalWorkouts,
    currentStreak,
    thisWeekWorkouts,
    totalMinutesPlanned,
    totalEstimatedCalories,
    lastWorkoutDate,
  };
}
