import { Fragment, useEffect, useMemo, useState } from 'react'
import { fetchAllOrders, updateOrderStatus } from '@/lib/admin'
import type { OrderWithItems } from '@/lib/types'
import { ORDER_STATUSES } from '@/lib/types'
import { formatPrice, formatDateTime, unsplash } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { PageSpinner } from '@/components/ui/Feedback'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const { push } = useToast()

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .catch(() => push('Could not load orders', { sub: 'Check the database connection' }))
      .finally(() => setLoading(false))
  }, [push])

  const filtered = useMemo(
    () => (statusFilter === 'All' ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  )

  async function changeStatus(o: OrderWithItems, status: string) {
    const prev = o.status
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status } : x)))
    try {
      await updateOrderStatus(o.id, status)
      push(`${o.order_number} → ${status}`, {})
    } catch (err) {
      setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: prev } : x)))
      push('Status update failed', { sub: (err as Error).message })
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="admin-view">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Order Management</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', ...ORDER_STATUSES].map((s) => (
              <button
                key={s}
                className={`pill ${statusFilter === s ? 'active' : ''}`}
                style={{ padding: '7px 14px', fontSize: 13 }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
                {s !== 'All' && (
                  <span style={{ color: 'var(--muted)', marginLeft: 4 }}>
                    {orders.filter((o) => o.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td>
                      <button style={{ fontWeight: 700, color: 'var(--choco)', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                        {o.order_number}
                        {expanded === o.id ? <ChevronUp width={14} height={14} /> : <ChevronDown width={14} height={14} />}
                      </button>
                    </td>
                    <td>
                      {o.customer_name}
                      <br />
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{o.city}</span>
                    </td>
                    <td>{o.items.map((i) => i.product_name).slice(0, 2).join(', ')}{o.items.length > 2 ? '…' : ''}</td>
                    <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td>
                      <strong style={{ color: 'var(--choco)' }}>{formatPrice(o.total)}</strong>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(o.created_at)}</td>
                    <td>
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={(e) => void changeStatus(o, e.target.value)}
                        style={{ borderColor: o.status === 'Cancelled' ? '#e0b4b4' : undefined }}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={7} style={{ background: 'var(--pink-mist)' }}>
                        <div className="order-detail-row">
                          <div>
                            <h5 style={{ marginBottom: 10, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Items</h5>
                            {o.items.map((it) => (
                              <div className="os-item" key={it.id} style={{ marginBottom: 10 }}>
                                {it.image_url ? (
                                  <img src={unsplash(it.image_url, 200)} alt="" style={{ width: 44, height: 52, borderRadius: 8, objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: 44, height: 52, borderRadius: 8, background: 'var(--soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌸</div>
                                )}
                                <div className="os-info">
                                  <h5 style={{ fontSize: 13.5 }}>{it.product_name}</h5>
                                  <p style={{ fontSize: 12 }}>× {it.quantity}</p>
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{formatPrice(it.price * it.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h5 style={{ marginBottom: 10, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Delivery</h5>
                            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
                              {o.customer_name} · {o.phone}
                              <br />
                              {o.address}, {o.city} {o.postal_code}
                            </p>
                            <h5 style={{ margin: '14px 0 8px', fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Totals</h5>
                            <p style={{ fontSize: 13.5, lineHeight: 1.8 }}>
                              Subtotal {formatPrice(o.subtotal)} · Discount −{formatPrice(o.discount)} · Delivery{' '}
                              {o.delivery_fee === 0 ? 'FREE' : formatPrice(o.delivery_fee)}
                              <br />
                              <strong style={{ color: 'var(--choco)', fontSize: 15 }}>Total {formatPrice(o.total)}</strong>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    No {statusFilter.toLowerCase()} orders right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {orders.length === 0 && (
        <div className="admin-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          🌷 Orders from your customers will appear here. Try placing a test order from the storefront.
        </div>
      )}
    </div>
  )
}