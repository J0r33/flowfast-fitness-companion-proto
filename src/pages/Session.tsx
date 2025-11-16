import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WorkoutPlan } from '@/types/workout';
import { generateMockWorkout } from '@/data/mockWorkouts';
import { buildWorkoutSession, saveWorkoutSession } from '@/utils/workoutSession';
import { ExerciseListItem } from '@/components/ExerciseListItem';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/MobileNav';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Edit, Clock, Flame } from 'lucide-react';

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    if (state?.isAdjusted) {
      // Generate new workout based on adjustments
      const generated = generateMockWorkout(
        state.energy,
        state.time,
        state.focusAreas
      );
      setWorkout(generated);
    } else if (state?.workout) {
      // Use workout passed from Dashboard
      setWorkout(state.workout);
    } else {
      // No state provided, redirect to home
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  const handleStartWorkout = () => {
    if (!workout) return;
    
    // Build workout session and save to localStorage
    const session = buildWorkoutSession(workout);
    saveWorkoutSession(session);
    
    // Navigate to first step of workout player
    navigate(`/workout/${session.id}/0`);
  };

  const handleRefine = () => {
    navigate('/adjust');
  };

  if (!workout) return null;

  const totalCalories = workout.exercises.reduce((sum, ex) => sum + (ex.caloriesEstimate || 0), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/')}>
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Your Workout</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Workout Summary */}
        <section className="bg-gradient-primary text-primary-foreground p-6 rounded-2xl shadow-medium">
          <h2 className="text-2xl font-bold mb-4">Adapted Just for You</h2>
          <div className="flex gap-3 mb-3">
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-4 w-4" />
              {workout.totalTime} minutes
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-4 w-4" />
              ~{totalCalories} calories
            </Badge>
          </div>
          <p className="text-sm text-primary-foreground/90">
            Based on your {workout.adaptedFor?.energy} energy and {workout.adaptedFor?.availableTime} minute time frame
          </p>
        </section>

        {/* Exercise List */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Exercises ({workout.exercises.length})
          </h3>
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <ExerciseListItem key={exercise.id} exercise={exercise} index={index} />
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            variant="fitness"
            size="lg"
            className="w-full"
            onClick={handleStartWorkout}
          >
            <Play className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleRefine}
          >
            <Edit className="mr-2 h-5 w-5" />
            Refine Workout
          </Button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
