'use client'

import styles from './ActivityFeed.module.css'
import { useFollowingActivity } from '@/hooks'
import Link from 'next/link'
import Image from 'next/image'
import { getTimeAgo } from '@/utils/date.utils'
import type { ActivityItem } from '@/services/activity.service'

interface ActivityFeedProps {
  userId: string
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = useFollowingActivity(userId)

  if (isLoading) {
    return (
      <div className={styles['activity-feed']}>
        <h2 className={styles['section-title']}>FRIENDS' LATEST RATINGS</h2>
        <div className={styles['loading-skeleton']}>
          <div className={styles['skeleton-item']} />
          <div className={styles['skeleton-item']} />
          <div className={styles['skeleton-item']} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles['activity-feed']}>
        <h2 className={styles['section-title']}>FRIENDS' LATEST RATINGS</h2>
        <p className="text-white/40 text-sm">Failed to load activity</p>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className={styles['activity-feed']}>
        <h2 className={styles['section-title']}>FRIENDS' LATEST RATINGS</h2>
        <div className={styles['empty-state']}>
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
    <div className={styles['activity-feed']}>
      <h2 className={styles['section-title']}>FRIENDS' LATEST RATINGS</h2>
      <div className={styles['activity-list']}>
        {activities.slice(0, 3).map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
      {activities.length > 3 && (
        <Link href="/activity" className={styles['view-more-btn']}>
          VIEW MORE ACTIVITY ({activities.length - 3} MORE)
        </Link>
      )}
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const timeAgo = getTimeAgo(activity.created_at)

  return (
    <div className={styles['activity-card']}>
      {/* User Info */}
      <div className={styles['activity-header']}>
        <Link href={`/user/${activity.user.username}`} className={styles['user-info']}>
          <div className={styles['user-avatar']}>
            {activity.user.avatar_url ? (
              <Image
                src={activity.user.avatar_url}
                alt={activity.user.username}
                fill
                className="object-cover"
              />
            ) : (
              <div className={styles['avatar-placeholder']}>
                {activity.user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className={styles['username']}>@{activity.user.username}</span>
        </Link>
        <span className={styles['time-ago']}>{timeAgo}</span>
      </div>

      {/* Rating Info */}
      <div className={styles['activity-content']}>
        <div className={styles['movie-info']}>
          {activity.movie.poster_path && (
            <Link href={`/movie/${activity.movie.id}`} className={styles['movie-poster']}>
              <Image
                src={`https://image.tmdb.org/t/p/w92${activity.movie.poster_path}`}
                alt={activity.movie.title}
                width={46}
                height={69}
                className="rounded"
              />
            </Link>
          )}
          <div className={styles['rating-details']}>
            <p className={styles['rating-text']}>
              rated{' '}
              <Link href={`/movie/${activity.movie.id}`} className={styles['movie-title']}>
                {activity.movie.title}
              </Link>
            </p>
            <div className={styles['rating-stars']}>
              {'★'.repeat(Math.floor(activity.rating))}
              {activity.rating % 1 !== 0 && '½'}
              <span className={styles['rating-value']}>{activity.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
