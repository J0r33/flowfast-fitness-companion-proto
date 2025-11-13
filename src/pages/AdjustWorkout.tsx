import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnergyLevel, FocusArea } from '@/types/workout';
import { EnergySelector } from '@/components/EnergySelector';
import { TimeSelector } from '@/components/TimeSelector';
import { FocusAreaSelector } from '@/components/FocusAreaSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MobileNav } from '@/components/MobileNav';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Step = 'energy' | 'time' | 'focus' | 'goal';

export default function AdjustWorkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('energy');
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [goal, setGoal] = useState<string>('');

  const steps: Step[] = ['energy', 'time', 'focus', 'goal'];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (step === 'energy' && energy) setStep('time');
    else if (step === 'time' && time) setStep('focus');
    else if (step === 'focus' && focusAreas.length > 0) setStep('goal');
    else if (step === 'goal' && goal.trim()) {
      // Navigate to session with params
      navigate('/session', { 
        state: { energy, time, focusAreas, goal, isAdjusted: true } 
      });
    }
  };

  const handleBack = () => {
    if (step === 'time') setStep('energy');
    else if (step === 'focus') setStep('time');
    else if (step === 'goal') setStep('focus');
    else navigate('/');
  };

  const toggleFocusArea = (area: FocusArea) => {
    setFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const canProceed = 
    (step === 'energy' && energy) ||
    (step === 'time' && time) ||
    (step === 'focus' && focusAreas.length > 0) ||
    (step === 'goal' && goal.trim());

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={handleBack}>
              <ArrowLeft className="h-6 w-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Adjust Workout</h1>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6">
        <div className="space-y-6">
          {step === 'energy' && (
            <EnergySelector selected={energy} onSelect={setEnergy} />
          )}
          
          {step === 'time' && (
            <TimeSelector selected={time} onSelect={setTime} />
          )}
          
          {step === 'focus' && (
            <FocusAreaSelector selected={focusAreas} onToggle={toggleFocusArea} />
          )}

          {step === 'goal' && (
            <div className="space-y-3">
              <Label htmlFor="goal" className="font-semibold text-foreground">
                What's your goal for this workout?
              </Label>
              <Input
                id="goal"
                type="text"
                placeholder="e.g., feel less stiff, break a sweat"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="pt-6">
            <Button
              variant="fitness"
              size="lg"
              className="w-full"
              onClick={handleNext}
              disabled={!canProceed}
            >
              {step === 'goal' ? 'Generate Workout' : 'Continue'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
