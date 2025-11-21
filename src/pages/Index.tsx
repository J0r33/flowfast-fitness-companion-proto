import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Activity className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold tracking-tight">FlowFast</h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl font-semibold text-muted-foreground">AI-Driven Fitness, Powered by Product Thinking</p>

          {/* Narrative Pitch */}
          <p className="text-lg text-muted-foreground max-w-2xl">
            FlowFast is a fully-featured AI fitness platform designed, architected, and built to demonstrate my ability
            as a <span className="font-semibold text-foreground">technical Product Manager</span>
            to rapidly prototype with AI, translate user needs into product capabilities, and ship end-to-end
            experiences. <br />
            <br />
            The system dynamically generates strength-based workouts using adaptive models, personalization signals, and
            continuous feedback loops, showcasing a full product lifecycle from ideation to implementation.
          </p>

          {/* CTA */}
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-10 py-6 mt-4">
            Explore the Demo
          </Button>

          {/* Product Capabilities Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-6">What This Build Demonstrates</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              FlowFast is not just a workout generator, it’s a hands-on example of how I approach AI-native product
              development. Every feature showcases product strategy, user-centric thinking, and execution across data,
              UX, and engineering.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {/* 1: Adaptive AI */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Adaptive AI Engine</h3>
              <p className="text-sm text-muted-foreground">
                Dynamically generates personalized workouts using behavioral data, energy levels, goals, and feedback
                loops.
              </p>
            </div>

            {/* 2: Goal segmentation */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">User Goal Segmentation</h3>
              <p className="text-sm text-muted-foreground">
                System tailors exercises, difficulty, set/rep schemes, and movement types based on long-term goals.
              </p>
            </div>

            {/* 3: Workout generation logic */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Context-Aware Session Builder</h3>
              <p className="text-sm text-muted-foreground">
                Uses constraints like available time, equipment, and target muscle groups to intelligently structure
                sessions.
              </p>
            </div>

            {/* 4: Calendar & history */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Full Workout History System</h3>
              <p className="text-sm text-muted-foreground">
                Calendar views, detailed session breakdowns, weight tracking, and training metadata storage.
              </p>
            </div>

            {/* 5: Progress & insights */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Insights & Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Structured analytics on training volume, energy levels, adherence, and performance trends.
              </p>
            </div>

            {/* 6: PM skills callout */}
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI-Native Product Thinking</h3>
              <p className="text-sm text-muted-foreground">
                Demonstrates capability in ideation, user-centered design, roadmap execution, rapid prototyping, and
                delivering polished end-to-end experiences.
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mt-12 max-w-2xl leading-relaxed">
            This project was built to showcase my ability to turn ambiguous AI opportunities into clear product
            outcomes, and to design systems that learn, adapt, and deliver real user value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
