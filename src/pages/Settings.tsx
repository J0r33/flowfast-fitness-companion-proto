import { MobileNav } from '@/components/MobileNav';
import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-card border-b border-border px-6 py-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-6">
        <Card className="p-12 text-center">
          <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground">
            Customize your preferences and manage your profile
          </p>
        </Card>
      </main>

      <MobileNav />
    </div>
  );
}
