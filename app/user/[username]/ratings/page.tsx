'use client'

import '../profile.css'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProfileService, AuthService, RatingService, WatchlistService, TMDBService } from '@/services'
import type { Profile, Rating, WatchlistMovie } from '@/types'
import Link from 'next/link'
import { toast } from 'sonner'

interface RatingWithMovie extends Rating {
  movie?: {
    title: string
    poster_path: string | null
  }
  inWatchlist?: boolean
}

export default function RatingsPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [ratings, setRatings] = useState<RatingWithMovie[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get profile by username
        const userProfile = await ProfileService.getProfileByUsername(username)
        
        if (!userProfile) {
          setNotFound(true)
          setLoading(false)
          return
        }

        setProfile(userProfile)

        // Get all ratings for this user
        const userRatings = await RatingService.getUserRatings(userProfile.id)
        
        // Get user's watchlist to check which movies are already added
        const userWatchlist = await WatchlistService.getWatchlist(userProfile.id)
        setWatchlist(userWatchlist)
        
        // Fetch movie details for each rating
        const ratingsWithMovies: RatingWithMovie[] = await Promise.all(
          userRatings.map(async (rating) => {
            try {
              const movie = await TMDBService.getMovieDetails(rating.movie_id)
              return {
                ...rating,
                movie: {
                  title: movie.title,
                  poster_path: movie.poster_path,
                },
                inWatchlist: userWatchlist.some(w => w.tmdb_id === rating.movie_id)
              }
            } catch {
              return {
                ...rating,
                movie: {
                  title: `Movie #${rating.movie_id}`,
                  poster_path: null,
                },
                inWatchlist: userWatchlist.some(w => w.tmdb_id === rating.movie_id)
              }
            }
          })
        )
        
        setRatings(ratingsWithMovies)

        // Check if current user is logged in - ratings page requires login
        try {
          const currentUser = await AuthService.getUser()
          if (currentUser) {
            setIsLoggedIn(true)
            if (currentUser.id === userProfile.id) {
              setIsOwner(true)
            }
          } else {
            // Not logged in - redirect to auth
            router.push('/auth?redirect=' + encodeURIComponent(`/user/${username}/ratings`))
            return
          }
        } catch {
          // User not logged in - redirect to auth
          router.push('/auth?redirect=' + encodeURIComponent(`/user/${username}/ratings`))
          return
        }
      } catch (error) {
        console.error('Error fetching ratings:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username])

  const handleDeleteRating = async (ratingId: string) => {
    if (!confirm('Are you sure you want to delete this rating?')) return
    
    setDeletingId(ratingId)
    try {
      await RatingService.deleteRating(ratingId)
      setRatings(ratings.filter(r => r.id !== ratingId))
      toast.success('Rating deleted')
    } catch {
      toast.error('Failed to delete rating')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddToWatchlist = async (rating: RatingWithMovie) => {
    if (!profile) return
    
    setAddingId(rating.movie_id)
    try {
      await WatchlistService.addToWatchlist(profile.id, {
        movie_id: rating.movie_id,
        title: rating.movie?.title || `Movie #${rating.movie_id}`,
        poster_path: rating.movie?.poster_path || undefined,
        tmdb_id: rating.movie_id,
        rating: rating.rating_value, // Include the rating!
      })
      
      // Update local state
      setRatings(ratings.map(r => 
        r.id === rating.id ? { ...r, inWatchlist: true } : r
      ))
      toast.success(`Added "${rating.movie?.title}" to watchlist!`)
    } catch {
      toast.error('Failed to add to watchlist')
    } finally {
      setAddingId(null)
    }
  }

  // VISIBILITY LOGIC: Sort by rating (highest first), limit to 50% for non-logged users
  const displayRatings = (() => {
    // Sort by rating value: highest to lowest
    const sorted = [...ratings].sort((a, b) => b.rating_value - a.rating_value)
    
    // For non-logged users: show only top 50%
    if (!isLoggedIn) {
      const halfCount = Math.ceil(sorted.length / 2)
      return sorted.slice(0, halfCount)
    }
    
    return sorted
  })()

  // Calculate average rating
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="profile-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING RATINGS...</span>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="profile-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="not-found">
          <h1>USER NOT FOUND</h1>
          <p>The profile @{username} does not exist.</p>
          <button onClick={() => router.push(isLoggedIn ? '/dashboard' : '/discover')} className="btn-primary">
            {isLoggedIn ? 'RETURN TO DASHBOARD' : 'RETURN TO DISCOVER'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page ratings-page">
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
        <nav className="header-nav">
          <Link href="/discover" className="nav-link">Discover</Link>
          <Link href={`/user/${username}`} className="nav-link">Profile</Link>
          <Link href={`/user/${username}/ratings`} className="nav-link active">My Ratings</Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href={`/user/${username}`}>@{username}</Link>
        <span>/</span>
        <span className="current">RATINGS</span>
      </div>

      {/* Ratings Header */}
      <section className="ratings-hero">
        <h1>{profile?.username?.toUpperCase()}'S RATINGS</h1>
        <div className="ratings-stats">
          <div className="stat">
            <span className="stat-value">{ratings.length}</span>
            <span className="stat-label">TOTAL</span>
          </div>
          <div className="stat accent">
            <span className="stat-value">{avgRating}</span>
            <span className="stat-label">AVG</span>
          </div>
        </div>
      </section>

      {/* Ratings List */}
      <section className="ratings-list">
        {ratings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>NO RATINGS YET</h3>
            <p>
              {isOwner 
                ? "Start rating movies to build your collection."
                : `${profile?.username} hasn't rated any movies yet.`
              }
            </p>
            {isOwner && (
              <Link href="/discover" className="btn-primary">
                DISCOVER MOVIES
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="ratings-grid">
              {displayRatings.map((rating) => (
                <div key={rating.id} className="rating-card">
                  <Link href={`/movie/${rating.movie_id}`} className="rating-link">
                    <div className="rating-poster">
                      {rating.movie?.poster_path ? (
                        <img 
                          src={TMDBService.getImageUrl(rating.movie.poster_path, 'w300') || ''} 
                          alt={rating.movie?.title || 'Movie'} 
                          loading="lazy"
                        />
                      ) : (
                        <div className="no-poster">🎬</div>
                      )}
                      {/* Only show rating value if logged in */}
                      {isLoggedIn && (
                        <div className="rating-value">★ {rating.rating_value}</div>
                      )}
                    </div>
                    <div className="rating-info">
                      <h3>{rating.movie?.title || `Movie #${rating.movie_id}`}</h3>
                      {isLoggedIn && (
                        <span className="rating-date">
                          {new Date(rating.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  {/* Action buttons - only for owner */}
                  {isOwner && (
                    <div className="rating-actions">
                      {!rating.inWatchlist ? (
                        <button 
                          className="add-watchlist-btn"
                          onClick={() => handleAddToWatchlist(rating)}
                          disabled={addingId === rating.movie_id}
                          title="Add to watchlist"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                          </svg>
                          {addingId === rating.movie_id ? 'ADDING...' : 'ADD TO LIST'}
                        </button>
                      ) : (
                        <span className="in-watchlist-badge">✓ IN WATCHLIST</span>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteRating(rating.id)}
                        disabled={deletingId === rating.id}
                        title="Delete rating"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Signup CTA for non-logged users */}
            {!isLoggedIn && ratings.length > displayRatings.length && (
              <div className="signup-cta">
                <p>Sign up to see all {ratings.length} ratings with scores!</p>
                <Link href="/auth" className="btn-signup">CREATE ACCOUNT</Link>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="profile-footer">
        <div className="footer-logo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
          </svg>
          <span>MYWATCHLIST</span>
        </div>
        <p className="footer-version">SYSTEM_VERSION: 1.0.0 // © 2026 MYWATCHLIST.CORP</p>
      </footer>
    </div>
  )
}
