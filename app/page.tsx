import './landing.css'
import Link from 'next/link'
import { Header } from '@/components/Header'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="grid-background" />
      <div className="border-glow" />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>No. 1 Movie sharing platform</span>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>

          <h1 className="hero-title">
            Discover and share
            <br />
            <span className="gradient-text">your favorite</span>
            <br />
            <span className="gradient-text">watchlists.</span>
          </h1>

          <p className="hero-description">
            Rate movies, build your collection, and get inspired by others.
            <br />
            Share your taste with the community.
          </p>

          <div className="hero-actions">
            <Link href="/auth" className="cta-primary">
              Get Started
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
            <Link href="/discover" className="cta-secondary">
              Explore Watchlists
            </Link>
          </div>

          {/* Floating Movie Icons */}
          <div className="floating-icons">
            <div className="icon-wrapper icon-1">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
              </svg>
            </div>
            <div className="icon-wrapper icon-2">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="icon-wrapper icon-3">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          Built with <span className="heart">❤️</span> by{' '}
          <a href="https://github.com/DevYoma" target="_blank" rel="noopener noreferrer" className="author-link">
            Yoma
          </a>
        </p>
      </footer>
    </div>
  )
}
