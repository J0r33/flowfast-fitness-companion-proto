import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockUserProfile } from "@/data/mockWorkouts";
import { ProgressStats } from "@/components/ProgressStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MobileNav } from "@/components/MobileNav";
import { Sparkles, Activity, Zap, Shuffle } from "lucide-react";
import { computeWorkoutStats } from "@/utils/workoutHistory";
import { getTodayRecommendationFromHistory } from "@/utils/todayRecommendation";
import { formatMinutes, formatCalories } from "@/utils/formatters";
import { UserProfile } from "@/types/workout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, profileLoading } = useAuth();

  // 🚀 Load data with React Query (cached, deduplicated)
  const { data: history, isLoading: historyLoading } = useWorkoutHistory();
  const { data: userProfile } = useUserProfile();

  // 🔢 Compute stats and recommendation from cached data
  const stats = useMemo(() => {
    if (!history) return null;
    return computeWorkoutStats(history);
  }, [history]);

  const todayRec = useMemo(() => {
    if (!history || !userProfile?.goals) return null;
    return getTodayRecommendationFromHistory(history, userProfile.goals);
  }, [history, userProfile?.goals]);

  const profileState = useMemo<UserProfile>(
    () => ({
      ...mockUserProfile,
      totalWorkouts: stats?.totalWorkouts ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
    }),
    [stats],
  );

  const workoutsThisWeek = stats?.thisWeekWorkouts ?? 0;

  // 🧠 Compute displayName from account profile
  const displayName = profile?.displayName || (!profileLoading && user?.email?.split("@")[0]) || undefined;

  // Show loading state if data is still loading
  if (historyLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-6 pt-6 pb-6 rounded-b-3xl shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">FlowFast</span>
            </div>
            <div className="h-8 w-40 rounded bg-primary-foreground/10 mb-1" />
            <p className="text-primary-foreground/90">Loading your dashboard...</p>
          </div>
        </header>
        <MobileNav />
      </div>
    );
  }

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
          {displayName ? (
            <h1 className="text-3xl font-bold mb-1">Hi, {displayName}! 👋</h1>
          ) : (
            // subtle skeleton instead of wrong name flicker
            <div className="h-8 w-40 rounded bg-primary-foreground/10 mb-1" />
          )}
          <p className="text-primary-foreground/90">Ready to move today?</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <ProgressStats profile={profileState} workoutsThisWeek={workoutsThisWeek} />

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

          <Card
            className={cn(
              "p-4 border border-border rounded-xl",
              todayRec === "push" &&
                "ring-2 ring-orange-500/30 bg-gradient-to-br from-orange-50/40 to-transparent dark:from-orange-950/20",
              todayRec === "recovery" &&
                "ring-2 ring-blue-500/30 bg-gradient-to-br from-blue-50/40 to-transparent dark:from-blue-950/20",
              todayRec === "catch_up" &&
                "ring-2 ring-yellow-500/30 bg-gradient-to-br from-yellow-50/40 to-transparent dark:from-yellow-950/20",
            )}
          >
            {todayRec && (
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
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
                    Smart recommendation based on your recent activity and weekly goals.
                  </p>
                </div>
              </div>
            )}

            <p className="text-sm text-foreground mb-1">Choose how you want to train today:</p>
            <p className="text-xs text-muted-foreground mb-4">
              <strong>Smart auto plan</strong> uses your recent workouts and goals to build a session for you.{" "}
              <strong>Customize today&apos;s workout</strong> lets you set your current energy, time available, and
              target areas.
            </p>

            <div className="flex flex-col gap-2">
              {/* Auto plan – based on history & goals */}
              <Button
                className="w-full sm:w-1/2"
                onClick={() => navigate("/session", { state: { mode: "today_auto" } })}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Smart Auto Plan
              </Button>

              {/* Customize – based on today’s energy/time/focus areas */}
              <Button
                variant="outline"
                className="w-full sm:w-1/2 bg-orange-500 hover:bg-orange-600 text-white border-transparent"
                onClick={() => navigate("/adjust")}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Customize Today&apos;s Workout
              </Button>
            </div>
          </Card>
        </section>

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
