import { UserProfile } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { getWorkoutsThisWeek } from '@/utils/workoutHistory';

interface ProgressStatsProps {
  profile: UserProfile;
}

export function ProgressStats({ profile }: ProgressStatsProps) {
  const workoutsThisWeek = getWorkoutsThisWeek();
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 bg-gradient-primary border-0">
        <div className="flex flex-col items-center text-center gap-1">
          <Flame className="h-5 w-5 text-primary-foreground" />
          <div className="text-2xl font-bold text-primary-foreground">{profile.currentStreak}</div>
          <div className="text-xs text-primary-foreground/90">Day Streak</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col items-center text-center gap-1">
          <Trophy className="h-5 w-5 text-secondary" />
          <div className="text-2xl font-bold text-foreground">{profile.totalWorkouts}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col items-center text-center gap-1">
          <Calendar className="h-5 w-5 text-accent" />
          <div className="text-2xl font-bold text-foreground">{workoutsThisWeek}</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </div>
      </Card>
    </div>
  );
}
