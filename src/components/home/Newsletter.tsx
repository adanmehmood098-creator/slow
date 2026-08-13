import { useState } from 'react'
import { Send } from 'lucide-react'
import { subscribeNewsletter } from '@/lib/db'
import Reveal from '@/components/ui/Reveal'
import { useToast } from '@/context/ToastContext'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const { push } = useToast()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      push('Please enter a valid email', { sub: 'We double-check, so flowers never get lost 🌷' })
      return
    }
    subscribeNewsletter(value)
    setEmail('')
    push("You're subscribed!", { sub: 'Offers & inspiration, straight to your inbox 🌸' })
  }

  return (
    <section className="newsletter section-sm">
      <div className="container">
        <Reveal>
          <div className="newsletter-inner">
            <h2>Get Flowers, Offers &amp; Inspiration</h2>
            <p>Join 12,000+ flower lovers. New-season blooms, secret sales and care tips — no spam, ever.</p>
            <form className="newsletter-form" onSubmit={onSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button type="submit" className="btn btn-choco">
                Subscribe <Send width={15} height={15} />
              </button>
            </form>
            <p className="newsletter-note">By subscribing you agree to our privacy policy. Unsubscribe anytime.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}