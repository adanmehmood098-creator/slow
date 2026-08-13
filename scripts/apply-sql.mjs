// Applies supabase/schema.sql + supabase/seed.sql straight to the database.
// Requires .env with SUPABASE_DB_URL (postgres connection string, service key).
// Usage: node scripts/apply-sql.mjs [schema|seed|all]
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const { Client } = pg
const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error('Missing SUPABASE_DB_URL in .env')
  process.exit(1)
}

const step = process.argv[2] ?? 'all'

async function apply(file) {
  const sql = readFileSync(join(root, 'supabase', file), 'utf8')
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    await client.query(sql)
    console.log(`OK  ${file}`)
  } catch (err) {
    console.error(`FAIL ${file}:`, err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

const order = step === 'schema' ? ['schema.sql'] : step === 'seed' ? ['seed.sql'] : ['schema.sql', 'seed.sql']

for (const f of order) {
  await apply(f)
}
if (process.exitCode) process.exit(process.exitCode)
console.log('Done.')