import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import SearchOverlay from './SearchOverlay'
import { useToast } from '@/context/ToastContext'

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { toasts, dismiss } = useToast()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <div className="app-shell">
        <AnnouncementBar />
        <Navbar onOpenCart={() => setCartOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
        <main className="main">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
        <div className="toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <div className="toast" key={t.id}>
              {t.image && <img src={t.image} alt="" />}
              <div className="toast-body">
                <div className="toast-title">{t.title}</div>
                {t.sub && <div className="toast-sub">{t.sub}</div>}
              </div>
              <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}