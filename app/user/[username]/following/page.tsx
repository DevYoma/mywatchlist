'use client'

import { useParams } from 'next/navigation'
import { useProfileByUsername, useFollow } from '@/hooks'
import { UserCard } from '@/components/UserCard'
import Link from 'next/link'
import '../profile.css'

export default function FollowingPage() {
  const params = useParams()
  const username = params.username as string

  // Fetch profile using React Query
  const { data: profile, isLoading: isLoadingProfile } = useProfileByUsername(username)

  // Get following list
  const { following, isLoadingFollowing } = useFollow(profile?.id)

  if (isLoadingProfile || isLoadingFollowing) {
    return (
      <div className="profile-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING FOLLOWING...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="not-found">
          <h1>PROFILE NOT FOUND</h1>
          <p>The profile @{username} does not exist.</p>
          <Link href="/discover" className="btn-primary">
            RETURN TO DISCOVER
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* Grid background */}
      <div className="grid-background" />
      <div className="border-glow" />

      {/* Header */}
      <header className="profile-header">
        <div className="logo">
          <Link href="/dashboard" className="logo-link">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
              </svg>
            </div>
            <span className="logo-text">MYWATCHLIST</span>
          </Link>
        </div>
      </header>

      <div className="profile-container">
        {/* Title Section */}
        <section className="hero-section" style={{ paddingBottom: '2rem' }}>
          <div className="hero-content">
            <Link 
              href={`/user/${username}`}
              className="text-white/60 hover:text-white text-sm mb-4 inline-flex items-center gap-2 transition-colors"
            >
              ← Back to @{username}'s profile
            </Link>
            <h1 className="hero-title">FOLLOWING</h1>
            <p className="text-white/60 text-sm mt-2">
              {following.length} {following.length === 1 ? 'user' : 'users'}
            </p>
          </div>
        </section>

        {/* Following List */}
        <section className="watchlist-section" style={{ paddingTop: 0 }}>
          {following.length === 0 ? (
            <div className="empty-state">
              <p className="text-white/40 text-sm">Not following anyone yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {following.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
