import { Link } from 'react-router-dom'
import { fetchProducts } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import ProductCard from '@/components/ui/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Feedback'
import SetupNotice from '@/components/ui/SetupNotice'

export default function FeaturedFlowers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProducts({ featured: true, activeOnly: true, bestSeller: undefined })
      .then((data) => !cancelled && setProducts(data.slice(0, 8)))
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="featured section">
      <div className="container">
        <Reveal>
          <div className="featured-row">
            <SectionHeading
              eyebrow="Featured"
              title="Our Most Loved Flowers"
              subtitle="Handpicked by our florists — the arrangements our customers fall for again and again."
            />
            <Link to="/shop" className="btn btn-outline btn-sm" style={{ marginBottom: 40 }}>
              View All Flowers →
            </Link>
          </div>
        </Reveal>
        {!isSupabaseConfigured ? (
          <SetupNotice />
        ) : loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <SetupNotice />
        ) : (
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}