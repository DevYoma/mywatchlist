import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RatingService } from '@/services'
import type { RateMoviePayload } from '@/types'

export const useRating = (userId: string | undefined, movieId: number | undefined) => {
  const queryClient = useQueryClient()

  const userRatingQuery = useQuery({
    queryKey: ['rating', 'user', userId, movieId],
    queryFn: () => RatingService.getUserRating(userId!, movieId!),
    enabled: !!userId && !!movieId,
  })

  const movieRatingsQuery = useQuery({
    queryKey: ['ratings', 'movie', movieId],
    queryFn: () => RatingService.getMovieRatings(movieId!),
    enabled: !!movieId,
  })

  const recentRatingsQuery = useQuery({
    queryKey: ['ratings', 'recent', movieId],
    queryFn: () => RatingService.getRecentRatings(movieId!, 5),
    enabled: !!movieId,
  })

  const rateMovieMutation = useMutation({
    mutationFn: (payload: RateMoviePayload) =>
      RatingService.rateMovie(userId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', 'user', userId, movieId] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'movie', movieId] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'recent', movieId] })
      queryClient.invalidateQueries({ queryKey: ['profile', 'stats', userId] })
    },
  })

  const deleteRatingMutation = useMutation({
    mutationFn: (ratingId: string) => RatingService.deleteRating(ratingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', 'user', userId, movieId] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'movie', movieId] })
      queryClient.invalidateQueries({ queryKey: ['ratings', 'recent', movieId] })
    },
  })

  // Calculate global average
  const globalAverage = movieRatingsQuery.data && movieRatingsQuery.data.length > 0
    ? movieRatingsQuery.data.reduce((sum: number, r) => sum + r.rating_value, 0) / movieRatingsQuery.data.length
    : null

  return {
    userRating: userRatingQuery.data,
    movieRatings: movieRatingsQuery.data || [],
    recentRatings: recentRatingsQuery.data || [],
    globalAverage,
    totalRatings: movieRatingsQuery.data?.length || 0,
    isLoading: userRatingQuery.isLoading || movieRatingsQuery.isLoading,
    rateMovie: rateMovieMutation.mutate,
    deleteRating: deleteRatingMutation.mutate,
    isRating: rateMovieMutation.isPending,
  }
}

export const useUserRatings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['ratings', 'user', userId],
    queryFn: () => RatingService.getUserRatings(userId!),
    enabled: !!userId,
  })
}
