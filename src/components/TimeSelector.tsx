import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  selected: number | null;
  onSelect: (minutes: number) => void;
}

const timeOptions = [15, 30, 45, 60];

export function TimeSelector({ selected, onSelect }: TimeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">How much time do you have?</h3>
      <div className="grid grid-cols-2 gap-3">
        {timeOptions.map((minutes) => {
          const isSelected = selected === minutes;
          return (
            <Card
              key={minutes}
              className={`p-4 cursor-pointer transition-smooth hover:shadow-soft ${
                isSelected 
                  ? 'border-2 border-primary bg-primary/10' 
                  : 'border hover:border-primary/40'
              }`}
              onClick={() => onSelect(minutes)}
            >
              <div className="flex flex-col items-center gap-2">
                <Clock className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-lg font-semibold ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {minutes} min
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
