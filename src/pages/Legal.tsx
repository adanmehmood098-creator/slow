import { Link } from 'react-router-dom'

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Privacy Policy',
    body: [
      'We collect the information you give us: your name, email, delivery address and order history. This lets us process orders, deliver flowers, and occasionally send you blooms you actually want to hear about.',
      'Payment details are handled by our payment provider and are never stored on our servers. We never sell your data to anyone — flowers don\'t gossip, and neither do we.',
      'You can request a copy or deletion of your data at any time by emailing privacy@bloomandblush.com.',
    ],
  },
  {
    title: 'Terms & Conditions',
    body: [
      'All orders are subject to availability. Flowers are a natural product — exact shade and size may vary slightly from photos, and that is part of their charm.',
      'Orders placed before 2:00 PM qualify for same-day delivery within our delivery area. Standard delivery takes 1–2 business days.',
      'If your flowers arrive damaged, contact us within 24 hours with a photo and we will replace them free of charge.',
      'Sales and promotions cannot be combined unless stated. The coupon code BLOOM20 grants 20% off basket subtotal and cannot be combined with other codes.',
    ],
  },
]

export default function Legal({ page }: { page: 'privacy' | 'terms' }) {
  const section = page === 'privacy' ? SECTIONS[0] : SECTIONS[1]
  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span>{section.title}</span>
          </nav>
          <h1>{section.title}</h1>
          <p>Last updated: January 2026</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="panel-card">
            {section.body.map((p, i) => (
              <p key={i} style={{ color: 'var(--ink-soft)', fontSize: 15.5, lineHeight: 1.85, marginBottom: 18 }}>
                {p}
              </p>
            ))}
            <Link to="/contact" className="btn btn-outline">Questions? Contact us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}