import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ABOUT_STATS, FLORIST_TEAM } from '@/data/content'
import { IMAGES, unsplash } from '@/lib/utils'
import Reveal from '@/components/ui/Reveal'

function useCountUp(target: number, decimals = 0, duration = 1600) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / duration)
              const eased = 1 - Math.pow(1 - p, 3)
              setValue(target * eased)
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
            obs.disconnect()
          }
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return { ref, display: value.toLocaleString('en-US', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) }
}

function StatItem({ stat, delay }: { stat: (typeof ABOUT_STATS)[number]; delay: number }) {
  const { ref, display } = useCountUp(stat.value, stat.decimals ?? 0, 1600 + delay)
  return (
    <div className="stat-item">
      <div className="stat-num" ref={ref}>
        {display}
        {stat.suffix}
      </div>
      <div className="stat-lbl">{stat.label}</div>
    </div>
  )
}

export default function AboutStrip() {
  return (
    <section className="about-strip section">
      <div className="container">
        <div className="about-strip-grid">
          <Reveal direction="left">
            <div className="about-media">
              <img src={unsplash(IMAGES.weddingArch, 1100)} alt="Our florist studio" />
              <div className="about-badge">
                <span className="ab-num">8+ Years</span>
                <span className="ab-lbl">of crafting<br />floral stories</span>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" delay={120}>
            <div className="about-text">
              <span className="eyebrow">🌸 Our Story</span>
              <h2>A Little Boutique With A Very Big Heart</h2>
              <p>
                What began as a tiny market stall in 2018 with a single bucket of blush roses has bloomed into a
                city-wide favourite. We still hand-tie every bouquet in our studio, still write every note by hand,
                and still treat every order like it's for someone we love.
              </p>
              <p>
                Our mission is simple: make every moment beautiful, and every flower feel personal. From
                first-date tulips to wedding arches, we've sent over 25,000 blooms into the world — many with
                happy tears attached.
              </p>
              <div className="stats-row">
                {ABOUT_STATS.map((s, i) => (
                  <StatItem key={s.label} stat={s} delay={i * 200} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 26, alignItems: 'center', overflowX: 'auto' }}>
                {FLORIST_TEAM.map((f) => (
                  <span key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', background: '#fff', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-pill)', padding: '8px 14px', fontSize: 13 }}>
                    <span style={{ fontSize: 17 }}>{f.emoji}</span>
                    <span>
                      <strong style={{ color: 'var(--choco)' }}>{f.name}</strong>
                      <span style={{ color: 'var(--muted)' }}> · {f.role}</span>
                    </span>
                  </span>
                ))}
              </div>
              <Link to="/about" className="btn btn-choco" style={{ marginTop: 26 }}>
                Read Our Full Story
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}