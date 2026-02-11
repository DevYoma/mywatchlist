'use client'

import { useRouter } from 'next/navigation'
import { AuthService } from '@/services'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProfileMenuProps {
  username?: string
  aesthetic?: string
}

export function ProfileMenu({ username, aesthetic }: ProfileMenuProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await AuthService.signOut()
      toast.success('Signed out successfully')
      router.push('/auth')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="avatar-btn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 dropdown-dark">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{username || 'User'}</span>
            <span className="text-xs text-muted-foreground">{aesthetic || 'Movie'} Enthusiast</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {username && (
          <DropdownMenuItem onClick={() => router.push(`/user/${username}`)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="mr-2">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="mr-2">
            <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="mr-2">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
