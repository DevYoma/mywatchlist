'use client'

import './settings.css'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useProfile, useProfileStats, useCheckUsername } from '@/hooks'
import { AuthService } from '@/services'
import Link from 'next/link'
import { toast } from 'sonner'

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
  const { user, isLoading: isAuthLoading, isLoggedIn } = useAuth()

  console.log(user, isAuthLoading, isLoggedIn)
  
  // Profile via React Query
  const { 
    profile, 
    isLoading: isProfileLoading, 
    updateProfile, 
    updatePreferences,
    isUpdating 
  } = useProfile(user?.id)

  // console.log(profile)
  
  // Stats via React Query
  const { data: stats } = useProfileStats(user?.id)
  
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
      <div className="settings-page">
        <div className="grid-background" />
        <div className="border-glow" />
        <div className="loading">
          <span>LOADING SETTINGS...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="grid-background" />
      <div className="border-glow" />

      {/* Header */}
      <header className="settings-header">
        <Link href="/dashboard" className="logo-link">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
            </svg>
          </div>
          <span className="logo-text">MyWatchList</span>
        </Link>
        
        <nav className="header-nav">
          <Link href="/discover" className="nav-link">Movies</Link>
          <span className="nav-link disabled">Lists</span>
          <span className="nav-link disabled">Community</span>
        </nav>

        <div className="header-actions">
          <button className="notification-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>
          <button className="settings-active-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="settings-main">
        {/* Avatar */}
        <div className="avatar-section">
          <div className="avatar-container">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Username Field */}
        <div className="form-group">
          <label className="form-label">USERNAME</label>
          <div className="input-wrapper">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className={`form-input ${usernameAvailable === false ? 'error' : usernameAvailable === true ? 'success' : ''}`}
              placeholder="your_username"
            />
            {checkingUsername && <span className="input-status">Checking...</span>}
            {!checkingUsername && usernameAvailable === true && <span className="input-status success">✓ Available</span>}
            {!checkingUsername && usernameAvailable === false && <span className="input-status error">✗ Taken</span>}
          </div>
        </div>

        {/* Bio Field */}
        <div className="form-group">
          <label className="form-label">BIO</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="form-textarea"
            placeholder="Tell us about your taste..."
            rows={4}
            maxLength={200}
          />
          <span className="char-count">{bio.length}/200</span>
        </div>

        {/* Stats Overview (readonly) */}
        <div className="stats-section">
          <label className="form-label">STATS OVERVIEW</label>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-value pink">{(stats?.moviesRated || 0).toLocaleString()}</span>
              <span className="stat-label">MOVIES RATED</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{(stats?.followers || 0).toLocaleString()}</span>
              <span className="stat-label">FOLLOWERS</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">0</span>
              <span className="stat-label">LISTS</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">0</span>
              <span className="stat-label">REVIEWS</span>
            </div>
          </div>
        </div>

        {/* Genre Preferences */}
        <div className="form-group">
          <button 
            className="genre-toggle-btn"
            onClick={() => setShowGenres(!showGenres)}
          >
            <span className="form-label">GENRE PREFERENCES</span>
            <span className="toggle-icon">{showGenres ? '▼' : '▶'}</span>
          </button>
          
          {showGenres && (
            <div className="genres-grid">
              {GENRE_OPTIONS.map(genre => (
                <button
                  key={genre}
                  className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  <span className="checkbox">{selectedGenres.includes(genre) ? '☑' : '☐'}</span>
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <div className="danger-header">
            <span className="danger-icon">⚠</span>
            <span className="danger-title">DANGER ZONE</span>
          </div>
          <p className="danger-text">Actions here are irreversible. Please proceed with caution.</p>
          <button onClick={handleSignOut} className="signout-btn">
            SIGN OUT
          </button>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={() => router.push('/dashboard')} 
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="save-btn"
            disabled={isUpdating || (username !== profile?.username && usernameAvailable === false)}
          >
            {isUpdating ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </main>
    </div>
  )
}
