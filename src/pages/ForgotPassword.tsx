import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const { push } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
      push('Reset link sent', { sub: 'Check your inbox — it expires in 1 hour' })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell quote="“The earth laughs in flowers.” — Ralph Waldo Emerson">
      <h2>Forgot your password?</h2>
      <p className="auth-sub">No worries — petals fall, so do passwords. Tell us your email and we'll send a reset link.</p>
      {error && <div className="auth-error">{error}</div>}
      {sent ? (
        <div className="auth-success">
          💌 A password reset link has been sent to <strong>{email}</strong>. Follow the link (it expires in 1 hour) to
          choose a new password.
        </div>
      ) : (
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
          <button type="submit" className="btn btn-choco btn-lg btn-block" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Send Reset Link'}
          </button>
        </form>
      )}
      <p className="auth-alt">
        Remembered it? <Link to="/login">Back to Sign In</Link>
      </p>
    </AuthShell>
  )
}