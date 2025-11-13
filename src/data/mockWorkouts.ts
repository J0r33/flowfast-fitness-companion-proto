import { WorkoutPlan, Exercise, UserProfile } from '@/types/workout';

export const mockExercises: Record<string, Exercise[]> = {
  lowEnergyCardio: [
    { id: '1', name: 'Easy Walk', type: 'cardio', duration: 600, caloriesEstimate: 80 },
    { id: '2', name: 'Light Cycling', type: 'cardio', duration: 300, caloriesEstimate: 60 },
    { id: '3', name: 'Gentle Stretching', type: 'stretch', duration: 300, notes: 'Focus on breathing' },
  ],
  mediumEnergyStrength: [
    { id: '4', name: 'Push-ups', type: 'strength', sets: 3, reps: 12, caloriesEstimate: 30 },
    { id: '5', name: 'Bodyweight Squats', type: 'strength', sets: 3, reps: 15, caloriesEstimate: 35 },
    { id: '6', name: 'Plank Hold', type: 'strength', duration: 180, caloriesEstimate: 25 },
    { id: '7', name: 'Lunges', type: 'strength', sets: 3, reps: 10, caloriesEstimate: 30 },
  ],
  highEnergyFullBody: [
    { id: '8', name: 'Burpees', type: 'cardio', sets: 4, reps: 10, caloriesEstimate: 50 },
    { id: '9', name: 'Jump Squats', type: 'strength', sets: 4, reps: 12, caloriesEstimate: 45 },
    { id: '10', name: 'Mountain Climbers', type: 'cardio', duration: 240, caloriesEstimate: 60 },
    { id: '11', name: 'Pull-ups', type: 'strength', sets: 3, reps: 8, caloriesEstimate: 40 },
    { id: '12', name: 'Cool Down Stretch', type: 'stretch', duration: 300, notes: 'Deep breathing' },
  ],
  flexibilityFocus: [
    { id: '13', name: 'Dynamic Warm-up', type: 'stretch', duration: 300 },
    { id: '14', name: 'Hip Openers', type: 'stretch', duration: 420 },
    { id: '15', name: 'Shoulder Mobility', type: 'stretch', duration: 360 },
    { id: '16', name: 'Hamstring Stretches', type: 'stretch', duration: 360 },
    { id: '17', name: 'Breathing Exercise', type: 'breathing', duration: 240 },
  ],
  recoveryLight: [
    { id: '18', name: 'Gentle Yoga Flow', type: 'stretch', duration: 900, notes: 'Focus on relaxation' },
    { id: '19', name: 'Breathing Practice', type: 'breathing', duration: 300 },
    { id: '20', name: 'Light Walking', type: 'cardio', duration: 600 },
  ],
};

export const generateMockWorkout = (
  energy: 'low' | 'medium' | 'high',
  time: number,
  focus: string[]
): WorkoutPlan => {
  let exercises: Exercise[] = [];
  
  // Simple logic to pick exercises based on inputs
  if (energy === 'low' || focus.includes('recovery')) {
    exercises = [...mockExercises.recoveryLight];
  } else if (focus.includes('flexibility')) {
    exercises = [...mockExercises.flexibilityFocus];
  } else if (energy === 'high') {
    exercises = [...mockExercises.highEnergyFullBody];
  } else {
    exercises = [...mockExercises.mediumEnergyStrength];
  }

  // Adjust exercises to fit time constraint (simplified)
  const totalExerciseTime = exercises.reduce((sum, ex) => {
    if (ex.duration) return sum + ex.duration / 60;
    if (ex.sets && ex.reps) return sum + (ex.sets * 1.5);
    return sum + 2;
  }, 0);

  const timeRatio = time / totalExerciseTime;
  if (timeRatio < 0.8) {
    exercises = exercises.slice(0, Math.ceil(exercises.length * timeRatio));
  }

  return {
    id: `workout-${Date.now()}`,
    date: new Date().toISOString(),
    exercises,
    totalTime: time,
    intensity: energy,
    focusAreas: focus as any[],
    adaptedFor: {
      energy,
      availableTime: time,
    },
  };
};

export const mockUserProfile: UserProfile = {
  name: 'Alex',
  currentStreak: 5,
  totalWorkouts: 47,
  preferredFocusAreas: ['strength', 'cardio'],
  defaultTime: 30,
};

export const mockTodayWorkout: WorkoutPlan = {
  id: 'today-1',
  date: new Date().toISOString(),
  exercises: [...mockExercises.mediumEnergyStrength],
  totalTime: 30,
  intensity: 'medium',
  focusAreas: ['strength', 'full-body'],
  adaptedFor: {
    energy: 'medium',
    availableTime: 30,
  },
};
