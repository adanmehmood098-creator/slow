-- ============================================================
-- Bloom & Blush — Supabase schema
-- Run this in the Supabase SQL Editor (sql.new)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- categories ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image text,
  description text,
  created_at timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  discount numeric(5,2) not null default 0 check (discount >= 0 and discount <= 100),
  stock int not null default 0 check (stock >= 0),
  image_url text,
  featured boolean not null default false,
  best_seller boolean not null default false,
  is_active boolean not null default true,
  rating numeric(3,2) not null default 0,
  review_count int not null default 0,
  sales_count int not null default 0,
  sku text,
  occasions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_created on public.products(created_at);

-- ---------- product_images ----------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on public.product_images(product_id);

-- ---------- cart_items ----------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_cart_user on public.cart_items(user_id);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  postal_code text,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
  payment_method text not null default 'card',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_created on public.orders(created_at);
create index if not exists idx_orders_status on public.orders(status);

-- ---------- order_items ----------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  image_url text,
  quantity int not null check (quantity > 0),
  price numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_user on public.reviews(user_id);

-- ---------- wishlist ----------
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_user on public.wishlist(user_id);

-- ---------- addresses ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ---------- contact_messages ----------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null default 'General question',
  message text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Stock & rating triggers
-- ============================================================

-- order_items insert => decrement stock, bump sales_count
create or replace function public.consume_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
    set stock = greatest(stock - new.quantity, 0),
        sales_count = sales_count + new.quantity
  where id = new.product_id;
  return new;
end;
$$;

drop trigger if exists trg_consume_stock on public.order_items;
create trigger trg_consume_stock
  after insert on public.order_items
  for each row execute function public.consume_stock();

-- reviews insert/delete/update => recompute product rating + review_count
create or replace function public.recompute_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare p_id uuid;
begin
  if tg_op = 'DELETE' then
    p_id := old.product_id;
  else
    p_id := new.product_id;
  end if;
  update public.products p
  set rating = coalesce((
        select round(avg(r.rating)::numeric, 2) from public.reviews r where r.product_id = p_id
      ), 0),
      review_count = (select count(*) from public.reviews r where r.product_id = p_id)
  where p.id = p_id;
  return null;
end;
$$;

drop trigger if exists trg_recompute_rating_insert on public.reviews;
create trigger trg_recompute_rating_insert
  after insert on public.reviews
  for each row execute function public.recompute_rating();

drop trigger if exists trg_recompute_rating_delete on public.reviews;
create trigger trg_recompute_rating_delete
  after delete on public.reviews
  for each row execute function public.recompute_rating();

drop trigger if exists trg_recompute_rating_update on public.reviews;
create trigger trg_recompute_rating_update
  after update of rating on public.reviews
  for each row execute function public.recompute_rating();

