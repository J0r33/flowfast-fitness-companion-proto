import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Activity, Dumbbell, Zap, Calendar, TrendingUp, Target } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Activity className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold">FlowFast</h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl text-muted-foreground">AI-Powered Adaptive Workouts That Evolve With You</p>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl">
            FlowFast generates personalized strength training workouts based on your goals, available equipment, and
            energy levels. Our adaptive AI learns from your feedback to create the perfect workout every time.
          </p>

          {/* CTA Button */}
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6 mt-4">
            Get Started Free
          </Button>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 w-full">
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Adaptive AI</h3>
              <p className="text-sm text-muted-foreground">Workouts that adjust based on your feedback and progress</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Goal-Focused</h3>
              <p className="text-sm text-muted-foreground">Tailored to your fitness goals and available equipment</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Track History</h3>
              <p className="text-sm text-muted-foreground">
                Calendar view of all your workouts with detailed breakdowns
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card border border-border">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">See Progress</h3>
              <p className="text-sm text-muted-foreground">Visualize your training volume and intensity over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
