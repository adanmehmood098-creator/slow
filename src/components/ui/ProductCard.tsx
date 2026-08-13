import { useState } from 'react'
import { Eye, ShoppingBag, Heart, Plus, Minus, X, Check } from 'lucide-react'
import type { Product } from '@/lib/types'
import { discountedPrice, formatPrice, productImg, unsplash } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useToast } from '@/context/ToastContext'
import SafeImage from './SafeImage'
import RatingStars from './RatingStars'
import QuickView from './QuickView'

interface ProductCardProps {
  product: Product
  index?: number
  showRank?: boolean
}

export default function ProductCard({ product, index = 0, showRank = false }: ProductCardProps) {
  const { add } = useCart()
  const { isWished, toggle } = useWishlist()
  const { push } = useToast()
  const [quickOpen, setQuickOpen] = useState(false)
  const [added, setAdded] = useState(false)
  const wished = isWished(product.id)
  const soldOut = product.stock === 0
  const img = unsplash(productImg(product), 800)
  const isNew = Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 21
  const limited = product.stock > 0 && product.stock <= 5

  const handleAdd = () => {
    if (soldOut) return
    add(product)
    push(product.name + ' added to your cart', { sub: 'Beautiful choice 🌸', image: img })
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  const handleWish = () => {
    toggle(product)
    if (!wished) push(product.name + ' added to your wishlist', { image: img })
    else push(product.name + ' removed from wishlist', { sub: 'Hope to see it again 🌷', image: img })
  }

  return (
    <>
      <article className={`product-card ${showRank ? 'ranked-card' : ''}`} style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
        <div className="card-media">
          <SafeImage src={img} alt={product.name} />
          <div className="card-badges">
            {showRank && (
              <span className="badge badge-best">Rank #{index + 1}</span>
            )}
            {product.best_seller && !showRank && <span className="badge badge-best">Best Seller</span>}
            {isNew && product.stock > 0 && <span className="badge badge-new">New</span>}
            {product.discount >= 20 && <span className="badge badge-sale">{product.discount}% Off</span>}
            {limited && <span className="badge badge-low">Limited Stock</span>}
          </div>
          {!soldOut && (
            <span className="stock-chip">
              <span className={`stock-dot ${product.stock <= 5 ? 'low' : ''}`} />
              {product.stock <= 5 ? `${product.stock} left` : 'In Stock'}
            </span>
          )}
          <button
            className={`card-wishlist ${wished ? 'active' : ''}`}
            onClick={handleWish}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart width={19} height={19} />
          </button>
          <div className="card-quick-actions">
            <button className="btn btn-choco btn-sm" onClick={handleAdd} disabled={soldOut}>
              {added ? <Check width={16} height={16} /> : <ShoppingBag width={16} height={16} />}
              {added ? 'Added!' : soldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button className="btn btn-light btn-sm card-quick-view" onClick={() => setQuickOpen(true)} aria-label="Quick view">
              <Eye width={17} height={17} />
            </button>
          </div>
          {soldOut && (
            <div className="card-out">
              <span>Sold Out</span>
            </div>
          )}
        </div>
        <div className="card-info">
          <span className="card-cat">{product.category?.name ?? 'Flowers'}</span>
          <a href={`/product/${product.id}`} className="card-name">
            {product.name}
          </a>
          <div className="card-rating">
            <RatingStars value={product.rating} />
            <span>{product.rating.toFixed(1)}</span>
            <span>({product.review_count.toLocaleString()} reviews)</span>
          </div>
          <div className="card-price">
            <span className="price">{formatPrice(discountedPrice(product))}</span>
            {product.discount > 0 && <span className="price-old">{formatPrice(product.price)}</span>}
            {product.discount > 0 && <span className="price-off">{product.discount}%</span>}
          </div>
        </div>
      </article>
      <QuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  )
}