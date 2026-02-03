// Watchlist types
export interface WatchlistMovie {
  id: string
  user_id: string
  movie_id: number
  title: string
  poster_path: string | null
  tmdb_id: number
  rating: number | null
  watched: boolean
  added_at: string
}

export interface AddToWatchlistPayload {
  movie_id: number
  title: string
  poster_path?: string
  tmdb_id: number
  rating?: number // Include rating when adding to watchlist
}

export interface UpdateWatchlistMoviePayload {
  rating?: number
  watched?: boolean
}
