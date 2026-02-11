import { useQuery } from '@tanstack/react-query'
import { ActivityService } from '@/services'

/**
 * Get count of unread activities (activities created after user's last visit)
 * For now, we'll just show count of activities in last 24 hours
 */
export const useUnreadActivityCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['activity', 'unread', userId],
    queryFn: async () => {
      if (!userId) return 0
      
      const activities = await ActivityService.getFollowingActivity(userId, 50)
      
      // Count activities from last 24 hours
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)
      
      const recentCount = activities.filter(activity => {
        const activityDate = new Date(activity.created_at.replace(' ', 'T') + 'Z')
        return activityDate > oneDayAgo
      }).length
      
      return recentCount
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  })
}
