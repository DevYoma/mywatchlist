// Follow types
export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// Extended profile for followers/following lists
export interface FollowUser {
  id: string
  username: string
  avatar_url: string | null
}
