'use client'

import styles from './onboarding.module.css'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { toast } from 'sonner'
import { ProfileService, AuthService } from '@/services'

const vibes = [
  { id: 'cyberpunk', label: 'CYBERPUNK', icon: '🎬' },
  { id: 'noir', label: 'NOIR', icon: '🏛️' },
  { id: 'indie', label: 'INDIE', icon: '🌀' },
  { id: 'sci-fi', label: 'SCI-FI', icon: '🚀' },
  { id: 'psychological', label: 'PSYCHOLOGICAL', icon: '🧠' },
  { id: 'dystopian', label: 'DYSTOPIAN', icon: '☁️' },
  { id: 'retro-futurism', label: 'RETRO-FUTURISM', icon: '📺' },
  { id: 'slice-of-life', label: 'SLICE OF LIFE', icon: '💬' },
  { id: 'high-fantasy', label: 'HIGH FANTASY', icon: '🏰' },
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Show welcome toast for new users
    if (searchParams.get('new_user') === 'true') {
      toast.success('Account created successfully!', {
        description: 'Welcome to MyWatchList, cinephile.',
      })
    }
  }, [searchParams])

  const toggleVibe = (id: string) => {
    setSelectedVibes(prev => 
      prev.includes(id) 
        ? prev.filter(v => v !== id)
        : [...prev, id]
    )
  }

  const savePreferencesAndRedirect = async (preferences: string[]) => {
    setSaving(true)
    try {
      const user = await AuthService.getUser()
      if (user) {
        await ProfileService.updatePreferences(user.id, preferences)
        if (preferences.length > 0) {
          toast.success('Preferences saved!')
        }
      }
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  const handleInitialize = () => {
    savePreferencesAndRedirect(selectedVibes)
  }

  const handleSkip = () => {
    savePreferencesAndRedirect([])
  }

  return (
    <div className={styles['onboarding-page']}>
      {/* Grid background */}
      <div className={styles['grid-background']} />
      <div className={styles['border-glow']} />

      {/* Header */}
      <header className={styles['onboarding-header']}>
        <div className={styles['logo']}>
          <div className={styles['logo-icon']}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
            </svg>
          </div>
          <span className={styles['logo-text']}>MyWatchList</span>
        </div>
        <div className={styles['step-indicator']}>
          <div className={styles['step-dots']}>
            <span className={`${styles['dot']} ${styles['completed']}`} />
            <span className={`${styles['dot']} ${styles['completed']}`} />
            <span className={`${styles['dot']} ${styles['active']}`} />
          </div>
          <span className={styles['step-label']}>STEP 3 OF 3</span>
        </div>
      </header>

      {/* Main content */}
      <main className={styles['onboarding-main']}>
        <h1 className={styles['title']}>SELECT YOUR VIBE</h1>
        <p className={styles['subtitle']}>
          Pick at least 3 themes to calibrate your discovery engine<br />
          and personal AI recommendation feed.
        </p>

        <div className={styles['vibes-grid']}>
          {vibes.map(vibe => (
            <button
              key={vibe.id}
              className={`${styles['vibe-card']} ${selectedVibes.includes(vibe.id) ? styles['selected'] : ''}`}
              onClick={() => toggleVibe(vibe.id)}
              disabled={saving}
            >
              <span className={styles['vibe-icon']}>{vibe.icon}</span>
              <span className={styles['vibe-label']}>{vibe.label}</span>
            </button>
          ))}
        </div>

        <div className={styles['actions']}>
          <button 
            className={styles['btn-primary']}
            onClick={handleInitialize}
            disabled={saving}
          >
            {saving ? 'SAVING...' : 'INITIALIZE PROFILE'}
          </button>
          <button 
            className={styles['btn-secondary']}
            onClick={handleSkip}
            disabled={saving}
          >
            I&apos;LL SET THESE UP LATER
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles['onboarding-footer']}>
        <p>SYSTEM PROTOCOL V3.0.0 © 2024 MYWATCHLIST DISCOVERY CORP.</p>
      </footer>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className={styles['onboarding-page']}>
        <div className={styles['grid-background']} />
        <div className={styles['border-glow']} />
        <div className={styles['loading']} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <span>CALIBRATING SYSTEMS...</span>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
