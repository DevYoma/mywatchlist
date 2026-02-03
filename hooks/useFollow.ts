import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FollowService } from '@/services'

export const useFollow = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  const followersQuery = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => FollowService.getFollowers(userId!),
    enabled: !!userId,
  })

  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: () => FollowService.getFollowing(userId!),
    enabled: !!userId,
  })

  const followerCountQuery = useQuery({
    queryKey: ['followerCount', userId],
    queryFn: () => FollowService.getFollowerCount(userId!),
    enabled: !!userId,
  })

  const followingCountQuery = useQuery({
    queryKey: ['followingCount', userId],
    queryFn: () => FollowService.getFollowingCount(userId!),
    enabled: !!userId,
  })

  const followMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      FollowService.followUser(userId!, targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] })
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['followingCount', userId] })
      queryClient.invalidateQueries({ queryKey: ['followerCount', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId, targetUserId] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      FollowService.unfollowUser(userId!, targetUserId),
    onSuccess: (_, targetUserId) => {
      queryClient.invalidateQueries({ queryKey: ['following', userId] })
      queryClient.invalidateQueries({ queryKey: ['followers', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['followingCount', userId] })
      queryClient.invalidateQueries({ queryKey: ['followerCount', targetUserId] })
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userId, targetUserId] })
    },
  })

  return {
    followers: followersQuery.data || [],
    following: followingQuery.data || [],
    followerCount: followerCountQuery.data || 0,
    followingCount: followingCountQuery.data || 0,
    isLoadingFollowers: followersQuery.isLoading,
    isLoadingFollowing: followingQuery.isLoading,
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
  }
}

export const useIsFollowing = (followerId: string | undefined, followingId: string | undefined) => {
  return useQuery({
    queryKey: ['isFollowing', followerId, followingId],
    queryFn: () => FollowService.isFollowing(followerId!, followingId!),
    enabled: !!followerId && !!followingId,
  })
}
