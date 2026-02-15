'use client'

import styles from './auth.module.css'
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
    <div className={styles['auth-page']}>
      {/* Grid background */}
      <div className={styles['grid-background']} />
      
      {/* Cyan border glow effect */}
      <div className={styles['border-glow']} />
      
      {/* Header */}
      <header className={styles['auth-header']}>
        <div className={styles['logo']}>
          <div className={styles['logo-icon']}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
            </svg>
          </div>
          <span className={styles['logo-text']}>MYWATCHLIST</span>
        </div>
        <div className={styles['status-bar']}>
          <span className={styles['status-item']}>SYSTEM_STATUS: ONLINE</span>
          <span className={styles['status-item']}>ENTRY_POINT: 01</span>
        </div>
      </header>

      {/* Main content */}
      <main className={styles['auth-main']}>
        {/* Left side - Hero text */}
        <div className={styles['hero-section']}>
          <p className={styles['phase-label']}>PHASE 01: IDENTIFICATION</p>
          <h1 className={styles['hero-title']}>
            <span className={styles['hero-line']}>Your</span>
            <span className={styles['hero-line']}>taste.</span>
            <span key="accent" className={`${styles['hero-line']} ${styles['accent']}`}>Shared.</span>
          </h1>
        </div>

        {/* Right side - Auth card */}
        <div className={styles['auth-card']}>
          <div className={styles['card-header']}>
            <h2 className={styles['card-title']}>INITIALIZE ACCESS</h2>
            <p className={styles['card-subtitle']}>CREDENTIALS REQUIRED TO PROCEED</p>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className={styles['google-btn']}
          >
            <svg className={styles['google-icon']} viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          <div className={styles['divider']}>
            <span>OR</span>
          </div>

          <button 
            onClick={handleContinueAsVisitor}
            className={styles['visitor-btn']}
          >
            CONTINUE AS VISITOR
          </button>

          <p className={styles['card-footer']}>JOIN THE ELITE CLUB OF CINEPHILES</p>
        </div>
      </main>

      {/* Features section */}
      <section className={styles['features-section']}>
        <div className={styles['feature']}>
          <h3 className={styles['feature-title']}>FOLLOW.</h3>
          <p className={styles['feature-desc']}>Network with the global elite.</p>
        </div>
        <div className={styles['feature']}>
          <h3 className={styles['feature-title']}>RATE.</h3>
          <p className={styles['feature-desc']}>Archive your cinematic journey.</p>
        </div>
        <div className={styles['feature']}>
          <h3 className={styles['feature-title']}>DISCOVER.</h3>
          <p className={styles['feature-desc']}>Find the unseen gems.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles['auth-footer']}>
        <div className={styles['footer-links']}>
          <a href="#">PRIVACY</a>
          <a href="#">PROTOCOL</a>
          <a href="#">CONTACT</a>
        </div>
        <p className={styles['footer-copy']}>© 2024 MYWATCHLIST // VER: 1.0.0_STABLE</p>
      </footer>
    </div>
  )
}
