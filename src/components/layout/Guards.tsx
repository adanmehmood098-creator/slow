import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { PageSpinner } from '@/components/ui/Feedback'
import SetupNotice from '@/components/ui/SetupNotice'
import { isSupabaseConfigured } from '@/lib/supabase'

export function RequireAuth({ children, fallback = '/login' }: { children: ReactNode; fallback?: string }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) return <SetupNotice />
  if (loading) return <PageSpinner />
  if (!user) {
    return <Navigate to={fallback} state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (!isSupabaseConfigured) return <SetupNotice />
  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdmin) {
    return (
      <div className="page container" style={{ textAlign: 'center', padding: '90px 0' }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🌷</div>
        <h2 style={{ fontSize: 28, marginBottom: 8 }}>Florists only, I'm afraid</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 22 }}>
          This area is for the Bloom &amp; Blush team. Your account is not an admin account.
        </p>
        <a className="btn btn-choco" href="/">Back to the shop</a>
      </div>
    )
  }
  return <>{children}</>
}