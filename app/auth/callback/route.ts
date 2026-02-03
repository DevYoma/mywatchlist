import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createSupabaseServerClient()
    
    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error || !session?.user) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/auth?error=auth_failed', requestUrl.origin))
    }

    const user = session.user
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // NEW USER: Create profile and show onboarding
    if (!existingProfile) {
      const metadata = user.user_metadata
      const email = user.email || metadata?.email
      const username = email?.split('@')[0] || `user_${user.id.slice(0, 8)}`
      
      await supabase.from('profiles').insert({
        id: user.id,
        email: email,
        username: username,
        avatar_url: metadata?.avatar_url || metadata?.picture,
      })

      // New user → onboarding (one-time)
      const redirectUrl = new URL('/onboarding', requestUrl.origin)
      redirectUrl.searchParams.set('new_user', 'true')
      return NextResponse.redirect(redirectUrl)
    }

    // RETURNING USER: Always go to dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  }

  return NextResponse.redirect(new URL('/auth', requestUrl.origin))
}
