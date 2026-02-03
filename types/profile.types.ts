// Profile types
export interface Profile {
  id: string
  username: string
  email: string | null
  avatar_url: string | null
  bio: string | null
  preferences: string[] | null
  created_at: string
}

export interface UpdateProfilePayload {
  username?: string
  avatar_url?: string
  bio?: string
}

export interface UpdatePreferencesPayload {
  preferences: string[]
}
