'use client'

import './not-found.css'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="grid-background" />
      <div className="border-glow" />
      
      <div className="not-found-container">
        <div className="glitch-wrapper">
          <div className="glitch" data-text="404">404</div>
        </div>
        
        <h1 className="error-title">CONTENT NOT FOUND</h1>
        <p className="error-message">
          The page you're looking for has been removed, relocated, or never existed in our database.
        </p>
        
        <div className="error-details">
          <div className="detail-item">
            <span className="detail-label">ERROR CODE:</span>
            <span className="detail-value">404_NOT_FOUND</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">STATUS:</span>
            <span className="detail-value">RESOURCE UNAVAILABLE</span>
          </div>
        </div>

        <div className="action-buttons">
          <Link href="/dashboard" className="btn-primary">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            RETURN TO DASHBOARD
          </Link>
          <Link href="/discover" className="btn-secondary">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            EXPLORE MOVIES
          </Link>
        </div>

        <div className="error-footer">
          <p>Lost? Try searching for movies or check your watchlist.</p>
        </div>
      </div>
    </div>
  )
}
