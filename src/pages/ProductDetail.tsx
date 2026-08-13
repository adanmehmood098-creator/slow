import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  ZoomIn,
  Star,
} from 'lucide-react'
import { fetchProduct, fetchProducts, fetchReviews, addReview } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Product, Review } from '@/lib/types'
import { formatPrice, discountedPrice, productGallery, unsplash, timeAgo } from '@/lib/utils'
import { PRODUCT_CARE_NOTES } from '@/data/content'
import RatingStars from '@/components/ui/RatingStars'
import SafeImage from '@/components/ui/SafeImage'
import ProductCard from '@/components/ui/ProductCard'
import { EmptyState, PageSpinner } from '@/components/ui/Feedback'
import SetupNotice from '@/components/ui/SetupNotice'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'

type TabKey = 'description' | 'care' | 'delivery' | 'reviews'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: 'Description' },
  { key: 'care', label: 'Flower Care' },
  { key: 'delivery', label: 'Delivery Info' },
  { key: 'reviews', label: 'Customer Reviews' },
]

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])
  const [activeImg, setActiveImg] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const zoomPos = useRef<{ x: number; y: number }>({ x: 50, y: 50 })
  const [tab, setTab] = useState<TabKey>('description')
  const [qty, setQty] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [ratingHover, setRatingHover] = useState(0)
  const [myRating, setMyRating] = useState(5)
  const [myReview, setMyReview] = useState('')
  const { add } = useCart()
  const { isWished, toggle } = useWishlist()
  const { push } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    if (!id) {
      setLoading(false)
      return
    }
    fetchProduct(id)
      .then(async (p) => {
        if (cancelled || !p) return
        setProduct(p)
        setGallery(productGallery(p))
        setActiveImg(0)
        setQty(1)
        const [revs, all] = await Promise.all([
          fetchReviews(p.id),
          fetchProducts({ activeOnly: true }).catch(() => []),
        ])
        if (cancelled) return
        setReviews(revs)
        const pool = all.filter((x) => x.id !== p.id)
        setRelated(
          [...pool.filter((x) => x.category_id === p.category_id), ...pool].slice(0, 4)
        )
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  const occ = (product?.occasions ?? []) as string[]

  const dist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++
    }
    const total = Math.max(1, reviews.length)
    return counts
      .map((c, i) => ({ stars: i + 1, pct: Math.round((c / total) * 100) }))
      .reverse()
  }, [reviews])

  function handleZoomMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    zoomPos.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  const addToCart = useCallback(
    (goCheckout = false) => {
      if (!product || product.stock === 0) return
      add(product, qty)
      if (goCheckout) {
        navigate('/checkout')
      } else {
        push(product.name + ' added to your cart', {
          sub: `Quantity: ${qty} — Beautiful choice 🌸`,
          image: unsplash(product.image_url ?? '', 300),
        })
      }
    },
    [product, qty, add, push, navigate]
  )

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    setSubmitting(true)
    try {
      const created = await addReview({ productId: product.id, rating: myRating, review: myReview.trim() })
      setReviews((prev) => [created, ...prev])
      setMyReview('')
      setMyRating(5)
      push('Thank you for your review', { sub: 'It helps other flower lovers 🥰' })
    } catch (err) {
      push('Could not submit review', { sub: (err as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="page container"><PageSpinner /></div>
  if (error || !product)
    return (
      <div className="page container">
        <EmptyState
          icon="🌼"
          title="We couldn't find that bouquet"
          text="It may have sold out or moved. Browse the shop for more fresh blooms."
          action={<Link to="/shop" className="btn btn-choco">Back to Shop</Link>}
        />
      </div>
    )

  const wished = isWished(product.id)
  const soldOut = product.stock === 0
  const img = unsplash(gallery[activeImg], 1100)

  return (
    <div className="page">
      <section className="section-sm">
        <div className="container">
          <nav className="breadcrumbs" style={{ justifyContent: 'flex-start', marginBottom: 30, color: 'var(--muted)', textTransform: 'none', letterSpacing: '0' }}>
            <Link to="/" style={{ color: 'var(--choco)' }}>Home</Link>
            <span className="sep">/</span>
            <Link to="/shop" style={{ color: 'var(--choco)' }}>Shop</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--choco)' }}>{product.name}</span>
          </nav>

          <div className="pd-layout">
            <div className="pd-gallery">
              <div
                className={`pd-main-img ${zoomed ? 'zoomed' : ''}`}
                onMouseMove={handleZoomMove}
                onClick={() => setZoomed((z) => !z)}
                style={
                  zoomed
                    ? { '--zoom-x': `${zoomPos.current.x}%`, '--zoom-y': `${zoomPos.current.y}%` } as React.CSSProperties
                    : undefined
                }
              >
                <SafeImage src={img} alt={product.name} />
                {product.discount > 0 && (
                  <span className="badge badge-sale" style={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
                    {product.discount}% Off
                  </span>
                )}
                <span className="pd-zoom-hint">
                  <ZoomIn width={14} height={14} /> {zoomed ? 'Click to zoom out' : 'Hover to zoom'}
                </span>
              </div>
              {gallery.length > 1 && (
                <div className="pd-thumbs">
                  {gallery.map((g, i) => (
                    <button
                      key={g + i}
                      className={`pd-thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={unsplash(g, 300)} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pd-info">
              <span className="pd-cat">{product.category?.name ?? 'Flowers'}</span>
              <div>
                <h1>{product.name}</h1>
                <div className="pd-rating-line">
                  <RatingStars value={product.rating} showValue />
                  <span>{product.review_count.toLocaleString()} reviews</span>
                  {product.best_seller && <span className="badge badge-best">Best Seller</span>}
                  {product.stock > 0 && product.stock <= 5 && <span className="badge badge-low">Limited Stock</span>}
                </div>
              </div>

              <div className="pd-price-row">
                <span className="pd-price">{formatPrice(discountedPrice(product))}</span>
                {product.discount > 0 && (
                  <>
                    <span className="pd-price-old">{formatPrice(product.price)}</span>
                    <span className="pd-price-off">Save {product.discount}%</span>
                  </>
                )}
              </div>

              <span className="pd-stock-line">
                {soldOut ? (
                  <span className="out">● Sold Out</span>
                ) : product.stock <= 5 ? (
                  <span className="low">● Only {product.stock} left — order soon!</span>
                ) : (
                  <span className="in">● In Stock</span>
                )}
              </span>

              <p className="pd-desc">{product.description}</p>

              {occ.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {occ.map((o) => (
                    <Link to={`/shop?occasion=${encodeURIComponent(o)}`} className="pill" key={o}>
                      {o} 💐
                    </Link>
                  ))}
                </div>
              )}

              <div className="pd-actions">
                <div className="qty-stepper" style={{ padding: '8px 12px' }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>
                    <Minus width={15} height={15} />
                  </button>
                  <span style={{ minWidth: 38 }}>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))} aria-label="Increase quantity" disabled={soldOut || qty >= product.stock}>
                    <Plus width={15} height={15} />
                  </button>
                </div>
                <button className="btn btn-choco btn-lg" style={{ flex: 1, minWidth: 180 }} disabled={soldOut} onClick={() => addToCart(false)}>
                  <ShoppingBag width={18} height={18} /> Add to Cart
                </button>
                <button className="btn btn-gold btn-lg" disabled={soldOut} onClick={() => addToCart(true)}>
                  <Zap width={18} height={18} /> Buy Now
                </button>
                <button
                  className={`btn btn-icon ${wished ? 'active' : ''}`}
                  style={{ width: 52, height: 52, color: wished ? '#d23f57' : undefined }}
                  onClick={() => {
                    toggle(product)
                    push(wished ? 'Removed from wishlist' : product.name + ' added to wishlist', {
                      sub: wished ? '' : 'Saved for later 💕',
                      image: unsplash(product.image_url ?? '', 300),
                    })
                  }}
                  aria-label="Toggle wishlist"
                >
                  <Heart width={21} height={21} />
                </button>
              </div>

              <div className="pd-meta">
                <div className="pd-meta-row">
                  <Truck width={17} height={17} /> Free delivery on orders over $50 · <Link to="/shop" style={{ textDecoration: 'underline' }}>same-day options</Link>
                </div>
                <div className="pd-meta-row">
                  <ShieldCheck width={17} height={17} /> <strong>Freshness promise:</strong> replaced free if not perfect within 24h
                </div>
                <div className="pd-meta-row">
                  <span style={{ opacity: 0.6 }}>SKU:</span> {product.sku ?? '—'} · <strong>Stock:</strong> {product.stock}
                </div>
              </div>
            </div>
          </div>

          <div className="pd-tabs">
            <div className="pd-tab-nav" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`pd-tab-btn ${tab === t.key ? 'active' : ''}`}
                  onClick={() => setTab(t.key)}
                  role="tab"
                  aria-selected={tab === t.key}
                >
                  {t.label}
                  {t.key === 'reviews' && <span style={{ fontSize: 12, opacity: 0.6 }}> ({reviews.length})</span>}
                </button>
              ))}
            </div>

            {tab === 'description' && (
              <div className="pd-tab-panel">
                <h3 style={{ fontSize: 26, marginBottom: 16 }}>{product.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.85 }}>
                  {product.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginTop: 30 }}>
                  {['🌷 Freshly cut blooms', '🎀 Silk ribbon & kraft wrap', '💌 Free handwritten card', '🧊 Cold-chain delivery'].map((f) => (
                    <div key={f} style={{ background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius)', padding: 18, fontSize: 15, color: 'var(--ink-soft)' }}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'care' && (
              <div className="pd-tab-panel">
                <ul className="care-list">
                  {PRODUCT_CARE_NOTES.care.map((c) => (
                    <li key={c.title}>
                      <span className="care-ico" style={{ fontSize: 18 }}>{c.icon}</span>
                      <div>
                        <h4>{c.title}</h4>
                        <p>{c.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'delivery' && (
              <div className="pd-tab-panel">
                <ul className="care-list">
                  {PRODUCT_CARE_NOTES.delivery.map((d) => (
                    <li key={d.title}>
                      <span className="care-ico" style={{ fontSize: 18 }}>{d.icon}</span>
                      <div>
                        <h4>{d.title}</h4>
                        <p>{d.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === 'reviews' && (
              <div className="pd-tab-panel">
                {!isSupabaseConfigured ? (
                  <SetupNotice />
                ) : (
                  <div className="reviews-layout">
                    <div className="reviews-summary">
                      <div className="big-score">{product.rating.toFixed(1)}</div>
                      <RatingStars value={product.rating} size={18} />
                      <p className="score-caption">{product.review_count.toLocaleString()} reviews</p>
                      {dist.map((d, i) => (
                        <div className={`dist-row ${d.pct > 0 ? 'is-in' : ''}`} key={i} style={{ '--dist-w': `${d.pct}%` } as React.CSSProperties}>
                          <span className="dist-label">{d.stars}★</span>
                          <div className="dist-bar">
                            <span style={{ width: `${d.pct}%` }} />
                          </div>
                          <span className="dist-pct">{d.pct}%</span>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="review-list">
                        {reviews.length === 0 && (
                          <EmptyState
                            compact
                            icon="💬"
                            title="No reviews yet"
                            text="Be the first to tell everyone how beautiful these flowers are."
                          />
                        )}
                        {reviews.map((r) => (
                          <div className="review-card" key={r.id}>
                            <div className="review-head">
                              <span className="review-avatar">{r.author_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                              <div>
                                <div className="reviewer">{r.author_name}</div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <RatingStars value={r.rating} size={13} />
                                  <span className="review-date">{timeAgo(r.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            {r.review && <p>{r.review}</p>}
                          </div>
                        ))}
                      </div>

                      <form className="review-form" onSubmit={submitReview}>
                        <h3>Share your experience</h3>
                        {!user ? (
                          <p style={{ color: 'var(--muted)' }}>
                            <Link to="/login" style={{ color: 'var(--blush-deep)', fontWeight: 600 }}>Sign in</Link> to write a review — we'd love to hear from you.
                          </p>
                        ) : (
                          <>
                            <div style={{ marginBottom: 14 }}>
                              <div className="star-input" onMouseLeave={() => setRatingHover(0)}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    type="button"
                                    key={s}
                                    onClick={() => setMyRating(s)}
                                    onMouseEnter={() => setRatingHover(s)}
                                    style={{ padding: 2 }}
                                    aria-label={`${s} stars`}
                                  >
                                    <Star
                                      width={28}
                                      height={28}
                                      className={(ratingHover || myRating) >= s ? 'lit' : ''}
                                      fill={(ratingHover || myRating) >= s ? 'currentColor' : 'none'}
                                    />
                                  </button>
                                ))}
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{['', 'Not great', 'Okay', 'Good', 'Very good', 'Absolutely beautiful!'][myRating]}</div>
                            </div>
                            <textarea
                              placeholder="Tell others about the freshness, scent and arrangement…"
                              value={myReview}
                              onChange={(e) => setMyReview(e.target.value)}
                              maxLength={600}
                              required
                            />
                            <button type="submit" className="btn btn-choco" disabled={submitting}>
                              {submitting ? <span className="spinner" /> : 'Submit Review'}
                            </button>
                          </>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 30, marginBottom: 28 }}>Related Bouquets</h2>
            {related.length > 0 ? (
              <div className="product-grid">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState compact icon="🌸" title="More blooms coming soon" text="Check back tomorrow — we refresh the studio daily." />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}