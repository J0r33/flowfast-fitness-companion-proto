import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockUserProfile, mockTodayWorkout } from "@/data/mockWorkouts";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ProgressStats } from "@/components/ProgressStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/MobileNav";
import { Sparkles, Activity, Zap } from "lucide-react";
import { loadWorkoutHistory, computeWorkoutStats } from "@/utils/workoutHistory";
import { getTodayRecommendation } from "@/utils/todayRecommendation";
import { formatMinutes, formatCalories } from "@/utils/formatters";
import { UserProfile, WorkoutStatsSummary, TodayRecommendation } from "@/types/workout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { loadUserProfile } from "@/utils/profileSync";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ Seed displayName synchronously from auth so there's no "Hi, User" flicker
  const [displayName, setDisplayName] = useState<string>(() => user?.email?.split("@")[0] || "User");

  const [todayWorkout] = useState(mockTodayWorkout);
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [stats, setStats] = useState<WorkoutStatsSummary | null>(null);
  const [todayRec, setTodayRec] = useState<TodayRecommendation | null>(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        if (!user?.id) return;

        // Load user profile (including display name)
        const userProfile = await loadUserProfile();

        // Load workout history from DB
        const history = await loadWorkoutHistory(user.id);
        const workoutStats = computeWorkoutStats(history);

        if (!isMounted) return;

        // ✅ Refine the name once profile is loaded, but keep fallback logic consistent
        setDisplayName(userProfile.displayName || user?.email?.split("@")[0] || "User");

        setStats(workoutStats);
        setWorkoutsThisWeek(workoutStats.thisWeekWorkouts);

        setProfile((prev) => ({
          ...prev,
          totalWorkouts: workoutStats.totalWorkouts,
          currentStreak: workoutStats.currentStreak,
        }));

        // Load today's recommendation from DB
        const rec = await getTodayRecommendation(user.id);
        setTodayRec(rec);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 pt-6 pb-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          {/* FlowFast Branding - Top Left */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">FlowFast</span>
          </div>

          {/* Greeting */}
          <h1 className="text-3xl font-bold mb-1">Hi, {displayName}! 👋</h1>
          <p className="text-primary-foreground/90">Ready to move today?</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <ProgressStats profile={profile} workoutsThisWeek={workoutsThisWeek} />

        {/* Weekly Highlights */}
        {stats && stats.totalWorkouts > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">This Week</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{formatMinutes(stats.totalMinutesPlanned)}</div>
                    <div className="text-xs text-muted-foreground">Total Time</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-secondary" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCalories(stats.totalEstimatedCalories)}
                    </div>
                    <div className="text-xs text-muted-foreground">Burned</div>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Today's Workout */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-3">Today&apos;s Plan</h2>

          <div
            className={cn(
              "rounded-lg transition-all",
              todayRec === "push" &&
                "ring-2 ring-orange-500/30 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/20",
              todayRec === "recovery" &&
                "ring-2 ring-blue-500/30 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20",
              todayRec === "catch_up" &&
                "ring-2 ring-yellow-500/30 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20",
            )}
          >
            {todayRec && (
              <div className="mb-3 px-1 pt-1">
                <Badge
                  variant={todayRec === "push" ? "default" : todayRec === "recovery" ? "secondary" : "outline"}
                  className={cn(
                    todayRec === "push" && "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
                    todayRec === "catch_up" && "bg-yellow-500 hover:bg-yellow-600 text-foreground border-transparent",
                  )}
                >
                  {todayRec === "push" && "🔥 Push Day"}
                  {todayRec === "maintain" && "⚡ Maintain Day"}
                  {todayRec === "recovery" && "🧘 Recovery Day"}
                  {todayRec === "catch_up" && "🎯 Catch-Up Day"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Smart recommendation based on your recent activity and goals
                </p>
              </div>
            )}

            <WorkoutCard
              workout={todayWorkout}
              onClick={() => navigate("/session", { state: { mode: "today_auto" } })}
            />
          </div>
        </section>

        {/* Adjust Button */}
        <Button variant="default" size="lg" className="w-full" onClick={() => navigate("/adjust")}>
          <Sparkles className="mr-2 h-5 w-5" />
          Adjust My Workout
        </Button>

        {/* Empty State for new users */}
        {stats && stats.totalWorkouts === 0 && (
          <Card className="p-6 text-center border-dashed">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold text-foreground mb-2">Start Your Journey</h3>
            <p className="text-sm text-muted-foreground mb-4">Complete your first workout to see your progress here!</p>
            <Button variant="default" onClick={() => navigate("/adjust")}>
              Get Started
            </Button>
          </Card>
        )}

        {/* Quick Tips */}
        {stats && stats.totalWorkouts > 0 && (
          <section className="bg-muted/50 p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-2">💡 Today&apos;s Tip</h3>
            <p className="text-sm text-muted-foreground">
              Consistency beats intensity! Even a 15-minute workout keeps your momentum going.
            </p>
          </section>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
