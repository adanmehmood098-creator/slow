import { Heart, ShoppingBag } from 'lucide-react'
import type { Product } from '@/lib/types'
import { discountedPrice, formatPrice, productImg, stockLabel, unsplash } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import SafeImage from './SafeImage'
import RatingStars from './RatingStars'
import Modal from './Modal'

interface QuickViewProps {
  product: Product
  open: boolean
  onClose: () => void
}

export default function QuickView({ product, open, onClose }: QuickViewProps) {
  const { add } = useCart()
  const { isWished, toggle } = useWishlist()
  const { push } = useToast()
  const img = unsplash(productImg(product), 900)
  const wished = isWished(product.id)
  const stock = stockLabel(product)
  const soldOut = product.stock === 0

  return (
    <Modal open={open} onClose={onClose} labelledBy="quickview-title">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 480,
        }}
        className="qv-grid"
      >
        <div style={{ position: 'relative', height: '100%', minHeight: 360 }}>
          <SafeImage src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {product.discount > 0 && (
            <span className="badge badge-sale" style={{ position: 'absolute', top: 16, left: 16 }}>
              {product.discount}% Off
            </span>
          )}
        </div>
        <div style={{ padding: '38px 34px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span className="card-cat">{product.category?.name ?? 'Flowers'}</span>
          <h2 id="quickview-title" style={{ fontSize: 28 }}>
            <a href={`/product/${product.id}`} style={{ color: 'inherit' }}>
              {product.name}
            </a>
          </h2>
          <div className="card-rating">
            <RatingStars value={product.rating} />
            <span>
              {product.rating.toFixed(1)} ({product.review_count.toLocaleString()} reviews)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="pd-price" style={{ fontSize: 30 }}>
              {formatPrice(discountedPrice(product))}
            </span>
            {product.discount > 0 && <span className="pd-price-old" style={{ fontSize: 16 }}>{formatPrice(product.price)}</span>}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description || 'A beautifully crafted arrangement by our expert florists.'}
          </p>
          <span className={`pd-stock-line ${soldOut ? 'out' : product.stock <= 5 ? 'low' : 'in'}`}>
            <span className={`stock-dot ${product.stock <= 5 ? 'low' : ''}`} />
            {stock.text}
          </span>
          <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 12 }}>
            <button
              className="btn btn-choco"
              style={{ flex: 1 }}
              disabled={soldOut}
              onClick={() => {
                add(product)
                push(product.name + ' added to your cart', { sub: 'Beautiful choice 🌸', image: img })
                onClose()
              }}
            >
              <ShoppingBag width={17} height={17} /> Add to Cart
            </button>
            <button
              className={`btn btn-icon ${wished ? 'active' : ''}`}
              style={{ color: wished ? '#d23f57' : undefined }}
              onClick={() => {
                toggle(product)
                push(wished ? 'Removed from wishlist' : product.name + ' added to wishlist', { image: img })
              }}
              aria-label="Toggle wishlist"
            >
              <Heart width={19} height={19} />
            </button>
          </div>
          <a href={`/product/${product.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
            View Full Details
          </a>
        </div>
      </div>
    </Modal>
  )
}