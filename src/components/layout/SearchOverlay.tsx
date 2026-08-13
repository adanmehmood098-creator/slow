import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SafeImage from '@/components/ui/SafeImage'
import { formatPrice, unsplash, productImg, discountedPrice } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface SearchHit {
  id: string
  name: string
  price: number
  discount: number
  image_url: string | null
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const navigate = useNavigate()

  async function handleSearch(value: string) {
    setQ(value)
    if (!value.trim()) {
      setResults([])
      return
    }
    if (!isSupabaseConfigured || !supabase) return
    const { data } = await supabase
      .from('products')
      .select('id, name, price, discount, image_url')
      .ilike('name', `%${value.trim()}%`)
      .eq('is_active', true)
      .limit(6)
    setResults((data ?? []) as SearchHit[])
  }

  function go(id: string) {
    setQ('')
    setResults([])
    onClose()
    navigate(`/product/${id}`)
  }

  return (
    <div className={`search-overlay ${open ? 'open' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-box">
        <div className="search-input-row">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--choco)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            placeholder="Search for flowers, bouquets, occasions…"
            value={q}
            onChange={(e) => void handleSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && q.trim()) {
                onClose()
                navigate(`/shop?search=${encodeURIComponent(q.trim())}`)
                setQ('')
              }
            }}
          />
          <button className="toast-close" style={{ color: 'var(--muted)' }} onClick={onClose} aria-label="Close search">
            ✕
          </button>
        </div>
        <div className="search-results">
          {q.trim() && results.length === 0 && (
            <div className="search-empty">
              No flowers found for “{q}” — try “rose”, “tulip” or press Enter to browse the shop.
            </div>
          )}
          {results.map((r) => (
            <div
              className="search-result-item"
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => go(r.id)}
              onKeyDown={(e) => e.key === 'Enter' && go(r.id)}
            >
              <SafeImage src={unsplash(productImg(r), 200)} alt={r.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</h4>
                <p>{formatPrice(discountedPrice(r))}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}