import { supabase } from '@/lib/supabase'
import type { WatchlistMovie, AddToWatchlistPayload, UpdateWatchlistMoviePayload } from '@/types'

// Watchlist service - handles watchlist CRUD operations
export const WatchlistService = {
  getWatchlist: async (userId: string): Promise<WatchlistMovie[]> => {
    const { data, error } = await supabase
      .from('watchlist_movies')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  addToWatchlist: async (userId: string, payload: AddToWatchlistPayload): Promise<WatchlistMovie> => {
    const { data, error } = await supabase
      .from('watchlist_movies')
      .insert({
        user_id: userId,
        ...payload,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  removeFromWatchlist: async (watchlistId: string): Promise<void> => {
    const { error } = await supabase
      .from('watchlist_movies')
      .delete()
      .eq('id', watchlistId)
    
    if (error) throw error
  },

  updateWatchlistMovie: async (watchlistId: string, payload: UpdateWatchlistMoviePayload): Promise<WatchlistMovie> => {
    const { data, error } = await supabase
      .from('watchlist_movies')
      .update(payload)
      .eq('id', watchlistId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  isInWatchlist: async (userId: string, tmdbId: number): Promise<boolean> => {
    const { data } = await supabase
      .from('watchlist_movies')
      .select('id')
      .eq('user_id', userId)
      .eq('tmdb_id', tmdbId)
      .single()
    
    return !!data
  },
}
