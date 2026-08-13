import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

interface AuthContextValue {
  user: { id: string; email: string | undefined } | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string, remember: boolean) => Promise<void>
  signUp: (fullName: string, email: string, password: string) => Promise<{ needsEmailConfirm: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  confirmPasswordReset: (newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchProfile(userId: string, retries = 3): Promise<Profile | null> {
  if (!supabase) return null
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (!error && data) return data as Profile
    await new Promise((r) => setTimeout(r, 350 * attempt))
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let active = true
    supabase!.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const u = data.session?.user ?? null
      setUser(u ? { id: u.id, email: u.email } : null)
      if (u) {
        const remember = localStorage.getItem('bb_remember') !== '0'
        if (!remember) {
          await supabase!.auth.signOut()
          setUser(null)
          setProfile(null)
        } else {
          setProfile(await fetchProfile(u.id))
        }
      }
      setLoading(false)
    })
    const { data: sub } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null
      setUser(u ? { id: u.id, email: u.email } : null)
      if (u) setProfile(await fetchProfile(u.id))
      else setProfile(null)
      setLoading(false)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string, remember: boolean) => {
    if (!supabase) throw new Error('Connect Supabase first (see README)')
    localStorage.setItem('bb_remember', remember ? '1' : '0')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [])

  const signUp = useCallback(async (fullName: string, email: string, password: string) => {
    if (!supabase) throw new Error('Connect Supabase first (see README)')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(error.message)
    return { needsEmailConfirm: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Connect Supabase first (see README)')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    if (error) throw new Error(error.message)
  }, [])

  const confirmPasswordReset = useCallback(async (newPassword: string) => {
    if (!supabase) throw new Error('Connect Supabase first (see README)')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }, [])

  const refreshProfile = useCallback(async () => {
    const u = user
    if (!u) return
    const p = await fetchProfile(u.id, 2)
    if (p) setProfile(p)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        signIn,
        signUp,
        signOut,
        resetPassword,
        confirmPasswordReset,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}