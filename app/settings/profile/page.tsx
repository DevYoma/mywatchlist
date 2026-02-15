'use client'

import styles from './settings.module.css'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useProfileStats, useCheckUsername, useUnreadActivityCount } from '@/hooks'
import { AuthService } from '@/services'
import Link from 'next/link'
import { toast } from 'sonner'
import { Header } from '@/components/Header'

// Genre options
const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'Documentary', 'Noir', 'Indie',
  'Cyberpunk', 'Western', 'Musical', 'War', 'Family'
]

export default function SettingsProfilePage() {
  const router = useRouter()
  
  // Auth via React Query - no useEffect needed!
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth()
  
  // Profile via React Query
  const { profile, isLoading: isProfileLoading, updateProfile, updatePreferences, isUpdating } = useProfile(user?.id)

  // Stats via React Query
  const { data: stats } = useProfileStats(user?.id)
  const { data: unreadCount = 0 } = useUnreadActivityCount(user?.id)
  
  // Get aesthetic from profile preferences (genres is an array)
  const aesthetic = (Array.isArray(profile?.preferences) && profile.preferences.length > 0) 
    ? profile.preferences[0] 
    : 'Movie'

  
  // Form states (local, for editing)
  const [username, setUsername] = useState('')
  const [debouncedUsername, setDebouncedUsername] = useState('')
  const [bio, setBio] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [showGenres, setShowGenres] = useState(false)
  
  // Debounce timer ref for username
  const usernameTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Username availability via React Query
  const { data: usernameExists, isLoading: checkingUsername } = useCheckUsername(
    debouncedUsername, 
    profile?.username
  )
  const usernameAvailable = debouncedUsername.length >= 3 && debouncedUsername !== profile?.username 
    ? !usernameExists 
    : null

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !isLoggedIn) {
      router.push('/auth')
    }
  }, [isAuthLoading, isLoggedIn, router])

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.username)
      setDebouncedUsername(profile.username)
      setBio(profile.bio || '')
      setSelectedGenres(profile.preferences || [])
    }
  }, [profile])

  // Handle username input with debouncing
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(value)
    
    // Clear existing timer
    if (usernameTimerRef.current) {
      clearTimeout(usernameTimerRef.current)
    }
    
    // Debounce the actual check by 500ms
    usernameTimerRef.current = setTimeout(() => {
      console.log("this runs after 500ms")
      setDebouncedUsername(value)
    }, 500)
  }

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  const handleSave = async () => {
    if (!profile) return
    
    // Validate username
    if (username !== profile.username && !usernameAvailable) {
      toast.error('Please choose an available username')
      return
    }

    try {
      // Update profile (username and bio)
      if (username !== profile.username || bio !== (profile.bio || '')) {
        updateProfile({
          username,
          bio: bio || undefined
        })
      }

      // Update preferences if changed
      const prefsChanged = JSON.stringify(selectedGenres.sort()) !== JSON.stringify((profile.preferences || []).sort())
      if (prefsChanged) {
        updatePreferences(selectedGenres)
      }

      toast.success('Profile updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    }
  }

  const handleSignOut = async () => {
    try {
      await AuthService.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  const loading = isAuthLoading || isProfileLoading

  if (loading) {
    return (
      <div className={styles['settings-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']}>
          <span>LOADING SETTINGS...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['settings-page']}>
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      <Header 
        username={profile?.username}
        aesthetic={aesthetic}
        isLoggedIn={isLoggedIn}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <main className={styles['settings-main']}>
        {/* Avatar */}
        <div className={styles['avatar-section']}>
          <div className={styles['avatar-container']}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className={styles['avatar-img']} />
            ) : (
              <div className={styles['avatar-placeholder']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Username Field */}
        <div className={styles['form-group']}>
          <label className={styles['form-label']}>USERNAME</label>
          <div className={styles['input-wrapper']}>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`${styles['form-input']} ${usernameAvailable === false ? styles['error'] : usernameAvailable === true ? styles['success'] : ''}`}
              placeholder="your_username"
            />
            {checkingUsername && <span className={styles['input-status']}>Checking...</span>}
            {!checkingUsername && usernameAvailable === true && <span className={`${styles['input-status']} ${styles['success']}`}>✓ Available</span>}
            {!checkingUsername && usernameAvailable === false && <span className={`${styles['input-status']} ${styles['error']}`}>✗ Taken</span>}
          </div>
        </div>

        {/* Bio Field */}
        <div className={styles['form-group']}>
          <label className={styles['form-label']}>BIO</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={styles['form-textarea']}
            placeholder="Tell us about your taste..."
            rows={4}
            maxLength={200}
          />
          <span className={styles['char-count']}>{bio.length}/200</span>
        </div>

        {/* Stats Overview (readonly) */}
        <div className={styles['stats-section']}>
          <label className={styles['form-label']}>STATS OVERVIEW</label>
          <div className={styles['stats-grid']}>
            <div className={styles['stat-box']}>
              <span className={`${styles['stat-value']} ${styles['pink']}`}>{(stats?.moviesRated || 0).toLocaleString()}</span>
              <span className={styles['stat-label']}>MOVIES RATED</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-value']}>{(stats?.followers || 0).toLocaleString()}</span>
              <span className={styles['stat-label']}>FOLLOWERS</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-value']}>0</span>
              <span className={styles['stat-label']}>LISTS</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-value']}>0</span>
              <span className={styles['stat-label']}>REVIEWS</span>
            </div>
          </div>
        </div>

        {/* Genre Preferences */}
        <div className={styles['form-group']}>
          <button 
            className={styles['genre-toggle-btn']}
            onClick={() => setShowGenres(!showGenres)}
          >
            <span className={styles['form-label']}>GENRE PREFERENCES</span>
            <span className={styles['toggle-icon']}>{showGenres ? '▼' : '▶'}</span>
          </button>
          
          {showGenres && (
            <div className={styles['genres-grid']}>
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  className={`${styles['genre-chip']} ${selectedGenres.includes(genre) ? styles['selected'] : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  <span className={styles['checkbox']}>{selectedGenres.includes(genre) ? '☑' : '☐'}</span>
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className={styles['danger-zone']}>
          <div className={styles['danger-header']}>
            <span className={styles['danger-icon']}>⚠</span>
            <span className={styles['danger-title']}>DANGER ZONE</span>
          </div>
          <p className={styles['danger-text']}>Actions here are irreversible. Please proceed with caution.</p>
          <button onClick={handleSignOut} className={styles['signout-btn']}>
            SIGN OUT
          </button>
        </div>

        {/* Action Buttons */}
        <div className={styles['action-buttons']}>
          <button 
            onClick={() => router.push('/dashboard')} 
            className={styles['cancel-btn']}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className={styles['save-btn']}
            disabled={isUpdating || (username !== profile?.username && usernameAvailable === false)}
          >
            {isUpdating ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </main>
    </div>
  )
}
