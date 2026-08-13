import { Star } from 'lucide-react'

interface RatingStarsProps {
  value: number
  size?: number
  showValue?: boolean
}

export default function RatingStars({ value, size = 15, showValue = false }: RatingStarsProps) {
  const rounded = Math.round(value)
  return (
    <span className="stars-row" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          fill={i <= rounded ? 'currentColor' : 'none'}
          className={i <= rounded ? '' : 'star-dim'}
        />
      ))}
      {showValue && <strong style={{ color: 'var(--choco)', fontSize: 13, marginLeft: 4 }}>{value.toFixed(1)}</strong>}
    </span>
  )
}