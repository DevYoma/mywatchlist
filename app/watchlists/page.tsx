'use client'

import styles from './watchlists.module.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useAllWatchlists, useWatchlistLikeMutations, useUnreadActivityCount, TMDBService } from '@/hooks'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/Header'
import type { WatchlistItem } from '@/services/watchlists.service'

export default function WatchlistsPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: watchlists, isLoading } = useAllWatchlists(user?.id)
  const { like, unlike, isLikePending, isUnlikePending } = useWatchlistLikeMutations(user?.id)
  const { data: unreadCount = 0 } = useUnreadActivityCount(user?.id)

  // Don't redirect - allow non-authenticated users to view watchlists

  if (isLoading) {
    return (
      <div className={styles['watchlists-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']}>
          <span>LOADING WATCHLISTS...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['watchlists-page']}>
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      <Header 
        username={profile?.username}
        aesthetic="Cinema"
        isLoggedIn={isLoggedIn}
        unreadCount={unreadCount}
      />

      <div className={styles['watchlists-container']}>
        <section className={styles['hero-section']}>
          <h1 className={styles['hero-title']}>WATCHLISTS</h1>
          <p className={styles['hero-subtitle']}>Discover what the community is watching</p>
        </section>

        <section className={styles['watchlists-content']}>
          {!watchlists || watchlists.length === 0 ? (
            <div className={styles['empty-state']}>
              <p className="text-white/40 text-sm">No watchlists found</p>
            </div>
          ) : (
            <div className={styles['watchlist-grid']}>
              {watchlists.map((watchlist) => (
                <WatchlistCard
                  key={watchlist.id}
                  watchlist={watchlist}
                  currentUserId={user?.id}
                  onLike={() => like({ watchlistOwnerId: watchlist.id })}
                  onUnlike={() => unlike({ watchlistOwnerId: watchlist.id })}
                  isPending={isLikePending || isUnlikePending}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

interface WatchlistCardProps {
  watchlist: WatchlistItem
  currentUserId?: string
  onLike: () => void
  onUnlike: () => void
  isPending: boolean
}

function WatchlistCard({ watchlist, currentUserId, onLike, onUnlike, isPending }: WatchlistCardProps) {
  const isOwnWatchlist = currentUserId === watchlist.id

  return (
    <div className={styles['watchlist-card']}>
      {/* Owner Info */}
      <Link href={`/user/${watchlist.owner.username}`} className={styles['watchlist-owner']}>
        <div className={styles['owner-avatar']}>
          {watchlist.owner.avatar_url ? (
            <Image
              src={watchlist.owner.avatar_url}
              alt={watchlist.owner.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className={styles['avatar-placeholder']}>
              {watchlist.owner.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <span className={styles['owner-username']}>@{watchlist.owner.username}</span>
      </Link>

      {/* Movie Posters Grid */}
      <div className={styles['movie-posters-grid']}>
        {watchlist.recent_movies.slice(0, 4).map((movie, idx) => (
          <MoviePoster key={idx} movieId={movie.movie_id} />
        ))}
      </div>

      {/* Stats */}
      <div className={styles['watchlist-stats']}>
        <span className={styles['stat-item']}>{watchlist.total_ratings} movies</span>
        <span className={styles['stat-divider']}>•</span>
        <span className={styles['stat-item']}>{watchlist.like_count} likes</span>
      </div>

      {/* Like Button */}
      {!isOwnWatchlist && currentUserId && (
        <button
          className={`${styles['like-btn']} ${watchlist.is_liked_by_current_user ? styles['liked'] : ''}`}
          onClick={watchlist.is_liked_by_current_user ? onUnlike : onLike}
          disabled={isPending}
        >
          <svg viewBox="0 0 24 24" fill={watchlist.is_liked_by_current_user ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {watchlist.is_liked_by_current_user ? 'Liked' : 'Like Watchlist'}
        </button>
      )}
    </div>
  )
}

function MoviePoster({ movieId }: { movieId: number }) {
  const { data: movie } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => TMDBService.getMovieDetails(movieId),
  })

  if (!movie?.poster_path) {
    return <div className={styles['movie-poster-placeholder']}>?</div>
  }

  return (
    <div className={styles['movie-poster']}>
      <Image
        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
        alt={movie.title}
        fill
        className="object-cover"
      />
    </div>
  )
}
