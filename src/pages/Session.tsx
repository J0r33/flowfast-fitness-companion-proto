import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WorkoutPlan } from '@/types/workout';
import { generateMockWorkout } from '@/data/mockWorkouts';
import { buildWorkoutSession, saveWorkoutSession } from '@/utils/workoutSession';
import { generatePlannerHistorySnapshot } from '@/utils/adaptationState';
import { ExerciseListItem } from '@/components/ExerciseListItem';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/MobileNav';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Edit, Clock, Flame, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const { toast } = useToast();

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadWorkout() {
      if (state?.isAdjusted) {
        // Generate workout via LLM
        setIsGenerating(true);
        
        // Load equipment from localStorage (outside try-catch so it's available in catch)
        const userEquipment = JSON.parse(localStorage.getItem('userEquipment') || '[]') as string[];
        
        try {
          // Build goal text from focus areas
          const goalText = `Focus on ${state.focusAreas.join(', ')} training`;
          
          // Generate history snapshot for adaptation
          const history = generatePlannerHistorySnapshot();

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-workout-plan`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                energy: state.energy,
                time_minutes: state.time,
                focus_areas: state.focusAreas,
                goal_text: goalText,
                equipment: userEquipment,
                history: history,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Failed to generate workout');
          }

          console.log('LLM Context:', data.llm_context); // Debug logging
          
          // Add context to workout plan
          const workoutWithContext = {
            ...data.workout,
            context: {
              energy: state.energy,
              timeMinutes: state.time,
              focusAreas: state.focusAreas,
              equipment: userEquipment,
            }
          };
          
          setWorkout(workoutWithContext);

        } catch (error) {
          console.error('Failed to generate workout with LLM:', error);
          
          toast({
            title: "Using Quick Workout",
            description: "We couldn't generate a custom workout right now, so we've created a quick one for you. You can try refining it again.",
            variant: "default",
          });

          // Fallback to mock workout
          const fallbackWorkout = generateMockWorkout(
            state.energy,
            state.time,
            state.focusAreas
          );
          
          // Add context to fallback workout
          const fallbackWithContext = {
            ...fallbackWorkout,
            context: {
              energy: state.energy,
              timeMinutes: state.time,
              focusAreas: state.focusAreas,
              equipment: userEquipment,
            }
          };
          
          setWorkout(fallbackWithContext);
        } finally {
          setIsGenerating(false);
        }
      } else if (state?.workout) {
        // Use today's workout from Dashboard
        setWorkout(state.workout);
      } else {
        // No workout provided, go back to home
        navigate('/', { replace: true });
      }
    }

    loadWorkout();
  }, [state, navigate, toast]);

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

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Creating Your Workout...</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Personalizing exercises based on your energy and goals
            </p>
          </div>
        </div>
      </div>
    );
  }

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
