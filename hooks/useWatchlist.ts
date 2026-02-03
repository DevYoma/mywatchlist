import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WatchlistService } from '@/services'
import type { AddToWatchlistPayload, UpdateWatchlistMoviePayload } from '@/types'

export const useWatchlist = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  const watchlistQuery = useQuery({
    queryKey: ['watchlist', userId],
    queryFn: () => WatchlistService.getWatchlist(userId!),
    enabled: !!userId,
  })

  const addToWatchlistMutation = useMutation({
    mutationFn: (payload: AddToWatchlistPayload) =>
      WatchlistService.addToWatchlist(userId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', userId] })
    },
  })

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (watchlistId: string) =>
      WatchlistService.removeFromWatchlist(watchlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', userId] })
    },
  })

  const updateWatchlistMovieMutation = useMutation({
    mutationFn: ({ watchlistId, payload }: { watchlistId: string; payload: UpdateWatchlistMoviePayload }) =>
      WatchlistService.updateWatchlistMovie(watchlistId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', userId] })
    },
  })

  return {
    watchlist: watchlistQuery.data || [],
    isLoading: watchlistQuery.isLoading,
    error: watchlistQuery.error,
    addToWatchlist: addToWatchlistMutation.mutate,
    removeFromWatchlist: removeFromWatchlistMutation.mutate,
    updateWatchlistMovie: updateWatchlistMovieMutation.mutate,
    isAdding: addToWatchlistMutation.isPending,
    isRemoving: removeFromWatchlistMutation.isPending,
  }
}

export const useIsInWatchlist = (userId: string | undefined, tmdbId: number) => {
  return useQuery({
    queryKey: ['watchlist', 'check', userId, tmdbId],
    queryFn: () => WatchlistService.isInWatchlist(userId!, tmdbId),
    enabled: !!userId,
  })
}
