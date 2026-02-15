'use client'

import Link from 'next/link'
import { useIsFollowing, useFollowMutations, useAuth } from '@/hooks'
import { toast } from 'sonner'
import type { Profile } from '@/types'

interface ProfileActionsProps {
  profile: Profile | null
  isOwner: boolean
  isLoggedIn: boolean
}

export function ProfileActions({ profile, isOwner, isLoggedIn }: ProfileActionsProps) {
  // ALL hooks must be called unconditionally (React Rules of Hooks)
  const { user: currentUser } = useAuth()
  const currentUserId = currentUser?.id
  const targetUserId = profile?.id ?? ''

  const { data: isFollowing, isLoading } = useIsFollowing(currentUserId, targetUserId || undefined)
  const { follow, unfollow, isFollowPending, isUnfollowPending } = useFollowMutations(currentUserId, targetUserId)

  if (!profile) return null

  if (isOwner) {
    return (
      <div className="flex gap-3">
        <Link 
          href="/settings/profile" 
          className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider hover:bg-emerald-500/20 hover:border-emerald-500 transition-all duration-300 hover:-translate-y-0.5"
        >
          EDIT PROFILE
        </Link>
        <button className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 text-xs font-bold tracking-wider hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
          </svg>
          SHARE LIST
        </button>
      </div>
    )
  }

  if (!isLoggedIn) return null

  const handleFollowClick = () => {
    if (isFollowing) {
      unfollow(undefined, {
        onSuccess: () => toast.success(`Unfollowed ${profile.username}`),
        onError: () => toast.error('Failed to unfollow user')
      })
    } else {
      follow(undefined, {
        onSuccess: () => toast.success(`Following ${profile.username}`),
        onError: () => toast.error('Failed to follow user')
      })
    }
  }

  return (
    <div className="flex gap-3">
      <button 
        className={`px-6 py-3 text-xs font-bold tracking-wider transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
          isFollowing 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400' 
            : 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500'
        }`}
        onClick={handleFollowClick}
        disabled={isLoading || isFollowPending || isUnfollowPending || !currentUserId}
      >
        {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
      </button>
    </div>
  )
}

