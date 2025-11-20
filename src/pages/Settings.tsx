import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Target, Activity, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { WeeklyGoals, TrainingGoal } from "@/types/workout";
import { loadUserProfile, saveUserProfile } from "@/utils/profileSync";
import { DEFAULT_WEEKLY_GOALS } from "@/utils/weeklyGoals";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoals>(DEFAULT_WEEKLY_GOALS);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    async function loadProfile() {
      const profile = await loadUserProfile();
      setSelectedEquipment(profile.equipment);
      setWeeklyGoals(profile.goals);
      setDisplayName(profile.displayName || "");
    }
    loadProfile();
  }, []);

  const handleToggleEquipment = (equipment: string) => {
    setSelectedEquipment((prev) => {
      const isBodyweightOnly = equipment === "Bodyweight only (no equipment)";

      if (isBodyweightOnly) {
        // If selecting bodyweight only, clear all others
        return prev.includes(equipment) ? [] : [equipment];
      }

      // If selecting any equipment, remove bodyweight only
      const filtered = prev.filter((item) => item !== "Bodyweight only (no equipment)");

      if (filtered.includes(equipment)) {
        return filtered.filter((item) => item !== equipment);
      }
      return [...filtered, equipment];
    });
  };

  const handleSaveEquipment = async () => {
    try {
      await saveUserProfile(selectedEquipment, weeklyGoals);
      toast.success("Equipment preferences saved");
    } catch (error) {
      toast.error("Failed to save equipment preferences");
    }
  };

  const handleSaveGoals = async () => {
    if (weeklyGoals.targetWorkoutsPerWeek < 1 || weeklyGoals.targetWorkoutsPerWeek > 7) {
      toast.error("Workouts per week must be between 1 and 7");
      return;
    }
    if (weeklyGoals.targetMinutesPerWeek < 30 || weeklyGoals.targetMinutesPerWeek > 500) {
      toast.error("Minutes per week must be between 30 and 500");
      return;
    }

    try {
      await saveUserProfile(selectedEquipment, weeklyGoals);
      toast.success("Weekly goals saved");
    } catch (error) {
      toast.error("Failed to save weekly goals");
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    try {
      await saveUserProfile(selectedEquipment, weeklyGoals, displayName.trim());
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-6 pt-6 pb-6 rounded-b-3xl shadow-lg">
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

      <main className="max-w-md mx-auto px-6 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="equipment">
              <Dumbbell className="h-4 w-4 mr-2" />
              Equipment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Profile</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                {user?.created_at && (
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <p className="text-sm text-muted-foreground">{format(new Date(user.created_at), "MMMM d, yyyy")}</p>
                  </div>
                )}

                <Button onClick={handleSaveProfile} className="w-full">
                  Save Profile
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Weekly Goals</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryGoal">Primary Goal</Label>
                  <Select
                    value={weeklyGoals.primaryGoal}
                    onValueChange={(value) => setWeeklyGoals({ ...weeklyGoals, primaryGoal: value as TrainingGoal })}
                  >
                    <SelectTrigger id="primaryGoal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Build Strength</SelectItem>
                      <SelectItem value="muscle">Build Muscle</SelectItem>
                      <SelectItem value="endurance">Build Endurance</SelectItem>
                      <SelectItem value="weight_loss">Lose Weight</SelectItem>
                      <SelectItem value="general_fitness">General Fitness</SelectItem>
                      <SelectItem value="flexibility">Flexibility & Mobility</SelectItem>
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

                <Button onClick={handleSaveGoals} className="w-full">
                  Save Goals
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Home Equipment</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the equipment you have available for home workouts:
                </p>

                <div className="space-y-3">
                  {EQUIPMENT_OPTIONS.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={selectedEquipment.includes(equipment)}
                        onCheckedChange={() => handleToggleEquipment(equipment)}
                      />
                      <Label htmlFor={equipment} className="text-sm font-normal cursor-pointer">
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveEquipment} className="w-full">
                  Save Equipment
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
