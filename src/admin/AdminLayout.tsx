import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ExternalLink } from 'lucide-react'
import { RequireAdmin } from '@/components/layout/Guards'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'

function AdminLayoutInner() {
  const { user, profile, signOut } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()

  return (
    <div className="admin-body" style={{ minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <span className="brand-mark">🌸</span>
            <span>
              <h2>Bloom &amp; Blush</h2>
              <small>Admin Studio</small>
            </span>
          </div>
          <nav className="admin-nav">
            <NavLink to="/admin" end>
              <LayoutDashboard width={18} height={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/products">
              <Package width={18} height={18} /> Products
            </NavLink>
            <NavLink to="/admin/products/new">
              <Package width={18} height={18} /> Add New Product
            </NavLink>
            <NavLink to="/admin/orders">
              <ShoppingCart width={18} height={18} /> Orders
            </NavLink>
            <NavLink to="/admin/customers">
              <Users width={18} height={18} /> Customers
            </NavLink>
            <NavLink to="/" target="_blank">
              <ExternalLink width={18} height={18} /> View Store
            </NavLink>
            <button
              onClick={async () => {
                await signOut()
                push('Signed out of admin', {})
                navigate('/login')
              }}
            >
              <LogOut width={18} height={18} /> Logout
            </button>
          </nav>
        </aside>
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Florist Studio</h1>
            <div className="admin-top-actions">
              <div className="admin-user-chip">
                <span className="au-avatar">
                  {(profile?.full_name || user?.email || 'A').slice(0, 1).toUpperCase()}
                </span>
                <span>
                  <span className="au-name">{profile?.full_name || 'Admin'}</span>
                  <br />
                  <span className="au-role">Head Florist</span>
                </span>
              </div>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminLayoutInner />
    </RequireAdmin>
  )
}