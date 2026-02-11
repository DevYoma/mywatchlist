import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WatchlistsService } from '@/services/watchlists.service'

/**
 * Hook to fetch all watchlists with stats and like counts
 */
export const useAllWatchlists = (currentUserId: string | undefined) => {
  return useQuery({
    queryKey: ['watchlists', 'all', currentUserId],
    queryFn: () => WatchlistsService.getAllWatchlists(currentUserId),
    staleTime: 60000, // Cache for 1 minute
  })
}

/**
 * Hook for like/unlike mutations with optimistic updates
 */
export const useWatchlistLikeMutations = (currentUserId: string | undefined) => {
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: ({ watchlistOwnerId }: { watchlistOwnerId: string }) =>
      WatchlistsService.likeWatchlist(currentUserId!, watchlistOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists', 'all'] })
    },
  })

  const unlikeMutation = useMutation({
    mutationFn: ({ watchlistOwnerId }: { watchlistOwnerId: string }) =>
      WatchlistsService.unlikeWatchlist(currentUserId!, watchlistOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists', 'all'] })
    },
  })

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isLikePending: likeMutation.isPending,
    isUnlikePending: unlikeMutation.isPending,
  }
}
