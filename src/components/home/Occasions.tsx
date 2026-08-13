import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { OCCASION_CARDS } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import SafeImage from '@/components/ui/SafeImage'

export default function Occasions() {
  return (
    <section className="occasions section" id="occasions">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Occasions"
            title="Flowers For Every Moment"
            subtitle="From whispered 'I love you's to heartfelt good wishes — find the arrangement that says it perfectly."
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
  )
}