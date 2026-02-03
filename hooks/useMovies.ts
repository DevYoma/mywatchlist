import { useQuery } from '@tanstack/react-query'
import { TMDBService } from '@/services'

export const useTrending = (timeWindow: 'day' | 'week' = 'week') => {
  return useQuery({
    queryKey: ['movies', 'trending', timeWindow],
    queryFn: () => TMDBService.getTrending(timeWindow),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

export const useSearchMovies = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => TMDBService.searchMovies(query, page),
    enabled: query.length > 2, // Only search when query is at least 3 chars
  })
}

export const useMovieDetails = (movieId: number | undefined) => {
  return useQuery({
    queryKey: ['movies', 'details', movieId],
    queryFn: () => TMDBService.getMovieDetails(movieId!),
    enabled: !!movieId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

export const usePopularMovies = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => TMDBService.getPopular(page),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTopRatedMovies = (page: number = 1) => {
  return useQuery({
    queryKey: ['movies', 'top-rated', page],
    queryFn: () => TMDBService.getTopRated(page),
    staleTime: 5 * 60 * 1000,
  })
}

// Re-export the image URL helper for convenience
export { TMDBService } from '@/services'
