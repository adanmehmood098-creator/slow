import { supabase } from './supabase'
import { handleDbError, type DbError } from './db'
import type { Order, OrderItem, OrderWithItems, Product, Profile, Review } from './types'

export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalStock: number
  lowStock: number
  pendingOrders: number
  cancelledOrders: number
}

export interface AdminProductInput {
  name: string
  category_id: string | null
  description: string
  price: number
  discount: number
  stock: number
  sku: string
  image_url: string | null
  featured: boolean
  best_seller: boolean
  is_active: boolean
  occasions: string[]
}

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: orders, error: oErr } = await supabase.from('orders').select('total, status')
  if (oErr) return handleDbError(oErr, 'Could not load stats')
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
  if (pErr) return handleDbError(pErr, 'Could not load stats')
  const { data: products, error: prErr } = await supabase.from('products').select('id, stock, is_active')
  if (prErr) return handleDbError(prErr, 'Could not load stats')

  const list = (orders ?? []) as { total: number; status: string }[]
  const activeOrders = list.filter((o) => o.status !== 'Cancelled')
  return {
    totalRevenue: activeOrders.reduce((s, o) => s + Number(o.total), 0),
    totalOrders: list.length,
    totalCustomers: profiles?.length ?? 0,
    totalProducts: (products ?? []).length,
    totalStock: (products ?? []).reduce((s, p) => s + p.stock, 0),
    lowStock: (products ?? []).filter((p) => p.stock > 0 && p.stock <= 5).length,
    pendingOrders: list.filter((o) => o.status === 'Pending').length,
    cancelledOrders: list.filter((o) => o.status === 'Cancelled').length,
  }
}

export async function fetchAllOrders(): Promise<OrderWithItems[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) return handleDbError(error, 'Could not load orders')
  const list = (orders ?? []) as Order[]
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .in(
      'order_id',
      list.map((o) => o.id)
    )
  if (iErr) return handleDbError(iErr, 'Could not load order items')
  const itemRows = (items ?? []) as OrderItem[]
  const byOrder = new Map<string, OrderItem[]>()
  for (const it of itemRows) {
    const arr = byOrder.get(it.order_id) ?? []
    arr.push(it)
    byOrder.set(it.order_id, arr)
  }
  return list.map((o) => ({ ...o, items: byOrder.get(o.id) ?? [] }))
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) return handleDbError(error, 'Could not update order status')
}

export async function fetchAdminProducts(): Promise<Product[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(name), images:product_images(image_url)')
    .order('created_at', { ascending: false })
  if (error) return handleDbError(error, 'Could not load products')
  return (data ?? []) as Product[]
}

export async function createAdminProduct(input: AdminProductInput): Promise<Product> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .insert({ ...input, rating: 0, review_count: 0, sales_count: 0 })
    .select()
    .single()
  if (error) return handleDbError(error, 'Could not create product')
  return data as Product
}

export async function updateAdminProduct(id: string, patch: Partial<AdminProductInput>): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('products').update(patch).eq('id', id)
  if (error) return handleDbError(error, 'Could not update product')
}

export async function deleteAdminProduct(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return handleDbError(error, 'Could not delete product')
}

export async function adjustStock(id: string, delta: number): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('products').select('stock').eq('id', id).single()
  if (error) return handleDbError(error, 'Could not update stock')
  const next = Math.max(0, (data.stock ?? 0) + delta)
  const { error: uErr } = await supabase.from('products').update({ stock: next }).eq('id', id)
  if (uErr) return handleDbError(uErr, 'Could not update stock')
}

export async function replaceProductImages(productId: string, urls: string[]): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error: dErr } = await supabase.from('product_images').delete().eq('product_id', productId)
  if (dErr) return handleDbError(dErr, 'Could not update images')
  if (urls.length > 0) {
    const { error: iErr } = await supabase
      .from('product_images')
      .insert(urls.map((u) => ({ product_id: productId, image_url: u })))
    if (iErr) return handleDbError(iErr, 'Could not update images')
  }
}

export async function fetchAdminCustomers(): Promise<Profile[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) return handleDbError(error, 'Could not load customers')
  return (data ?? []) as Profile[]
}

export async function fetchAdminReviews(): Promise<(Review & { product?: { name: string } })[]> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('reviews')
    .select('*, product:products(name)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return handleDbError(error, 'Could not load reviews')
  return (data ?? []) as (Review & { product?: { name: string } })[]
}

export async function deleteAdminReview(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase.from('reviews').delete().eq('id', id)
  if (error) return handleDbError(error, 'Could not delete review')
}

export type { DbError }

export type { Order }