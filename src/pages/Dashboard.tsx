import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUserProfile, mockTodayWorkout } from '@/data/mockWorkouts';
import { WorkoutCard } from '@/components/WorkoutCard';
import { ProgressStats } from '@/components/ProgressStats';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MobileNav } from '@/components/MobileNav';
import { Sparkles, Activity, Zap } from 'lucide-react';
import { computeWorkoutStats } from '@/utils/workoutHistory';
import { formatMinutes, formatCalories } from '@/utils/formatters';
import { UserProfile, WorkoutStatsSummary } from '@/types/workout';

export default function Dashboard() {
  const navigate = useNavigate();
  const [todayWorkout] = useState(mockTodayWorkout);
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [stats, setStats] = useState<WorkoutStatsSummary | null>(null);
  
  useEffect(() => {
    // Load unified stats
    const workoutStats = computeWorkoutStats();
    setStats(workoutStats);
    
    setProfile(prev => ({
      ...prev,
      totalWorkouts: workoutStats.totalWorkouts,
      currentStreak: workoutStats.currentStreak,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground px-6 pt-8 pb-6 rounded-b-3xl shadow-medium">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-1">Hi, {profile.name}! 👋</h1>
          <p className="text-primary-foreground/90">Ready to move today?</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <ProgressStats profile={profile} />

        {/* Weekly Highlights */}
        {stats && stats.totalWorkouts > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">This Week</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatMinutes(stats.totalMinutesPlanned)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Time</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCalories(stats.totalEstimatedCalories)}
                    </div>
                    <div className="text-xs text-muted-foreground">Burned</div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Today's Workout */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Today's Plan</h2>
          <WorkoutCard 
            workout={todayWorkout} 
            onClick={() => navigate('/session', { state: { workout: todayWorkout } })}
          />
        </section>

        {/* Adjust Button */}
        <Button
          variant="fitness"
          size="lg"
          className="w-full"
          onClick={() => navigate('/adjust')}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Adjust My Workout
        </Button>

        {/* Empty State for new users */}
        {stats && stats.totalWorkouts === 0 && (
          <Card className="p-6 text-center border-dashed">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-foreground mb-2">
              Start Your Journey
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your first workout to see your progress here!
            </p>
            <Button
              variant="fitness"
              onClick={() => navigate('/adjust')}
            >
              Get Started
            </Button>
          </Card>
        )}

        {/* Quick Tips */}
        {stats && stats.totalWorkouts > 0 && (
          <section className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-2">💡 Today's Tip</h3>
            <p className="text-sm text-muted-foreground">
              Consistency beats intensity! Even a 15-minute workout keeps your momentum going.
            </p>
          </section>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
