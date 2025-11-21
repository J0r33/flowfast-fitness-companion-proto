import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { loadUserProfile } from "@/utils/profileSync";
import { WeeklyGoals } from "@/types/workout";

// 🔹 This matches what loadUserProfile() actually returns
export interface AccountProfile {
  equipment: string[];
  goals: WeeklyGoals;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean; // auth (Supabase) loading
  profile: AccountProfile | null;
  profileLoading: boolean; // account/profile loading
  needsOnboarding: boolean; // true if displayName is empty
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 🔐 Auth state (Supabase)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 👤 Account profile (equipment, goals, displayName)
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      try {
        const p = await loadUserProfile(); // { equipment, goals, displayName }
        if (!cancelled) {
          setProfile(p);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        if (!cancelled) {
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          displayName,
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const needsOnboarding =
    !profileLoading && profile !== null && (!profile.displayName || profile.displayName === "User");

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        profileLoading,
        needsOnboarding,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
