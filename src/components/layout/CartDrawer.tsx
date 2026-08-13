import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, X, TicketCheck, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice, FREE_DELIVERY_THRESHOLD, unsplash, productImg } from '@/lib/utils'
import SafeImage from '@/components/ui/SafeImage'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cart = useCart()
  const { push } = useToast()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const progress = Math.min(100, (cart.subtotal / FREE_DELIVERY_THRESHOLD) * 100)
  const remaining = Math.max(0, Math.round((FREE_DELIVERY_THRESHOLD - cart.subtotal) * 100) / 100)

  function applyCoupon() {
    if (cart.applyCoupon(couponInput)) {
      push('Coupon applied', { sub: '20% off your bouquet ✨' })
      setCouponInput('')
    } else {
      push('Invalid coupon', { sub: 'Try code BLOOM20 🌸' })
    }
  }

  function removeItem(id: string) {
    setRemovingId(id)
    setTimeout(() => {
      cart.remove(id)
      setRemovingId(null)
    }, 300)
  }

  return (
    <div className={`cart-overlay ${open ? 'open' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="cart-head">
          <h3>
            <ShoppingBag width={20} height={20} /> Your Basket
            <span style={{ fontSize: 13, color: 'var(--gold-soft)', fontWeight: 500 }}>
              {cart.count} {cart.count === 1 ? 'item' : 'items'}
            </span>
          </h3>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">
            <X width={18} height={18} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🧺</div>
            <h4>Your basket is empty</h4>
            <p>Fill it with something beautiful — your flowers are waiting.</p>
            <button className="btn btn-choco" onClick={() => { onClose(); navigate('/shop') }}>
              Browse Flowers
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item.product.id} className={`cart-item ${removingId === item.product.id ? 'removing' : ''}`}>
                  <SafeImage src={unsplash(productImg(item.product), 300)} alt={item.product.name} />
                  <div className="cart-item-info">
                    <h4>{item.product.name}</h4>
                    <span className="item-price">
                      <strong>{formatPrice((item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity)}</strong>
                      {item.product.discount > 0 && (
                        <span style={{ textDecoration: 'line-through', marginLeft: 8 }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      )}
                    </span>
                    <div
                      className="qty-stepper"
                      style={{ marginTop: 6, alignSelf: 'flex-start' }}
                    >
                      <button onClick={() => cart.setQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity" disabled={item.quantity <= 1}>
                        <Minus width={14} height={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => cart.setQuantity(item.product.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus width={14} height={14} />
                      </button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.product.id)} aria-label={`Remove ${item.product.name}`}>
                    <Trash2 width={15} height={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-free-progress">
                <p>
                  {remaining > 0 ? (
                    <>Add <strong>{formatPrice(remaining)}</strong> more for <strong>FREE delivery</strong> 🚚</>
                  ) : (
                    <strong style={{ color: '#2e9e52' }}>You've unlocked FREE delivery 🎉</strong>
                  )}
                </p>
                <div className="cart-free-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>

              {cart.couponCode ? (
                <div className="cart-coupon">
                  <span className="applied">
                    <TicketCheck width={15} height={15} /> {cart.couponCode} applied — 20% off
                    <button onClick={cart.removeCoupon} style={{ marginLeft: 6, color: 'inherit', textDecoration: 'underline' }}>
                      Remove
                    </button>
                  </span>
                </div>
              ) : (
                <div className="cart-coupon">
                  <input
                    placeholder="Coupon code (try BLOOM20)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon}>Apply</button>
                </div>
              )}

              <div className="cart-summary-rows">
                <div className="row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="row">
                  <span>Discount</span>
                  <span style={{ color: '#2e9e52' }}>-{formatPrice(cart.productDiscount + cart.couponDiscount)}</span>
                </div>
                <div className="row">
                  <span>Delivery</span>
                  <span className={cart.deliveryFee === 0 ? 'free' : ''}>
                    {cart.deliveryFee === 0 ? 'FREE' : formatPrice(cart.deliveryFee)}
                  </span>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>

              <button
                className="btn btn-choco btn-block"
                onClick={() => {
                  onClose()
                  navigate('/checkout')
                }}
              >
                Checkout <ArrowRight width={17} height={17} />
              </button>
              <button
                className="btn btn-ghost btn-block"
                style={{ marginTop: 8, width: '100%', border: '1.5px solid var(--line)' }}
                onClick={() => {
                  onClose()
                  navigate('/shop')
                }}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}