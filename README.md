# Bloom & Blush — Floral E-Commerce

A premium floral shop experience: storefront + checkout + customer accounts + a separate admin dashboard.

**Stack:** React 18 · TypeScript · Vite 5 · React Router 6 · Supabase (Postgres + Auth + Storage) · lucide-react
**Design:** Playfair Display + Jost · chocolate `#4A2925` · blush `#E8A7B5` · cream `#FFF8F1`

## Getting started

```bash
npm install
```

1. Create a Supabase project (https://supabase.com).
2. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (project → Settings → API; only used by local seed script)
   - `SUPABASE_ACCESS_TOKEN` (optional — dashboard → Account → Access Tokens; needed only to apply SQL via the Management API)
3. Apply the schema (choose one):
   - **SQL editor:** run `supabase/schema.sql`, then `supabase/seed.sql`.
   - **Management API** (no editor needed): `node scripts/manage-sql.mjs supabase/schema.sql` then `... supabase/seed.sql`. If the project already contains another app's tables, wipe them first with `node scripts/manage-sql.mjs supabase/cleanup.sql`.
4. Create demo users + promote admin:

```bash
node scripts/seed-demo.mjs
```

5. Sanity-check the whole pipeline (login → cart → checkout → stock):

```bash
node scripts/e2e-check.mjs
```

6. Run the app:

```bash
npm run dev
```

### Demo accounts

| Role     | Email                          | Password         |
| -------- | ------------------------------ | ---------------- |
| Customer | `demo@bloomandblush.shop`      | `flowerPower1!`  |
| Admin    | `admin@bloomandblush.shop`     | `adminFlowers1!` |

The admin dashboard lives at `/admin` (only visible when signed in as an admin).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — `tsc && vite build`
- `npm run preview` — serve the production build
- `node scripts/seed-demo.mjs` — create demo users (needs `.env` with service role key)

## Features

**Storefront**
- Home: hero, features, occasions, featured + bestsellers carousels, offer strip, testimonials, flower care, Instagram grid, newsletter, store info
- Shop: category filter, search, sort, price + discount filters, URL-synced state, populated grid + skeletons, empty state
- Product detail: image gallery/zoom, share & occasion chips, Q&A + care tabs, reviews with rating, related products, quick view
- Cart drawer with quantity controls, coupon (`BLOOM20` = 20% off), free delivery over $50 (else $7.90)
- Wishlist (guest = localStorage, signed in = synced to Supabase)
- Checkout: addresses CRUD, 2-step (details → review/confirm), simulated card, stock-checked confirmation page
- Auth: sign up, sign in (with "remember me"), forgot/reset password, protected account area

**Account** — profile, addresses, orders (with reorder), reviews, wishlist, saved cards (demo)

**Admin** (`/admin`) — dashboard stats & charts, product CRUD with image upload to Storage, stock/active/promote toggles, order status management with expandable rows, customer list with order counts

## Database notes

- All tables have RLS; `profiles.role` (`customer` | `admin`) gates admin access.
- `handle_new_user` trigger auto-creates a profile on signup.
- `public.place_order(...)` is a transactional RPC used by checkout — runs stock checks, decrements stock, applies coupon + delivery rules, clears the cart, and returns the full order.
- `consume_stock` / `recompute_rating` triggers keep the catalog in sync.
- Image uploads go to the public `product-images` bucket.

To promote an existing user to admin manually (SQL editor):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Project structure

```
src/
  admin/            admin dashboard pages
  components/layout/  shell: navbar, footer, cart drawer, search overlay, guards
  components/home/    homepage sections
  components/ui/      shared UI (cards, modal, rating stars, petals, ...)
  context/          toast, auth, cart, wishlist providers
  data/             static storefront content
  lib/              supabase client, types, db + admin helpers, utils (images, money)
  pages/            storefront routes
  styles/           tokens, base, components, home, pages, admin (global CSS)
supabase/           schema.sql + seed.sql
scripts/            seed-demo.mjs
```