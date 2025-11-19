import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AdjustWorkout from "./pages/AdjustWorkout";
import Session from "./pages/Session";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import WorkoutComplete from "./pages/WorkoutComplete";
import Feedback from "./pages/Feedback";
import History from "./pages/History";
import WorkoutDetail from "./pages/WorkoutDetail";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/adjust" element={<ProtectedRoute><AdjustWorkout /></ProtectedRoute>} />
            <Route path="/session" element={<ProtectedRoute><Session /></ProtectedRoute>} />
            <Route path="/workout/:sessionId/:stepIndex" element={<ProtectedRoute><WorkoutPlayer /></ProtectedRoute>} />
            <Route path="/workout/complete" element={<ProtectedRoute><WorkoutComplete /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/history/:workoutId" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
            <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
