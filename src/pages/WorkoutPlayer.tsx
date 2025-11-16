import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkoutSession, WorkoutStep } from '@/types/workout';
import { loadWorkoutSession } from '@/utils/workoutSession';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function WorkoutPlayer() {
  const navigate = useNavigate();
  const { sessionId, stepIndex } = useParams();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  useEffect(() => {
    const loaded = loadWorkoutSession();
    if (!loaded || loaded.id !== sessionId) {
      navigate('/', { replace: true });
      return;
    }
    setSession(loaded);
  }, [sessionId, navigate]);

  useEffect(() => {
    const index = parseInt(stepIndex || '0', 10);
    if (session) {
      if (index < 0) {
        navigate(`/workout/${sessionId}/0`, { replace: true });
      } else if (index >= session.steps.length) {
        navigate('/workout/complete', { replace: true });
      } else {
        setCurrentStepIndex(index);
      }
    }
  }, [stepIndex, session, sessionId, navigate]);

  if (!session) return null;

  const currentStep: WorkoutStep = session.steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / session.steps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === session.steps.length - 1;

  const handleNext = () => {
    setSlideDirection('left');
    if (isLastStep) {
      navigate('/workout/complete');
    } else {
      navigate(`/workout/${sessionId}/${currentStepIndex + 1}`);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setSlideDirection('right');
      navigate(`/workout/${sessionId}/${currentStepIndex - 1}`);
    }
  };

  const renderSetDots = () => {
    if (currentStep.totalSets <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">Sets:</span>
        {Array.from({ length: currentStep.totalSets }).map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full transition-colors ${
              idx + 1 === currentStep.setIndex
                ? 'bg-primary'
                : idx + 1 < currentStep.setIndex
                ? 'bg-primary/50'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-lg font-semibold text-foreground">{session.title}</h1>
        </div>
      </header>

      {/* Main Exercise Area */}
      <main
        className={`flex-1 max-w-md mx-auto w-full px-6 py-8 flex flex-col justify-between animate-fade-in ${
          slideDirection === 'left' ? 'animate-slide-in-right' : ''
        }`}
      >
        <div className="space-y-6">
          {/* Group Label */}
          {currentStep.groupType && currentStep.groupLabel && (
            <Badge variant="secondary" className="mb-2">
              {currentStep.groupLabel}
            </Badge>
          )}

          {/* Exercise Name */}
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {currentStep.exerciseName}
            </h2>
            {renderSetDots()}
          </div>

          {/* Animation Placeholder */}
          <div className="bg-muted/30 rounded-2xl aspect-square flex items-center justify-center border border-border">
            <div className="text-center p-8">
              <div className="h-32 w-32 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">💪</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Animation: {currentStep.animationAssetId}
              </p>
            </div>
          </div>

          {/* Exercise Details */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            {currentStep.type === 'time' && currentStep.durationSeconds && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-xl font-semibold text-foreground">
                  {Math.floor(currentStep.durationSeconds / 60)}:
                  {(currentStep.durationSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {currentStep.type === 'reps' && currentStep.reps && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reps</span>
                <span className="text-xl font-semibold text-foreground">
                  {currentStep.reps}
                </span>
              </div>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Info className="mr-2 h-4 w-4" />
                  How to do this exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{currentStep.exerciseName}</DialogTitle>
                  <DialogDescription className="pt-4">
                    {currentStep.tooltipInstructions}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <Button variant="fitness" size="lg" onClick={handleNext} className="flex-1">
            {isLastStep ? 'Finish' : 'Next'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Progress Footer */}
      <footer className="bg-card border-t border-border px-6 py-4">
        <div className="max-w-md mx-auto">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Exercise {currentStepIndex + 1} of {session.steps.length}
          </p>
        </div>
      </footer>
    </div>
  );
}
