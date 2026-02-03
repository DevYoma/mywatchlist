'use client'

import './auth.css'
import { AuthService } from '@/services'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      await AuthService.signInWithGoogle()
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const handleContinueAsVisitor = () => {
    router.push('/discover')
  }

  return (
    <div className="auth-page">
      {/* Grid background */}
      <div className="grid-background" />
      
      {/* Cyan border glow effect */}
      <div className="border-glow" />
      
      {/* Header */}
      <header className="auth-header">
        <div className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
            </svg>
          </div>
          <span className="logo-text">MYWATCHLIST</span>
        </div>
        <div className="status-bar">
          <span className="status-item">SYSTEM_STATUS: ONLINE</span>
          <span className="status-item">ENTRY_POINT: 01</span>
        </div>
      </header>

      {/* Main content */}
      <main className="auth-main">
        {/* Left side - Hero text */}
        <div className="hero-section">
          <p className="phase-label">PHASE 01: IDENTIFICATION</p>
          <h1 className="hero-title">
            <span className="hero-line">Your</span>
            <span className="hero-line">taste.</span>
            <span className="hero-line accent">Shared.</span>
          </h1>
        </div>

        {/* Right side - Auth card */}
        <div className="auth-card">
          <div className="card-header">
            <h2 className="card-title">INITIALIZE ACCESS</h2>
            <p className="card-subtitle">CREDENTIALS REQUIRED TO PROCEED</p>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="google-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button 
            onClick={handleContinueAsVisitor}
            className="visitor-btn"
          >
            CONTINUE AS VISITOR
          </button>

          <p className="card-footer">JOIN THE ELITE CLUB OF CINEPHILES</p>
        </div>
      </main>

      {/* Features section */}
      <section className="features-section">
        <div className="feature">
          <h3 className="feature-title">FOLLOW.</h3>
          <p className="feature-desc">Network with the global elite.</p>
        </div>
        <div className="feature">
          <h3 className="feature-title">RATE.</h3>
          <p className="feature-desc">Archive your cinematic journey.</p>
        </div>
        <div className="feature">
          <h3 className="feature-title">DISCOVER.</h3>
          <p className="feature-desc">Find the unseen gems.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="auth-footer">
        <div className="footer-links">
          <a href="#">PRIVACY</a>
          <a href="#">PROTOCOL</a>
          <a href="#">CONTACT</a>
        </div>
        <p className="footer-copy">© 2024 MYWATCHLIST // VER: 1.0.0_STABLE</p>
      </footer>
    </div>
  )
}
