'use client'

import './movie.css'
import './movie-mobile.css'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useProfile, useMovieDetails, useRating, useWatchlist, useUnreadActivityCount, TMDBService } from '@/hooks'
import { toast } from 'sonner'
import { Header } from '@/components/Header'

export default function MoviePage() {
  const params = useParams()
  const router = useRouter()
  const movieId = params.id ? Number(params.id) : undefined

  // Auth via React Query
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: unreadCount = 0 } = useUnreadActivityCount(user?.id)

  // Movie details via React Query
  const { data: movie, isLoading: isMovieLoading } = useMovieDetails(movieId)

  // Rating via React Query
  const {
    userRating,
    globalAverage,
    totalRatings,
    recentRatings,
    rateMovie,
    deleteRating,
    isRating,
  } = useRating(user?.id, movieId)

  // Watchlist via React Query
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving } = useWatchlist(user?.id)

  // Check if movie is already in watchlist and get the item for removal
  const watchlistItem = watchlist?.find((item) => item.tmdb_id === movieId)
  const isInWatchlist = !!watchlistItem

  // Handle remove from watchlist
  const handleRemoveFromWatchlist = () => {
    if (!watchlistItem) return
    removeFromWatchlist(watchlistItem.id, {
      onSuccess: () => {
        toast.success('Removed from watchlist')
      },
      onError: () => {
        toast.error('Failed to remove from watchlist')
      },
    })
  }

  // Local state for rating slider (default 0 for new, or existing value)
  const [sliderValue, setSliderValue] = useState(0)

  // Initialize slider with existing rating
  useEffect(() => {
    if (userRating) {
      setSliderValue(userRating.rating_value)
    }
  }, [userRating])

  // Handle add to watchlist - ONLY if rated
  const handleAddToWatchlist = () => {
    if (!isLoggedIn || !movie || !movieId) return
    
    if (!userRating) {
      toast.error('You need to rate this movie first before adding to watchlist')
      return
    }

    if (isInWatchlist) {
      toast.info('This movie is already in your watchlist')
      return
    }

    addToWatchlist(
      {
        movie_id: movieId,
        title: movie.title,
        poster_path: movie.poster_path || undefined,
        tmdb_id: movieId,
        rating: userRating.rating_value, // Include the rating!
      },
      {
        onSuccess: () => {
          toast.success(`Added "${movie.title}" to your watchlist!`)
        },
        onError: () => {
          toast.error('Failed to add to watchlist')
        },
      }
    )
  }

  const handleRateMovie = () => {
    if (!isLoggedIn) {
      toast.error('You need to log in to rate movies')
      return
    }

    if (!movieId) return

    rateMovie(
      { movie_id: movieId, rating_value: sliderValue },
      {
        onSuccess: () => {
          toast.success(userRating ? 'Rating updated!' : 'Rating saved!')
        },
        onError: () => {
          toast.error('Failed to save rating')
        },
      }
    )
  }

  const handleDeleteRating = () => {
    if (!userRating) return

    deleteRating(userRating.id, {
      onSuccess: () => {
        setSliderValue(0)
        toast.success('Rating removed')
      },
      onError: () => {
        toast.error('Failed to remove rating')
      },
    })
  }

  const loading = isAuthLoading || isMovieLoading

  if (loading) {
    return (
      <div className="movie-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING...</span>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="error-state">
          <h1>Movie not found</h1>
          <Link href="/discover" className="btn-back">Back to Discover</Link>
        </div>
      </div>
    )
  }

  // Format runtime
  const hours = Math.floor((movie.runtime || 0) / 60)
  const minutes = (movie.runtime || 0) % 60
  const runtimeText = movie.runtime ? `${hours}h ${minutes}m` : 'N/A'

  return (
    <div className="movie-page">
      <div className="grid-background" />
      <div className="border-glow" />

      <Header 
        username={profile?.username}
        aesthetic="Cinema"
        isLoggedIn={isLoggedIn}
        unreadCount={unreadCount}
      />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/discover">DATABASE</Link>
        <span>/</span>
        <Link href="/discover">SCI-FI_SECTOR</Link>
        <span>/</span>
        <span className="current">{movie.title?.toUpperCase().replace(/ /g, '_')}</span>
      </div>

      {/* Main Content */}
      <main className="movie-main">
        <div className="movie-content">
          {/* Left: Poster */}
          <div className="poster-section">
            <div className="movie-poster">
              {movie.poster_path ? (
                <img 
                  src={TMDBService.getImageUrl(movie.poster_path, 'w500') || ''} 
                  alt={movie.title} 
                />
              ) : (
                <div className="no-poster">🎬</div>
              )}
            </div>
            <div className="movie-credits">
              <div className="credit">
                <span className="credit-label">DIRECTOR</span>
                <span className="credit-value">-</span>
              </div>
              <div className="credit">
                <span className="credit-label">RUNTIME</span>
                <span className="credit-value">{runtimeText}</span>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="details-section">
            <h1 className="movie-title">{movie.title}</h1>
            
            <div className="movie-meta">
              <span className="meta-item">{movie.release_date?.split('-')[0] || 'N/A'}</span>
              {movie.vote_average && (
                <span className="meta-item rating">
                  <span className="star">★</span> {movie.vote_average.toFixed(1)} TMDB
                </span>
              )}
              <span className="meta-item runtime">{runtimeText}</span>
            </div>

            <div className="genre-tags">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="genre-tag">{genre.name}</span>
              ))}
            </div>

            <p className="movie-overview">{movie.overview}</p>

            {/* Personal Rating Section */}
            <div className="rating-section">
              <div className="rating-header">
                <h3>PERSONAL RATING</h3>
                <p className="rating-subtitle">Assign a numerical value to this experience</p>
              </div>

              <div className="rating-slider-container">
                <div className="slider-track">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      className={`slider-dot ${sliderValue >= num ? 'active' : ''}`}
                      onClick={() => setSliderValue(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="rating-display">
                  <span className="rating-value">{sliderValue.toFixed(1)}</span>
                  <span className="rating-max">/ 10</span>
                </div>
              </div>

              <button 
                className="save-rating-btn" 
                onClick={handleRateMovie}
                disabled={isRating || !isLoggedIn || sliderValue === 0}
              >
                {isRating ? 'SAVING...' : userRating ? 'UPDATE EXPERIENCE & SAVE' : 'LOG EXPERIENCE & SAVE'}
              </button>

              {userRating && (
                <button 
                  className="delete-rating-btn" 
                  onClick={handleDeleteRating}
                >
                  REMOVE RATING
                </button>
              )}

              {!isLoggedIn && (
                <p className="login-hint">
                  <Link href="/auth">Sign in</Link> to save your rating
                </p>
              )}

              {/* Add to Watchlist - only shown after rating */}
              {isLoggedIn && userRating && !isInWatchlist && (
                <button 
                  className="add-to-watchlist-btn" 
                  onClick={handleAddToWatchlist}
                  disabled={isAdding}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  {isAdding ? 'ADDING...' : 'ADD TO WATCHLIST'}
                </button>
              )}

              {isLoggedIn && isInWatchlist && (
                <>
                  <div className="in-watchlist-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    IN YOUR WATCHLIST
                  </div>
                  <button 
                    className="remove-from-watchlist-btn"
                    onClick={handleRemoveFromWatchlist}
                    disabled={isRemoving}
                  >
                    {isRemoving ? 'REMOVING...' : 'REMOVE'}
                  </button>
                </>
              )}
            </div>

            {/* Global Ratings */}
            <div className="global-ratings">
              <div className="global-average">
                <span className="avg-value">{globalAverage ? globalAverage.toFixed(1) : '-'}</span>
                <div className="avg-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`star ${globalAverage && star <= Math.round(globalAverage / 2) ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="total-ratings">{totalRatings} ALL TIME RATINGS</span>
              </div>
            </div>

            {/* Recent User Activity */}
            {recentRatings.length > 0 && (
              <div className="recent-activity">
                <div className="activity-header">
                  <h3>RECENT USER ACTIVITY</h3>
                  <span className="see-all">ACCESS ALL RECORDS</span>
                </div>
                <div className="activity-list">
                  {recentRatings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="activity-item">
                      <div className="user-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <div className="activity-info">
                        <span className="activity-user">@{rating.profile?.username || 'user'}</span>
                        <span className="activity-label">Rated</span>
                      </div>
                      <span className="activity-rating">{rating.rating_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="movie-footer">
        <span>© MYWATCHLIST // SYSTEM_V_0.0.0</span>
      </footer>
    </div>
  )
}
