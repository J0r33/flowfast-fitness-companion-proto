import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUserProfile, mockTodayWorkout } from '@/data/mockWorkouts';
import { WorkoutCard } from '@/components/WorkoutCard';
import { ProgressStats } from '@/components/ProgressStats';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/MobileNav';
import { Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [todayWorkout] = useState(mockTodayWorkout);
  const [profile] = useState(mockUserProfile);

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

        {/* Today's Workout */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Today's Plan</h2>
          <WorkoutCard 
            workout={todayWorkout} 
            onClick={() => navigate('/session')}
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

        {/* Quick Tips */}
        <section className="bg-muted/50 p-4 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2">💡 Today's Tip</h3>
          <p className="text-sm text-muted-foreground">
            Consistency beats intensity! Even a 15-minute workout keeps your momentum going.
          </p>
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
