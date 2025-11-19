import { loadAdaptationStateUnified, generatePlannerHistorySnapshotUnified } from "@/utils/adaptationState";
import { loadWorkoutHistoryUnified } from "@/utils/workoutHistory";
import { getTodayRecommendation } from "@/utils/todayRecommendation";
import { loadGoals } from "@/utils/profileSync";
import { TodayRecommendation, FocusArea, PlannerHistorySnapshot } from "@/types/workout";

interface RecentFocusSummary {
  last_sessions: {
    date: string;
    focusAreas: string[];
  }[];
  focus_counts: Record<string, number>;
}

export interface AutoTodayPlanInput {
  energy: "low" | "medium" | "high";
  time_minutes: number;
  focus_areas: string[];
  goal_text: string;
  primary_goal: string;
  history: PlannerHistorySnapshot;
  today_recommendation: TodayRecommendation;
  recent_focus_summary: RecentFocusSummary;
}

// All possible focus areas to ensure balanced training
const ALL_FOCUS_AREAS: FocusArea[] = [
  "upper-body",
  "lower-body",
  "core",
  "cardio",
  "full-body",
  "strength",
  "flexibility",
  "recovery"
];

/**
 * Build input for Auto Today mode - automatically derives workout parameters
 * from user history, goals, and current state.
 */
export async function buildAutoTodayPlanInput(userId?: string): Promise<AutoTodayPlanInput> {
  const weeklyGoals = await loadGoals();
  const adaptation = await loadAdaptationStateUnified(userId);
  const history = await loadWorkoutHistoryUnified(userId);
  const todayRec = await getTodayRecommendation(userId);

  // Check if this is the user's first workout
  const isFirstWorkout = history.entries.length === 0;

  // --- Derive energy level ---
  const lastRPE = adaptation.lastRpe ?? null;
  let energy: "low" | "medium" | "high" = "medium";

  if (todayRec === "recovery") {
    energy = "low";
  } else if (todayRec === "push" && (lastRPE === null || lastRPE <= 6)) {
    energy = "high";
  } else {
    energy = "medium";
  }

  // --- Derive time_minutes from weekly goals ---
  const targetWorkouts = weeklyGoals.targetWorkoutsPerWeek || 3;
  const targetMinutes = weeklyGoals.targetMinutesPerWeek || 90;
  let approx = Math.round(targetMinutes / targetWorkouts);
  if (approx < 15) approx = 15;
  if (approx > 60) approx = 60;
  const time_minutes = approx;

  // --- Build recent focus summary from last 3 entries ---
  const lastSessions = history.entries.slice(0, 3); // newest first

  // Initialize all focus areas to 0 for proper balancing
  const focus_counts: Record<string, number> = {};
  ALL_FOCUS_AREAS.forEach(area => {
    focus_counts[area] = 0;
  });

  // Count occurrences from recent sessions
  lastSessions.forEach((entry) => {
    entry.focusAreas.forEach((fa) => {
      if (focus_counts[fa] !== undefined) {
        focus_counts[fa]++;
      }
    });
  });

  const recent_focus_summary: RecentFocusSummary = {
    last_sessions: lastSessions.map((entry) => ({
      date: entry.date,
      focusAreas: entry.focusAreas,
    })),
    focus_counts,
  };

  // --- Choose focus_areas for today (1-2 under-trained areas) ---
  let focus_areas: string[];

  if (isFirstWorkout) {
    // First workout: safe, balanced full-body approach
    focus_areas = ["full-body"];
  } else {
    // Find areas with minimum count (most under-trained)
    const minCount = Math.min(...Object.values(focus_counts));
    const underTrained = Object.keys(focus_counts).filter(
      (area) => focus_counts[area] === minCount
    );

    if (underTrained.length === 0) {
      focus_areas = ["full-body"];
    } else {
      // Pick 1-2 under-trained areas for variety without overload
      focus_areas = underTrained.slice(0, 2);
    }
  }

  const primary_goal = weeklyGoals.primaryGoal;
  const historySnapshot = await generatePlannerHistorySnapshotUnified(userId);

  // --- Build goal_text ---
  let goal_text: string;
  if (isFirstWorkout) {
    goal_text = "Let's start with a balanced session to introduce you to your fitness journey!";
  } else {
    const focusText = focus_areas.join(", ");
    const goalName = primary_goal.replace("_", " ");
    goal_text = `Auto-balanced session to support ${goalName} with focus on ${focusText}.`;
  }

  return {
    energy,
    time_minutes,
    focus_areas,
    goal_text,
    primary_goal,
    history: historySnapshot,
    today_recommendation: todayRec,
    recent_focus_summary,
  };
}
