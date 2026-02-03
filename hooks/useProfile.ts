import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProfileService } from '@/services'
import type { UpdateProfilePayload } from '@/types'

export const useProfile = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => ProfileService.getProfile(userId!),
    enabled: !!userId,
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      ProfileService.updateProfile(userId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })

  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: string[]) =>
      ProfileService.updatePreferences(userId!, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updateProfileMutation.isPending || updatePreferencesMutation.isPending,
  }
}

export const useProfileByUsername = (username: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: () => ProfileService.getProfileByUsername(username!),
    enabled: !!username,
  })
}

export const useProfileStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', 'stats', userId],
    queryFn: () => ProfileService.getProfileStats(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // Cache for 1 minute
  })
}

export const useCheckUsername = (username: string, currentUsername?: string) => {
  return useQuery({
    queryKey: ['username', 'check', username],
    queryFn: () => ProfileService.checkUsernameExists(username),
    enabled: username.length >= 3 && username !== currentUsername,
    staleTime: 30 * 1000, // Cache for 30 seconds
  })
}
