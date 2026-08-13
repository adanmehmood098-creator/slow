import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { confirmPasswordReset } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
      await confirmPasswordReset(password)
      push('Password updated', { sub: 'You can sign in with your new password 🌸' })
      navigate('/login', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote="“A flower cannot blossom without sunshine.” — Rabindranath Tagore">
      <h2>Choose a new password</h2>
      <p className="auth-sub">Fresh start, fresh blooms — pick something you'll remember.</p>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="pw">New Password</label>
          <input
            id="pw"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pw2">Confirm New Password</label>
          <input
            id="pw2"
            type="password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <button type="submit" className="btn btn-choco btn-lg btn-block" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Update Password'}
        </button>
      </form>
      <p className="auth-alt">
        <Link to="/login">Back to Sign In</Link>
      </p>
    </AuthShell>
  )
}