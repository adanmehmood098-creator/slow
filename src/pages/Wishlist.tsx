import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { RequireAuth } from '@/components/layout/Guards'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import ProductCard from '@/components/ui/ProductCard'
import { EmptyState } from '@/components/ui/Feedback'

export default function Wishlist() {
  const { ids, products, loaded } = useWishlist()
  const { add } = useCart()
  const { push } = useToast()

  return (
    <RequireAuth fallback="/login?next=/wishlist">
      <div className="page">
        <section className="page-hero">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="sep">/</span>
              <span>Wishlist</span>
            </nav>
            <h1>My Wishlist 💕</h1>
            <p>{ids.length} {ids.length === 1 ? 'bouquet' : 'bouquets'} saved for the moments that matter.</p>
          </div>
        </section>
        <section className="section-sm">
          <div className="container">
            {!loaded ? (
              <EmptyState icon="⏳" title="Loading your wishlist…" />
            ) : products.length === 0 ? (
              <EmptyState
                icon="💗"
                title="Nothing saved yet"
                text="Tap the heart on any bouquet and it will appear here."
                action={<Link to="/shop" className="btn btn-choco">Discover Flowers</Link>}
              />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                  <h2 style={{ fontSize: 26 }}>Your saved bouquets</h2>
                  <button
                    className="btn btn-choco btn-sm"
                    onClick={() => {
                      let added = 0
                      for (const p of products) {
                        add(p)
                        added++
                      }
                      push(`${added} bouquet${added === 1 ? '' : 's'} moved to your cart`, { sub: 'Ready for checkout 🌸' })
                    }}
                  >
                    Move all to cart
                  </button>
                </div>
                <div className="product-grid">
                  {products.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </>
            )}
            <div style={{ marginTop: 40 }}>
              <Link to="/shop" className="btn btn-outline">
                <ArrowLeft width={16} height={16} /> Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    </RequireAuth>
  )
}