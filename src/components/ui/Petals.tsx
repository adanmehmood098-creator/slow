import { useMemo } from 'react'
import { IMAGES, unsplash } from '@/lib/utils'

const COLORS = ['var(--blush)', 'var(--soft-pink)', 'var(--gold)', '#f3b6c4', '#e2949f']

export default function Petals({ count = 10 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 97) % 100,
        delay: (i * 1.7) % 14,
        duration: 11 + ((i * 3) % 8),
        size: 12 + ((i * 5) % 16),
        opacity: 0.5 + ((i * 13) % 40) / 100,
        sway: ((i * 67) % 120) - 60,
        color: COLORS[i % COLORS.length],
      })),
    [count]
  )

  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            fontSize: p.size,
            width: p.size,
            height: p.size,
            '--petal-sway': `${p.sway}px`,
            '--petal-opacity': p.opacity,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" width={p.size} height={p.size} fill={p.color}>
            <path d="M12 2c3.5 2 5 5 5 8.5 0 4-2.5 7.5-5 11.5-2.5-4-5-7.5-5-11.5C7 7 8.5 4 12 2z" opacity="0.85" />
          </svg>
        </span>
      ))}
    </div>
  )
}

export function HeroPetals() {
  return <Petals count={12} />
}

export function blossoms() {
  return { hero: unsplash(IMAGES.hero, 1800) }
}