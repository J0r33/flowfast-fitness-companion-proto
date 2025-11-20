import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EnergyLevel, WorkoutHistoryEntry } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Star, Battery, BatteryMedium, BatteryFull } from "lucide-react";
import { toast } from "sonner";
import { saveWorkoutHistoryEntry } from "@/utils/workoutHistory";
import { DifficultyFeedback } from "@/types/workout";
import { useAuth } from "@/contexts/AuthContext";

export default function Feedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const workout = location.state?.workout;
  const { user } = useAuth();

  const [rating, setRating] = useState<number | null>(null);
  const [energyAfter, setEnergyAfter] = useState<EnergyLevel | null>(null);
  const [rpe, setRpe] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    // ✅ Explicit validation with feedback instead of silent return
    if (rating === null || energyAfter === null || rpe === null) {
      toast.error("Almost there!", {
        description: "Please rate the workout, choose how you feel now, and select an RPE.",
      });
      return;
    }

    // Derive difficulty feedback
    let feedbackDifficulty: DifficultyFeedback;
    if (rating <= 2) feedbackDifficulty = "too_hard";
    else if (rating === 3) feedbackDifficulty = "just_right";
    else feedbackDifficulty = "too_easy";

    // Low energy + low rating = couldn't finish
    if (energyAfter === "low" && rating <= 3) {
      feedbackDifficulty = "couldnt_finish";
    }

    if (workout) {
      const totalSets = workout.exercises.reduce((sum: number, ex: any) => sum + (ex.sets || 0), 0);

      const totalEstimatedCalories = workout.exercises.reduce(
        (sum: number, ex: any) => sum + (ex.caloriesEstimate || 0),
        0,
      );

      const entry: WorkoutHistoryEntry = {
        date: new Date().toISOString(),
        energy: workout.context?.energy || "medium",
        timeMinutesPlanned: workout.context?.timeMinutes || workout.totalTime,
        focusAreas: workout.context?.focusAreas || workout.focusAreas,
        equipment: workout.context?.equipment || [],
        exercisesCount: workout.exercises.length,
        totalSets,
        totalEstimatedCalories: totalEstimatedCalories > 0 ? totalEstimatedCalories : undefined,
        feedbackDifficulty,
        rpe: rpe ?? undefined,
        exercises: workout.exercises,
      };

      try {
        if (!user?.id) {
          toast.error("Please log in to save workouts");
          return;
        }
        await saveWorkoutHistoryEntry(user.id, entry);
      } catch (error) {
        console.error("Error saving workout history:", error);
        toast.error("Failed to save workout");
      }
    }

    toast.success("Great work!", {
      description: "Your feedback helps personalize future workouts.",
    });

    setTimeout(() => navigate("/"), 1000);
  };

  const energyOptions = [
    { level: "low" as EnergyLevel, label: "Low", icon: Battery },
    { level: "medium" as EnergyLevel, label: "Medium", icon: BatteryMedium },
    { level: "high" as EnergyLevel, label: "High", icon: BatteryFull },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ✅ Cyan Header */}
      <header className="bg-primary text-primary-foreground px-6 pt-12 pb-8 rounded-b-3xl shadow-lg text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="text-3xl font-bold mb-1">Workout Complete!</h1>
          <p className="text-primary-foreground/90">You crushed it today</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Rating */}
        <section>
          <h3 className="font-semibold text-foreground mb-3">How was your workout?</h3>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className="transition-smooth hover:scale-110">
                <Star
                  className={`h-10 w-10 ${
                    rating && star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
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
                  energyAfter === level ? "border-2 border-primary bg-primary/10" : "border hover:border-primary/40"
                }`}
                onClick={() => setEnergyAfter(level)}
              >
                <Icon
                  className={`h-6 w-6 mx-auto mb-2 ${energyAfter === level ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-sm font-medium ${
                    energyAfter === level ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Card>
            ))}
          </div>
        </section>

        {/* RPE */}
        <section>
          <h3 className="font-semibold text-foreground mb-2">Rate of Perceived Effort (RPE)</h3>
          <p className="text-xs text-muted-foreground mb-3">1 = very easy, 10 = maximal effort</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={rpe === value ? "default" : "outline"}
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
          size="lg"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white border-transparent"
          onClick={handleSubmit}
        >
          Save Feedback
        </Button>
      </main>

      <MobileNav />
    </div>
  );
}
