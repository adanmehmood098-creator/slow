import { Droplets, Sun, Scissors, Clock } from 'lucide-react'
import { CARE_GUIDES } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import SafeImage from '@/components/ui/SafeImage'

export default function FlowerCare() {
  return (
    <section className="flower-care section">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Flower Care"
            title="Make Your Flowers Last Longer"
            subtitle="A few simple habits keep your blooms fresh for days — here's how to care for your favourites."
          />
        </Reveal>
        <div className="care-grid">
          {CARE_GUIDES.map((g, i) => (
            <Reveal key={g.flower} delay={(i % 4) * 100}>
              <article className="care-card">
                <div className="care-media">
                  <SafeImage src={g.image} alt={g.flower} />
                  <span className="care-emoji">{g.emoji}</span>
                </div>
                <h3>{g.flower}</h3>
                <div className="care-body">
                  <div className="care-row">
                    <Scissors className="care-ico" width={15} height={15} />
                    <span>{g.care}</span>
                  </div>
                  <div className="care-row">
                    <Droplets className="care-ico" width={15} height={15} />
                    <span>{g.water}</span>
                  </div>
                  <div className="care-row">
                    <Sun className="care-ico" width={15} height={15} />
                    <span>{g.sun}</span>
                  </div>
                  <span className="care-lifespan">
                    <Clock width={13} height={13} /> Lasts {g.lifespan}
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}