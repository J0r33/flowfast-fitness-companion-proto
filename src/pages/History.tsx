import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileNav } from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Flame, Dumbbell, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import { loadWorkoutHistory } from '@/utils/workoutHistory';
import { WorkoutHistoryEntry } from '@/types/workout';
import { useAuth } from '@/contexts/AuthContext';
import {
  formatDate,
  formatEnergy,
  formatMinutes,
  formatCalories,
  formatDifficultyFromRPE,
} from '@/utils/formatters';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<WorkoutHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        if (!user?.id) return;
        
        const history = await loadWorkoutHistory(user.id);
        if (isMounted) {
          setEntries(history.entries);
        }
      } catch (error) {
        console.error('Failed to load workout history:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border px-6 py-6">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground">History</h1>
          </div>
        </header>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border px-6 py-6 shadow-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {entries.length} workout{entries.length !== 1 ? 's' : ''} completed
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6">
        {entries.length === 0 ? (
          // Empty state
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground mb-2">No Workouts Yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete your first workout to see it here!
            </p>
          </Card>
        ) : (
          // History list
          <div className="space-y-4">
            {entries.map((entry) => {
              const energyInfo = formatEnergy(entry.energy);
              const difficultyInfo = formatDifficultyFromRPE(entry.rpe);

              return (
                <Card 
                  key={entry.id} 
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/history/${entry.id}`)}
                >
                  {/* Header: Date and Energy */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-foreground">
                        {formatDate(entry.date)}
                      </div>
                      <div className={`text-sm ${energyInfo.color} flex items-center gap-1 mt-1`}>
                        <span>{energyInfo.emoji}</span>
                        <span>{energyInfo.label}</span>
                      </div>
                    </div>
                    
                    {difficultyInfo && (
                      <Badge variant={difficultyInfo.variant} className="text-xs">
                        {difficultyInfo.emoji} {difficultyInfo.label}
                      </Badge>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {formatMinutes(entry.timeMinutesPlanned)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {entry.totalSets} sets
                      </span>
                    </div>

                    {entry.totalEstimatedCalories && entry.totalEstimatedCalories > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-foreground font-medium">
                          {formatCalories(entry.totalEstimatedCalories)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-medium">
                        {entry.exercisesCount} exercises
                      </span>
                    </div>

                    {entry.rpe && (
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">
                          RPE {entry.rpe}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Focus Areas */}
                  <div className="pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground mb-2">Focus Areas</div>
                    <div className="flex flex-wrap gap-1">
                      {entry.focusAreas.map((area, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>


                  {/* Equipment (if any) */}
                  {entry.equipment.length > 0 && (
                    <div className="pt-2">
                      <div className="text-xs text-muted-foreground">
                        Equipment: {entry.equipment.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {entry.rpe ? `RPE: ${entry.rpe}/10` : 'View details'}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
