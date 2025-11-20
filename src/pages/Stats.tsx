import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Flame, Trophy, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { computeWorkoutStats } from "@/utils/workoutHistory";
import { WorkoutHistory } from "@/types/workout";
import {
  computeAdaptationMetricsFromHistory,
  generatePlannerHistorySnapshotFromMetrics,
} from "@/utils/adaptationState";
import { formatMinutes, formatCalories, formatRPE } from "@/utils/formatters";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";

export default function Stats() {
  const navigate = useNavigate();
  const { data: history, isLoading } = useWorkoutHistory();

  // Calculate weekly stats
  const calculateWeeklyStats = (history: WorkoutHistory) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const todayCopy = new Date(now);
    todayCopy.setHours(23, 59, 59, 999);

    let weeklyMinutes = 0;
    let weeklyCalories = 0;

    for (const entry of history.entries) {
      const d = new Date(entry.date);
      if (d >= startOfWeek && d <= todayCopy) {
        weeklyMinutes += entry.timeMinutesPlanned ?? 0;
        weeklyCalories += entry.totalEstimatedCalories ?? 0;
      }
    }

    return { weeklyMinutes, weeklyCalories };
  };

  const stats = useMemo(() => {
    if (!history) return null;
    return computeWorkoutStats(history);
  }, [history]);

  const { weeklyMinutes, weeklyCalories } = useMemo(() => {
    if (!history) return { weeklyMinutes: 0, weeklyCalories: 0 };
    return calculateWeeklyStats(history);
  }, [history]);

  const { avgRpe, lastRpe } = useMemo(() => {
    if (!history) return { avgRpe: undefined, lastRpe: undefined };
    const metrics = computeAdaptationMetricsFromHistory(history);
    const snapshot = generatePlannerHistorySnapshotFromMetrics(metrics);
    return { avgRpe: snapshot.avg_rpe, lastRpe: snapshot.last_rpe };
  }, [history]);

  if (isLoading || !stats) {
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
            <h1 className="text-2xl font-bold text-primary-foreground">Your Training Stats</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Track your progress, volume, and intensity over time
            </p>
          </div>
        </header>
        <MobileNav />
      </div>
    );
  }

  // Empty state for users with no workouts
  if (stats.totalWorkouts === 0) {
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
            <h1 className="text-2xl font-bold text-primary-foreground">Your Training Stats</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Track your progress, volume, and intensity over time
            </p>
          </div>
        </header>

        <main className="max-w-md mx-auto px-6 py-8">
          <Card className="p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold text-foreground mb-2">No Stats Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete your first workout to start tracking your progress
            </p>
            <Button onClick={() => navigate("/adjust")} className="mt-2">
              Start a Workout
            </Button>
          </Card>
        </main>

        <MobileNav />
      </div>
    );
  }

  const avgRpeInfo = avgRpe ? formatRPE(avgRpe) : null;
  const lastRpeInfo = lastRpe ? formatRPE(lastRpe) : null;

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
          <h1 className="text-2xl font-bold text-primary-foreground">Your Training Stats</h1>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Track your progress, volume, and intensity over time
          </p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Lifetime Summary */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Lifetime Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</div>
                  <div className="text-xs text-muted-foreground">Total Workouts</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatMinutes(stats.totalMinutesPlanned || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Minutes</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-secondary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCalories(stats.totalEstimatedCalories || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Calories</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.currentStreak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* This Week */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">This Week</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stats.thisWeekWorkouts}</div>
                  <div className="text-xs text-muted-foreground">Workouts</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{formatMinutes(weeklyMinutes)}</div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Effort Insights (RPE) */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">Effort Insights</h2>
          {!avgRpe && !lastRpe ? (
            <Card className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Complete a workout and log your effort to see RPE insights
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {avgRpe && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <div className={`text-2xl font-bold ${avgRpeInfo?.color || "text-foreground"}`}>
                        {avgRpeInfo?.emoji} {avgRpe.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Average RPE</div>
                    </div>
                  </div>
                </Card>
              )}

              {lastRpe && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <div className={`text-2xl font-bold ${lastRpeInfo?.color || "text-foreground"}`}>
                        {lastRpeInfo?.emoji} {lastRpe}
                      </div>
                      <div className="text-xs text-muted-foreground">Last Session</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </section>
      </main>

      <MobileNav />
    </div>
  );
}
