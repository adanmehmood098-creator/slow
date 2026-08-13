import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Heart, Search, ShoppingBag, User, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/collections', label: 'Collections' },
  { to: '/shop?sort=popularity&best=1', label: 'Best Sellers' },
  { to: '/offers', label: 'Offers' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar({
  onOpenCart,
  onOpenSearch,
}: {
  onOpenCart: () => void
  onOpenSearch: () => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { count } = useCart()
  const { ids } = useWishlist()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="brand" aria-label="Bloom and Blush home">
            <span className="brand-mark">🌸</span>
            <span>
              <span className="brand-name">
                Bloom <span>&</span> Blush
              </span>
              <span className="brand-tagline">Luxury Florist</span>
            </span>
          </Link>

          <nav aria-label="Main">
            <ul className="nav-links">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <NavLink to={l.to} className={({ isActive }) => 'nav-link ' + (isActive && l.to === location.pathname ? 'active' : '')} end={l.to === '/'}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-actions">
            <button className="nav-action" onClick={onOpenSearch} aria-label="Search">
              <Search width={19} height={19} />
            </button>
            <button className="nav-action desktop-only" onClick={() => navigate('/wishlist')} aria-label="Wishlist">
              <Heart width={19} height={19} />
              {ids.length > 0 && <span className="nav-count">{ids.length}</span>}
            </button>
            <button className="nav-action" onClick={onOpenCart} aria-label="Open cart">
              <ShoppingBag width={19} height={19} />
              {count > 0 && <span className="nav-count">{count}</span>}
            </button>
            <button className="nav-action desktop-only" onClick={() => navigate(user ? '/account' : '/login')} aria-label="Account">
              <User width={19} height={19} />
            </button>
            <button
              className={`burger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-menu-head">
            <Link to="/" className="brand" style={{ color: 'var(--choco-dark)' }} onClick={() => setMenuOpen(false)}>
              <span className="brand-mark">🌸</span>
              <span className="brand-name">
                Bloom <span style={{ color: 'var(--gold)' }}>&</span> Blush
              </span>
            </Link>
            <button className="btn-icon" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X width={18} height={18} />
            </button>
          </div>
          <ul className="mobile-menu-links">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className={location.pathname === l.to.split('?')[0] ? 'active' : ''}>
                  {l.label} <span style={{ color: 'var(--blush-deep)' }}>→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-menu-foot">
            <Link to={user ? '/account' : '/login'} className="btn btn-choco btn-block" style={{ width: '100%' }}>
              <User width={17} height={17} /> {user ? 'My Account' : 'Sign In'}
            </Link>
            <Link to="/wishlist" className="btn btn-outline btn-block" style={{ width: '100%' }}>
              <Heart width={17} height={17} /> Wishlist {ids.length > 0 && `(${ids.length})`}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}