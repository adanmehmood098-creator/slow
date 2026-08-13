import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IMAGES, unsplash } from '@/lib/utils'

export default function AuthShell({ children, quote }: { children: ReactNode; quote: string }) {
  return (
    <div className="page auth-layout">
      <div className="auth-visual">
        <img src={unsplash(IMAGES.pinkRoses, 1200)} alt="Elegant pink flower arrangement" />
        <div className="auth-shade" />
        <div className="auth-quote">
          <span style={{ fontSize: 44, display: 'block', marginBottom: 6 }}>🌸</span>
          {quote}
        </div>
      </div>
      <div className="auth-form-side">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 30, color: 'var(--choco-dark)' }}>
          <span className="brand-mark" style={{ width: 40, height: 40, fontSize: 18 }}>🌸</span>
          <span className="brand-name" style={{ fontSize: 18 }}>
            Bloom <span style={{ color: 'var(--gold)' }}>&</span> Blush
          </span>
        </Link>
        {children}
      </div>
    </div>
  )
}