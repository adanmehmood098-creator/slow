import { useEffect, useMemo, useState } from 'react'
import { fetchAdminCustomers, fetchAllOrders } from '@/lib/admin'
import type { Profile } from '@/lib/types'
import { formatDate, formatPrice } from '@/lib/utils'
import { PageSpinner } from '@/components/ui/Feedback'
import { Crown } from 'lucide-react'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Profile[]>([])
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchAllOrders>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAdminCustomers(), fetchAllOrders()])
      .then(([c, o]) => {
        setCustomers(c)
        setOrders(o)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(
    () =>
      customers.map((c) => {
        const theirs = orders.filter((o) => o.user_id === c.id)
        return {
          ...c,
          orders: theirs.length,
          spent: theirs.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total), 0),
        }
      }),
    [customers, orders]
  )

  if (loading) return <PageSpinner />

  return (
    <div className="admin-view">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <h3>Customers</h3>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            {rows.length} registered flower lovers
          </span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: c.role === 'admin' ? 'var(--grad-gold)' : 'var(--grad-blush)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: 'var(--choco-dark)',
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {(c.full_name || c.email || '?')[0].toUpperCase()}
                      </span>
                      <strong style={{ color: 'var(--choco)' }}>{c.full_name || 'Unnamed'}</strong>
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>
                    {c.role === 'admin' ? (
                      <span className="badge badge-best">
                        <Crown width={11} height={11} /> Admin
                      </span>
                    ) : (
                      <span className="badge badge-new" style={{ background: 'var(--pink-mist)', color: 'var(--choco)' }}>
                        Customer
                      </span>
                    )}
                  </td>
                  <td>{c.orders}</td>
                  <td>
                    <strong style={{ color: 'var(--choco)' }}>{formatPrice(c.spent)}</strong>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.created_at)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No customers yet — they'll appear after the first sign-up.
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