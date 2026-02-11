'use client'

import { useFollowingActivity } from '@/hooks'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import type { ActivityItem } from '@/services/activity.service'

interface ActivityFeedProps {
  userId: string
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = useFollowingActivity(userId)

  if (isLoading) {
    return (
      <div className="activity-feed">
        <h2 className="section-title">FRIENDS' LATEST RATINGS</h2>
        <div className="loading-skeleton">
          <div className="skeleton-item" />
          <div className="skeleton-item" />
          <div className="skeleton-item" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="activity-feed">
        <h2 className="section-title">FRIENDS' LATEST RATINGS</h2>
        <p className="text-white/40 text-sm">Failed to load activity</p>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="activity-feed">
        <h2 className="section-title">FRIENDS' LATEST RATINGS</h2>
        <div className="empty-state">
          <p className="text-white/40 text-sm">
            No recent activity from people you follow
          </p>
          <p className="text-white/30 text-xs mt-2">
            Follow users to see their ratings here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-feed">
      <h2 className="section-title">FRIENDS' LATEST RATINGS</h2>
      <div className="activity-list">
        {activities.slice(0, 3).map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
      {activities.length > 3 && (
        <Link href="/activity" className="view-more-btn">
          VIEW MORE ACTIVITY ({activities.length - 3} MORE)
        </Link>
      )}
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
