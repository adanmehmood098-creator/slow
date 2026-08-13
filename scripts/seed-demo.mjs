// Seed demo users + verify product data for Bloom & Blush.
// Requires .env with VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service role).
// Usage: node scripts/seed-demo.mjs
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureUser(email, password, fullName, role) {
  const { data: existing } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const found = existing.users.find((u) => u.email === email)
  if (found) {
    console.log(`User ${email} already exists (${found.id})`)
    if (role === 'admin') {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin', full_name: fullName })
        .eq('id', found.id)
      if (error) console.error('  promote error:', error.message)
      else console.log('  Promoted to admin')
    }
    return
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (error) {
    console.error(`createUser ${email} error:`, error.message)
    return
  }
  console.log(`Created ${email} (${data.user.id})`)
  if (role === 'admin') {
    const { error: rp } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id)
    if (rp) console.error('  promote error:', rp.message)
    else console.log('  Promoted to admin')
  }
}

async function seedDemoData() {
  const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Cannot check products (did you run schema.sql first?):', error.message)
    return
  }
  console.log(`Products currently in DB: ${count}`)
  if (count === 0) {
    console.log('Products table is empty — run supabase/seed.sql in the SQL editor (or Dashboard SQL) to insert the catalog.')
  }
}

await ensureUser('demo@bloomandblush.shop', 'flowerPower1!', 'Demo Customer', 'customer')
await ensureUser('admin@bloomandblush.shop', 'adminFlowers1!', 'Store Admin', 'admin')
await seedDemoData()
console.log('\nDone. Frontend demo users:')
console.log('  Customer: demo@bloomandblush.shop / flowerPower1!')
console.log('  Admin:    admin@bloomandblush.shop / adminFlowers1!')