import { useEffect, useState } from 'react'

const MESSAGES = [
  { icon: '🌸', text: 'FREE DELIVERY ON ORDERS ABOVE $50', highlight: 'FREE DELIVERY' },
  { icon: '🌸', text: '20% OFF SELECTED BOUQUETS — CODE: BLOOM20', highlight: '20% OFF' },
  { icon: '🌷', text: 'SAME-DAY DELIVERY AVAILABLE IN THE CITY', highlight: 'SAME-DAY' },
]

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="announcement" aria-live="polite">
      <div className="announcement-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {MESSAGES.map((m, i) => (
          <div className="announcement-slide" key={i} aria-hidden={i !== index}>
            <span>{m.icon}</span>
            <span>
              <strong>{m.highlight}</strong> {m.text.replace(m.highlight, '').trim()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}