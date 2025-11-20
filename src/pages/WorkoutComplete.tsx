import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles } from "lucide-react";
import { clearWorkoutSession, loadWorkoutSession } from "@/utils/workoutSession";

export default function WorkoutComplete() {
  const navigate = useNavigate();

  useEffect(() => {
    // Preload workout session for feedback
    const session = loadWorkoutSession();
    if (session) {
      // Store for feedback page
      sessionStorage.setItem("completedWorkout", JSON.stringify(session.workoutPlan));
    }
  }, []);

  const handleContinue = () => {
    const session = loadWorkoutSession();
    clearWorkoutSession();
    navigate("/feedback", { state: { workout: session?.workoutPlan } });
  };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8 animate-scale-in">
        {/* Celebration Icon */}
        <div className="relative">
          <div className="h-32 w-32 mx-auto bg-primary-foreground/20 rounded-full flex items-center justify-center animate-pulse">
            <Trophy className="h-20 w-20 text-primary-foreground" />
          </div>
          <Sparkles className="absolute top-0 right-1/4 h-8 w-8 text-primary-foreground animate-bounce" />
          <Sparkles className="absolute bottom-4 left-1/4 h-6 w-6 text-primary-foreground animate-bounce delay-100" />
        </div>

        {/* Congratulations Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Workout Complete!</h1>
          <p className="text-lg text-primary-foreground/90">Amazing effort! You&apos;ve completed your session.</p>
          <p className="text-sm text-primary-foreground/80">Take a moment to reflect on how you feel.</p>
        </div>

        {/* Continue Button */}
        <Button variant="secondary" size="lg" onClick={handleContinue} className="w-full max-w-xs mx-auto">
          Continue to Feedback
        </Button>
      </div>
    </div>
  );
}
