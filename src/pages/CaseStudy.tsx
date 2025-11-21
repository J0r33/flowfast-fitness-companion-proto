import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Brain,
  Dumbbell,
  Layers,
  LineChart,
  Rocket,
  Users,
  ArrowLeft,
  Sparkles,
  Settings2,
} from "lucide-react";

export default function CaseStudy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted pb-16">
      {/* Header / Hero */}
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to app
          </button>
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-primary" />
            FlowFast · Product Case Study
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-10 space-y-10">
        {/* Hero / Intro */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-native Product Management · Solo build
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            FlowFast: An AI-Driven Adaptive Workout Coach
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            FlowFast is a fully functional AI fitness companion I designed and built end-to-end to demonstrate how I
            approach <strong>AI-native product development</strong> as a <strong>technical Product Manager</strong>:
            from problem framing and system design to experimentation and implementation.
          </p>

          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="outline">Role: Product Management · UX · IC Builder</Badge>
            <Badge variant="outline">Stack: React · TypeScript · Supabase · AI Functions</Badge>
            <Badge variant="outline">Focus: Rapid prototyping, personalization, feedback loops</Badge>
          </div>
        </section>

        {/* Snapshot Cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Target users</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Time-constrained professionals who want strength training guidance without manually programming workouts.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Problem framing</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Existing apps either feel generic or force heavy manual setup. Users want <strong>smart defaults</strong>{" "}
              that adapt to their energy, time, equipment, and progress.
            </p>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Outcome</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              A production-style prototype that generates, tracks, and adapts workouts in real time, showing how I turn
              ambiguous AI opportunities into concrete product flows.
            </p>
          </Card>
        </section>

        {/* Vision & Product Story */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Product vision</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            FlowFast&apos;s vision is to become a <strong>personalized training layer</strong> that sits between users
            and the gym: intelligently planning each session, adapting to constraints, and learning from every workout.
            For this prototype, I focused on:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2 max-w-3xl">
            <li>
              Proving that <strong>AI can make strength programming feel effortless</strong> while still respecting best
              practices.
            </li>
            <li>
              Designing <strong>closed feedback loops</strong> (history → stats → recommendations → new plan) that
              showcase real personalization.
            </li>
            <li>
              Building a system that is <strong>transparent and inspectable</strong> for recruiters and technical
              stakeholders.
            </li>
          </ul>
        </section>

        {/* System Architecture & AI */}
        <section className="grid gap-8 md:grid-cols-[1.7fr,1.3fr] items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              System architecture &amp; AI design
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I treated FlowFast like a real product: start from user journeys, then design data contracts and AI
              surfaces. The core system has three feedback loops:
            </p>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
              <li>
                <span className="font-medium text-foreground">Plan → Play → Feedback.</span> The app generates a
                session, guides the user through a step-by-step player, then collects RPE, satisfaction, and energy
                post-workout.
              </li>
              <li>
                <span className="font-medium text-foreground">Feedback → History → Metrics.</span> Each session writes a
                structured history row (sets, estimated calories, energy, difficulty), which powers streaks, volume, and
                effort analytics.
              </li>
              <li>
                <span className="font-medium text-foreground">Metrics → Recommendation → Next plan.</span> An adaptive
                layer uses recent history, weekly goals, and equipment to recommend whether today should be a push,
                maintain, recovery, or catch-up day, then passes that context into the workout generator.
              </li>
            </ol>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under the hood, the app uses <strong>Supabase</strong> for auth and data, React + TypeScript on the
              client, and server functions to orchestrate AI prompts. I defined explicit types for workout plans,
              history entries, and adaptation metrics to keep the AI integration deterministic and debuggable.
            </p>
          </div>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Key product &amp; tech decisions
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">AI as a planner, not a black box.</span> LLM output is
                normalized into a typed workout plan structure rather than rendered raw.
              </li>
              <li>
                <span className="font-semibold text-foreground">History as the source of truth.</span> All adaptation
                logic reads from workout_history, so new models can be plugged in without changing UX.
              </li>
              <li>
                <span className="font-semibold text-foreground">Mobile-first UX.</span> Flow and components are tuned
                for phones, reflecting realistic usage.
              </li>
            </ul>
          </Card>
        </section>

        {/* Key User Flows */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Key user flows</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                1. Onboarding &amp; preferences
              </h3>
              <p className="text-sm text-muted-foreground">
                Users define equipment, weekly goals, and training focus. I scoped this to a single page with sensible
                defaults to minimize friction while still enabling meaningful personalization.
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                2. Generate today&apos;s workout
              </h3>
              <p className="text-sm text-muted-foreground">
                Two paths: a <strong>Smart Auto Plan</strong> that uses history and goals, and a{" "}
                <strong>Customize Today</strong> flow where users set energy, time, and areas of focus. This shows how I
                design parallel entry points for different user mindsets.
              </p>
            </Card>

            <Card className="p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                3. Play, reflect, and adapt
              </h3>
              <p className="text-sm text-muted-foreground">
                A structured workout player captures weights and effort, followed by a feedback flow that updates
                history, streaks, weekly stats, and future recommendations.
              </p>
            </Card>
          </div>
        </section>

        {/* Metrics & What I’d do next */}
        <section className="grid gap-8 md:grid-cols-[1.4fr,1.6fr] items-start">
          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Example success metrics (if this shipped)
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <span className="font-semibold text-foreground">Activation:</span> Percentage of new users who complete
                a generated workout within 48 hours.
              </li>
              <li>
                <span className="font-semibold text-foreground">Engagement:</span> Weekly active users and average
                workouts per week.
              </li>
              <li>
                <span className="font-semibold text-foreground">Quality:</span> Distribution of feedback difficulty (too
                easy / just right / too hard) over time.
              </li>
              <li>
                <span className="font-semibold text-foreground">Retention:</span> Streak length and 4-week retention for
                users who complete at least three sessions.
              </li>
            </ul>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              If I continued this as a PM
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Run usability tests on the generation and feedback flows to reduce friction further.</li>
              <li>
                Experiment with A/B variants of recommendation logic (for example, more aggressive push vs conservative
                recovery bias).
              </li>
              <li>
                Add social proof and habit loops (such as streak celebrations and weekly recaps) to increase long-term
                engagement.
              </li>
              <li>
                Integrate wearable data (heart rate, steps) as additional signals for recovery and load management.
              </li>
            </ul>
          </Card>
        </section>

        {/* Closing / Personal positioning */}
        <section className="mt-6 border border-dashed border-border rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">What this project says about me as a Product Manager</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            FlowFast is intentionally <strong>end-to-end</strong>: from auth and state management to AI orchestration,
            UX flows, and data modeling. I built it this way so hiring managers and technical peers can see how I:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li>Frame user problems and translate them into clear, testable product capabilities.</li>
            <li>Design systems where AI is a thoughtful collaborator, not a novelty feature.</li>
            <li>Work comfortably across UX, data, and engineering details to de-risk execution.</li>
            <li>Prototype quickly while maintaining structure that can scale into a real product.</li>
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="default" onClick={() => navigate("/auth")}>
              Explore the live product
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
