'use client'

import styles from './Header.module.css'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProfileMenu } from '@/components/ProfileMenu'

interface HeaderProps {
  username?: string
  aesthetic?: string
  isLoggedIn?: boolean
  unreadCount?: number
}

export function Header({ username, aesthetic, isLoggedIn, unreadCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className={styles['app-header']}>
      <div className={styles['header-container']}>
        {/* Logo */}
        <div className={styles['logo']}>
          <Link href={isLoggedIn ? "/dashboard" : "/"} className={styles['logo-link']}>
            <div className={styles['logo-icon']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
              </svg>
            </div>
            <span className={styles['logo-text']}>MYWATCHLIST</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className={`${styles['header-nav']} ${styles['desktop-nav']}`}>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={`${styles['nav-link']} ${isActive('/dashboard') ? styles['active'] : ''}`}>
                Dashboard
              </Link>
              <Link href="/discover" className={`${styles['nav-link']} ${isActive('/discover') ? styles['active'] : ''}`}>
                Explore
              </Link>
              <Link href="/activity" className={`${styles['nav-link']} ${isActive('/activity') ? styles['active'] : ''}`}>
                Activity
              </Link>
              <Link href="/watchlists" className={`${styles['nav-link']} ${isActive('/watchlists') ? styles['active'] : ''}`}>
                Watchlists
              </Link>
            </>
          ) : (
            <>
              <Link href="/discover" className={`${styles['nav-link']} ${isActive('/discover') ? styles['active'] : ''}`}>
                Explore
              </Link>
              <Link href="/watchlists" className={`${styles['nav-link']} ${isActive('/watchlists') ? styles['active'] : ''}`}>
                Watchlists
              </Link>
            </>
          )}
        </nav>

        {/* Right Side */}
        <div className={styles['header-right']}>
          {isLoggedIn ? (
            <>
              {/* Notification Bell */}
              <Link href="/activity" className={styles['notification-btn']}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                {unreadCount > 0 && <span className={styles['notification-badge']}>{unreadCount}</span>}
              </Link>

              {/* Desktop Profile Menu */}
              <div className={styles['desktop-profile']}>
                <span className={styles['username']}>@{username || 'user'}</span>
                <ProfileMenu username={username} aesthetic={aesthetic} />
              </div>
            </>
          ) : (
            <Link href="/auth" className={styles['sign-in-btn']}>
              SIGN IN
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button 
            className={styles['mobile-menu-btn']}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              {mobileMenuOpen ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={styles['mobile-menu']}>
          {isLoggedIn ? (
            <>
              <Link 
                href="/dashboard" 
                className={`${styles['mobile-nav-link']} ${isActive('/dashboard') ? styles['active'] : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/discover" 
                className={`${styles['mobile-nav-link']} ${isActive('/discover') ? styles['active'] : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                href="/activity" 
                className={`${styles['mobile-nav-link']} ${isActive('/activity') ? styles['active'] : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Activity
                {unreadCount > 0 && <span className={styles['mobile-notification-badge']}>{unreadCount}</span>}
              </Link>
              <Link 
                href="/watchlists" 
                className={`${styles['mobile-nav-link']} ${isActive('/watchlists') ? styles['active'] : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Watchlists
              </Link>
              <hr className={styles['mobile-divider']} />
              <Link 
                href={`/user/${username}`} 
                className={styles['mobile-nav-link']}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                href="/settings/profile" 
                className={styles['mobile-nav-link']}
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </Link>
              <button 
                className={`${styles['mobile-nav-link']} ${styles['sign-out-btn']}`}
                onClick={async () => {
                  setMobileMenuOpen(false)
                  try {
                    const { AuthService } = await import('@/services')
                    await AuthService.signOut()
                    window.location.href = '/auth'
                  } catch (error) {
                    console.error('Sign out failed:', error)
                  }
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/discover" 
                className={`${styles['mobile-nav-link']} ${isActive('/discover') ? styles['active'] : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore
              </Link>
              <Link 
                href="/watchlists" 
                className={`${styles['mobile-nav-link']} ${isActive('/watchlists') ? styles['active'] : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Watchlists
              </Link>
              <hr className={styles['mobile-divider']} />
              <Link 
                href="/auth" 
                className={styles['mobile-nav-link']}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
