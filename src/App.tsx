import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdjustWorkout from "./pages/AdjustWorkout";
import Session from "./pages/Session";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import WorkoutComplete from "./pages/WorkoutComplete";
import Feedback from "./pages/Feedback";
import History from "./pages/History";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/adjust" element={<AdjustWorkout />} />
          <Route path="/session" element={<Session />} />
          <Route path="/workout/:sessionId/:stepIndex" element={<WorkoutPlayer />} />
          <Route path="/workout/complete" element={<WorkoutComplete />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
