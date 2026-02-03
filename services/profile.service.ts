import { supabase } from '@/lib/supabase'
import type { Profile, UpdateProfilePayload } from '@/types'

// Profile service - handles profile CRUD operations
export const ProfileService = {
  getProfile: async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  getProfileByUsername: async (username: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  updateProfile: async (userId: string, payload: UpdateProfilePayload): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  updatePreferences: async (userId: string, preferences: string[]): Promise<Profile> => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ preferences })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  checkUsernameExists: async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()
    
    return !!data
  },

  getProfileStats: async (userId: string) => {
    // Get movies rated count and average
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating_value')
      .eq('user_id', userId)

    const moviesRated = ratings?.length || 0
    const avgRating = moviesRated > 0 
      ? (ratings!.reduce((sum, r) => sum + r.rating_value, 0) / moviesRated).toFixed(1)
      : '0.0'

    // Get followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    return {
      moviesRated,
      avgRating,
      followers: followersCount || 0,
    }
  },
}

