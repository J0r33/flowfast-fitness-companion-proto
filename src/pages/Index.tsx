import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Dumbbell, Zap, Calendar, TrendingUp, Target, Sparkles } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Auto-redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* 🌟 Cyan Header (non-sticky) */}
      <header className="bg-primary text-primary-foreground px-6 pt-10 pb-10 rounded-b-3xl shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">FlowFast</h1>
            <p className="text-lg md:text-2xl font-semibold text-primary-foreground/90">
              AI-Driven Fitness, Powered by Product Thinking
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Hero / Story + CTAs */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)] items-start">
          {/* Left: narrative */}
          <div className="space-y-6 text-left">
            <Badge className="mb-2 w-fit" variant="outline">
              Product-managed AI prototype · Solo build
            </Badge>

            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              An end-to-end AI fitness product, built as a PM portfolio piece
            </h2>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              FlowFast is a fully-featured AI fitness platform designed and built to show how I operate as a technical
              Product Manager. The app connects user goals, constraints, and feedback into a cohesive product system
              instead of a one-off demo.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed">
              Under the hood, it generates strength-based workouts using adaptive logic, reacts to weekly goals and
              energy levels, and closes the loop with history, stats, and recommendations.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Translate messy user needs into concrete AI-powered workflows.</li>
              <li>Design data models and feedback loops that make personalization real.</li>
              <li>Ship a complete, interactive experience instead of a static prototype.</li>
            </ul>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-base md:text-lg px-8 md:px-12 py-5">
                Explore the Demo
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/case-study")}
                className="text-base md:text-lg px-8 md:px-12 py-5"
              >
                PM Case Study
              </Button>
            </div>
          </div>

          {/* Right: product snapshot card */}
          <Card className="p-6 space-y-4 bg-card/80 border border-border shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Product snapshot</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">Core experience</span>
                <span className="text-right">
                  AI-generated strength sessions, workout player, feedback, and adaptive recommendations.
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">Tech stack</span>
                <span className="text-right">React, TypeScript, Supabase, serverless AI functions.</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-foreground">PM focus</span>
                <span className="text-right">
                  Rapid prototyping, system design, UX flows, and measurable product outcomes.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
              <p>Built to be read like a real product: clear data model, understandable AI surface, and visible UX.</p>
            </div>
          </Card>
        </section>

        {/* What this build demonstrates */}
        <section className="space-y-4">
          <div className="space-y-2 text-left max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold">What this build demonstrates</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              FlowFast is not just a workout generator. It is a concrete example of how I approach AI-native product
              development: start from user journeys, design the system around them, and only then wire in the model.
              Every surface in the app exists to support a real job to be done.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* 1: Adaptive AI */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Adaptive AI Engine</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Uses history, energy, and goals to generate workouts that feel personalized without manual programming.
              </p>
            </Card>

            {/* 2: Goal segmentation */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Goal-Based Segmentation</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Adjusts movement types, intensity, and progression based on whether a user is training for strength,
                muscle, endurance, or general fitness.
              </p>
            </Card>

            {/* 3: Workout generation logic */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Context-Aware Session Builder</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Builds sessions around real constraints: time available, equipment on hand, and target muscle groups.
              </p>
            </Card>

            {/* 4: Calendar & history */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Workout History System</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Stores every session with sets, estimated calories, RPE, and focus areas, displayed in calendar and
                detail views.
              </p>
            </Card>

            {/* 5: Progress & insights */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Insights & Progress Tracking</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Surfaces training volume, streaks, weekly workload, and effort patterns so users see progress over time.
              </p>
            </Card>

            {/* 6: PM skills callout */}
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">AI-Native Product Thinking</h3>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Shows how I move from opportunity to architecture to working product, while keeping the experience
                simple enough for real users.
              </p>
            </Card>
          </div>
        </section>

        {/* Closing positioning card */}
        <section>
          <Card className="p-6 md:p-8 space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold">Why this project is in my portfolio</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              FlowFast is intentionally built as a complete product slice: authentication, state management, workout
              generation, history, stats, and adaptive logic all working together. It is meant to give recruiters and
              hiring managers a realistic view of how I think, scope, and ship AI-powered features.
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              If you want to understand how I approach product work, the best way is to click into the app, explore a
              generated session, and skim the PM case study that explains the architecture and tradeoffs behind it.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => navigate("/auth")}>Try a generated workout</Button>
              <Button variant="outline" onClick={() => navigate("/case-study")}>
                Read the PM case study
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
