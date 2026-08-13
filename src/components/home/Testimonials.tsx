import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TESTIMONIALS } from '@/data/content'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import RatingStars from '@/components/ui/RatingStars'

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setIndex((i) => (i + 1) % TESTIMONIALS.length), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 5200)
    return () => clearInterval(t)
  }, [next, paused])

  return (
    <section className="testimonials section">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Testimonials"
            title="Loved By Flower Lovers"
            subtitle="Thousands of five-star reviews from people who sent (and received!) our blooms."
          />
        </Reveal>
        <Reveal>
          <div
            className="testimonial-stage"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`testimonial-slide ${i === index ? 'active' : i === (index + TESTIMONIALS.length - 1) % TESTIMONIALS.length ? 'prev' : ''}`}
                aria-hidden={i !== index}
              >
                <RatingStars value={5} size={17} />
                <p className="testimonial-quote">“{t.quote}”</p>
                <div className="testimonial-who">
                  <span className="testimonial-avatar">{t.name.split(' ').map((w) => w[0]).join('')}</span>
                  <span>
                    <span className="name">{t.name}</span>
                    <br />
                    <span className="role">{t.role}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="testimonial-nav">
          <button className="testimonial-arrow" onClick={prev} aria-label="Previous testimonial">
            <ChevronLeft width={20} height={20} />
          </button>
          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                className={i === index ? 'active' : ''}
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button className="testimonial-arrow" onClick={next} aria-label="Next testimonial">
            <ChevronRight width={20} height={20} />
          </button>
        </div>
      </div>
    </section>
  )
}