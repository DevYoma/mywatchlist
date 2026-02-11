import { supabase } from '@/lib/supabase'

export interface WatchlistItem {
  id: string
  owner: {
    id: string
    username: string
    avatar_url: string | null
  }
  total_ratings: number
  like_count: number
  is_liked_by_current_user: boolean
  recent_movies: Array<{
    movie_id: number
    rating_value: number
    poster_path: string | null
  }>
}

export const WatchlistsService = {
  /**
   * Get all users' watchlists with like counts, sorted by likes
   */
  getAllWatchlists: async (currentUserId?: string): Promise<WatchlistItem[]> => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .order('username')

      if (profilesError) throw profilesError
      if (!profiles) return []

      // Get all ratings with movie details
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select('user_id, movie_id, rating_value')
        .order('created_at', { ascending: false })
      
      if (ratingsError) throw ratingsError

      // Get like counts for each user's watchlist
      const { data: likes, error: likesError } = await supabase
        .from('watchlist_likes')
        .select('watchlist_owner_id, user_id')

      if (likesError) throw likesError

      // Group ratings by user
      const ratingsMap = new Map<string, any[]>()
      ratings?.forEach((rating: any) => {
        if (!ratingsMap.has(rating.user_id)) {
          ratingsMap.set(rating.user_id, [])
        }
        ratingsMap.get(rating.user_id)!.push(rating)
      })

      // Count likes per user
      const likesMap = new Map<string, number>()
      const currentUserLikes = new Set<string>()
      
      likes?.forEach((like: any) => {
        likesMap.set(like.watchlist_owner_id, (likesMap.get(like.watchlist_owner_id) || 0) + 1)
        if (currentUserId && like.user_id === currentUserId) {
          currentUserLikes.add(like.watchlist_owner_id)
        }
      })

      // Build watchlist items
      const watchlists: WatchlistItem[] = []
      
      for (const profile of profiles) {
        const userRatings = ratingsMap.get(profile.id) || []
        if (userRatings.length === 0) continue // Skip users with no ratings

        watchlists.push({
          id: profile.id,
          owner: {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
          },
          total_ratings: userRatings.length,
          like_count: likesMap.get(profile.id) || 0,
          is_liked_by_current_user: currentUserLikes.has(profile.id),
          recent_movies: userRatings.slice(0, 4).map(r => ({
            movie_id: r.movie_id,
            rating_value: r.rating_value,
            poster_path: null, // Will be fetched from TMDB in component
          })),
        })
      }

      // Sort by like count (descending), then by total ratings
      watchlists.sort((a, b) => {
        if (b.like_count !== a.like_count) {
          return b.like_count - a.like_count
        }
        return b.total_ratings - a.total_ratings
      })

      return watchlists
    } catch (error) {
      console.error('Error fetching watchlists:', error)
      return []
    }
  },

  /**
   * Like a user's watchlist
   */
  likeWatchlist: async (userId: string, watchlistOwnerId: string): Promise<void> => {
    const { error } = await supabase
      .from('watchlist_likes')
      .insert({
        user_id: userId,
        watchlist_owner_id: watchlistOwnerId,
      })

    if (error) throw error
  },

  /**
   * Unlike a user's watchlist
   */
  unlikeWatchlist: async (userId: string, watchlistOwnerId: string): Promise<void> => {
    const { error } = await supabase
      .from('watchlist_likes')
      .delete()
      .eq('user_id', userId)
      .eq('watchlist_owner_id', watchlistOwnerId)

    if (error) throw error
  },
}
