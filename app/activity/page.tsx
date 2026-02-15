'use client'

import styles from './activity.module.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useFollowingActivity, useUnreadActivityCount } from '@/hooks'
import { getTimeAgo } from '@/utils/date.utils'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/Header'
import type { ActivityItem } from '@/services/activity.service'

export default function ActivityPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: activities, isLoading, error } = useFollowingActivity(user?.id)
  const { data: unreadCount = 0 } = useUnreadActivityCount(user?.id)

  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/auth')
    }
  }, [isAuthLoading, isLoggedIn, router])

  if (isAuthLoading || isLoading) {
    return (
      <div className={styles['activity-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']}>
          <span>LOADING ACTIVITY...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['activity-page']}>
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      <Header 
        username={profile?.username}
        aesthetic="Film"
        isLoggedIn={isLoggedIn}
        unreadCount={unreadCount}
      />

      <div className={styles['activity-container']}>
        <section className={styles['hero-section']}>
          <h1 className={styles['hero-title']}>ACTIVITY FEED</h1>
          <p className={styles['hero-subtitle']}>Recent ratings from people you follow</p>
        </section>

        <section className={styles['activity-content']}>
          {error && (
            <p className="text-white/40 text-sm">Failed to load activity</p>
          )}

          {!activities || activities.length === 0 ? (
            <div className={styles['empty-state']}>
              <p className="text-white/40 text-sm">
                No recent activity from people you follow
              </p>
              <p className="text-white/30 text-xs mt-2">
                Follow users to see their ratings here
              </p>
            </div>
          ) : (
            <div className={styles['activity-list']}>
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
