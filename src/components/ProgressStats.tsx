import { UserProfile } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface ProgressStatsProps {
  profile: UserProfile;
  workoutsThisWeek: number;
}

export function ProgressStats({ profile, workoutsThisWeek }: ProgressStatsProps) {
  
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="p-4 bg-primary border-primary shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
        <div className="flex flex-col items-center text-center gap-1">
          <Flame className="h-5 w-5 text-primary-foreground" />
          <div className="text-2xl font-bold text-primary-foreground">{profile.currentStreak}</div>
          <div className="text-xs text-primary-foreground/90">Day Streak</div>
        </div>
      </Card>
      
      <Card className="p-4 hover:scale-[1.02] transition-all">
        <div className="flex flex-col items-center text-center gap-1">
          <Trophy className="h-5 w-5 text-secondary" />
          <div className="text-2xl font-bold text-foreground">{profile.totalWorkouts}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </Card>
      
      <Card className="p-4 hover:scale-[1.02] transition-all">
        <div className="flex flex-col items-center text-center gap-1">
          <Calendar className="h-5 w-5 text-accent" />
          <div className="text-2xl font-bold text-foreground">{workoutsThisWeek}</div>
          <div className="text-xs text-muted-foreground">This Week</div>
        </div>
      </Card>
    </div>
  );
}
