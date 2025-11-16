import { WorkoutPlan, WorkoutSession, WorkoutStep } from '@/types/workout';

/**
 * Converts a WorkoutPlan into a WorkoutSession with a flat array of steps.
 * Each step represents one screen in the exercise player.
 */
export function buildWorkoutSession(workoutPlan: WorkoutPlan): WorkoutSession {
  const steps: WorkoutStep[] = [];
  let stepCounter = 0;

  workoutPlan.exercises.forEach((exercise) => {
    const totalSets = exercise.sets || 1;
    
    for (let setIndex = 1; setIndex <= totalSets; setIndex++) {
      steps.push({
        id: `step-${stepCounter++}`,
        exerciseName: exercise.name,
        type: exercise.duration ? 'time' : 'reps',
        durationSeconds: exercise.duration,
        reps: exercise.reps,
        setIndex,
        totalSets,
        groupType: null,
        groupLabel: undefined,
        animationAssetId: `anim-${exercise.type}`,
        tooltipInstructions: exercise.notes || `Perform ${exercise.name} with proper form. Focus on controlled movements.`,
      });
    }
  });

  return {
    id: workoutPlan.id,
    title: `${workoutPlan.intensity.charAt(0).toUpperCase() + workoutPlan.intensity.slice(1)} Intensity Workout`,
    steps,
    workoutPlan,
  };
}

/**
 * Saves a workout session to localStorage
 */
export function saveWorkoutSession(session: WorkoutSession): void {
  localStorage.setItem('currentWorkoutSession', JSON.stringify(session));
}

/**
 * Loads a workout session from localStorage
 */
export function loadWorkoutSession(): WorkoutSession | null {
  const saved = localStorage.getItem('currentWorkoutSession');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
}

/**
 * Clears the current workout session from localStorage
 */
export function clearWorkoutSession(): void {
  localStorage.removeItem('currentWorkoutSession');
}
