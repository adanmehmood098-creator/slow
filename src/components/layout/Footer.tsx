import { Link } from 'react-router-dom'
import { Instagram, Facebook, Music2, Phone, Mail, MapPin, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

function FooterInner() {
  const { user } = useAuth()
  const { count } = useCart()
  const { ids } = useWishlist()

  const shopLinks = [
    { to: '/shop', label: 'All Flowers' },
    { to: '/shop?category=Bouquets', label: 'Bouquets' },
    { to: '/shop?sort=popularity&best=1', label: 'Best Sellers' },
    { to: '/offers', label: 'Offers' },
    { to: '/collections', label: 'Collections' },
  ]
  const careLinks = [
    { to: '/contact', label: 'Contact' },
    { to: '/checkout', label: 'Delivery' },
    { to: '/account', label: 'My Orders' },
    { to: '/contact', label: 'FAQs' },
  ]
  const companyLinks = [
    { to: '/about', label: 'About Us' },
    { to: '/about', label: 'Our Florists' },
    { to: '/contact', label: 'Careers' },
  ]

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="brand" style={{ color: '#fff' }}>
              <span className="brand-mark">🌸</span>
              <span>
                <span className="brand-name">Bloom & Blush</span>
                <span className="brand-tagline">Luxury Florist</span>
              </span>
            </Link>
            <p>
              A luxury flower boutique crafting bouquets that speak what words cannot. Fresh blooms, expert
              hands, delivered with love since 2018.
            </p>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram width={18} height={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook width={18} height={18} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok">
                <Music2 width={18} height={18} />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>
                    <ChevronRight width={12} height={12} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              {careLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>
                    <ChevronRight width={12} height={12} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>
                    <ChevronRight width={12} height={12} /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Reach Us</h4>
            <ul style={{ gap: 14 }}>
              <li>
                <a href="tel:+15551234567" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Phone width={15} height={15} /> +1 (555) 123-4567
                </a>
              </li>
              <li>
                <a href="mailto:hello@bloomandblush.com" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Mail width={15} height={15} /> hello@bloomandblush.com
                </a>
              </li>
              <li>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <MapPin width={15} height={15} /> 12 Rosewood Avenue, Flower District
                </a>
              </li>
              <li style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                {user ? `Signed in as ${user.email}` : `${count} items in cart · ${ids.length} wishlist favorites`}
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bloom & Blush Florals. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Footer() {
  return <FooterInner />
}