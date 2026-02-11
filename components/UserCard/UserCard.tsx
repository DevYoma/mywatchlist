'use client'

import { useIsFollowing, useFollowMutations, useAuth } from '@/hooks'
import Link from 'next/link'
import Image from 'next/image'

interface UserCardProps {
  user: {
    id: string
    username: string
    avatar_url?: string | null
    bio?: string | null
  }
  showFollowButton?: boolean
}

export function UserCard({ user, showFollowButton = true }: UserCardProps) {
  const { user: currentUser } = useAuth()
  const currentUserId = currentUser?.id
  const isOwnProfile = currentUserId === user.id

  const { data: isFollowing, isLoading } = useIsFollowing(currentUserId, user.id)
  const { follow, unfollow, isFollowPending, isUnfollowPending } = useFollowMutations(currentUserId, user.id)

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isFollowing) {
      unfollow()
    } else {
      follow()
    }
  }

  return (
    <Link 
      href={`/user/${user.username}`}
      className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
    >
      {/* Avatar */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-sm tracking-wider truncate">
          @{user.username}
        </h3>
        {user.bio && (
          <p className="text-white/60 text-xs mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}
      </div>

      {/* Follow Button */}
      {showFollowButton && !isOwnProfile && currentUserId && (
        <button
          onClick={handleFollowClick}
          disabled={isLoading || isFollowPending || isUnfollowPending}
          className={`px-4 py-2 text-xs font-bold tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
            isFollowing
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400'
              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500'
          }`}
        >
          {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
        </button>
      )}
    </Link>
  )
}
