import { ReactNode } from 'react'

export function EmptyState({
  icon = '🌸',
  title,
  text,
  action,
  compact = false,
}: {
  icon?: string | ReactNode
  title: string
  text?: string
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div className="empty-state" style={compact ? { padding: '36px 20px' } : undefined}>
      <div className="empty-icon">{icon}</div>
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}

export function PageSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '90px 0' }}>
      <div className="spinner spinner-dark" style={{ width: 34, height: 34, borderWidth: 3 }} />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="product-card" key={i} style={{ pointerEvents: 'none' }}>
          <div className="card-media">
            <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
          </div>
          <div className="card-info">
            <div className="skeleton" style={{ height: 13, width: '45%' }} />
            <div className="skeleton" style={{ height: 20, width: '85%' }} />
            <div className="skeleton" style={{ height: 13, width: '60%' }} />
            <div className="skeleton" style={{ height: 22, width: '40%', marginTop: 6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: lines }, (_, i) => (
        <div className="skeleton" key={i} style={{ height: 15, width: `${100 - i * 12}%` }} />
      ))}
    </div>
  )
}