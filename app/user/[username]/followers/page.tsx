'use client'

import { useParams } from 'next/navigation'
import { useProfileByUsername, useFollow } from '@/hooks'
import { UserCard } from '@/components/UserCard'
import Link from 'next/link'
import styles from '../profile.module.css'

export default function FollowersPage() {
  const params = useParams()
  const username = params.username as string

  // Fetch profile using React Query
  const { data: profile, isLoading: isLoadingProfile } = useProfileByUsername(username)

  // Get followers list
  const { followers, isLoadingFollowers } = useFollow(profile?.id)


  if (isLoadingProfile || isLoadingFollowers) {
    return (
      <div className={styles['profile-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']}>
          <span>LOADING FOLLOWERS...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={styles['profile-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['not-found']}>
          <h1>PROFILE NOT FOUND</h1>
          <p>The profile @{username} does not exist.</p>
          <Link href="/discover" className={styles['btn-primary']}>
            RETURN TO DISCOVER
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['profile-page']}>
      {/* Grid background */}
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      {/* Header */}
      <header className={styles['profile-header']}>
        <div className={styles['logo']}>
          <Link href="/dashboard" className={styles['logo-link']}>
            <div className={styles['logo-icon']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
              </svg>
            </div>
            <span className={styles['logo-text']}>MYWATCHLIST</span>
          </Link>
        </div>
      </header>

      <div className={styles['profile-container']}>
        {/* Title Section */}
        <section className={styles['hero-section']} style={{ paddingBottom: '2rem' }}>
          <div className={styles['hero-content']}>
            <Link 
              href={`/user/${username}`}
              className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-2 transition-colors"
            >
              ← Back to @{username}'s profile
            </Link>
            <h1 className={styles['hero-title']}>FOLLOWERS</h1>
            <p className="text-white/60 text-sm mt-2">
              {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
            </p>
          </div>
        </section>

        {/* Followers List */}
        <section className={styles['watchlist-section']} style={{ paddingTop: 0 }}>
          {followers.length === 0 ? (
            <div className={styles['empty-state']}>
              <p className="text-white/40 text-sm">No followers yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {followers.map((follower) => (
                <UserCard key={follower.id} user={follower} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
