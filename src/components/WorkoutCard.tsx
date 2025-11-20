import { WorkoutPlan } from '@/types/workout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, CheckCircle2 } from 'lucide-react';

interface WorkoutCardProps {
  workout: WorkoutPlan;
  onClick?: () => void;
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const totalCalories = workout.exercises.reduce((sum, ex) => sum + (ex.caloriesEstimate || 0), 0);

  const intensityColors = {
    low: 'bg-accent-light text-accent border-accent/20',
    medium: 'bg-primary-light text-primary border-primary/20',
    high: 'bg-secondary-light text-secondary border-secondary/20',
  };

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all ${workout.completed ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {workout.completed ? 'Completed Workout' : "Today's Workout"}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {workout.focusAreas.join(' + ').replace(/^\w/, c => c.toUpperCase())}
            </CardDescription>
          </div>
          {workout.completed && (
            <CheckCircle2 className="h-6 w-6 text-success" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <Badge variant="outline" className={intensityColors[workout.intensity]}>
            {workout.intensity.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {workout.totalTime} min
          </Badge>
          {totalCalories > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-3 w-3" />
              ~{totalCalories} cal
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {workout.exercises.length} exercises
        </div>
      </CardContent>
    </Card>
  );
}
