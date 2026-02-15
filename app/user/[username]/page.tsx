'use client'

import styles from './profile.module.css'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProfileService, AuthService, WatchlistService } from '@/services'
import type { Profile, WatchlistMovie } from '@/types'
import Link from 'next/link'
import { WatchlistGrid } from '@/components/WatchlistGrid'
import { useAuth, useFollow, useUnreadActivityCount } from '@/hooks'
import { ProfileActions } from '@/components/ProfileActions'
import { Header } from '@/components/Header'

interface ProfileStats {
  moviesRated: number
  avgRating: string
  followers: number
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats>({ moviesRated: 0, avgRating: '0.0', followers: 0 })
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get profile by username
        const userProfile = await ProfileService.getProfileByUsername(username)
        
        if (!userProfile) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setProfile(userProfile)

        // Get stats
        const profileStats = await ProfileService.getProfileStats(userProfile.id)
        setStats(profileStats)

        // Get watchlist
        const userWatchlist = await WatchlistService.getWatchlist(userProfile.id)
        setWatchlist(userWatchlist)

        // Check if current user is the owner
        try {
          const currentUser = await AuthService.getUser()
          if (currentUser) {
            setIsLoggedIn(true)
            if (currentUser.id === userProfile.id) {
              setIsOwner(true)
            }
          }
        } catch {
          // User not logged in - that's fine
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className={styles['profile-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']}>
          <span>LOADING PROFILE...</span>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className={styles['profile-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['not-found']}>
          <h1>USER NOT FOUND</h1>
          <p>The profile @{username} does not exist.</p>
          <button onClick={() => router.push(isLoggedIn ? '/dashboard' : '/discover')} className={styles['btn-primary']}>
            {isLoggedIn ? 'RETURN TO DASHBOARD' : 'RETURN TO DISCOVER'}
          </button>
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
      <Header 
        username={profile?.username}
        aesthetic="Noir"
        isLoggedIn={isLoggedIn}
      />

      {/* Profile Hero */}
      <section className={styles['profile-hero']}>
        <div className={styles['profile-avatar']}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} />
          ) : (
            <div className={styles['avatar-placeholder']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>

        <div className={styles['profile-info']}>
          <h1 className={styles['profile-username']}>{profile?.username?.toUpperCase()}</h1>
          <p className={styles['profile-bio']}>
            {profile?.bio || 'CINEPHILE & FILM ENTHUSIAST'}
            {profile?.created_at && (
              <span className={styles['join-date']}> // JOINED {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}</span>
            )}
          </p>
        </div>

        <ProfileActions profile={profile} isOwner={isOwner} isLoggedIn={isLoggedIn} />
      </section>

      {/* Stats Section */}
      <section className={styles['stats-section']}>
        <Link href={`/user/${username}/ratings`} className={`${styles['stat-card']} ${styles['clickable']}`}>
          <span className={styles['stat-value']}>{stats.moviesRated}</span>
          <span className={styles['stat-label']}>MOVIES RATED</span>
        </Link>
        <div className={`${styles['stat-card']} ${styles['accent']}`}>
          <span className={styles['stat-value']}>{stats.avgRating}</span>
          <span className={styles['stat-label']}>AVG. RATING</span>
        </div>
        <StatsFollowerCard profileId={profile?.id} username={username} styles={styles} />
        <StatsFollowingCard profileId={profile?.id} username={username} styles={styles} />
      </section>

      {/* Watchlist Section Header */}
      <section className={styles['watchlist-header-section']}>
        <div className={styles['section-title']}>
          <h2>{profile?.username?.toUpperCase()}'S WATCHLIST</h2>
          <span className={styles['movie-count']}>{watchlist.length} MOVIES</span>
        </div>
        {isOwner && (
          <Link href="/discover" className={styles['btn-add-movie']}>+ Add Movie</Link>
        )}
      </section>

      {/* Watchlist Grid */}
      <section className={styles['movies-section']}>
        <WatchlistGrid
          watchlist={watchlist}
          isOwner={false}
          isLoggedIn={isLoggedIn}
          limitedView={!isLoggedIn}
          maxItems={12}
          showLoadMore={watchlist.length > 12}
        />
      </section>

      {/* Footer */}
      <footer className={styles['profile-footer']}>
        <div className={styles['footer-logo']}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
          </svg>
          <span>MYWATCHLIST</span>
        </div>
        <p className={styles['footer-version']}>SYSTEM_VERSION: 1.0.0 // © 2026 MYWATCHLIST.CORP</p>
        <div className={styles['footer-links']}>
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
          <a href="#">API</a>
        </div>
      </footer>
    </div>
  )
}

function StatsFollowerCard({ profileId, username, styles }: { profileId?: string, username?: string, styles: any }) {
  const { followerCount } = useFollow(profileId)
  
  if (!username) {
    return (
      <div className={styles['stat-card']}>
        <span className={styles['stat-value']}>{followerCount.toLocaleString()}</span>
        <span className={styles['stat-label']}>FOLLOWERS</span>
      </div>
    )
  }

  return (
    <Link href={`/user/${username}/followers`} className={`${styles['stat-card']} ${styles['clickable']}`}>
      <span className={styles['stat-value']}>{followerCount.toLocaleString()}</span>
      <span className={styles['stat-label']}>FOLLOWERS</span>
    </Link>
  )
}

function StatsFollowingCard({ profileId, username, styles }: { profileId?: string, username?: string, styles: any }) {
  const { followingCount } = useFollow(profileId)
  
  if (!username) {
    return (
      <div className={styles['stat-card']}>
        <span className={styles['stat-value']}>{followingCount.toLocaleString()}</span>
        <span className={styles['stat-label']}>FOLLOWING</span>
      </div>
    )
  }

  return (
    <Link href={`/user/${username}/following`} className={`${styles['stat-card']} ${styles['clickable']}`}>
      <span className={styles['stat-value']}>{followingCount.toLocaleString()}</span>
      <span className={styles['stat-label']}>FOLLOWING</span>
    </Link>
  )
}
