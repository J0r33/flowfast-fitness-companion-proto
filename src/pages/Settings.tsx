import { MobileNav } from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

  useEffect(() => {
    const saved = localStorage.getItem('userEquipment');
    if (saved) {
      setSelectedEquipment(JSON.parse(saved));
    }
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

  const handleSave = () => {
    localStorage.setItem('userEquipment', JSON.stringify(selectedEquipment));
    toast.success('Equipment preferences saved');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border px-6 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
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

          <Button onClick={handleSave} className="w-full mt-6">
            Save Equipment
          </Button>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
