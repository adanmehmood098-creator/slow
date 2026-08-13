import { supabase } from './supabase'
import type {
  Address,
  Category,
  ContactMessage,
  Order,
  OrderItem,
  OrderWithItems,
  Product,
  Profile,
  Review,
} from './types'

export class DbError extends Error {
  code: string
  constructor(message: string, code = 'DB_ERROR') {
    super(message)
    this.code = code
  }
}

export function handleDbError(e: unknown, fallback: string): never {
  if (e instanceof DbError) throw e
  const err = e as { message?: string }
  throw new DbError(err?.message || fallback, (err as { code?: string })?.code)
}

export async function fetchCategories(): Promise<Category[]> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) handleDbError(error, 'Could not load categories')
  return (data ?? []) as Category[]
}

export interface ProductQuery {
  categoryId?: string
  occasion?: string
  featured?: boolean
  bestSeller?: boolean
  activeOnly?: boolean
  includeCategory?: boolean
}

export async function fetchProducts(q: ProductQuery = {}): Promise<Product[]> {
  if (!supabase) throw new DbError('Supabase is not configured')
  let query = supabase
    .from('products')
    .select(q.includeCategory !== false ? '*, category:categories(name)' : '*')
    .order('created_at', { ascending: false })
  if (q.categoryId) query = query.eq('category_id', q.categoryId)
  if (q.featured !== undefined) query = query.eq('featured', q.featured)
  if (q.bestSeller !== undefined) query = query.eq('best_seller', q.bestSeller)
  if (q.activeOnly !== false) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) handleDbError(error, 'Could not load products')
  let products = (data ?? []) as unknown as Product[]
  if (q.occasion) {
    products = products.filter((p) => (p.occasions ?? []).includes(q.occasion as string))
  }
  return products
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(name), images:product_images(image_url)')
    .eq('id', id)
    .maybeSingle()
  if (error) handleDbError(error, 'Could not load product')
  return (data ?? null) as Product | null
}

export async function fetchProductBySku(sku: string): Promise<Product | null> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const { data, error } = await supabase.from('products').select('*').eq('sku', sku).maybeSingle()
  if (error) handleDbError(error, 'Could not load product')
  return (data ?? null) as Product | null
}

export async function fetchProductIds(ids: string[]): Promise<Product[]> {
  if (!supabase || ids.length === 0) return []
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(name)')
    .in('id', ids)
    .eq('is_active', true)
  if (error) handleDbError(error, 'Could not load products')
  return (data ?? []) as Product[]
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) handleDbError(error, 'Could not load reviews')
  return (data ?? []) as Review[]
}

export async function fetchMyReviews(userId: string): Promise<(Review & { product?: { id: string; name: string; image_url: string | null } })[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('reviews')
    .select('*, product:products(id, name, image_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleDbError(error, 'Could not load reviews')
  return (data ?? []) as (Review & { product?: { id: string; name: string; image_url: string | null } })[]
}

export async function addReview(input: {
  productId: string
  rating: number
  review: string
}): Promise<Review> {
  if (!supabase) throw new DbError('Sign in to submit a review')
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .maybeSingle()
  if (pErr) handleDbError(pErr, 'Could not load your profile')
  const authorName = profile?.full_name || 'Flower Lover'
  const { data, error } = await supabase
    .from('reviews')
    .insert({ product_id: input.productId, rating: input.rating, review: input.review, author_name: authorName })
    .select()
    .single()
  if (error) handleDbError(error, 'Could not submit review')
  return data as Review
}

export async function fetchOrders(userId: string): Promise<OrderWithItems[]> {
  if (!supabase) return []
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleDbError(error, 'Could not load orders')
  const list = (orders ?? []) as Order[]
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .in(
      'order_id',
      list.map((o) => o.id)
    )
    .order('created_at', { ascending: false })
  if (iErr) handleDbError(iErr, 'Could not load order items')
  const itemsByOrder = new Map<string, OrderItem[]>()
  for (const it of (items ?? []) as OrderItem[]) {
    const arr = itemsByOrder.get(it.order_id) ?? []
    arr.push(it)
    itemsByOrder.set(it.order_id, arr)
  }
  return list.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] }))
}

