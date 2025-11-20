import { WorkoutPlan } from '@/types/workout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Flame, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutCardProps {
  workout: WorkoutPlan;
  onClick?: () => void;
  recommendation?: "push" | "maintain" | "recovery" | "catch_up" | null;
  showRecommendation?: boolean;
}

export function WorkoutCard({ workout, onClick, recommendation, showRecommendation }: WorkoutCardProps) {
  const totalCalories = workout.exercises.reduce((sum, ex) => sum + (ex.caloriesEstimate || 0), 0);

  const intensityColors = {
    low: 'bg-accent-light text-accent border-accent/20',
    medium: 'bg-primary-light text-primary border-primary/20',
    high: 'bg-secondary-light text-secondary border-secondary/20',
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all",
        workout.completed && 'opacity-75',
        showRecommendation && recommendation === "push" && 
          "ring-2 ring-orange-500/30 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/20",
        showRecommendation && recommendation === "recovery" && 
          "ring-2 ring-blue-500/30 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20",
        showRecommendation && recommendation === "catch_up" && 
          "ring-2 ring-yellow-500/30 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20",
      )}
      onClick={onClick}
    >
      <CardHeader>
        {showRecommendation && recommendation && (
          <div className="mb-4">
            <Badge
              variant={recommendation === "push" ? "default" : recommendation === "recovery" ? "secondary" : "outline"}
              className={cn(
                recommendation === "push" && "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
                recommendation === "catch_up" && "bg-yellow-500 hover:bg-yellow-600 text-foreground border-transparent",
              )}
            >
              {recommendation === "push" && "🔥 Push Day"}
              {recommendation === "maintain" && "⚡ Maintain Day"}
              {recommendation === "recovery" && "🧘 Recovery Day"}
              {recommendation === "catch_up" && "🎯 Catch-Up Day"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Smart recommendation based on your recent activity and goals
            </p>
          </div>
        )}
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
