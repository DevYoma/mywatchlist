'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import type { WatchlistMovie } from '@/types'

interface WatchlistGridProps {
  watchlist: WatchlistMovie[]
  isLoading?: boolean
  isOwner?: boolean // true if viewing own watchlist (can remove)
  isLoggedIn?: boolean // visibility control: logged in users see ratings
  onRemove?: (id: string) => void
  isRemoving?: boolean
  maxItems?: number // limit items shown
  showLoadMore?: boolean
  limitedView?: boolean // for non-logged users: show half, no ratings
}

export function WatchlistGrid({
  watchlist,
  isLoading = false,
  isOwner = false,
  isLoggedIn = true,
  onRemove,
  isRemoving = false,
  maxItems,
  showLoadMore = false,
  limitedView = false,
}: WatchlistGridProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

  // For limited view (non-logged in users), show only half the movies
  let itemsToShow = watchlist
  if (limitedView && !isLoggedIn) {
    const halfCount = Math.ceil(watchlist.length / 2)
    itemsToShow = watchlist.slice(0, halfCount)
  }

  const displayItems = maxItems ? itemsToShow.slice(0, maxItems) : itemsToShow
  const hasMore = maxItems && itemsToShow.length > maxItems

  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id)
      setDeleteConfirm(null)
      toast.success('Removed from watchlist')
    }
  }

  if (isLoading) {
    return <div className="loading-state">Loading watchlist...</div>
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="empty-state">
        <p>No movies in this watchlist yet!</p>
        {isOwner && (
          <Link href="/discover" className="btn-add">+ Browse Movies</Link>
        )}
      </div>
    )
  }

  // Show ratings only if logged in AND not in limited view
  const showRatings = isLoggedIn && !limitedView

  return (
    <>
      <div className="watchlist-grid">
        {displayItems.map((item) => (
          <Link 
            key={item.id} 
            href={`/movie/${item.tmdb_id}`}
            className="movie-card"
          >
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
              {isOwner && onRemove && (
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeleteConfirm({ id: item.id, title: item.title })
                  }}
                  title="Remove from watchlist"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
              {showRatings && item.rating && (
                <div className="rating-badge">★ {item.rating}</div>
              )}
            </div>
            <div className="movie-info">
              <h3>{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Sign up CTA for non-logged users */}
      {limitedView && !isLoggedIn && watchlist.length > displayItems.length && (
        <div className="signup-cta">
          <p>Sign up to see all {watchlist.length} movies with ratings!</p>
          <Link href="/auth" className="btn-signup">CREATE ACCOUNT</Link>
        </div>
      )}

      {showLoadMore && hasMore && isLoggedIn && (
        <button className="load-more-btn">
          LOAD FULL WATCHLIST ({itemsToShow.length - (maxItems || 0)} MORE)
        </button>
      )}

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
                onClick={() => handleRemove(deleteConfirm.id)}
                disabled={isRemoving}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
