import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { IMAGES, unsplash } from '@/lib/utils'
import Petals from '@/components/ui/Petals'

const FLOATS = [
  { cls: 'f1', src: unsplash(IMAGES.whiteBouquet, 500) },
  { cls: 'f2', src: unsplash(IMAGES.pinkBloom, 400) },
  { cls: 'f3', src: unsplash(IMAGES.redRoses, 500) },
  { cls: 'f4', src: unsplash(IMAGES.tulips, 400) },
]

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onScroll = () => {
      if (bgRef.current) {
        const y = window.scrollY
        if (y < window.innerHeight) bgRef.current.style.transform = `translateY(${y * 0.28}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" ref={bgRef}>
        <img src={unsplash(IMAGES.hero, 1920)} alt="" />
      </div>
      <div className="hero-overlay" />
      <Petals count={11} />
      {FLOATS.map((f) => (
        <div className={`hero-floats ${f.cls}`} key={f.cls}>
          <img src={f.src} alt="" />
        </div>
      ))}
      <div className="hero-content">
        <span className="hero-eyebrow">🌸 Luxury Flower Boutique</span>
        <h1 className="hero-title">
          Flowers That Speak <em>What Words Cannot.</em>
        </h1>
        <p className="hero-sub">Beautifully crafted bouquets for life's most beautiful moments.</p>
        <div className="hero-ctas">
          <Link to="/shop" className="btn btn-blush btn-lg">
            Shop Flowers
          </Link>
          <Link to="/collections" className="btn btn-glass btn-lg">
            Explore Collections
          </Link>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span className="mouse" />
        Scroll
      </div>
    </section>
  )
}