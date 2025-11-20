import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkoutSession, WorkoutStep } from '@/types/workout';
import { loadWorkoutSession } from '@/utils/workoutSession';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Info, Pause, Play } from 'lucide-react';
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
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [exerciseWeights, setExerciseWeights] = useState<Map<string, number[]>>(new Map());

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
        // Initialize timer for timed exercises and rest periods
        const step = session.steps[index];
        if ((step.type === 'time' || step.type === 'rest') && step.durationSeconds) {
          setRemainingSeconds(step.durationSeconds);
          setIsPaused(false);
          setTimerComplete(false);
          // Auto-start rest periods
          setTimerStarted(step.type === 'rest');
        } else {
          setRemainingSeconds(null);
          setIsPaused(false);
          setTimerComplete(false);
          setTimerStarted(false);
        }
      }
    }
  }, [stepIndex, session, sessionId, navigate]);

  // Countdown timer for timed exercises and rest periods
  useEffect(() => {
    if (!session || remainingSeconds === null || remainingSeconds <= 0 || isPaused || timerComplete || !timerStarted) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          // Timer complete
          setTimerComplete(true);
          playCompletionSound();
          
          // Auto-advance for rest periods
          const step = session.steps[currentStepIndex];
          if (step.type === 'rest') {
            setTimeout(() => {
              setSlideDirection('left');
              if (currentStepIndex >= session.steps.length - 1) {
                navigate('/workout/complete');
              } else {
                navigate(`/workout/${sessionId}/${currentStepIndex + 1}`);
              }
            }, 1000);
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, isPaused, timerComplete, timerStarted, session, currentStepIndex, sessionId, navigate]);

  const playCompletionSound = () => {
    // Play a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    setTimerStarted(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (!session) return null;

  const currentStep: WorkoutStep = session.steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / session.steps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === session.steps.length - 1;

  const handleNext = () => {
    setSlideDirection('left');
    if (isLastStep) {
      // Save weights to session before navigating to completion
      const updatedSession = {
        ...session,
        workoutPlan: {
          ...session.workoutPlan,
          exercises: session.workoutPlan.exercises.map(ex => ({
            ...ex,
            weights: exerciseWeights.get(ex.name) || undefined
          }))
        }
      };
      localStorage.setItem('currentWorkoutSession', JSON.stringify(updatedSession));
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

  const isWeightedExercise = (step: WorkoutStep): boolean => {
    const exercise = session?.workoutPlan.exercises.find(e => e.name === step.exerciseName);
    if (!exercise) return false;
    
    const weightEquipment = ['dumbbells', 'barbell', 'kettlebell', 'weight plate'];
    return exercise.type === 'strength' || 
           (exercise.equipment?.some(eq => weightEquipment.includes(eq.toLowerCase())) ?? false);
  };

  const getCurrentSetWeight = (exerciseName: string, setIndex: number): number | undefined => {
    const weights = exerciseWeights.get(exerciseName);
    return weights?.[setIndex - 1];
  };

  const handleWeightChange = (exerciseName: string, setIndex: number, weight: number) => {
    setExerciseWeights(prev => {
      const newMap = new Map(prev);
      const weights = newMap.get(exerciseName) || [];
      weights[setIndex - 1] = weight;
      newMap.set(exerciseName, weights);
      return newMap;
    });
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
                <span className="text-4xl">{currentStep.type === 'rest' ? '⏸️' : '💪'}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentStep.type === 'rest' ? 'Take a breather' : `Animation: ${currentStep.animationAssetId}`}
              </p>
            </div>
          </div>

          {/* Exercise Details */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            {currentStep.type === 'rest' && currentStep.durationSeconds && (
              <div className="flex flex-col items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {timerComplete ? 'Rest Complete - Moving to next exercise...' : 'Rest Time'}
                </span>
                <span className={`text-6xl font-bold tabular-nums ${timerComplete ? 'text-green-500' : 'text-primary'}`}>
                  {remainingSeconds !== null 
                    ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`
                    : `${Math.floor(currentStep.durationSeconds / 60)}:${String(currentStep.durationSeconds % 60).padStart(2, '0')}`
                  }
                </span>
                <p className="text-sm text-muted-foreground text-center">
                  Catch your breath and prepare for the next challenge
                </p>
              </div>
            )}
            {currentStep.type === 'time' && currentStep.durationSeconds && (
              <>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {timerComplete ? 'Time Complete!' : !timerStarted ? 'Ready' : isPaused ? 'Paused' : 'Time Remaining'}
                  </span>
                  <span className={`text-6xl font-bold tabular-nums ${timerComplete ? 'text-green-500' : 'text-primary'}`}>
                    {remainingSeconds !== null 
                      ? `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')}`
                      : `${Math.floor(currentStep.durationSeconds / 60)}:${String(currentStep.durationSeconds % 60).padStart(2, '0')}`
                    }
                  </span>
                  {remainingSeconds !== null && !timerComplete && (
                    <>
                      {!timerStarted ? (
                        <Button
                          variant="default"
                          size="lg"
                          onClick={startTimer}
                          className="w-full"
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Start Timer
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={togglePause}
                          className="w-full"
                        >
                          {isPaused ? (
                            <>
                              <Play className="mr-2 h-5 w-5" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="mr-2 h-5 w-5" />
                              Pause
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
            {currentStep.type === 'reps' && currentStep.reps && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reps</span>
                  <span className="text-xl font-semibold text-foreground">
                    {currentStep.reps}
                  </span>
                </div>
                
                {/* Weight input for weighted exercises */}
                {!currentStep.isRest && isWeightedExercise(currentStep) && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Weight Used (optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={getCurrentSetWeight(currentStep.exerciseName, currentStep.setIndex) || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            const numValue = parseFloat(value) || 0;
                            handleWeightChange(currentStep.exerciseName, currentStep.setIndex, numValue);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="text-center text-lg"
                      />
                      <span className="text-sm text-muted-foreground">lbs</span>
                    </div>
                  </div>
                )}
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
          <Button variant="default" size="lg" onClick={handleNext} className="flex-1">
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
