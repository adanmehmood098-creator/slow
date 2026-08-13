import { Link } from 'react-router-dom'
import { IMAGES, unsplash } from '@/lib/utils'
import { ABOUT_STATS, FLORIST_TEAM } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import SafeImage from '@/components/ui/SafeImage'

export default function About() {
  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span>About Us</span>
          </nav>
          <h1>Our Story</h1>
          <p>From one bucket of blush roses to 25,000+ bouquets delivered with love.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-strip-grid">
            <Reveal direction="left">
              <div className="about-media">
                <img src={unsplash(IMAGES.pinkRoses, 1100)} alt="Our florists at work" />
              </div>
            </Reveal>
            <Reveal direction="right" delay={100}>
              <div className="about-text">
                <span className="eyebrow">🌸 Where it began</span>
                <h2>A Flower Stall, A Dream, A Thousand Bouquets</h2>
                <p>
                  In the spring of 2018, our founder Isabella tied her first bouquet on a market stall with a roll of
                  silk ribbon and a dream. Word spread faster than petals in the wind — within a year we had our own
                  studio, and within three, our own delivery fleet.
                </p>
                <p>
                  Today Bloom &amp; Blush is a full flower house: a boutique studio, a wedding atelier, and a
                  delivery service known for flowers that arrive looking like they were picked minutes ago. Because
                  they were.
                </p>
                <p>
                  Every morning at 5 AM our florists meet the growers' vans. Every arrangement is designed in-studio,
                  photographed, and packed with hydration care. Every card is handwritten. That's the promise that
                  built this brand — and the one we keep, every single day.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="stats-row" style={{ marginTop: 60 }}>
            {ABOUT_STATS.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-num">
                  {s.value.toLocaleString()}
                  {s.suffix}
                </div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(180deg, var(--pink-mist), var(--cream))' }}>
        <div className="container">
          <Reveal>
            <SectionHeading
              eyebrow="The Team"
              title="Meet The Hands Behind The Blooms"
              subtitle="A small team of obsessive flower people who believe every stem deserves a story."
            />
          </Reveal>
          <div className="care-grid">
            {FLORIST_TEAM.map((f, i) => (
              <Reveal key={f.name} delay={i * 100}>
                <div className="care-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ fontSize: 56, padding: '30px 0 6px' }}>{f.emoji}</div>
                  <h3 style={{ padding: '10px 0 2px' }}>{f.name}</h3>
                  <p style={{ color: 'var(--blush-deep)', fontSize: 13.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', paddingBottom: 26 }}>
                    {f.role}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <p style={{ color: 'var(--muted)', marginBottom: 20, fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                "We don't sell flowers. We send feelings wrapped in petals."
              </p>
              <Link to="/shop" className="btn btn-choco btn-lg">See What We Create</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}