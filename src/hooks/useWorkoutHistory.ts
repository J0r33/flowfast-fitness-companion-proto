import { useQuery } from '@tanstack/react-query';
import { loadWorkoutHistory } from '@/utils/workoutHistory';
import { WorkoutHistory } from '@/types/workout';
import { useAuth } from '@/contexts/AuthContext';

/**
 * React Query hook for loading and caching workout history.
 * Provides automatic caching and deduplication across components.
 */
export function useWorkoutHistory() {
  const { user } = useAuth();

  return useQuery<WorkoutHistory>({
    queryKey: ['workoutHistory', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return { entries: [] };
      }
      return loadWorkoutHistory(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
