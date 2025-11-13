import { FocusArea } from '@/types/workout';
import { Badge } from '@/components/ui/badge';
import { Heart, Dumbbell, Accessibility, Sparkles, Activity } from 'lucide-react';

interface FocusAreaSelectorProps {
  selected: FocusArea[];
  onToggle: (area: FocusArea) => void;
}

const focusOptions: { area: FocusArea; label: string; icon: any }[] = [
  { area: 'cardio', label: 'Cardio', icon: Heart },
  { area: 'strength', label: 'Strength', icon: Dumbbell },
  { area: 'flexibility', label: 'Flexibility', icon: Accessibility },
  { area: 'recovery', label: 'Recovery', icon: Sparkles },
  { area: 'full-body', label: 'Full Body', icon: Activity },
];

export function FocusAreaSelector({ selected, onToggle }: FocusAreaSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">What do you want to focus on?</h3>
      <div className="flex flex-wrap gap-2">
        {focusOptions.map(({ area, label, icon: Icon }) => {
          const isSelected = selected.includes(area);
          return (
            <Badge
              key={area}
              variant={isSelected ? 'default' : 'outline'}
              className={`px-4 py-2 cursor-pointer transition-smooth text-sm ${
                isSelected 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-primary/10 hover:border-primary'
              }`}
              onClick={() => onToggle(area)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
