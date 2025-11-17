import { format } from 'date-fns';
import { EnergyLevel, FocusArea, DifficultyFeedback } from '@/types/workout';

// Format ISO date string to readable format
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

// Format date with time
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
}

// Format energy level with emoji
export function formatEnergy(level: EnergyLevel): { label: string; emoji: string; color: string } {
  const map = {
    low: { label: 'Low Energy', emoji: '🌙', color: 'text-blue-600' },
    medium: { label: 'Medium Energy', emoji: '⚡', color: 'text-yellow-600' },
    high: { label: 'High Energy', emoji: '🔥', color: 'text-orange-600' },
  };
  return map[level] || map.medium;
}

// Format minutes to readable string
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Format calories
export function formatCalories(calories: number): string {
  return `${Math.round(calories)} cal`;
}

// Format focus areas to readable string
export function formatFocusAreas(areas: FocusArea[]): string {
  if (areas.length === 0) return 'General';
  
  const displayNames: Record<string, string> = {
    'cardio': 'Cardio',
    'strength': 'Strength',
    'flexibility': 'Flexibility',
    'recovery': 'Recovery',
    'full-body': 'Full Body',
    'upper-body': 'Upper Body',
    'lower-body': 'Lower Body',
    'core': 'Core',
  };
  
  return areas
    .map(area => displayNames[area] || area)
    .join(', ');
}

// Format difficulty feedback with styling
export function formatDifficulty(feedback?: DifficultyFeedback): { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  emoji: string;
} | null {
  if (!feedback) return null;
  
  const map = {
    too_easy: { label: 'Too Easy', variant: 'secondary' as const, emoji: '😴' },
    just_right: { label: 'Just Right', variant: 'default' as const, emoji: '✨' },
    too_hard: { label: 'Too Hard', variant: 'destructive' as const, emoji: '😅' },
    couldnt_finish: { label: 'Incomplete', variant: 'destructive' as const, emoji: '💪' },
  };
  
  return map[feedback] || null;
}

// Format RPE with context
export function formatRPE(rpe?: number): { 
  label: string; 
  color: string;
  emoji: string;
} | null {
  if (!rpe) return null;
  
  if (rpe <= 3) {
    return { label: `RPE ${rpe}/10`, color: 'text-green-600', emoji: '😌' };
  } else if (rpe <= 6) {
    return { label: `RPE ${rpe}/10`, color: 'text-blue-600', emoji: '💪' };
  } else if (rpe <= 8) {
    return { label: `RPE ${rpe}/10`, color: 'text-orange-600', emoji: '🔥' };
  } else {
    return { label: `RPE ${rpe}/10`, color: 'text-red-600', emoji: '💥' };
  }
}

// Format difficulty level based on RPE (1-10 scale)
export function formatDifficultyFromRPE(rpe?: number): { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  emoji: string;
} | null {
  if (!rpe) return null;
  
  if (rpe <= 3) {
    // Very Easy: RPE 1-3
    return { 
      label: 'Very Easy', 
      variant: 'secondary' as const, 
      emoji: '😌' 
    };
  } else if (rpe <= 6) {
    // Comfortable: RPE 4-6
    return { 
      label: 'Comfortable', 
      variant: 'outline' as const, 
      emoji: '💪' 
    };
  } else if (rpe <= 8) {
    // Challenging: RPE 7-8
    return { 
      label: 'Challenging', 
      variant: 'default' as const, 
      emoji: '🔥' 
    };
  } else {
    // Max Effort: RPE 9-10
    return { 
      label: 'Max Effort', 
      variant: 'destructive' as const, 
      emoji: '💥' 
    };
  }
}
