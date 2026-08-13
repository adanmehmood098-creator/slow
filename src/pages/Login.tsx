import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, user } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const next = params.get('next') || (location.state as { from?: string } | null)?.from || '/account'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      await signIn(email.trim(), password, remember)
      push('Welcome back, flower lover', { sub: 'Good to see you again 🌸' })
      navigate(next, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    navigate(next, { replace: true })
    return null
  }

  return (
    <AuthShell quote="“Every flower is a soul blossoming in nature.” — Gérard De Nerval">
      <h2>Welcome back</h2>
      <p className="auth-sub">Sign in to view orders, track deliveries and shop faster.</p>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ paddingRight: 46 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
            >
              {showPw ? <EyeOff width={18} height={18} /> : <Eye width={18} height={18} />}
            </button>
          </div>
        </div>
        <div className="check-line">
          <label>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button type="submit" className="btn btn-choco btn-lg btn-block" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>
      <p className="auth-alt">
        New to Bloom &amp; Blush? <Link to="/register">Create Account</Link>
      </p>
    </AuthShell>
  )
}