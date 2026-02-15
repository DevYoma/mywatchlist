'use client'

import styles from '../profile.module.css'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProfileService, AuthService, RatingService, WatchlistService, TMDBService } from '@/services'
import type { Profile, Rating, WatchlistMovie } from '@/types'
import Link from 'next/link'
import { toast } from 'sonner'
import { MoreHorizontal, Trash2, Bookmark, BookmarkCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  // Handle removing from watchlist
  const handleRemoveFromWatchlist = async (rating: RatingWithMovie) => {
    if (!profile) return
    
    // Find watchlist item ID
    const watchlistItem = watchlist.find(w => w.tmdb_id === rating.movie_id)
    if (!watchlistItem) return

    setAddingId(rating.movie_id) // reuse loading state
    try {
      await WatchlistService.removeFromWatchlist(watchlistItem.id)
      
      // Update local state
      setRatings(ratings.map(r => 
        r.id === rating.id ? { ...r, inWatchlist: false } : r
      ))
      // Update watchlist state too
      setWatchlist(watchlist.filter(w => w.id !== watchlistItem.id))
      
      toast.success('Removed from watchlist')
    } catch {
      toast.error('Failed to remove from watchlist')
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
      <div className={styles['profile-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']}>
          <span>LOADING RATINGS...</span>
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
    <div className={`${styles['profile-page']} ${styles['ratings-page']}`}>
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      {/* Header */}
      <header className={styles['profile-header']}>
        <div className={styles['logo']}>
          <Link href="/dashboard" className={styles['logo-link']}>
            <div className={styles['logo-icon']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
              </svg>
            </div>
            <span className={styles['logo-text']}>MYWATCHLIST</span>
          </Link>
        </div>
        <nav className={styles['header-nav']}>
          <Link href="/discover" className={styles['nav-link']}>Discover</Link>
          <Link href={`/user/${username}`} className={styles['nav-link']}>Profile</Link>
          <Link href={`/user/${username}/ratings`} className={`${styles['nav-link']} ${styles['active']}`}>My Ratings</Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className={styles['breadcrumb']}>
        <Link href={`/user/${username}`}>@{username}</Link>
        <span>/</span>
        <span className={styles['current']}>RATINGS</span>
      </div>

      {/* Ratings Header */}
      <section className={styles['ratings-hero']}>
        <h1>{profile?.username?.toUpperCase()}'S RATINGS</h1>
        <div className={styles['ratings-stats']}>
          <div className={styles['stat']}>
            <span className={styles['stat-value']}>{ratings.length}</span>
            <span className={styles['stat-label']}>TOTAL</span>
          </div>
          <div className={`${styles['stat']} ${styles['accent']}`}>
            <span className={styles['stat-value']}>{avgRating}</span>
            <span className={styles['stat-label']}>AVG</span>
          </div>
        </div>
      </section>

      {/* Ratings List */}
      <section className={styles['ratings-list']}>
        {ratings.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-icon']}>⭐</div>
            <h3>NO RATINGS YET</h3>
            <p>
              {isOwner 
                ? "Start rating movies to build your collection."
                : `${profile?.username} hasn't rated any movies yet.`
              }
            </p>
            {isOwner && (
              <Link href="/discover" className={styles['btn-primary']}>
                DISCOVER MOVIES
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={styles['ratings-grid']}>
              {displayRatings.map((rating) => (
                <div key={rating.id} className={styles['rating-card']}>
                  {/* Mobile Menu Trigger (Absolute positioned over poster) */}
                  {isOwner && (
                    <div className="mobile-only mobile-menu-trigger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button style={{width:'100%', height:'100%', background:'transparent', border:'none', display:'flex', alignItems:'center', justifyContent:'center', color:'white', cursor:'pointer'}}>
                               <MoreHorizontal size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" style={{background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', color: 'white'}}>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                rating.inWatchlist ? handleRemoveFromWatchlist(rating) : handleAddToWatchlist(rating);
                              }}
                              style={{cursor: 'pointer', fontSize: '12px'}}
                            >
                              {rating.inWatchlist ? <BookmarkCheck style={{marginRight: '8px', width: '14px', color: '#00ff88'}} /> : <Bookmark style={{marginRight: '8px', width: '14px'}} />}
                              {rating.inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDeleteRating(rating.id); }}
                              style={{color: '#ff4444', cursor: 'pointer', fontSize: '12px'}}
                            >
                              <Trash2 style={{marginRight: '8px', width: '14px'}} />
                              Delete Rating
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  )}

                  <Link href={`/movie/${rating.movie_id}`} className={styles['rating-link']}>
                    <div className={styles['rating-poster']}>
                      {rating.movie?.poster_path ? (
                        <img 
                          src={TMDBService.getImageUrl(rating.movie.poster_path, 'w300') || ''} 
                          alt={rating.movie?.title || 'Movie'} 
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles['no-poster']}>🎬</div>
                      )}
                      {/* Only show rating value if logged in */}
                      {isLoggedIn && (
                        <div className={styles['rating-value']}>★ {rating.rating_value}</div>
                      )}
                    </div>
                    <div className={styles['rating-info']}>
                      <h3>{rating.movie?.title || `Movie #${rating.movie_id}`}</h3>
                      {isLoggedIn && (
                        <span className={styles['rating-date']}>
                          {new Date(rating.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  {/* Desktop Actions - Stacked */}
                  {isOwner && (
                    <div className="desktop-only rating-actions-stacked">
                      {!rating.inWatchlist ? (
                        <button 
                          className={styles['add-watchlist-btn']}
                          style={{justifyContent: 'center', width: '100%'}}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleAddToWatchlist(rating)
                          }}
                          disabled={addingId === rating.movie_id}
                          title="Add to watchlist"
                        >
                          {addingId === rating.movie_id ? 'ADDING...' : 'ADD TO WATCHLIST'}
                        </button>
                      ) : (
                        <button 
                          className={styles['in-watchlist-btn']}
                          style={{justifyContent: 'center', width: '100%'}}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRemoveFromWatchlist(rating)
                          }}
                          disabled={addingId === rating.movie_id}
                          title="Remove from watchlist"
                        >
                          {addingId === rating.movie_id ? 'REMOVING...' : 'IN WATCHLIST'}
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteRating(rating.id); }}
                        disabled={deletingId === rating.id}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.4)',
                          fontSize: '0.6rem',
                          fontWeight: '700',
                          letterSpacing: '0.1em',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          marginTop: '0.2rem',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ff4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                      >
                        {deletingId === rating.id ? 'DELETING...' : 'DELETE RATING'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Signup CTA for non-logged users */}
            {!isLoggedIn && ratings.length > displayRatings.length && (
              <div className={styles['signup-cta']}>
                <p>Sign up to see all {ratings.length} ratings with scores!</p>
                <Link href="/auth" className={styles['btn-signup']}>CREATE ACCOUNT</Link>
              </div>
            )}
          </>
        )}
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
      </footer>
    </div>
  )
}
