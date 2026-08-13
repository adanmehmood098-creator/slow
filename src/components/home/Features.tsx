import { FEATURES } from '@/data/content'
import Reveal from '@/components/ui/Reveal'

export default function Features() {
  return (
    <section className="features section-sm">
      <div className="container">
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}