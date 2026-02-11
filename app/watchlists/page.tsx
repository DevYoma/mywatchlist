'use client'

import './watchlists.css'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useAllWatchlists, useWatchlistLikeMutations, TMDBService } from '@/hooks'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { ProfileMenu } from '@/components/ProfileMenu'
import type { WatchlistItem } from '@/services/watchlists.service'

export default function WatchlistsPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: watchlists, isLoading } = useAllWatchlists(user?.id)
  const { like, unlike, isLikePending, isUnlikePending } = useWatchlistLikeMutations(user?.id)

  // Don't redirect - allow non-authenticated users to view watchlists

  if (isLoading) {
    return (
      <div className="watchlists-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING WATCHLISTS...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="watchlists-page">
      <div className="grid-background" />
      <div className="border-glow" />

      {/* Header */}
      <header className="watchlists-header">
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
          <Link href="/watchlists" className="nav-link active">Watchlists</Link>
        </nav>
        <ProfileMenu username={profile?.username} aesthetic="Cinema" />
      </header>

      <div className="watchlists-container">
        <section className="hero-section">
          <h1 className="hero-title">WATCHLISTS</h1>
          <p className="hero-subtitle">Discover what the community is watching</p>
        </section>

        <section className="watchlists-content">
          {!watchlists || watchlists.length === 0 ? (
            <div className="empty-state">
              <p className="text-white/40 text-sm">No watchlists found</p>
            </div>
          ) : (
            <div className="watchlist-grid">
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
    <div className="watchlist-card">
      {/* Owner Info */}
      <Link href={`/user/${watchlist.owner.username}`} className="watchlist-owner">
        <div className="owner-avatar">
          {watchlist.owner.avatar_url ? (
            <Image
              src={watchlist.owner.avatar_url}
              alt={watchlist.owner.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="avatar-placeholder">
              {watchlist.owner.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <span className="owner-username">@{watchlist.owner.username}</span>
      </Link>

      {/* Movie Posters Grid */}
      <div className="movie-posters-grid">
        {watchlist.recent_movies.slice(0, 4).map((movie, idx) => (
          <MoviePoster key={idx} movieId={movie.movie_id} />
        ))}
      </div>

      {/* Stats */}
      <div className="watchlist-stats">
        <span className="stat-item">{watchlist.total_ratings} movies</span>
        <span className="stat-divider">•</span>
        <span className="stat-item">{watchlist.like_count} likes</span>
      </div>

      {/* Like Button */}
      {!isOwnWatchlist && currentUserId && (
        <button
          className={`like-btn ${watchlist.is_liked_by_current_user ? 'liked' : ''}`}
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
    return <div className="movie-poster-placeholder">?</div>
  }

  return (
    <div className="movie-poster">
      <Image
        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
        alt={movie.title}
        fill
        className="object-cover"
      />
    </div>
  )
}