-- ============================================================
-- place_order — server-side, transactional checkout
-- ============================================================
create or replace function public.place_order(
  p_items jsonb,
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_postal_code text default null,
  p_payment_method text default 'card',
  p_coupon text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_coupon_discount numeric := 0;
  v_after numeric;
  v_delivery numeric;
  v_total numeric;
  v_item jsonb;
  v_product record;
  v_qty int;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Your basket is empty';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select id, name, image_url, price, discount, stock
      into v_product
      from public.products
      where id = (v_item ->> 'product_id')::uuid
        and is_active = true
      for update;

    if v_product.id is null then
      raise exception 'A product in your basket is no longer available';
    end if;

    v_qty := (v_item ->> 'quantity')::int;
    if v_qty <= 0 then
      raise exception 'Invalid quantity';
    end if;
    if v_product.stock < v_qty then
      raise exception E'Only % left of %', v_product.stock, v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_discount := v_discount + (v_product.price * v_product.discount / 100 * v_qty);
  end loop;

  v_after := v_subtotal - v_discount;

  if upper(coalesce(p_coupon, '')) = 'BLOOM20' then
    v_coupon_discount := round(v_after * 0.20, 2);
    v_after := v_after - v_coupon_discount;
  end if;

  v_delivery := case when v_after >= 50 or v_after = 0 then 0 else 7.90 end;
  v_total := round(v_after + v_delivery, 2);

  insert into public.orders (
    user_id, customer_name, phone, address, city, postal_code,
    subtotal, discount, delivery_fee, total, payment_method, status
  ) values (
    v_user, p_customer_name, p_phone, p_address, p_city, p_postal_code,
    round(v_subtotal, 2), round(v_discount + v_coupon_discount, 2), v_delivery, v_total, p_payment_method, 'Pending'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item ->> 'quantity')::int;
    select id, name, image_url, price
      into v_product
      from public.products
      where id = (v_item ->> 'product_id')::uuid;

    insert into public.order_items (order_id, product_id, product_name, image_url, quantity, price)
    values (v_order_id, v_product.id, v_product.name, v_product.image_url, v_qty, v_product.price);
  end loop;

  delete from public.cart_items where user_id = v_user;

  return (
    select jsonb_build_object(
      'id', o.id,
      'order_number', o.order_number,
      'user_id', o.user_id,
      'customer_name', o.customer_name,
      'phone', o.phone,
      'address', o.address,
      'city', o.city,
      'postal_code', o.postal_code,
      'subtotal', o.subtotal,
      'discount', o.discount,
      'delivery_fee', o.delivery_fee,
      'total', o.total,
      'status', o.status,
      'payment_method', o.payment_method,
      'created_at', o.created_at,
      'items', (
        select jsonb_agg(jsonb_build_object(
          'id', oi.id, 'order_id', oi.order_id, 'product_id', oi.product_id,
          'product_name', oi.product_name, 'image_url', oi.image_url,
          'quantity', oi.quantity, 'price', oi.price
        ) order by oi.created_at)
        from public.order_items oi where oi.order_id = o.id
      )
    )
    from public.orders o where o.id = v_order_id
  );
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist enable row level security;
alter table public.addresses enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: own or admin
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- categories: public read, admin manages
drop policy if exists "categories_read" on public.categories;
create policy "categories_read" on public.categories
  for select using (true);

drop policy if exists "categories_insert" on public.categories;
create policy "categories_insert" on public.categories
  for insert with check (public.is_admin());

drop policy if exists "categories_update" on public.categories;
create policy "categories_update" on public.categories
  for update using (public.is_admin());

drop policy if exists "categories_delete" on public.categories;
create policy "categories_delete" on public.categories
  for delete using (public.is_admin());

-- products: public sees active; admin sees/manages everything
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
  for select using (is_active = true or public.is_admin());

drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products
  for insert with check (public.is_admin());

drop policy if exists "products_update" on public.products;
create policy "products_update" on public.products
  for update using (public.is_admin());

drop policy if exists "products_delete" on public.products;
create policy "products_delete" on public.products
  for delete using (public.is_admin());

-- product_images: public read, admin manages
drop policy if exists "product_images_read" on public.product_images;
create policy "product_images_read" on public.product_images
  for select using (true);

drop policy if exists "product_images_insert" on public.product_images;
create policy "product_images_insert" on public.product_images
  for insert with check (public.is_admin());

drop policy if exists "product_images_delete" on public.product_images;
create policy "product_images_delete" on public.product_images
  for delete using (public.is_admin());

-- cart_items: owner only
drop policy if exists "cart_select" on public.cart_items;
create policy "cart_select" on public.cart_items
  for select using (auth.uid() = user_id);

drop policy if exists "cart_insert" on public.cart_items;
create policy "cart_insert" on public.cart_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "cart_update" on public.cart_items;
create policy "cart_update" on public.cart_items
  for update using (auth.uid() = user_id);

drop policy if exists "cart_delete" on public.cart_items;
create policy "cart_delete" on public.cart_items
  for delete using (auth.uid() = user_id);

-- orders: owner or admin
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders
  for update using (public.is_admin());

-- order_items: owner via their order, or admin
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select using (
    public.is_admin()
    or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- reviews: public read, owner writes
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews
  for insert with check (auth.uid() = user_id and author_name is not null);

drop policy if exists "reviews_update" on public.reviews;
create policy "reviews_update" on public.reviews
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_delete" on public.reviews;
create policy "reviews_delete" on public.reviews
  for delete using (public.is_admin());

-- wishlist: owner only
drop policy if exists "wishlist_select" on public.wishlist;
create policy "wishlist_select" on public.wishlist
  for select using (auth.uid() = user_id);

drop policy if exists "wishlist_insert" on public.wishlist;
create policy "wishlist_insert" on public.wishlist
  for insert with check (auth.uid() = user_id);

drop policy if exists "wishlist_delete" on public.wishlist;
create policy "wishlist_delete" on public.wishlist
  for delete using (auth.uid() = user_id);

-- addresses: owner only (admin can read for dispatch)
drop policy if exists "addresses_select" on public.addresses;
create policy "addresses_select" on public.addresses
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "addresses_insert" on public.addresses;
create policy "addresses_insert" on public.addresses
  for insert with check (auth.uid() = user_id);

drop policy if exists "addresses_update" on public.addresses;
create policy "addresses_update" on public.addresses
  for update using (auth.uid() = user_id or public.is_admin());

drop policy if exists "addresses_delete" on public.addresses;
create policy "addresses_delete" on public.addresses
  for delete using (auth.uid() = user_id);

-- contact_messages: anyone may send, only admins read
drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_select" on public.contact_messages;
create policy "contact_select" on public.contact_messages
  for select using (public.is_admin());

-- ============================================================
-- Storage buckets
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_own_insert" on storage.objects;
create policy "avatars_own_insert"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- Grant API access
-- ============================================================
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- Helper: promote a user to admin (run manually with your email)
-- update public.profiles set role = 'admin' where email = 'you@example.com';