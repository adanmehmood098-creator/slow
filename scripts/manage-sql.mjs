// Runs a .sql file against the project via the Supabase Management API.
// Requires .env with VITE_SUPABASE_URL + SUPABASE_ACCESS_TOKEN (personal access token).
// Usage: node scripts/manage-sql.mjs supabase/cleanup.sql | schema.sql | seed.sql
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const url = process.env.VITE_SUPABASE_URL
const token = process.env.SUPABASE_ACCESS_TOKEN
if (!url || !token) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_ACCESS_TOKEN in .env')
  process.exit(1)
}
const ref = url.replace(/^https:\/\//, '').split('.')[0]
const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/manage-sql.mjs <file.sql>')
  process.exit(1)
}
const sql = readFileSync(join(root, file), 'utf8')

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})

const text = await res.text()
if (!res.ok) {
  console.error(`FAIL (HTTP ${res.status}):`, text.slice(0, 2000))
  process.exit(1)
}
console.log(`OK  ${file}${text ? ` — ${text.slice(0, 500)}` : ''}`)