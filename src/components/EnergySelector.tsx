import { EnergyLevel } from '@/types/workout';
import { Card } from '@/components/ui/card';
import { Battery, BatteryMedium, BatteryFull } from 'lucide-react';

interface EnergySelectorProps {
  selected: EnergyLevel | null;
  onSelect: (level: EnergyLevel) => void;
}

const energyOptions: { level: EnergyLevel; label: string; icon: any; color: string }[] = [
  { level: 'low', label: 'Low Energy', icon: Battery, color: 'accent' },
  { level: 'medium', label: 'Medium Energy', icon: BatteryMedium, color: 'primary' },
  { level: 'high', label: 'High Energy', icon: BatteryFull, color: 'secondary' },
];

export function EnergySelector({ selected, onSelect }: EnergySelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">How's your energy today?</h3>
      <div className="grid gap-3">
        {energyOptions.map(({ level, label, icon: Icon, color }) => {
          const isSelected = selected === level;
          return (
            <Card
              key={level}
              className={`p-4 cursor-pointer transition-smooth hover:shadow-soft ${
                isSelected 
                  ? `border-2 border-${color} bg-${color}/10` 
                  : 'border hover:border-primary/40'
              }`}
              onClick={() => onSelect(level)}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 ${isSelected ? `text-${color}` : 'text-muted-foreground'}`} />
                <span className={`font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
