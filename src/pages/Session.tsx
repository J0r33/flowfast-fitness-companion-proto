import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { WorkoutPlan } from '@/types/workout';
import { generateMockWorkout } from '@/data/mockWorkouts';
import { buildWorkoutSession, saveWorkoutSession } from '@/utils/workoutSession';
import { 
  computeAdaptationMetricsFromHistory,
  generatePlannerHistorySnapshotFromMetrics 
} from '@/utils/adaptationState';
import { loadWorkoutHistory } from '@/utils/workoutHistory';
import { getTodayRecommendation } from '@/utils/todayRecommendation';
import { buildAutoTodayPlanInput } from '@/utils/autoTodayPlan';
import { loadEquipment, loadGoals } from '@/utils/profileSync';
import { ExerciseListItem } from '@/components/ExerciseListItem';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/MobileNav';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Edit, Clock, Flame, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const { toast } = useToast();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadWorkout() {
      if (state?.mode === "today_auto") {
        // Auto Today mode - derive all inputs automatically
        setIsGenerating(true);
        try {
          if (!user?.id) {
            throw new Error('User not authenticated');
          }
          
          const userEquipment = await loadEquipment();
          const autoInput = await buildAutoTodayPlanInput(user.id);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-workout-plan`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                energy: autoInput.energy,
                time_minutes: autoInput.time_minutes,
                focus_areas: autoInput.focus_areas,
                goal_text: autoInput.goal_text,
                equipment: userEquipment,
                history: autoInput.history,
                primary_goal: autoInput.primary_goal,
                today_recommendation: autoInput.today_recommendation,
                recent_focus_summary: autoInput.recent_focus_summary,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || "Failed to generate workout");
          }

          console.log("LLM Context:", data.llm_context);

          const workoutWithContext = {
            ...data.workout,
            context: {
              energy: autoInput.energy,
              timeMinutes: autoInput.time_minutes,
              focusAreas: autoInput.focus_areas,
              equipment: userEquipment,
            },
          };

          setWorkout(workoutWithContext);
        } catch (error) {
          console.error("Failed to generate auto today workout:", error);

          toast({
            title: "Using Quick Workout",
            description: "We've created a quick workout for you based on your preferences.",
            variant: "default",
          });

          // Fallback to mock workout using auto-derived inputs
          if (user?.id) {
            const autoInput = await buildAutoTodayPlanInput(user.id);
            const fallbackWorkout = generateMockWorkout(
              autoInput.energy,
              autoInput.time_minutes,
              autoInput.focus_areas
            );
            setWorkout(fallbackWorkout);
          }
        } finally {
          setIsGenerating(false);
        }
      } else if (state?.isAdjusted) {
        // Generate workout via LLM
        setIsGenerating(true);
        const userEquipment = await loadEquipment();
        
        try {
          if (!user?.id) {
            throw new Error('User not authenticated');
          }
          
          // Build goal text from focus areas
          const goalText = `Focus on ${state.focusAreas.join(', ')} training`;
          
          // Load history and derive snapshot using pure functions
          const workoutHistory = await loadWorkoutHistory(user.id);
          const metrics = computeAdaptationMetricsFromHistory(workoutHistory);
          const historySnapshot = generatePlannerHistorySnapshotFromMetrics(metrics);
          
          // Load primary goal from weekly goals
          const weeklyGoals = await loadGoals();
          const primaryGoal = weeklyGoals.primaryGoal;

          // Load today's coaching recommendation
          const todayRec = await getTodayRecommendation(user.id);

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
                history: historySnapshot,
                primary_goal: primaryGoal,
                today_recommendation: todayRec,
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
