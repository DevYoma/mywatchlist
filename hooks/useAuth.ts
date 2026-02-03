import { useQuery } from '@tanstack/react-query'
import { AuthService } from '@/services'
import type { User } from '@supabase/supabase-js'

/**
 * Hook to get current authenticated user
 * Uses React Query to cache and manage auth state
 */
export function useAuth() {
  const query = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async (): Promise<User | null> => {
      try {
        return await AuthService.getUser()
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry if user is not logged in
  })

  return {
    user: query.data ?? null,
    isLoggedIn: !!query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
