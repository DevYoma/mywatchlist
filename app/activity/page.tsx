'use client'

import './activity.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useFollowingActivity } from '@/hooks'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { ProfileMenu } from '@/components/ProfileMenu'
import type { ActivityItem } from '@/services/activity.service'

export default function ActivityPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: activities, isLoading, error } = useFollowingActivity(user?.id)

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/auth')
    }
  }, [isAuthLoading, isLoggedIn, router])

  if (isAuthLoading || isLoading) {
    return (
      <div className="activity-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING ACTIVITY...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-page">
      <div className="grid-background" />
      <div className="border-glow" />

      {/* Header */}
      <header className="activity-header">
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
        <nav className="header-nav">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/discover" className="nav-link">Explore</Link>
          <Link href="/activity" className="nav-link active">Activity</Link>
          <Link href="/watchlists" className="nav-link">Watchlists</Link>
        </nav>
        <ProfileMenu username={profile?.username} aesthetic="Film" />
      </header>

      <div className="activity-container">
        <section className="hero-section">
          <h1 className="hero-title">ACTIVITY FEED</h1>
          <p className="hero-subtitle">Recent ratings from people you follow</p>
        </section>

        <section className="activity-content">
          {error && (
            <p className="text-white/40 text-sm">Failed to load activity</p>
          )}

          {!activities || activities.length === 0 ? (
            <div className="empty-state">
              <p className="text-white/40 text-sm">
                No recent activity from people you follow
              </p>
              <p className="text-white/30 text-xs mt-2">
                Follow users to see their ratings here
              </p>
            </div>
          ) : (
            <div className="activity-list">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  // Supabase returns UTC timestamps like "2026-02-03 04:24:04.503599" without 'Z'
  // Append 'Z' to tell JavaScript it's UTC, otherwise it parses as local time
  const timestamp = activity.created_at.replace(' ', 'T') + 'Z'
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true })

  return (
    <div className="activity-card">
      {/* User Info */}
      <div className="activity-header">
        <Link href={`/user/${activity.user.username}`} className="user-info">
          <div className="user-avatar">
            {activity.user.avatar_url ? (
              <Image
                src={activity.user.avatar_url}
                alt={activity.user.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className="avatar-placeholder">
                {activity.user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className="username">@{activity.user.username}</span>
        </Link>
        <span className="time-ago">{timeAgo}</span>
      </div>

      {/* Rating Info */}
      <div className="activity-content">
        <div className="movie-info">
          {activity.movie.poster_path && (
            <Link href={`/movie/${activity.movie.id}`} className="movie-poster">
              <Image
                src={`https://image.tmdb.org/t/p/w92${activity.movie.poster_path}`}
                alt={activity.movie.title}
                width={46}
                height={69}
                className="rounded"
              />
            </Link>
          )}
          <div className="rating-details">
            <p className="rating-text">
              rated{' '}
              <Link href={`/movie/${activity.movie.id}`} className="movie-title">
                {activity.movie.title}
              </Link>
            </p>
            <div className="rating-stars">
              {'★'.repeat(Math.floor(activity.rating))}
              {activity.rating % 1 !== 0 && '½'}
              <span className="rating-value">{activity.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
