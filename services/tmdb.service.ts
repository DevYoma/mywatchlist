import type { TMDBMovie, TMDBMovieDetails, TMDBSearchResponse } from '@/types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

// TMDB service - handles all TMDB API calls
export const TMDBService = {
  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovie[]> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch trending movies')
    
    const data: TMDBSearchResponse = await response.json()
    return data.results
  },

  searchMovies: async (query: string, page: number = 1): Promise<TMDBSearchResponse> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    )
    
    if (!response.ok) throw new Error('Failed to search movies')
    
    return response.json()
  },

  getMovieDetails: async (movieId: number): Promise<TMDBMovieDetails> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch movie details')
    
    return response.json()
  },

  getPopular: async (page: number = 1): Promise<TMDBSearchResponse> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch popular movies')
    
    return response.json()
  },

  getTopRated: async (page: number = 1): Promise<TMDBSearchResponse> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch top rated movies')
    
    return response.json()
  },

  // Helper to build image URLs
  getImageUrl: (path: string | null, size: 'w200' | 'w500' | 'w300' | 'original' = 'w500'): string | null => {
    if (!path) return null
    return `https://image.tmdb.org/t/p/${size}${path}`
  },
}
