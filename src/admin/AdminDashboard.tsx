import { useEffect, useMemo, useState } from 'react'
import { DollarSign, ShoppingCart, Users, Package, Boxes, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { fetchAdminStats, fetchAllOrders, fetchAdminProducts, type AdminStats } from '@/lib/admin'
import { formatPrice } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Feedback'

interface ChartBar {
  label: string
  value: number
}

function useRevealOnMount(): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 120)
    return () => clearTimeout(t)
  }, [])
  return on
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchAllOrders>>>([])
  const [products, setProducts] = useState<Awaited<ReturnType<typeof fetchAdminProducts>>>([])
  const [error, setError] = useState<string | null>(null)
  const animate = useRevealOnMount()

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAdminStats(), fetchAllOrders(), fetchAdminProducts()])
      .then(([s, o, p]) => {
        if (cancelled) return
        setStats(s)
        setOrders(o)
        setProducts(p)
      })
      .catch((e) => !cancelled && setError((e as Error).message))
    return () => {
      cancelled = true
    }
  }, [])

  const revenueByDay = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>()
    for (const o of orders) {
      if (o.status === 'Cancelled') continue
      const day = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const cur = map.get(day) ?? { revenue: 0, count: 0 }
      cur.revenue += Number(o.total)
      cur.count += 1
      map.set(day, cur)
    }
    const days = [...new Set([...map.keys(), ...Array.from({ length: 2 }, () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))])]
    return days.slice(-14).map((day) => ({ label: day, revenue: map.get(day)?.revenue ?? 0, count: map.get(day)?.count ?? 0 }))
  }, [orders])

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; image: string | null; sales: number }>()
    for (const p of products) map.set(p.id, { name: p.name, image: p.image_url, sales: p.sales_count })
    return [...map.values()].sort((a, b) => b.sales - a.sales).slice(0, 5)
  }, [products])

  const maxRevenue = Math.max(1, ...revenueByDay.map((d) => d.revenue))
  const maxSales = Math.max(1, ...topProducts.map((p) => p.sales))

  const statCards = stats
    ? [
        { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'gold', extra: 'All time (excl. cancelled)' },
        { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'blush', extra: `${stats.pendingOrders} pending` },
        { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: Users, color: 'choco', extra: 'registered accounts' },
        { label: 'Total Products', value: stats.totalProducts.toLocaleString(), icon: Package, color: 'pink', extra: `${stats.totalStock} units in stock` },
        { label: 'Low Stock Items', value: stats.lowStock.toString(), icon: AlertTriangle, color: 'gold', extra: stats.lowStock > 0 ? `${stats.lowStock} need restocking` : 'all stocked up', warn: stats.lowStock > 0 },
        { label: 'Cancelled Orders', value: stats.cancelledOrders.toString(), icon: XCircle, color: 'pink', extra: 'of total orders' },
      ]
    : []

  if (error)
    return (
      <div className="admin-panel" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
        🌷 {error}
      </div>
    )

  if (!stats || !animate) return <PageSpinner />

  return (
    <div className="admin-view">
      <div className="admin-stats">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label}>
            <span className={`st-ico ${s.color}`}>
              <s.icon width={23} height={23} />
            </span>
            <span>
              <span className="st-num" style={{ display: 'block' }}>{s.value}</span>
              <span className="st-lbl">{s.label}</span>
              <span className={`st-extra ${s.warn ? 'warn' : 'ok'}`} style={s.warn ? { color: '#c0392b' } : { color: 'var(--muted)' }}>
                {s.extra}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="admin-charts">
        <div className="chart-card">
          <h3>Revenue — last 14 days</h3>
          <div className="chart-bars">
            {revenueByDay.map((d) => (
              <div className="bar-wrap" key={d.label} title={`${d.label}: ${formatPrice(d.revenue)}`}>
                <div className="bar" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, animationDelay: `${Math.random() * 0.4}s` }} />
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <h3>Popular Products</h3>
          <div className="popular-list">
            {topProducts.map((p) => (
              <div className="popular-item" key={p.name}>
                {p.image ? (
                  <img src={p.image + '?auto=format&fit=crop&w=200&q=70'} alt="" />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌸</div>
                )}
                <div className="pi-info">
                  <h5>{p.name}</h5>
                  <div className="pi-bar">
                    <span style={{ width: `${(p.sales / maxSales) * 100}%` }} />
                  </div>
                </div>
                <span className="pi-sales">{p.sales.toLocaleString()} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Recent Orders</h3>
          <span className="chart-sub" style={{ color: 'var(--muted)', fontSize: 13 }}>
            {orders.length} total · <Clock width={12} height={12} style={{ display: 'inline', verticalAlign: -1 }} /> {stats.pendingOrders} awaiting confirmation
          </span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong style={{ color: 'var(--choco)' }}>{o.order_number}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString()}</span>
                  </td>
                  <td>{o.customer_name}</td>
                  <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td>
                    <strong style={{ color: 'var(--choco)' }}>{formatPrice(o.total)}</strong>
                  </td>
                  <td>
                    <span className={`badge-status ${o.status.replace(/\s/g, '\\ ')}`}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    No orders yet — they'll appear here the moment a customer checks out.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}