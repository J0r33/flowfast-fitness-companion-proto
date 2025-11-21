import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowLeft, TrendingUp, Award, Clock, Target } from 'lucide-react';

export default function CaseStudy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">FlowFast</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Success Stories
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real people, real results. See how FlowFast has transformed training routines and helped users reach their fitness goals.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-primary mx-auto" />
            <div className="text-3xl font-bold text-foreground">85%</div>
            <div className="text-sm text-muted-foreground">Increased Consistency</div>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <Clock className="h-8 w-8 text-primary mx-auto" />
            <div className="text-3xl font-bold text-foreground">40min</div>
            <div className="text-sm text-muted-foreground">Avg Workout Time</div>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <Target className="h-8 w-8 text-primary mx-auto" />
            <div className="text-3xl font-bold text-foreground">92%</div>
            <div className="text-sm text-muted-foreground">Goal Achievement</div>
          </Card>
          <Card className="p-6 text-center space-y-2">
            <Award className="h-8 w-8 text-primary mx-auto" />
            <div className="text-3xl font-bold text-foreground">4.8/5</div>
            <div className="text-sm text-muted-foreground">User Rating</div>
          </Card>
        </div>

        {/* Case Study 1 */}
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">From Inconsistent to Unstoppable</h2>
            <p className="text-muted-foreground">Sarah M. • 3 months using FlowFast</p>
          </div>
          
          <div className="space-y-4 text-foreground">
            <p>
              <span className="font-semibold">The Challenge:</span> Sarah struggled with maintaining a consistent workout routine. Her busy schedule made it difficult to plan workouts, and she often felt unmotivated when she didn't know what to do at the gym.
            </p>
            
            <p>
              <span className="font-semibold">The Solution:</span> FlowFast's AI-powered workout recommendations adapted to Sarah's energy levels and available time. The smart planning system ensured she always had a personalized workout ready to go.
            </p>
            
            <p>
              <span className="font-semibold">The Results:</span> In just 3 months, Sarah went from working out 1-2 times per week to maintaining a consistent 4-5 times per week schedule. She lost 12 pounds, increased her strength by 35%, and most importantly—she actually looks forward to her workouts now.
            </p>
            
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
              "FlowFast removed all the guesswork. I just show up, and it tells me exactly what to do based on how I'm feeling that day. It's like having a personal trainer in my pocket."
            </blockquote>
          </div>
        </Card>

        {/* Case Study 2 */}
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Breaking Through Plateaus</h2>
            <p className="text-muted-foreground">Marcus T. • 6 months using FlowFast</p>
          </div>
          
          <div className="space-y-4 text-foreground">
            <p>
              <span className="font-semibold">The Challenge:</span> Marcus had been training for years but hit a plateau. His progress stalled, and he was doing the same workouts week after week without seeing improvements.
            </p>
            
            <p>
              <span className="font-semibold">The Solution:</span> FlowFast's adaptive training system analyzed Marcus's workout history and RPE feedback to intelligently progress his training load. The AI adjusted volume and intensity based on his recovery and performance.
            </p>
            
            <p>
              <span className="font-semibold">The Results:</span> Marcus broke through his plateau, adding 45 pounds to his squat, 30 pounds to his bench press, and improved his body composition significantly. The progressive overload was perfectly calibrated to his recovery capacity.
            </p>
            
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
              "The way FlowFast tracks my RPE and adjusts my workouts is brilliant. It pushes me when I can handle it and backs off when I need recovery. I've made more progress in 6 months than I did in the previous 2 years."
            </blockquote>
          </div>
        </Card>

        {/* Case Study 3 */}
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Busy Professional, Better Results</h2>
            <p className="text-muted-foreground">Jennifer K. • 4 months using FlowFast</p>
          </div>
          
          <div className="space-y-4 text-foreground">
            <p>
              <span className="font-semibold">The Challenge:</span> As a working mom with limited time, Jennifer needed efficient workouts that fit her schedule. She had minimal equipment at home and couldn't commit to long gym sessions.
            </p>
            
            <p>
              <span className="font-semibold">The Solution:</span> FlowFast's equipment-based workout generation created effective 20-30 minute home workouts using just dumbbells and a resistance band. The time-based planning ensured every workout fit her schedule.
            </p>
            
            <p>
              <span className="font-semibold">The Results:</span> Jennifer lost 18 pounds, built noticeable muscle tone, and improved her energy levels dramatically. She now works out 5 days a week without sacrificing family time.
            </p>
            
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
              "I don't have time to waste on ineffective workouts. FlowFast gives me exactly what I need in the time I have. The results speak for themselves."
            </blockquote>
          </div>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold text-foreground">Ready to Write Your Success Story?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who have transformed their training with FlowFast's intelligent workout planning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/')}>
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 FlowFast. Your AI Fitness Companion.</p>
        </div>
      </footer>
    </div>
  );
}
