import { Exercise } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Repeat } from 'lucide-react';

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
}

export function ExerciseListItem({ exercise, index }: ExerciseListItemProps) {
  const typeColors = {
    cardio: 'bg-secondary/20 text-secondary border-secondary',
    strength: 'bg-primary/20 text-primary border-primary',
    stretch: 'bg-accent/20 text-accent border-accent',
    breathing: 'bg-success/20 text-success border-success',
  };

  return (
    <Card className="p-4 hover:shadow-soft transition-smooth">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-foreground">{exercise.name}</h4>
            <Badge variant="outline" className={`${typeColors[exercise.type]} text-xs`}>
              {exercise.type}
            </Badge>
          </div>
          
          <div className="flex gap-3 text-sm text-muted-foreground">
            {exercise.sets && exercise.reps && (
              <div className="flex items-center gap-1">
                <Repeat className="h-4 w-4" />
                <span>{exercise.sets} × {exercise.reps}</span>
              </div>
            )}
            {exercise.duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{Math.floor(exercise.duration / 60)} min</span>
              </div>
            )}
          </div>

          {exercise.notes && (
            <p className="text-xs text-muted-foreground mt-2 italic">{exercise.notes}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
