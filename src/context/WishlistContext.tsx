import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/lib/types'
import { useAuth } from './AuthContext'

interface WishlistContextValue {
  ids: string[]
  products: Product[]
  loaded: boolean
  isWished: (productId: string) => boolean
  toggle: (product: Product) => void
  remove: (productId: string) => void
}

const LS_KEY = 'bb_wishlist'
const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [ids, setIds] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) {
        const raw = localStorage.getItem(LS_KEY)
        const localIds = raw ? (JSON.parse(raw) as string[]) : []
        if (!cancelled) {
          setIds(localIds)
          setLoaded(true)
        }
        return
      }
      if (!supabase) {
        if (!cancelled) setLoaded(true)
        return
      }
      const local = localStorage.getItem(LS_KEY)
      const localIds: string[] = local ? (JSON.parse(local) as string[]) : []
      const { data } = await supabase.from('wishlist').select('product_id')
      const dbIds = (data ?? []).map((r) => r.product_id)
      const merged = [...new Set([...dbIds, ...localIds])]
      if (!cancelled) setIds(merged)
      if (!cancelled) setLoaded(true)
      if (localIds.length > 0 && supabase) {
        await supabase.from('wishlist').upsert(
          localIds.map((product_id) => ({ user_id: user.id, product_id })),
          { onConflict: 'user_id,product_id' }
        )
        localStorage.removeItem(LS_KEY)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    async function fetchProducts() {
      if (ids.length === 0) {
        setProducts([])
        return
      }
      if (!supabase) return
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .in('id', ids)
      if (!cancelled) setProducts((data ?? []) as Product[])
    }
    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [ids])

  useEffect(() => {
    if (!loaded) return
    if (user) return
    localStorage.setItem(LS_KEY, JSON.stringify(ids))
  }, [ids, loaded, user])

  const isWished = useCallback((productId: string) => ids.includes(productId), [ids])

  const toggle = useCallback(
    (product: Product) => {
      setIds((prev) => {
        const exists = prev.includes(product.id)
        const next = exists ? prev.filter((x) => x !== product.id) : [...prev, product.id]
        if (user && supabase) {
          if (exists) supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', product.id)
          else
            supabase
              .from('wishlist')
              .upsert({ user_id: user.id, product_id: product.id }, { onConflict: 'user_id,product_id' })
        }
        return next
      })
    },
    [user]
  )

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((x) => x !== productId))
    if (user && supabase) supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId)
  }, [user])

  return (
    <WishlistContext.Provider value={{ ids, products, loaded, isWished, toggle, remove }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}