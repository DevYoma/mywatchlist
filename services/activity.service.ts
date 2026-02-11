import { supabase } from '@/lib/supabase'
import { TMDBService } from './tmdb.service'

export interface ActivityItem {
  id: string
  user: {
    id: string
    username: string
    avatar_url: string | null
  }
  movie: {
    id: number
    title: string
    poster_path: string | null
  }
  rating: number
  created_at: string
}

export const ActivityService = {
  /**
   * Get recent ratings from users that the current user follows
   */
  getFollowingActivity: async (userId: string, limit = 20): Promise<ActivityItem[]> => {
    try {
      // Get list of users the current user follows
      const { data: following, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)

      if (followError) throw followError
      if (!following || following.length === 0) return []

      const followingIds = following.map(f => f.following_id)

      // Get recent ratings from followed users
      const { data: ratings, error: ratingsError } = await supabase
        .from('ratings')
        .select(`
          id,
          user_id,
          movie_id,
          rating_value,
          created_at,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (ratingsError) throw ratingsError
      if (!ratings || ratings.length === 0) return []

      // Fetch movie details from TMDB for each rating
      const activityItems: ActivityItem[] = await Promise.all(
        ratings.map(async (rating: any) => {
          const movieDetails = await TMDBService.getMovieDetails(rating.movie_id)
          
          return {
            id: rating.id,
            user: {
              id: rating.profiles.id,
              username: rating.profiles.username,
              avatar_url: rating.profiles.avatar_url,
            },
            movie: {
              id: rating.movie_id,
              title: movieDetails.title,
              poster_path: movieDetails.poster_path,
            },
            rating: rating.rating_value,
            created_at: rating.created_at,
          }
        })
      )

      return activityItems
    } catch (error) {
      console.error('Error fetching following activity:', error)
      return []
    }
  },
}
