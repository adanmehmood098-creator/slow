import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { OCCASION_CARDS } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import SafeImage from '@/components/ui/SafeImage'

export default function Collections() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span>Collections</span>
          </nav>
          <h1>Our Collections</h1>
          <p>Beautifully curated flower collections for the moments that stay with you.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="Curated"
              title="Shop By Occasion"
              subtitle="Every collection is hand-curated by our florists to carry the right feeling."
            />
          </Reveal>
          <div className="occasions-grid">
            {OCCASION_CARDS.map((oc, i) => (
              <Reveal key={oc.name} delay={(i % 4) * 90}>
                <Link to={`/shop?occasion=${encodeURIComponent(oc.name)}`} className="occasion-card">
                  <SafeImage src={oc.image} alt={oc.name} />
                  <div className="oc-shade" />
                  <div className="oc-info">
                    <div>
                      <h3>{oc.name}</h3>
                      <p>Explore Collection</p>
                    </div>
                    <span className="oc-arrow">
                      <ArrowRight width={18} height={18} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}