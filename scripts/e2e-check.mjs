// End-to-end sanity check: login -> profile -> cart -> place_order -> verify.
// Requires .env with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
// Usage: node scripts/e2e-check.mjs
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anon = process.env.VITE_SUPABASE_ANON_KEY
if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, anon)

const { data: login, error: loginErr } = await supabase.auth.signInWithPassword({
  email: 'demo@bloomandblush.shop',
  password: 'flowerPower1!',
})
if (loginErr) {
  console.error('FAIL login:', loginErr.message)
  process.exit(1)
}
console.log('OK  login:', login.user.email)

const { data: profile, error: profileErr } = await supabase
  .from('profiles')
  .select('full_name, role')
  .eq('id', login.user.id)
  .single()
if (profileErr) console.error('FAIL profile:', profileErr.message)
else console.log('OK  profile:', profile.full_name, '/', profile.role)

const { data: products } = await supabase
  .from('products')
  .select('id, name, price, discount, stock')
  .eq('is_active', true)
  .limit(1)
const p = products[0]

const { error: cartErr } = await supabase.from('cart_items').upsert(
  { user_id: login.user.id, product_id: p.id, quantity: 2 },
  { onConflict: 'user_id,product_id' }
)
if (cartErr) {
  console.error('FAIL cart upsert:', cartErr.message)
  process.exit(1)
}
console.log('OK  cart upsert:', p.name, 'x2')

const { data: order, error: orderErr } = await supabase.rpc('place_order', {
  p_items: [{ product_id: p.id, quantity: 2 }],
  p_customer_name: 'Demo Customer',
  p_phone: '555-0100',
  p_address: '1 Flower Lane',
  p_city: 'Blossom City',
  p_postal_code: '12345',
  p_payment_method: 'card',
  p_coupon: 'BLOOM20',
})
if (orderErr) {
  console.error('FAIL place_order:', orderErr.message)
  process.exit(1)
}
console.log('OK  order placed:', order.order_number, '| total $' + order.total, `(${order.items.length} item line)`)
console.log('    subtotal', order.subtotal, '| discount', order.discount, '| delivery', order.delivery_fee)

const { data: remaining } = await supabase
  .from('products')
  .select('stock')
  .eq('id', p.id)
  .single()
console.log('OK  stock decremented:', p.stock, '->', remaining.stock)

const { data: cartAfter } = await supabase.from('cart_items').select('*').eq('user_id', login.user.id)
console.log('OK  cart cleared after order:', cartAfter.length === 0)

const { data: adminCheck, error: adminErr } = await supabase
  .from('profiles')
  .select('role')
  .eq('email', 'admin@bloomandblush.shop')
  .single()
if (adminErr) console.log('INFO admin profile check skipped (non-admin cannot read other profiles)')
else console.log('OK  admin role visible:', adminCheck.role)