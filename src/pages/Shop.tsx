import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { fetchCategories, fetchProducts } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Category, Product } from '@/lib/types'
import { OCCASIONS } from '@/lib/types'
import { discountedPrice } from '@/lib/utils'
import ProductCard from '@/components/ui/ProductCard'
import { ProductGridSkeleton, EmptyState } from '@/components/ui/Feedback'
import SetupNotice from '@/components/ui/SetupNotice'

type SortKey = 'popularity' | 'rating' | 'price-asc' | 'price-desc' | 'newest' | 'best'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'best', label: 'Best Sellers' },
  { key: 'rating', label: 'Highest rated' },
  { key: 'price-asc', label: 'Lowest price' },
  { key: 'price-desc', label: 'Highest price' },
  { key: 'newest', label: 'Newest' },
]

const RATINGS = [4.5, 4.0, 3.5]

function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list]
  switch (sort) {
    case 'popularity':
      return arr.sort((a, b) => b.sales_count - a.sales_count || b.review_count - a.review_count)
    case 'best':
      return arr.sort((a, b) => Number(b.best_seller) - Number(a.best_seller) || b.sales_count - a.sales_count)
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
    case 'price-asc':
      return arr.sort((a, b) => discountedPrice(a) - discountedPrice(b))
    case 'price-desc':
      return arr.sort((a, b) => discountedPrice(b) - discountedPrice(a))
    case 'newest':
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileFilters, setMobileFilters] = useState(false)
  const [stamp, setStamp] = useState(0)
  const initialRender = useRef(true)

  const search = params.get('search') ?? ''
  const occasion = params.get('occasion') ?? ''
  const categoryName = params.get('category') ?? ''
  const sort = (params.get('sort') as SortKey) || 'popularity'
  const bestOnly = params.get('best') === '1'
  const maxPrice = Number(params.get('max') ?? '') || 0
  const minRating = Number(params.get('rating') ?? '') || 0
  const onSaleOnly = params.get('sale') === '1'
  const inStockOnly = params.get('stock') === '1'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchCategories(), fetchProducts({ activeOnly: true })])
      .then(([cats, prods]) => {
        if (cancelled) return
        setCategories(cats)
        setProducts(prods)
        setStamp((s) => s + (initialRender.current ? 0 : 1))
        initialRender.current = false
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params)
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === '') next.delete(k)
        else next.set(k, v)
      }
      setParams(next)
      setStamp((s) => s + 1)
    },
    [params, setParams]
  )

  const categoryId = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase())?.id

  const filtered = useMemo(() => {
    let list = products
    if (categoryId) list = list.filter((p) => p.category_id === categoryId)
    if (occasion) list = list.filter((p) => (p.occasions ?? []).includes(occasion))
    if (bestOnly) list = list.filter((p) => p.best_seller)
    if (onSaleOnly) list = list.filter((p) => p.discount > 0)
    if (inStockOnly) list = list.filter((p) => p.stock > 0)
    if (maxPrice > 0) list = list.filter((p) => discountedPrice(p) <= maxPrice)
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.category?.name ?? '').toLowerCase().includes(q)
      )
    }
    return sortProducts(list, sort)
  }, [products, categoryId, occasion, bestOnly, onSaleOnly, inStockOnly, maxPrice, minRating, search, sort])

  const activeFilters = [
    categoryName && { label: categoryName, clear: () => update({ category: null }) },
    occasion && { label: occasion, clear: () => update({ occasion: null }) },
    bestOnly && { label: 'Best Sellers', clear: () => update({ best: null }) },
    onSaleOnly && { label: 'On Sale', clear: () => update({ sale: null }) },
    inStockOnly && { label: 'In Stock', clear: () => update({ stock: null }) },
    maxPrice > 0 && { label: `Under $${maxPrice}`, clear: () => update({ max: null }) },
    minRating > 0 && { label: `${minRating}★ & up`, clear: () => update({ rating: null }) },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100 }
    const prices = products.map((p) => discountedPrice(p))
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
  }, [products])

  const Sidebar = (
    <aside className={`shop-sidebar ${mobileFilters ? 'mobile-open' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ fontSize: 20 }}>Filters</h3>
        <button className="btn-icon" onClick={() => setMobileFilters(false)} aria-label="Close filters" style={{ display: 'none' }}>
          <X width={16} height={16} />
        </button>
      </div>

      {activeFilters.length > 0 && (
        <div className="active-filter-chips" style={{ marginBottom: 14 }}>
          {activeFilters.map((f) => (
            <span className="filter-chip" key={f.label} onClick={f.clear}>
              {f.label} ✕
            </span>
          ))}
        </div>
      )}

      <div className="shop-filter-block">
        <h4>Categories</h4>
        <div className="chip-list">
          <button className={!categoryName ? 'active' : ''} onClick={() => update({ category: null })}>
            All Flowers <span>{products.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={categoryName.toLowerCase() === c.name.toLowerCase() ? 'active' : ''}
              onClick={() => update({ category: c.name })}
            >
              {c.name} <span>{products.filter((p) => p.category_id === c.id).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="shop-filter-block">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input type="number" min={0} placeholder="Min" value="0" readOnly aria-label="Min price" />
          <span>–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => update({ max: e.target.value ? String(e.target.value) : null })}
            aria-label="Max price"
          />
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          value={maxPrice || priceBounds.max}
          onChange={(e) => update({ max: e.target.value === String(priceBounds.max) ? null : e.target.value })}
          style={{ width: '100%', marginTop: 14, accentColor: 'var(--choco)' }}
          aria-label="Max price slider"
        />
      </div>

      <div className="shop-filter-block">
        <h4>Occasion</h4>
        <div className="chip-list">
          {OCCASIONS.map((o) => (
            <button key={o} className={occasion === o ? 'active' : ''} onClick={() => update({ occasion: occasion === o ? null : o })}>
              {o} <span>{products.filter((p) => (p.occasions ?? []).includes(o)).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="shop-filter-block">
        <h4>Rating</h4>
        <div className="check-list">
          {RATINGS.map((r) => (
            <label key={r}>
              <input type="radio" name="rating" checked={minRating === r} onChange={() => update({ rating: minRating === r ? null : String(r) })} />
              {r}★ &amp; up
            </label>
          ))}
        </div>
      </div>

      <div className="shop-filter-block">
        <h4>More</h4>
        <div className="check-list">
          <label>
            <input type="checkbox" checked={onSaleOnly} onChange={() => update({ sale: onSaleOnly ? null : '1' })} />
            On sale
          </label>
          <label>
            <input type="checkbox" checked={inStockOnly} onChange={() => update({ stock: inStockOnly ? null : '1' })} />
            In stock only
          </label>
          <label>
            <input type="checkbox" checked={bestOnly} onChange={() => update({ best: bestOnly ? null : '1' })} />
            Best sellers only
          </label>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span>Shop</span>
          </nav>
          <h1>Our Flower Shop</h1>
          <p>Fresh from the studio — every bouquet hand-tied, every stem hand-picked.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {!isSupabaseConfigured ? (
            <SetupNotice />
          ) : error ? (
            <SetupNotice />
          ) : loading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="shop-layout">
              {Sidebar}
              <div className="shop-main">
                <div className="shop-toolbar">
                  <span className="result-count">
                    <strong>{filtered.length}</strong> {filtered.length === 1 ? 'arrangement' : 'arrangements'}
                    {search && <> for “<strong>{search}</strong>”</>}
                  </span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button className="btn btn-outline btn-sm mobile-filters-btn" onClick={() => setMobileFilters(true)}>
                      <SlidersHorizontal width={15} height={15} /> Filters
                    </button>
                    <div className="sort-select">
                      <label htmlFor="sort" className="sr-only">Sort products</label>
                      <select
                        id="sort"
                        value={sort}
                        onChange={(e) => {
                          update({ sort: e.target.value })
                        }}
                      >
                        {SORTS.map((s) => (
                          <option key={s.key} value={s.key}>
                            Sort: {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {activeFilters.length > 0 && (
                  <div className="shop-chip-row">
                    {activeFilters.map((f) => (
                      <span className="filter-chip" key={f.label} onClick={f.clear}>
                        {f.label} ✕
                      </span>
                    ))}
                    <button className="filter-chip" onClick={() => update({ category: null, occasion: null, best: null, sale: null, stock: null, max: null, rating: null, search: null })}>
                      Clear all
                    </button>
                  </div>
                )}

                {filtered.length === 0 ? (
                  <EmptyState
                    icon="🌷"
                    title="No flowers match those filters"
                    text="Try widening the price range or clearing a filter — something beautiful is waiting."
                    action={
                      <button
                        className="btn btn-choco"
                        onClick={() => update({ category: null, occasion: null, best: null, sale: null, stock: null, max: null, rating: null, search: null })}
                      >
                        Reset all filters
                      </button>
                    }
                  />
                ) : (
                  <div className="product-grid" key={stamp}>
                    {filtered.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {mobileFilters && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 94, background: 'rgba(43,23,21,.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileFilters(false)}
        />
      )}
    </div>
  )
}