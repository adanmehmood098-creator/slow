export interface Category {
  id: string
  name: string
  image: string | null
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  discount: number
  stock: number
  image_url: string | null
  featured: boolean
  best_seller: boolean
  is_active: boolean
  rating: number
  review_count: number
  sales_count: number
  sku: string | null
  occasions: string[]
  created_at: string
  category?: { name: string } | null
  images?: { image_url: string }[]
}

export interface Review {
  id: string
  product_id: string
  user_id: string | null
  author_name: string
  rating: number
  review: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  image_url: string | null
  quantity: number
  price: number
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  customer_name: string
  phone: string
  address: string
  city: string
  postal_code: string | null
  subtotal: number
  discount: number
  delivery_fee: number
  total: number
  status: string
  payment_method: string
  created_at: string
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface Address {
  id: string
  user_id: string
  label: string
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string | null
  is_default: boolean
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
  created_at: string
}

export interface ContactMessage {
  id: string
  user_id: string | null
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export interface CartEntry {
  product: Product
  quantity: number
}

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
] as const

export const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Wedding',
  "Valentine's Day",
  'Congratulations',
  'Thank You',
  'Get Well Soon',
  'Just Because',
] as const

export const BADGES = ['Best Seller', 'New', 'Sale', 'Limited Stock'] as const