import { MobileNav } from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Target, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { WeeklyGoals, TrainingGoal } from '@/types/workout';
import { loadUserProfile, saveUserProfile } from '@/utils/profileSync';
import { DEFAULT_WEEKLY_GOALS } from '@/utils/weeklyGoals';

const EQUIPMENT_OPTIONS = [
  'Workout bands / Resistance bands',
  'Kettlebells',
  'Dumbbells',
  'Barbell',
  'Pull-up bar',
  'Bicycle / Stationary bike',
  'Treadmill',
  'Jump rope',
  'Rowing machine',
  'Medicine ball',
  'Yoga mat',
  'Adjustable bench / Flat bench',
  'Stability ball',
  'Foam roller',
  'Suspension trainer (TRX)',
  'Step / Plyo box',
  'Elliptical machine',
  'Sliders / Gliding discs',
  'Bodyweight only (no equipment)',
];

export default function Settings() {
  const navigate = useNavigate();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals>(DEFAULT_WEEKLY_GOALS);

  useEffect(() => {
    async function loadProfile() {
      const profile = await loadUserProfile();
      setSelectedEquipment(profile.equipment);
      setWeeklyGoals(profile.goals);
    }
    loadProfile();
  }, []);

  const handleToggleEquipment = (equipment: string) => {
    setSelectedEquipment((prev) => {
      const isBodyweightOnly = equipment === 'Bodyweight only (no equipment)';
      
      if (isBodyweightOnly) {
        // If selecting bodyweight only, clear all others
        return prev.includes(equipment) ? [] : [equipment];
      }
      
      // If selecting any equipment, remove bodyweight only
      const filtered = prev.filter(item => item !== 'Bodyweight only (no equipment)');
      
      if (filtered.includes(equipment)) {
        return filtered.filter(item => item !== equipment);
      }
      return [...filtered, equipment];
    });
  };

  const handleSaveEquipment = async () => {
    try {
      await saveUserProfile(selectedEquipment, weeklyGoals);
      toast.success('Equipment preferences saved');
    } catch (error) {
      toast.error('Failed to save equipment preferences');
    }
  };

  const handleSaveGoals = async () => {
    if (weeklyGoals.targetWorkoutsPerWeek < 1 || weeklyGoals.targetWorkoutsPerWeek > 7) {
      toast.error('Workouts per week must be between 1 and 7');
      return;
    }
    if (weeklyGoals.targetMinutesPerWeek < 30 || weeklyGoals.targetMinutesPerWeek > 500) {
      toast.error('Minutes per week must be between 30 and 500');
      return;
    }
    
    try {
      await saveUserProfile(selectedEquipment, weeklyGoals);
      toast.success('Weekly goals saved');
    } catch (error) {
      toast.error('Failed to save weekly goals');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold">FlowFast</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Weekly Goals</h2>
              <p className="text-sm text-muted-foreground">
                Set your weekly workout targets to track progress.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="mb-1 block text-sm font-medium">
                Primary Goal
              </Label>
              <Select
                value={weeklyGoals.primaryGoal}
                onValueChange={(value: TrainingGoal) =>
                  setWeeklyGoals((prev) => ({
                    ...prev,
                    primaryGoal: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your main goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">🔥 Lose weight</SelectItem>
                  <SelectItem value="get_stronger">💪 Get stronger</SelectItem>
                  <SelectItem value="get_toned">✨ Get toned</SelectItem>
                  <SelectItem value="general_fitness">🏃 General fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetWorkouts" className="text-sm font-medium">
                Workouts per week
              </Label>
              <Input
                id="targetWorkouts"
                type="number"
                min={1}
                max={7}
                value={weeklyGoals.targetWorkoutsPerWeek}
                onChange={(e) => setWeeklyGoals((prev) => ({
                  ...prev,
                  targetWorkoutsPerWeek: parseInt(e.target.value) || 1,
                }))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Target: 1-7 workouts per week
              </p>
            </div>

            <div>
              <Label htmlFor="targetMinutes" className="text-sm font-medium">
                Minutes per week
              </Label>
              <Input
                id="targetMinutes"
                type="number"
                min={30}
                max={500}
                step={15}
                value={weeklyGoals.targetMinutesPerWeek}
                onChange={(e) => setWeeklyGoals((prev) => ({
                  ...prev,
                  targetMinutesPerWeek: parseInt(e.target.value) || 30,
                }))}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Target: 30-500 minutes per week (increments of 15)
              </p>
            </div>
          </div>

          <Button onClick={handleSaveGoals} className="w-full mt-6">
            Save Goals
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Dumbbell className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Home Equipment</h2>
              <p className="text-sm text-muted-foreground">
                Tell us what you have at home so we can tailor your sessions.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <div key={equipment} className="flex items-start gap-3">
                <Checkbox
                  id={equipment}
                  checked={selectedEquipment.includes(equipment)}
                  onCheckedChange={() => handleToggleEquipment(equipment)}
                />
                <Label
                  htmlFor={equipment}
                  className="text-sm font-normal leading-tight cursor-pointer"
                >
                  {equipment}
                </Label>
              </div>
            ))}
          </div>

          {selectedEquipment.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
              We'll design workouts that don't require equipment.
            </p>
          )}

          <Button onClick={handleSaveEquipment} className="w-full mt-6">
            Save Equipment
          </Button>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
