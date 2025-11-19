import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EnergyLevel, WorkoutHistoryEntry } from '@/types/workout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MobileNav } from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Star, Battery, BatteryMedium, BatteryFull } from 'lucide-react';
import { toast } from 'sonner';
import { saveWorkoutHistoryEntryUnified } from '@/utils/workoutHistory';
import { DifficultyFeedback } from '@/types/workout';
import { useAuth } from '@/contexts/AuthContext';

export default function Feedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const workout = location.state?.workout;
  const { user } = useAuth();

  const [rating, setRating] = useState<number | null>(null);
  const [energyAfter, setEnergyAfter] = useState<EnergyLevel | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (rating === null || energyAfter === null || rpe === null) return;
    
    // Derive difficulty feedback from rating
    let difficultyFeedback: DifficultyFeedback;
    if (rating <= 2) {
      difficultyFeedback = 'too_hard';
    } else if (rating === 3) {
      difficultyFeedback = 'just_right';
    } else if (rating === 4) {
      difficultyFeedback = 'too_easy';
    } else {
      difficultyFeedback = 'too_easy';
    }
    
    // Special case: if energy after is 'low', consider it couldn't finish
    if (energyAfter === 'low' && rating <= 3) {
      difficultyFeedback = 'couldnt_finish';
    }
    
    // Build history entry and save to DB + localStorage
    // Note: adaptation state is now derived from workout_history, no separate recording needed
    if (workout) {
      // Calculate total sets
      const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0);
      
      // Calculate total calories
      const totalEstimatedCalories = workout.exercises.reduce(
        (sum: number, ex: any) => sum + (ex.caloriesEstimate || 0), 
        0
      );
      
      const entry: WorkoutHistoryEntry = {
        id: workout.id,
        date: new Date().toISOString(),
        energy: workout.context?.energy || 'medium',
        timeMinutesPlanned: workout.context?.timeMinutes || workout.totalTime,
        focusAreas: workout.context?.focusAreas || workout.focusAreas,
        equipment: workout.context?.equipment || [],
        exercisesCount: workout.exercises.length,
        totalSets,
        totalEstimatedCalories: totalEstimatedCalories > 0 ? totalEstimatedCalories : undefined,
        feedbackDifficulty: difficultyFeedback,
        rpe: rpe ?? undefined,
      };

      try {
        await saveWorkoutHistoryEntryUnified(entry, user?.id);
      } catch (error) {
        console.error('Error saving workout history:', error);
        toast.error('Failed to save to cloud', {
          description: 'Workout saved locally',
        });
      }
    }
    
    console.log({ rating, energyAfter, rpe, notes, difficulty: difficultyFeedback });
    
    toast.success('Great work! Feedback saved', {
      description: 'Keep up the momentum!',
    });

    // Navigate back to dashboard
    setTimeout(() => navigate('/'), 1000);
  };

  const energyOptions = [
    { level: 'low' as EnergyLevel, label: 'Low', icon: Battery },
    { level: 'medium' as EnergyLevel, label: 'Medium', icon: BatteryMedium },
    { level: 'high' as EnergyLevel, label: 'High', icon: BatteryFull },
  ];

  const canSubmit = rating !== null && energyAfter !== null && rpe !== null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Celebration Header */}
      <header className="bg-gradient-secondary text-secondary-foreground px-6 pt-12 pb-8 rounded-b-3xl shadow-medium text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold mb-2">Workout Complete!</h1>
          <p className="text-secondary-foreground/90">You crushed it today</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Rating */}
        <section>
          <h3 className="font-semibold text-foreground mb-3">How was your workout?</h3>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-smooth hover:scale-110"
              >
                <Star
                  className={`h-10 w-10 ${
                    rating && star <= rating
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
        </section>

        {/* Energy After */}
        <section>
          <h3 className="font-semibold text-foreground mb-3">How do you feel now?</h3>
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map(({ level, label, icon: Icon }) => (
              <Card
                key={level}
                className={`p-4 cursor-pointer transition-smooth text-center ${
                  energyAfter === level
                    ? 'border-2 border-primary bg-primary/10'
                    : 'border hover:border-primary/40'
                }`}
                onClick={() => setEnergyAfter(level)}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  energyAfter === level ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-sm font-medium ${
                  energyAfter === level ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* RPE Selection */}
        <section>
          <h3 className="font-semibold text-foreground mb-2">
            Rate of Perceived Effort (RPE)
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            1 = very easy, 10 = maximal effort
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={rpe === value ? "fitness" : "outline"}
                onClick={() => setRpe(value)}
                className="w-12 h-12 text-base font-semibold"
              >
                {value}
              </Button>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section>
          <h3 className="font-semibold text-foreground mb-3">Any thoughts? (optional)</h3>
          <Textarea
            placeholder="How did the workout feel? Anything you'd change?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </section>

        {/* Submit */}
        <Button
          variant="success"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Save Feedback
        </Button>
      </main>

      <MobileNav />
    </div>
  );
}
