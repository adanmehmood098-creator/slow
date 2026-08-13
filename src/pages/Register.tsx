import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { needsEmailConfirm } = await signUp(fullName.trim(), email.trim(), password)
      if (needsEmailConfirm) {
        setInfo('Almost there! Check your inbox and confirm your email to finish creating your account. 🌷')
        push('Confirm your email', { sub: 'We sent a link to ' + email.trim() })
      } else {
        push('Welcome to Bloom & Blush!', { sub: 'Your account is ready 🌸' })
        navigate('/account', { replace: true })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote="“Where flowers bloom, so does hope.” — Lady Bird Johnson">
      <h2>Create your account</h2>
      <p className="auth-sub">Join 12,000+ flower lovers — wishlists, faster checkout and birthday blooms. 🌷</p>
      {error && <div className="auth-error">{error}</div>}
      {info && <div className="auth-success">{info}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Jane Bloomfield"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
        <div className="field">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type={showPw ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <button type="submit" className="btn btn-choco btn-lg btn-block" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>
      </form>
      <p className="auth-alt">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </AuthShell>
  )
}