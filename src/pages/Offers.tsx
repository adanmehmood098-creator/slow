import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { IMAGES, unsplash } from '@/lib/utils'
import Countdown from '@/components/ui/Countdown'
import ProductCard from '@/components/ui/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Feedback'
import SetupNotice from '@/components/ui/SetupNotice'
import Reveal from '@/components/ui/Reveal'
import { useToast } from '@/context/ToastContext'

export default function Offers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { push } = useToast()

  useEffect(() => {
    let cancelled = false
    fetchProducts({ activeOnly: true })
      .then((all) => !cancelled && setProducts(all.filter((p) => p.discount > 0).sort((a, b) => b.discount - a.discount)))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page">
      <section className="section-sm">
        <div className="container">
          <Reveal direction="zoom">
            <div className="offers-hero">
              <img src={unsplash(IMAGES.peonies, 1800)} alt="Sale flowers" />
              <div className="offers-inner">
                <span className="hero-eyebrow" style={{ animation: 'none', opacity: 1 }}>🌸 Limited-Time Offer</span>
                <h1>
                  A Little More Love, <em>A Little Less Price.</em>
                </h1>
                <p>Up to <strong style={{ color: 'var(--gold-soft)' }}>30% OFF</strong> our most-loved bouquets — while stocks last.</p>
                <Countdown />
                <div className="coupon-box">
                  <span className="code">BLOOM20</span>
                  <span className="hint">
                    Extra 20% off your basket<br />when you apply this code at checkout
                  </span>
                  <button
                    className="btn btn-gold btn-sm"
                    onClick={() => {
                      navigator.clipboard?.writeText('BLOOM20').catch(() => undefined)
                      push('Code copied!', { sub: 'Apply BLOOM20 at checkout 🌸' })
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {!isSupabaseConfigured ? (
            <SetupNotice />
          ) : loading ? (
            <ProductGridSkeleton count={4} />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌷</div>
              <h4>No flowers on sale right now</h4>
              <p>Fresh deals bloom every week — check our <Link to="/newsletter" style={{ textDecoration: 'underline' }}>newsletter</Link> for the next one.</p>
              <Link to="/shop" className="btn btn-choco">Browse Full Shop</Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}