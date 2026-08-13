import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Home, Package, ShoppingBag } from 'lucide-react'
import { fetchOrder } from '@/lib/db'
import { RequireAuth } from '@/components/layout/Guards'
import type { OrderWithItems } from '@/lib/types'
import { formatPrice, formatDateTime, unsplash } from '@/lib/utils'
import SafeImage from '@/components/ui/SafeImage'
import { EmptyState, PageSpinner } from '@/components/ui/Feedback'
import Petals from '@/components/ui/Petals'

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Order not found')
      return
    }
    fetchOrder(id)
      .then(setOrder)
      .catch((e) => setError((e as Error).message))
  }, [id])

  return (
    <RequireAuth>
      <div className="page" style={{ position: 'relative', minHeight: '70vh' }}>
        <Petals count={8} />
        <div className="container">
          {error ? (
            <EmptyState
              icon="🌼"
              title="We couldn't find that order"
              text={error}
              action={<Link to="/account" className="btn btn-choco">View My Orders</Link>}
            />
          ) : !order ? (
            <PageSpinner />
          ) : (
            <div className="confirmation">
              <span className="confirm-flower">🌸</span>
              <h1>Your flowers are on their way!</h1>
              <p>
                Thank you for trusting us with your moments. Our florists are already hand-tying your bouquet.
              </p>
              <div className="confirm-card">
                <div className="cc-row">
                  <span className="lbl">Order number</span>
                  <span className="val">{order.order_number}</span>
                </div>
                <div className="cc-row">
                  <span className="lbl">Placed on</span>
                  <span className="val">{formatDateTime(order.created_at)}</span>
                </div>
                <div className="cc-row">
                  <span className="lbl">Status</span>
                  <span className="badge-status Pending" style={{ fontSize: 11 }}>{order.status}</span>
                </div>
                <div className="cc-row">
                  <span className="lbl">Delivering to</span>
                  <span className="val">
                    {order.customer_name} · {order.address}, {order.city}
                  </span>
                </div>
                <div className="cc-row">
                  <span className="lbl">Payment</span>
                  <span className="val">{order.payment_method === 'card' ? 'Card' : order.payment_method} · {formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="confirm-card">
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>What's in the box</h3>
                {order.items.map((it) => (
                  <div className="os-item" key={it.id} style={{ marginBottom: 12 }}>
                    <SafeImage src={unsplash(it.image_url ?? '', 300)} alt="" style={{ width: 52, height: 62, borderRadius: 10, objectFit: 'cover' }} />
                    <div className="os-info">
                      <h5 style={{ fontFamily: 'var(--font-serif)', color: 'var(--choco-dark)' }}>{it.product_name}</h5>
                      <p style={{ fontSize: 13, color: 'var(--muted)' }}>× {it.quantity}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--choco)' }}>{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="os-totals">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="row">
                    <span>Discount</span>
                    <span className="green">−{formatPrice(order.discount)}</span>
                  </div>
                  <div className="row">
                    <span>Delivery</span>
                    <span className={order.delivery_fee === 0 ? 'green' : ''}>
                      {order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}
                    </span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/shop" className="btn btn-choco">
                  <ShoppingBag width={17} height={17} /> Continue Shopping
                </Link>
                <Link to="/account" className="btn btn-outline">
                  <Package width={17} height={17} /> Track in My Orders
                </Link>
                <Link to="/" className="btn btn-ghost">
                  <Home width={17} height={17} /> Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}