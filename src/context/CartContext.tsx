import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { CartEntry, Product } from '@/lib/types'
import { useAuth } from './AuthContext'
import { COUPON_CODE, COUPON_DISCOUNT, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, discountAmount, discountedPrice } from '@/lib/utils'

interface CartContextValue {
  items: CartEntry[]
  count: number
  subtotal: number
  productDiscount: number
  couponCode: string | null
  couponDiscount: number
  deliveryFee: number
  total: number
  loaded: boolean
  add: (product: Product, quantity?: number) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
}

const LS_KEY = 'bb_cart'

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(() => localStorage.getItem('bb_coupon'))
  const syncing = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user) {
        const raw = localStorage.getItem(LS_KEY)
        if (!cancelled) {
          setItems(raw ? (JSON.parse(raw) as CartEntry[]) : [])
          setLoaded(true)
        }
        return
      }
      if (!supabase) {
        if (!cancelled) setLoaded(true)
        return
      }
      const local = localStorage.getItem(LS_KEY)
      const localItems: CartEntry[] = local ? (JSON.parse(local) as CartEntry[]) : []
      const { data } = await supabase.from('cart_items').select('product_id, quantity')
      const dbRows = (data ?? []) as { product_id: string; quantity: number }[]
      const merged = new Map<string, number>()
      for (const r of dbRows) merged.set(r.product_id, r.quantity)
      for (const l of localItems) merged.set(l.product.id, (merged.get(l.product.id) ?? 0) + l.quantity)
      if (merged.size > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .in('id', [...merged.keys()])
        const map = new Map((products ?? []).map((p) => [p.id, p]))
        const entries: CartEntry[] = [...merged.entries()]
          .map(([id, qty]) => (map.has(id) ? { product: map.get(id)!, quantity: qty } : null))
          .filter((e): e is CartEntry => e !== null)
        if (!cancelled) setItems(entries)
      } else if (!cancelled) {
        setItems([])
      }
      if (!cancelled) setLoaded(true)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!loaded) return
    if (!user) {
      localStorage.setItem(LS_KEY, JSON.stringify(items))
      return
    }
    if (!supabase || syncing.current) return
    syncing.current = true
    const timer = setTimeout(async () => {
      const rows = items.map((i) => ({ user_id: user.id, product_id: i.product.id, quantity: i.quantity }))
      await supabase!.from('cart_items').upsert(rows, { onConflict: 'user_id,product_id' })
      const ids = items.map((i) => i.product.id)
      const { data } = await supabase!.from('cart_items').select('product_id').eq('user_id', user.id)
      const stale = (data ?? [])
        .map((r) => r.product_id)
        .filter((id) => !ids.includes(id))
      if (stale.length > 0) await supabase!.from('cart_items').delete().in('product_id', stale)
      syncing.current = false
    }, 500)
    return () => {
      clearTimeout(timer)
      syncing.current = false
    }
  }, [items, user, loaded])

  const add = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id)
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(product.stock || 99, i.quantity + quantity) }
              : i
          )
        }
        return [...prev, { product, quantity: Math.max(1, quantity) }]
      })
    },
    []
  )

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => {
            if (i.product.id !== productId) return i
            const max = i.product.stock || 99
            return { ...i, quantity: Math.min(max, quantity) }
          })
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setCoupon(null)
    localStorage.removeItem('bb_coupon')
  }, [])

  const applyCoupon = useCallback(
    (code: string) => {
      const clean = code.trim().toUpperCase()
      if (clean !== COUPON_CODE) return false
      setCoupon(COUPON_CODE)
      localStorage.setItem('bb_coupon', COUPON_CODE)
      return true
    },
    []
  )

  const removeCoupon = useCallback(() => {
    setCoupon(null)
    localStorage.removeItem('bb_coupon')
  }, [])

  const summary = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + discountedPrice(i.product) * i.quantity, 0)
    const productDiscount = items.reduce((s, i) => s + discountAmount(i.product) * i.quantity, 0)
    const couponDiscount = coupon ? Math.round(subtotal * COUPON_DISCOUNT * 100) / 100 : 0
    const afterDiscount = subtotal - couponDiscount
    const deliveryFee = afterDiscount >= FREE_DELIVERY_THRESHOLD || afterDiscount === 0 ? 0 : DELIVERY_FEE
    const total = afterDiscount + deliveryFee
    return { subtotal, productDiscount, couponDiscount, deliveryFee, total }
  }, [items, coupon])

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.reduce((s, i) => s + i.quantity, 0),
        ...summary,
        couponCode: coupon,
        loaded,
        add,
        remove,
        setQuantity,
        clear,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}