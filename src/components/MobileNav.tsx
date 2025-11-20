import { Home, Settings, Calendar, BarChart3, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/history', icon: Calendar, label: 'History' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-3 safe-area-inset-bottom shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 transition-all min-h-[44px] min-w-[44px] justify-center rounded-lg ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              aria-label={label}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 transition-all text-muted-foreground hover:text-foreground hover:bg-muted min-h-[44px] min-w-[44px] justify-center rounded-lg"
          aria-label="Sign Out"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
