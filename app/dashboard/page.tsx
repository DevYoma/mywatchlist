'use client'

import './dashboard.css'
import '@/components/ActivityFeed/ActivityFeed.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useProfileStats, useWatchlist, useTrending, useFollow, TMDBService } from '@/hooks'
import { AuthService } from '@/services'
import Link from 'next/link'
import { toast } from 'sonner'
import { ActivityFeed } from '@/components/ActivityFeed'
import { ProfileMenu } from '@/components/ProfileMenu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function DashboardPage() {
  const router = useRouter()
  
  // All data via React Query - no manual useEffect for fetching!
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id)
  const { data: stats } = useProfileStats(user?.id)
  const { watchlist, isLoading: isWatchlistLoading, removeFromWatchlist, isRemoving } = useWatchlist(user?.id)
  const { data: trendingMovies, isLoading: isTrendingLoading } = useTrending('week')
  const { following } = useFollow(user?.id)

  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

  // Only useEffect: redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/auth')
    }
  }, [isAuthLoading, isLoggedIn, router])

  const handleSignOut = async () => {
    await AuthService.signOut()
    router.push('/auth')
  }

  const handleRemoveFromWatchlist = (id: string) => {
    removeFromWatchlist(id, {
      onSuccess: () => {
        toast.success('Removed from watchlist')
        setDeleteConfirm(null)
      },
      onError: () => {
        toast.error('Failed to remove from watchlist')
      },
    })
  }

  const loading = isAuthLoading || isProfileLoading

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING...</span>
        </div>
      </div>
    )
  }

  // Get first preference as "aesthetic"
  const aesthetic = profile?.preferences?.[0] || 'Cinephile'
  const moviesWatched = stats?.moviesRated || 0

  return (
    <div className="dashboard-page">
      <div className="grid-background" />
      <div className="border-glow" />

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <Link href="/dashboard" className="logo-link">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
              </svg>
            </div>
            <span className="logo-text">MyWatchList</span>
          </Link>
        </div>
        
        <nav className="header-nav">
          <Link href="/dashboard" className="nav-link active">Dashboard</Link>
          <Link href="/discover" className="nav-link">Explore</Link>
          <Link href="/activity" className="nav-link">Activity</Link>
          <Link href="/watchlists" className="nav-link">Watchlists</Link>
        </nav>

        {/* Search bar - commented out for now */}
        {/* <div className="header-search">
          <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input type="text" placeholder="Search films, lists, or movie buffs..." className="search-input" />
        </div> */}

        <div className="header-right">
          <button className="notification-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          
          <div className="user-menu">
            <span className="username">@{profile?.username || 'user'}</span>
            <ProfileMenu username={profile?.username} aesthetic={aesthetic} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content">
          {/* Hero Section */}
          <section className="hero-section">
            <h1 className="hero-title">
              Your taste. <span className="highlight">Shared.</span>
            </h1>
            <p className="hero-subtitle">
              Welcome back, {profile?.username || 'Cinephile'}. You have <strong>{moviesWatched} films</strong> watched this month.
              Your film aesthetic is currently <span className="aesthetic">{aesthetic}</span>.
            </p>
            <div className="hero-actions">
              <Link href="/discover" className="btn-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                Rate a Movie
              </Link>
              <button className="btn-secondary" disabled>
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M19 9l-7 7-7-7"/>
                </svg>
                Get AI Picks
              </button>
            </div>
          </section>

          {/* Activity Feed */}
          {user?.id && <ActivityFeed userId={user.id} />}

          {/* Your Watchlist Section - Movies you've watched and rated */}
          <section className="watchlist-section">
            <div className="section-header">
              <h2>Your Watched Movies</h2>
              <span className="watchlist-count">{watchlist?.length || 0} RATED</span>
              <div className="watchlist-controls">
                <span className="sort-label">Date Added</span>
                <button className="sort-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="watchlist-grid">
              {isWatchlistLoading ? (
                <div className="loading-state">Loading watchlist...</div>
              ) : watchlist && watchlist.length > 0 ? (
                watchlist.slice(0, 12).map((item) => (
                  <div key={item.id} className="movie-card">
                    <div className="movie-poster">
                      {item.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                          alt={item.title} 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="no-poster">🎬</div>
                      )}
                      <button 
                        className="remove-btn"
                        onClick={() => setDeleteConfirm({ id: item.id, title: item.title })}
                        title="Remove from watchlist"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="movie-info">
                      <h3>{item.title}</h3>
                      <div className="movie-meta">
                        <span className="rating">{item.rating ? `★ ${item.rating}` : ''}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Your watchlist is empty!</p>
                  <Link href="/discover" className="btn-add">+ Browse Movies</Link>
                </div>
              )}
            </div>

            {watchlist && watchlist.length > 12 && (
              <button className="load-more-btn">
                LOAD FULL WATCHLIST ({watchlist.length - 12} MORE)
              </button>
            )}
          </section>
        </div>

        {/* Trending Sidebar */}
        <aside className="trending-sidebar">
          <div className="sidebar-header">
            <h2>Trending</h2>
            <div className="nav-arrows">
              <button className="arrow-btn">&lt;</button>
              <button className="arrow-btn">&gt;</button>
            </div>
          </div>

          <div className="trending-lists">
            {/* Commented out for now - focus on core features
            {isTrendingLoading ? (
              <div className="loading-state">Loading...</div>
            ) : trendingMovies && trendingMovies.length > 0 ? (
              <>
                <div className="trending-card">
                  <div className="card-header">
                    <h3>Trending Now</h3>
                    <span className="film-count">{trendingMovies.length} FILMS</span>
                  </div>
                  <p className="card-author">@TMDB</p>
                  <div className="poster-stack">
                    {trendingMovies.slice(0, 3).map((movie, i) => (
                      <img 
                        key={movie.id}
                        src={TMDBService.getImageUrl(movie.poster_path, 'w200') || ''} 
                        alt={movie.title}
                        className="stack-poster"
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                    {trendingMovies.length > 3 && (
                      <span className="more-count">+{trendingMovies.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="trending-card">
                  <div className="card-header">
                    <h3>Top Rated This Week</h3>
                    <span className="film-count">{Math.min(10, trendingMovies.length)} FILMS</span>
                  </div>
                  <p className="card-author">@TMDB</p>
                  <div className="poster-stack">
                    {trendingMovies.slice(3, 6).map((movie, i) => (
                      <img 
                        key={movie.id}
                        src={TMDBService.getImageUrl(movie.poster_path, 'w200') || ''} 
                        alt={movie.title}
                        className="stack-poster"
                        style={{ zIndex: 3 - i }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="no-trending">No trending content available</p>
            )}
            */}
            <p className="coming-soon-text">Trending lists coming soon...</p>
          </div>

          {/* Profile Actions removed - using dropdown in header instead */}
        </aside>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon small">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
              </svg>
            </div>
            <span className="brand-name">MYWATCHLIST</span>
            <p className="brand-desc">A decentralized film community for the aesthetic elite.<br/>Track your journey through cinema and find your tribe.</p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h4>PLATFORM</h4>
              <a href="#">Release Notes</a>
              <a href="#">API Docs</a>
              <a href="#">Support</a>
            </div>
            <div className="link-group">
              <h4>CONNECT</h4>
              <div className="social-icons">
                <a href="#" className="social-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 NEO_PROTOCOL_V_0.0.0</span>
          <div className="footer-legal">
            <a href="#">PRIVACY</a>
            <a href="#">TERMS</a>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Remove from Watchlist?</h3>
            <p>Are you sure you want to remove <strong>{deleteConfirm.title}</strong> from your watchlist?</p>
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => handleRemoveFromWatchlist(deleteConfirm.id)}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
