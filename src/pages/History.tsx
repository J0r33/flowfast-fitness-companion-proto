import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Clock, Flame, Dumbbell, TrendingUp, Activity, ChevronRight } from "lucide-react";
import { formatDate, formatEnergy, formatMinutes, formatCalories, formatDifficultyFromRPE } from "@/utils/formatters";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { format, parseISO } from "date-fns";
import { WorkoutHistoryEntry } from "@/types/workout";
import { cn } from "@/lib/utils";

// Helper function to group workouts by date
const groupWorkoutsByDate = (entries: WorkoutHistoryEntry[]) => {
  const grouped: Record<string, WorkoutHistoryEntry[]> = {};
  entries.forEach(entry => {
    const dateKey = format(parseISO(entry.date), 'yyyy-MM-dd');
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  });
  return grouped;
};

export default function History() {
  const navigate = useNavigate();
  const { data: history, isLoading } = useWorkoutHistory();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const entries = history?.entries ?? [];
  
  // Group workouts by date for efficient lookup
  const groupedWorkouts = useMemo(() => groupWorkoutsByDate(entries), [entries]);
  
  // Get workout days for calendar modifiers
  const workoutDays = useMemo(() => {
    return Object.keys(groupedWorkouts).map(dateStr => parseISO(dateStr));
  }, [groupedWorkouts]);
  
  // Get workouts for selected date
  const selectedDateWorkouts = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return groupedWorkouts[dateKey] || [];
  }, [selectedDate, groupedWorkouts]);
  
  const handleDayClick = (date: Date | undefined) => {
    // Toggle: if clicking the same date, deselect it
    if (selectedDate && date && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-6 pt-6 pb-6 rounded-b-3xl shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-primary-foreground">FlowFast</span>
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">History</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Loading your workouts...
            </p>
          </div>
        </header>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cyan rounded header */}
      <header className="bg-primary text-primary-foreground px-6 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-primary-foreground">FlowFast</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">History</h1>
          <p className="text-sm text-primary-foreground/80 mt-1">
            {entries.length} workout{entries.length !== 1 ? "s" : ""} completed
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {entries.length === 0 ? (
          // Empty state
          <Card className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground mb-2">No Workouts Yet</h3>
            <p className="text-sm text-muted-foreground">Complete your first workout to see it here!</p>
          </Card>
        ) : (
          <>
            {/* Calendar View */}
            <Card className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onDayClick={handleDayClick}
                modifiers={{
                  workoutDay: workoutDays,
                }}
                modifiersClassNames={{
                  workoutDay: "workout-day",
                }}
                className="rounded-md"
              />
            </Card>

            {/* Selected Date Workouts */}
            {selectedDate && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {selectedDateWorkouts.length} workout{selectedDateWorkouts.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {selectedDateWorkouts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No workouts on this date</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {selectedDateWorkouts.map((entry) => {
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
                              <div className="font-semibold text-foreground">{formatDate(entry.date)}</div>
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
                              <span className="text-foreground font-medium">{formatMinutes(entry.timeMinutesPlanned)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Dumbbell className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{entry.totalSets} sets</span>
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
                              <span className="text-foreground font-medium">{entry.exercisesCount} exercises</span>
                            </div>

                            {entry.rpe && (
                              <div className="flex items-center gap-2 text-sm">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <span className="text-foreground font-medium">RPE {entry.rpe}/10</span>
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
                              <div className="text-xs text-muted-foreground">Equipment: {entry.equipment.join(", ")}</div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="pt-3 border-t border-border flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {entry.rpe ? `RPE: ${entry.rpe}/10` : "View details"}
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
