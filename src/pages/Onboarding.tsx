import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dumbbell, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { WeeklyGoals, TrainingGoal } from '@/types/workout';
import { saveUserProfile } from '@/utils/profileSync';
import { DEFAULT_WEEKLY_GOALS } from '@/utils/weeklyGoals';

const EQUIPMENT_OPTIONS = [
  "Workout bands / Resistance bands",
  "Kettlebells",
  "Dumbbells",
  "Barbell",
  "Pull-up bar",
  "Bicycle / Stationary bike",
  "Treadmill",
  "Jump rope",
  "Rowing machine",
  "Medicine ball",
  "Yoga mat",
  "Adjustable bench / Flat bench",
  "Stability ball",
  "Foam roller",
  "Suspension trainer (TRX)",
  "Step / Plyo box",
  "Elliptical machine",
  "Sliders / Gliding discs",
  "Bodyweight only (no equipment)",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals>(DEFAULT_WEEKLY_GOALS);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const handleToggleEquipment = (equipment: string) => {
    setSelectedEquipment((prev) => {
      const isBodyweightOnly = equipment === "Bodyweight only (no equipment)";

      if (isBodyweightOnly) {
        return prev.includes(equipment) ? [] : [equipment];
      }

      const filtered = prev.filter((item) => item !== "Bodyweight only (no equipment)");

      if (filtered.includes(equipment)) {
        return filtered.filter((item) => item !== equipment);
      }
      return [...filtered, equipment];
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!displayName.trim()) {
        toast.error('Please enter your display name');
        return;
      }
    }

    if (step === 2) {
      if (weeklyGoals.targetWorkoutsPerWeek < 1 || weeklyGoals.targetWorkoutsPerWeek > 7) {
        toast.error('Workouts per week must be between 1 and 7');
        return;
      }
      if (weeklyGoals.targetMinutesPerWeek < 30 || weeklyGoals.targetMinutesPerWeek > 500) {
        toast.error('Minutes per week must be between 30 and 500');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (selectedEquipment.length === 0) {
      toast.error('Please select at least one equipment option');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUserProfile(selectedEquipment, weeklyGoals, displayName.trim());
      toast.success('Profile setup complete! Welcome to FlowFast.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Onboarding save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save profile: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome to FlowFast</h1>
          <p className="text-muted-foreground">Let's personalize your fitness experience</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full transition-colors ${
                i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Step {step} of 3
        </p>

        {/* Step content */}
        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">What should we call you?</h2>
                <p className="text-sm text-muted-foreground">
                  This will be displayed throughout the app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                />
              </div>

              <Button onClick={handleNext} className="w-full">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">What are your goals?</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us about your fitness objectives
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryGoal">Primary Fitness Goal</Label>
                  <Select
                    value={weeklyGoals.primaryGoal}
                    onValueChange={(value) =>
                      setWeeklyGoals({
                        ...weeklyGoals,
                        primaryGoal: value as TrainingGoal,
                      })
                    }
                  >
                    <SelectTrigger id="primaryGoal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="get_stronger">Build Strength</SelectItem>
                      <SelectItem value="get_toned">Build Muscle / Get Toned</SelectItem>
                      <SelectItem value="lose_weight">Lose Weight</SelectItem>
                      <SelectItem value="general_fitness">General Fitness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workoutsPerWeek">Target Workouts per Week</Label>
                  <Input
                    id="workoutsPerWeek"
                    type="number"
                    min="1"
                    max="7"
                    value={weeklyGoals.targetWorkoutsPerWeek}
                    onChange={(e) =>
                      setWeeklyGoals({
                        ...weeklyGoals,
                        targetWorkoutsPerWeek: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minutesPerWeek">Target Minutes per Week</Label>
                  <Input
                    id="minutesPerWeek"
                    type="number"
                    min="30"
                    max="500"
                    value={weeklyGoals.targetMinutesPerWeek}
                    onChange={(e) =>
                      setWeeklyGoals({
                        ...weeklyGoals,
                        targetMinutesPerWeek: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Available Equipment</h2>
                <p className="text-sm text-muted-foreground">
                  Select what you have access to
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={`onboard-${equipment}`}
                      checked={selectedEquipment.includes(equipment)}
                      onCheckedChange={() => handleToggleEquipment(equipment)}
                    />
                    <Label
                      htmlFor={`onboard-${equipment}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBack} variant="outline" className="flex-1" disabled={isSubmitting}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
