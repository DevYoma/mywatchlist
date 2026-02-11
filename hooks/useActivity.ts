import { useQuery } from '@tanstack/react-query'
import { ActivityService } from '@/services/activity.service'

/**
 * Hook to fetch recent ratings from users the current user follows
 * Auto-refreshes every 60 seconds to show latest activity
 */
export const useFollowingActivity = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['activity', 'following', userId],
    queryFn: () => ActivityService.getFollowingActivity(userId!),
    enabled: !!userId,
    refetchInterval: 60000, // Auto-refresh every 60 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  })
}
