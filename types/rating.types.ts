// Rating types
export interface Rating {
  id: string
  user_id: string
  movie_id: number
  rating_value: number
  created_at: string
}

export interface RateMoviePayload {
  movie_id: number
  rating_value: number
}
