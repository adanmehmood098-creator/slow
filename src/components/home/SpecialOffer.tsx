import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { IMAGES, unsplash } from '@/lib/utils'
import Reveal from '@/components/ui/Reveal'
import Countdown from '@/components/ui/Countdown'

export default function SpecialOffer() {
  return (
    <section className="section">
      <div className="container">
        <Reveal direction="zoom">
          <div className="special-offer">
            <img className="bg" src={unsplash(IMAGES.peonies, 1600)} alt="" />
            <div className="so-shade" />
            <div className="so-content">
              <span className="so-tag"><Sparkles width={13} height={13} style={{ display: 'inline', marginRight: 6 }} /> Limited Time</span>
              <h2>
                A Little More Love, <em>A Little Less Price.</em>
              </h2>
              <p className="so-sub">
                Our signature peony & rose collection — now with up to 30% off, while the flowers last.
              </p>
              <div className="so-offer-badge">30% OFF</div>
              <div style={{ marginBottom: 30 }}>
                <Countdown />
              </div>
              <Link to="/offers" className="btn btn-gold btn-lg">
                Shop The Sale
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}