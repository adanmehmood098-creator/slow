import { useEffect, useState } from 'react'
import { fetchProducts } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import ProductCard from '@/components/ui/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Feedback'
import SetupNotice from '@/components/ui/SetupNotice'

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchProducts({ activeOnly: true })
      .then((all) => {
        const ranked = [...all].sort(
          (a, b) =>
            b.sales_count - a.sales_count ||
            b.rating - a.rating ||
            b.review_count - a.review_count
        )
        if (!cancelled) setProducts(ranked.slice(0, 4))
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="best-sellers section">
      <div className="container">
        <Reveal>
          <SectionHeading
            eyebrow="Top Rated"
            title="Best Sellers"
            subtitle="The four arrangements our customers can't stop ordering — ranked by sales, ratings and love."
          />
        </Reveal>
        {!isSupabaseConfigured ? (
          <SetupNotice />
        ) : loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="best-scroller">
            {products.map((p, i) => (
              <div className="best-card" key={p.id}>
                <span className="best-rank">#{i + 1}</span>
                <ProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}