import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Flame, Dumbbell, Timer, Repeat, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutHistoryEntry, Exercise } from '@/types/workout';
import {
  formatDate,
  formatEnergy,
  formatMinutes,
  formatCalories,
  formatDifficultyFromRPE,
} from '@/utils/formatters';

export default function WorkoutDetail() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entry, setEntry] = useState<WorkoutHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkout() {
      if (!workoutId || !user?.id) return;

      try {
        const { data, error } = await supabase
          .from('workout_history')
          .select('*')
          .eq('id', workoutId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const workoutEntry: WorkoutHistoryEntry = {
            id: data.id,
            date: data.date,
            energy: data.energy as any,
            timeMinutesPlanned: data.time_minutes_planned || 0,
            timeMinutesActual: data.time_minutes_actual,
            focusAreas: (data.focus_areas || []) as any[],
            equipment: data.equipment || [],
            exercisesCount: data.exercises_count || 0,
            totalSets: data.total_sets || 0,
            totalEstimatedCalories: data.total_estimated_calories,
            feedbackDifficulty: data.feedback_difficulty as any,
            rpe: data.rpe,
            exercises: (data.exercises as unknown as Exercise[]) || [],
          };
          setEntry(workoutEntry);
        }
      } catch (error) {
        console.error('Failed to load workout:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkout();
  }, [workoutId, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/history')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Loading...</h1>
          </div>
        </header>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/history')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Workout Not Found</h1>
          </div>
        </header>
      </div>
    );
  }

  const energyInfo = formatEnergy(entry.energy);
  const difficultyInfo = formatDifficultyFromRPE(entry.rpe);

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'strength':
        return Dumbbell;
      case 'cardio':
        return Timer;
      case 'stretch':
        return Activity;
      default:
        return Activity;
    }
  };

  const getRpeColor = (rpe?: number) => {
    if (!rpe) return 'bg-muted';
    if (rpe <= 3) return 'bg-success';
    if (rpe <= 6) return 'bg-warning';
    if (rpe <= 8) return 'bg-orange-500';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-gradient-secondary text-secondary-foreground px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/history')}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{formatDate(entry.date)}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{energyInfo.emoji} {energyInfo.label} Energy</span>
              {difficultyInfo && (
                <Badge variant={difficultyInfo.variant} className="text-xs">
                  {difficultyInfo.emoji} {difficultyInfo.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workout Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-semibold">{formatMinutes(entry.timeMinutesPlanned)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Exercises</div>
                  <div className="font-semibold">{entry.exercisesCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Repeat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Sets</div>
                  <div className="font-semibold">{entry.totalSets}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Flame className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                  <div className="font-semibold">
                    {entry.totalEstimatedCalories ? formatCalories(entry.totalEstimatedCalories) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Areas */}
            {entry.focusAreas.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  {entry.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {entry.equipment.length > 0 && (
              <div className="mt-3">
                <div className="text-sm text-muted-foreground mb-2">Equipment</div>
                <div className="flex flex-wrap gap-2">
                  {entry.equipment.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RPE Section */}
        {entry.rpe && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate of Perceived Effort</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{entry.rpe}/10</span>
                  <Badge variant={difficultyInfo?.variant}>
                    {difficultyInfo?.label}
                  </Badge>
                </div>
                <Progress value={entry.rpe * 10} className={`h-3 ${getRpeColor(entry.rpe)}`} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Easy</span>
                  <span>Moderate</span>
                  <span>Maximum</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        {entry.exercises && entry.exercises.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exercises ({entry.exercises.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.exercises.map((exercise, index) => {
                  const ExerciseIcon = getExerciseIcon(exercise.type);
                  const isRepsMode = exercise.mode === 'reps' || (exercise.reps && !exercise.duration);

                  return (
                    <div
                      key={exercise.id || index}
                      className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 h-fit">
                        <ExerciseIcon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground mb-1">{exercise.name}</div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {isRepsMode ? (
                            <>
                              {exercise.sets && <span>{exercise.sets} sets</span>}
                              {exercise.reps && <span>× {exercise.reps} reps</span>}
                            </>
                          ) : (
                            <>
                              {exercise.sets && <span>{exercise.sets} sets</span>}
                              {exercise.duration && (
                                <span>× {Math.floor(exercise.duration / 60)}:{String(exercise.duration % 60).padStart(2, '0')}</span>
                              )}
                            </>
                          )}
                        </div>

                        {exercise.equipment && exercise.equipment.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {exercise.equipment.map((item) => (
                              <Badge key={item} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {exercise.caloriesEstimate && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            ~{exercise.caloriesEstimate} cal
                          </div>
                        )}

                        {exercise.notes && (
                          <div className="text-xs text-muted-foreground mt-2 italic">
                            {exercise.notes}
                          </div>
                        )}
                      </div>

                      <Badge variant="secondary" className="h-fit">
                        {exercise.type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Detailed exercise data isn't available for this older workout.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
