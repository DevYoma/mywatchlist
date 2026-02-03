import { supabase } from '@/lib/supabase'
import type { Rating, RateMoviePayload } from '@/types'

// Rating service - handles all rating-related API calls
export const RatingService = {
  // Get a user's rating for a specific movie
  getUserRating: async (userId: string, movieId: number): Promise<Rating | null> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  },

  // Rate a movie (or update existing rating)
  rateMovie: async (userId: string, payload: RateMoviePayload): Promise<Rating> => {
    // Check if user already rated this movie
    const existing = await RatingService.getUserRating(userId, payload.movie_id)
    
    let result: Rating

    if (existing) {
      // Update existing rating
      const { data, error } = await supabase
        .from('ratings')
        .update({ rating_value: payload.rating_value })
        .eq('id', existing.id)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // Create new rating
      const { data, error } = await supabase
        .from('ratings')
        .insert({
          user_id: userId,
          movie_id: payload.movie_id,
          rating_value: payload.rating_value,
        })
        .select()
        .single()
      
      if (error) throw error
      result = data
    }

    // SYNC: Also update watchlist_movies if this movie is in user's watchlist
    await supabase
      .from('watchlist_movies')
      .update({ rating: payload.rating_value })
      .eq('user_id', userId)
      .eq('tmdb_id', payload.movie_id)

    return result
  },

  // Get all ratings for a movie (for global average)
  getMovieRatings: async (movieId: number): Promise<Rating[]> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get recent ratings for a movie (for activity feed)
  getRecentRatings: async (movieId: number, limit: number = 5): Promise<(Rating & { profile?: { username: string } })[]> => {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profile:profiles(username)
      `)
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Get a user's all ratings
  getUserRatings: async (userId: string): Promise<Rating[]> => {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Delete a rating (also removes from watchlist if present)
  deleteRating: async (ratingId: string): Promise<void> => {
    // First, get the rating to know user_id and movie_id
    const { data: rating, error: fetchError } = await supabase
      .from('ratings')
      .select('user_id, movie_id')
      .eq('id', ratingId)
      .single()
    
    if (fetchError) throw fetchError

    // Remove from watchlist if exists (cascade delete)
    await supabase
      .from('watchlist_movies')
      .delete()
      .eq('user_id', rating.user_id)
      .eq('tmdb_id', rating.movie_id)

    // Then delete the rating
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId)
    
    if (error) throw error
  },
}
