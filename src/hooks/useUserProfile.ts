import { useQuery } from '@tanstack/react-query';
import { loadUserProfile } from '@/utils/profileSync';
import { WeeklyGoals } from '@/types/workout';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileData {
  equipment: string[];
  goals: WeeklyGoals;
  displayName: string | null;
}

/**
 * React Query hook for loading and caching user profile data.
 * Provides automatic caching and deduplication across components.
 */
export function useUserProfile() {
  const { user } = useAuth();

  return useQuery<UserProfileData>({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      return loadUserProfile();
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
