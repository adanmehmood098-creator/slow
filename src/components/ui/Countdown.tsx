import { useEffect, useState } from 'react'

function getTarget(): number {
  const KEY = 'bb_sale_ends'
  const stored = localStorage.getItem(KEY)
  if (stored && !isNaN(Number(stored))) return Number(stored)
  const target = Date.now() + (2 * 86400 + 14 * 3600 + 32 * 60 + 18) * 1000
  localStorage.setItem(KEY, String(target))
  return target
}

interface CountdownProps {
  variant?: 'light' | 'dark'
}

export default function Countdown({ variant = 'light' }: CountdownProps) {
  const [target] = useState(getTarget)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  const units = [
    { num: days, lbl: 'Days' },
    { num: hours, lbl: 'Hours' },
    { num: minutes, lbl: 'Minutes' },
    { num: seconds, lbl: 'Seconds' },
  ]

  return (
    <div className="countdown">
      {units.map((u) => (
        <div className="countdown-unit" key={u.lbl}>
          <div className="num">{String(u.num).padStart(2, '0')}</div>
          <div className="lbl">{u.lbl}</div>
        </div>
      ))}
    </div>
  )
}