export async function fetchOrder(id: string): Promise<OrderWithItems> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (error) handleDbError(error, 'Could not load order')
  if (!order) throw new DbError('Order not found', 'NOT_FOUND')
  const { data: items, error: iErr } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at')
  if (iErr) handleDbError(iErr, 'Could not load order items')
  return { ...(order as Order), items: (items ?? []) as OrderItem[] }
}

export async function placeOrder(input: {
  items: { product_id: string; quantity: number }[]
  customer_name: string
  phone: string
  address: string
  city: string
  postal_code?: string
  payment_method: string
  coupon?: string
}): Promise<OrderWithItems> {
  if (!supabase) throw new DbError('Sign in to place an order', 'AUTH_REQUIRED')
  const { data, error } = await supabase.rpc('place_order', {
    p_items: input.items,
    p_customer_name: input.customer_name,
    p_phone: input.phone,
    p_address: input.address,
    p_city: input.city,
    p_postal_code: input.postal_code ?? null,
    p_payment_method: input.payment_method,
    p_coupon: input.coupon ?? null,
  })
  if (error) {
    const msg = (error as { message?: string }).message ?? 'Could not place order'
    throw new DbError(msg.replace(/^.*?:\s*/g, '').replace('Error: ', ''), 'ORDER_FAILED')
  }
  const order = data as OrderWithItems
  return order
}

export async function fetchAddresses(): Promise<Address[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('addresses').select('*').order('created_at', { ascending: false })
  if (error) handleDbError(error, 'Could not load addresses')
  return (data ?? []) as Address[]
}

export async function saveAddress(input: {
  label: string
  full_name: string
  phone: string
  address: string
  city: string
  postal_code?: string
  is_default?: boolean
  id?: string
}): Promise<Address> {
  if (!supabase) throw new DbError('Sign in to save an address')
  const payload = {
    label: input.label,
    full_name: input.full_name,
    phone: input.phone,
    address: input.address,
    city: input.city,
    postal_code: input.postal_code ?? null,
    is_default: input.is_default ?? false,
  }
  const { data, error } = input.id
    ? await supabase.from('addresses').update(payload).eq('id', input.id).select().single()
    : await supabase.from('addresses').insert(payload).select().single()
  if (error) handleDbError(error, 'Could not save address')
  if (input.is_default && !input.id) {
    await supabase.from('addresses').update({ is_default: false }).neq('id', (data as Address).id).eq('user_id', (await supabase.auth.getUser()).data.user?.id!)
  }
  return data as Address
}

export async function setDefaultAddress(id: string): Promise<void> {
  if (!supabase) return
  await supabase.from('addresses').update({ is_default: false }).neq('id', id)
  const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
  if (error) handleDbError(error, 'Could not update address')
}

export async function deleteAddress(id: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('addresses').delete().eq('id', id)
  if (error) handleDbError(error, 'Could not delete address')
}

export async function updateProfile(input: { full_name?: string; phone?: string }): Promise<Profile> {
  if (!supabase) throw new DbError('Sign in to update your profile')
  const { data, error } = await supabase.from('profiles').update(input).select().single()
  if (error) handleDbError(error, 'Could not update profile')
  return data as Profile
}

export async function updatePassword(newPassword: string): Promise<void> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) handleDbError(error, 'Could not update password')
}

export async function sendContactMessage(input: {
  name: string
  email: string
  subject: string
  message: string
}): Promise<void> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const user = await supabase.auth.getUser()
  const { error } = await supabase.from('contact_messages').insert({
    user_id: user.data.user?.id ?? null,
    ...input,
  })
  if (error) handleDbError(error, 'Could not send message')
}

export function subscribeNewsletter(email: string): void {
  try {
    const existing = JSON.parse(localStorage.getItem('bb_newsletter_subs') ?? '[]') as string[]
    if (!existing.includes(email)) {
      existing.push(email)
      localStorage.setItem('bb_newsletter_subs', JSON.stringify(existing))
    }
  } catch {
    /* ignore */
  }
}

export interface StorageUploadResult {
  url: string
  path: string
}

export async function uploadProductImage(file: File): Promise<StorageUploadResult> {
  if (!supabase) throw new DbError('Supabase is not configured')
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) handleDbError(error, 'Could not upload image')
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export async function deleteStoredImage(path: string): Promise<void> {
  if (!supabase || !path) return
  await supabase.storage.from('product-images').remove([path])
}