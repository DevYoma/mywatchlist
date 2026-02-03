import { supabase } from '@/lib/supabase'
import type { Follow, FollowUser } from '@/types'

// Follow service - handles follow/unfollow operations
export const FollowService = {
  followUser: async (followerId: string, followingId: string): Promise<Follow> => {
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  unfollowUser: async (followerId: string, followingId: string): Promise<void> => {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
    
    if (error) throw error
  },

  getFollowers: async (userId: string): Promise<FollowUser[]> => {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:profiles!follows_follower_id_fkey(id, username, avatar_url)
      `)
      .eq('following_id', userId)
    
    if (error) throw error
    return data?.map(d => d.follower as unknown as FollowUser) || []
  },

  getFollowing: async (userId: string): Promise<FollowUser[]> => {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:profiles!follows_following_id_fkey(id, username, avatar_url)
      `)
      .eq('follower_id', userId)
    
    if (error) throw error
    return data?.map(d => d.following as unknown as FollowUser) || []
  },

  isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    
    return !!data
  },

  getFollowerCount: async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
    
    return count || 0
  },

  getFollowingCount: async (userId: string): Promise<number> => {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)
    
    return count || 0
  },
}
