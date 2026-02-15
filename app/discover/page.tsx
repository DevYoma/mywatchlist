'use client'

import styles from './discover.module.css'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useTrending, useSearchMovies, useWatchlist, useUnreadActivityCount, TMDBService } from '@/hooks'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/Header'

// Genre mapping for TMDB
const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
]

export default function DiscoverPage() {
  const router = useRouter()
  
  // Auth state via React Query hook - NO useEffect needed!
  const { user, isLoggedIn } = useAuth()
  const { profile } = useProfile(user?.id)
  const { data: unreadCount = 0 } = useUnreadActivityCount(user?.id)
  
  // Watchlist via React Query
  const { watchlist, addToWatchlist, isAdding } = useWatchlist(user?.id)
  
  // Local UI state
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)
  
  // Ref for debounce timer
  const timerRef = useRef<NodeJS.Timeout | null>(null)


  // Handle search input with proper debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    
    // Set new timer - only update debounced value after 300ms of no typing
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // React Query hooks - NO useEffect needed for fetching!
  const { data: trendingMovies, isLoading: trendingLoading } = useTrending('week')
  const { data: searchResults, isLoading: searchLoading } = useSearchMovies(debouncedSearch)

  // Determine which movies to show (memoized for performance)
  const isSearching = debouncedSearch.length >= 3
  const movies = useMemo(() => {
    let result = isSearching ? (searchResults?.results || []) : (trendingMovies || [])
    
    // Filter by genre if selected
    if (selectedGenre) {
      result = result.filter(movie => movie.genre_ids.includes(selectedGenre))
    }
    
    return result
  }, [isSearching, searchResults, trendingMovies, selectedGenre])

  const loading = isSearching ? searchLoading : trendingLoading

  // Handle clicking rate button - check login status
  const handleRateClick = (movieId: number) => {
    if (!isLoggedIn) {
      toast.error('You need to log in to rate movies')
      return
    }
    router.push(`/movie/${movieId}`)
  }

  // Handle add to watchlist
  const handleAddToWatchlist = (movie: { id: number; title: string; poster_path: string | null; release_date?: string }) => {
    if (!isLoggedIn) {
      toast.error('You need to log in to add movies to your watchlist')
      return
    }
    
    // Check if already in watchlist
    const isInWatchlist = watchlist?.some((item) => item.tmdb_id === movie.id)
    if (isInWatchlist) {
      toast.info('This movie is already in your watchlist')
      return
    }

    // GUARD: Check if movie is rated before allowing add to watchlist
    // Redirect to movie page to rate first
    toast.info('You need to rate this movie before adding to your watchlist')
    router.push(`/movie/${movie.id}`)
  }

  // Check if movie is in watchlist
  const isInWatchlist = (tmdbId: number) => {
    return watchlist?.some((item) => item.tmdb_id === tmdbId)
  }

  return (
    <div className={styles['discover-page']}>
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      <Header 
        username={profile?.username}
        aesthetic="Cinema"
        isLoggedIn={isLoggedIn}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <main className={styles['discover-main']}>
        <div className={styles['page-title']}>
          <h1>Search & Quick Rate</h1>
          <p>FIND AND RATE MOVIES TO REFINE YOUR TASTE PROFILE</p>
        </div>

        {/* Search & Filters */}
        <div className={styles['search-filters']}>
          <div className={styles['search-box']}>
            <svg className={styles['search-icon']} viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search by title, genre, or director..."
              value={searchInput}
              onChange={handleSearchChange}
              className={styles['search-input']}
            />
            {searchInput && (
              <span className={styles['search-badge']}>
                {searchInput.length < 3 ? 'TYPE MORE...' : 'SEARCHING'}
              </span>
            )}
          </div>

          <div className={styles['filter-row']}>
            <select 
              className={styles['genre-select']}
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Genres</option>
              {GENRES.map(genre => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>

            <button className={styles['filter-toggle']}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Movie Grid */}
        <section className={styles['movies-grid']}>
          {loading ? (
            <div className={styles['loading-state']}>
              <span>LOADING MOVIES...</span>
            </div>
          ) : movies.length === 0 ? (
            <div className={styles['empty-state']}>
              <h3>NO MOVIES FOUND</h3>
              <p>Try a different search term or genre filter.</p>
            </div>
          ) : (
            movies.map(movie => (
              <div 
                key={movie.id} 
                className={styles['movie-card']}
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <div className={styles['movie-poster']}>
                  {movie.poster_path ? (
                    <img 
                      src={TMDBService.getImageUrl(movie.poster_path, 'w500') || ''} 
                      alt={movie.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles['no-poster']}>
                      <span>🎬</span>
                    </div>
                  )}
                  <div className={styles['movie-overlay']}>
                    <button 
                      className={styles['quick-rate-btn']}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRateClick(movie.id)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      RATE
                    </button>
                    <button 
                      className={`${styles['quick-add-btn']} ${isInWatchlist(movie.id) ? styles['added'] : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToWatchlist(movie)
                      }}
                      disabled={isAdding}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                      </svg>
                      {isInWatchlist(movie.id) ? 'SAVED' : 'SAVE'}
                    </button>
                  </div>
                </div>
                <div className={styles['movie-info']}>
                  <h3 className={styles['movie-title']}>{movie.title}</h3>
                  <div className={styles['movie-meta']}>
                    <span className={styles['movie-year']}>{movie.release_date?.slice(0, 4) || 'N/A'}</span>
                    <span className={styles['meta-separator']}>•</span>
                    <span className={styles['movie-rating']}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className={styles['genre-tag']}>
                      {GENRES.find(g => movie.genre_ids.includes(g.id))?.name || 'Movie'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Results count */}
        {!loading && movies.length > 0 && (
          <div className={styles['results-count']}>
            SHOWING {movies.length} OF {movies.length}+ RESULTS
          </div>
        )}
      </main>
    </div>
  )
}
