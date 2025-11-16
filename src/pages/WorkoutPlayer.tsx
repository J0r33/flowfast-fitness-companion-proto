import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkoutSession, WorkoutStep } from '@/types/workout';
import { loadWorkoutSession } from '@/utils/workoutSession';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Info, Play, Pause, RotateCcw, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type TimerState = 'idle' | 'pre-countdown' | 'running' | 'paused' | 'completed' | 'rest';
type RestTimerState = 'idle' | 'running' | 'completed';

export default function WorkoutPlayer() {
  const navigate = useNavigate();
  const { sessionId, stepIndex } = useParams();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  
  // Timer states
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [preCountdown, setPreCountdown] = useState(3);
  const [restTimerState, setRestTimerState] = useState<RestTimerState>('idle');
  const [restTimeRemaining, setRestTimeRemaining] = useState(30);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        // Reset timer state when step changes
        resetTimerState();
      }
    }
  }, [stepIndex, session, sessionId, navigate]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current);
    };
  }, []);

  // Pre-countdown timer
  useEffect(() => {
    if (timerState === 'pre-countdown') {
      const interval = setInterval(() => {
        setPreCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerState('running');
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      timerIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [timerState]);

  // Main exercise timer
  useEffect(() => {
    if (timerState === 'running' && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerState('completed');
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timerIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [timerState, timeRemaining]);

  // Rest timer
  useEffect(() => {
    if (restTimerState === 'running' && restTimeRemaining > 0) {
      const interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setRestTimerState('completed');
            playCompletionSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      restTimerIntervalRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [restTimerState, restTimeRemaining]);

  const resetTimerState = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current);
    setTimerState('idle');
    setRestTimerState('idle');
    setPreCountdown(3);
    setRestTimeRemaining(30);
  };

  const playCompletionSound = () => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  if (!session) return null;

  const currentStep: WorkoutStep = session.steps[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / session.steps.length) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === session.steps.length - 1;

  const handleStartTimer = () => {
    if (currentStep.type === 'time' && currentStep.durationSeconds) {
      setTimeRemaining(currentStep.durationSeconds);
      setPreCountdown(3);
      setTimerState('pre-countdown');
    }
  };

  const handlePauseTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerState('paused');
  };

  const handleResumeTimer = () => {
    setTimerState('running');
  };

  const handleRestartTimer = () => {
    resetTimerState();
    handleStartTimer();
  };

  const handleStartRestTimer = () => {
    setRestTimeRemaining(30);
    setRestTimerState('running');
  };

  const handleSkipRest = () => {
    if (restTimerIntervalRef.current) clearInterval(restTimerIntervalRef.current);
    setRestTimerState('idle');
    handleNext();
  };

  const handleNext = () => {
    // Mark current step as completed for reps-based exercises
    if (currentStep.type === 'reps') {
      setCompletedSets((prev) => new Set(prev).add(currentStep.id));
    }

    // Check if we should show rest timer
    if (restTimerState === 'idle' && !isLastStep && currentStep.totalSets > 1) {
      setRestTimerState('idle'); // Show rest timer option
      return;
    }

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
            className={`h-3 w-3 rounded-full transition-all ${
              idx + 1 === currentStep.setIndex
                ? 'bg-primary scale-110'
                : idx + 1 < currentStep.setIndex || completedSets.has(currentStep.id)
                ? 'bg-primary/70'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerProgress = () => {
    if (!currentStep.durationSeconds) return 0;
    return ((currentStep.durationSeconds - timeRemaining) / currentStep.durationSeconds) * 100;
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

          {/* Animation Placeholder with Timer Overlay */}
          <div className="relative bg-muted/30 rounded-2xl aspect-square flex items-center justify-center border border-border">
            <div className="text-center p-8">
              <div className="h-32 w-32 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-4xl">💪</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Animation: {currentStep.animationAssetId}
              </p>
            </div>

            {/* Pre-countdown Overlay */}
            {timerState === 'pre-countdown' && (
              <div className="absolute inset-0 bg-background/95 rounded-2xl flex items-center justify-center">
                <div className="text-center space-y-4 animate-scale-in">
                  <div className="text-8xl font-bold text-primary animate-pulse">
                    {preCountdown}
                  </div>
                  <p className="text-muted-foreground">Get ready...</p>
                </div>
              </div>
            )}

            {/* Timer Display for Running/Completed */}
            {currentStep.type === 'time' && (timerState === 'running' || timerState === 'completed') && (
              <div className="absolute top-4 right-4 bg-card/95 border border-border rounded-xl p-4 shadow-lg min-w-[120px]">
                <div className="text-center space-y-2">
                  <div className={`text-3xl font-bold ${timerState === 'completed' ? 'text-green-500 animate-pulse' : 'text-foreground'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                  <Progress value={getTimerProgress()} className="h-2" />
                  {timerState === 'running' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePauseTimer}
                      className="w-full"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Exercise Details */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            {currentStep.type === 'time' && currentStep.durationSeconds && timerState === 'idle' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-xl font-semibold text-foreground">
                    {formatTime(currentStep.durationSeconds)}
                  </span>
                </div>
                <Button onClick={handleStartTimer} className="w-full" variant="fitness">
                  <Play className="mr-2 h-4 w-4" />
                  Start Timer
                </Button>
              </div>
            )}
            
            {currentStep.type === 'reps' && currentStep.reps && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Target Reps</span>
                <span className="text-3xl font-bold text-primary">
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

          {/* Timer Completed - Show Rest Option */}
          {timerState === 'completed' && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 animate-scale-in">
              <p className="text-green-600 dark:text-green-400 font-semibold mb-3 text-center">
                ✓ Exercise Complete!
              </p>
              {!isLastStep && currentStep.totalSets > 1 && (
                <Button onClick={handleStartRestTimer} variant="outline" className="w-full mb-2">
                  Start Rest Timer (30s)
                </Button>
              )}
            </div>
          )}

          {/* Rest Timer */}
          {restTimerState !== 'idle' && (
            <div className="bg-card border-2 border-primary rounded-xl p-6 animate-scale-in">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">Rest Time</p>
                <div className="text-5xl font-bold text-primary">
                  {formatTime(restTimeRemaining)}
                </div>
                <Progress value={((30 - restTimeRemaining) / 30) * 100} className="h-2" />
                {restTimerState === 'completed' ? (
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    Rest complete! Ready for next set
                  </p>
                ) : (
                  <Button onClick={handleSkipRest} variant="outline" size="sm">
                    Skip Rest
                  </Button>
                )}
              </div>
            </div>
          )}
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
          <Button 
            variant="fitness" 
            size="lg" 
            onClick={handleNext} 
            className="flex-1"
            disabled={
              currentStep.type === 'time' && 
              timerState !== 'completed' && 
              timerState !== 'idle'
            }
          >
            {isLastStep ? 'Finish' : currentStep.totalSets > 1 && currentStep.setIndex < currentStep.totalSets ? 'Next Set' : 'Next Exercise'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Pause Overlay */}
      {timerState === 'paused' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-6 animate-scale-in">
            <h3 className="text-xl font-bold text-foreground mb-4 text-center">
              Timer Paused
            </h3>
            <div className="text-4xl font-bold text-center text-primary mb-6">
              {formatTime(timeRemaining)}
            </div>
            <div className="space-y-3">
              <Button onClick={handleResumeTimer} className="w-full" variant="fitness">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button onClick={handleRestartTimer} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restart
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Exit Exercise
              </Button>
            </div>
          </div>
        </div>
      )}

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
