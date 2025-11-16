import { WorkoutPlan, WorkoutSession, WorkoutStep } from '@/types/workout';

/**
 * Converts a WorkoutPlan into a WorkoutSession with a flat array of steps.
 * Each step represents one screen in the exercise player.
 * Includes rest periods between exercises and sets.
 */
export function buildWorkoutSession(workoutPlan: WorkoutPlan): WorkoutSession {
  const steps: WorkoutStep[] = [];
  let stepCounter = 0;

  // Default rest durations (will be replaced by LLM later)
  const DEFAULT_REST_BETWEEN_SETS = 30; // seconds
  const DEFAULT_REST_BETWEEN_EXERCISES = 60; // seconds

  workoutPlan.exercises.forEach((exercise, exerciseIndex) => {
    const totalSets = exercise.sets || 1;
    const isLastExercise = exerciseIndex === workoutPlan.exercises.length - 1;
    
    for (let setIndex = 1; setIndex <= totalSets; setIndex++) {
      // Add exercise step
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
        isRest: false,
      });

      // Add rest period after each set (except the last set of the last exercise)
      const isLastSet = setIndex === totalSets;
      if (!isLastSet || !isLastExercise) {
        const restDuration = isLastSet ? DEFAULT_REST_BETWEEN_EXERCISES : DEFAULT_REST_BETWEEN_SETS;
        const restLabel = isLastSet ? 'Rest - Next Exercise' : `Rest - Set ${setIndex + 1}`;
        
        steps.push({
          id: `step-${stepCounter++}`,
          exerciseName: restLabel,
          type: 'rest',
          durationSeconds: restDuration,
          setIndex: 1,
          totalSets: 1,
          groupType: null,
          groupLabel: undefined,
          animationAssetId: 'anim-rest',
          tooltipInstructions: 'Take a breather and prepare for the next set.',
          isRest: true,
        });
      }
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
