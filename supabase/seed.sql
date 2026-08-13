-- ============================================================
-- Bloom & Blush — seed data
-- Run AFTER schema.sql
-- ============================================================

insert into public.categories (name, image, description) values
  ('Bouquets', 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=1200&q=80', 'Hand-tied arrangements for every occasion.'),
  ('Roses', 'https://images.unsplash.com/photo-1548586196-aa5803b77379?auto=format&fit=crop&w=1200&q=80', 'Timeless classic blooms, delivered in full bloom.'),
  ('Peonies', 'https://images.unsplash.com/photo-1596075780750-81249df16d19?auto=format&fit=crop&w=1200&q=80', 'Soft, romantic, and in season for just a few weeks.'),
  ('Tulips', 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=1200&q=80', 'Bright spring favourites in every colour.'),
  ('Sunflowers', 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80', 'Sunny blooms that brighten any day.'),
  ('Lilies & Orchids', 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80', 'Elegant, long-lasting statement flowers.'),
  ('Plants & Gifts', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80', 'Potted plants, candles, and more to gift along.');

insert into public.products (
  category_id, name, description, price, discount, stock, image_url,
  featured, best_seller, rating, review_count, sales_count, sku, occasions
) values
(
  (select id from public.categories where name = 'Bouquets'),
  'Classic Pink Roses Bouquet',
  'Twelve of our signature blush roses hand-tied with eucalyptus, wrapped in premium kraft paper. The bouquet that started it all.',
  44.00, 0, 40,
  'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=1200&q=80',
  true, true, 4.9, 214, 1830, 'BB-PINK-12',
  array['Anniversary','Birthday','Love','Just Because']
),
(
  (select id from public.categories where name = 'Roses'),
  'Dozen Red Roses',
  'Twelve long-stemmed red roses, the classic symbol of love, finished with baby''s breath and ribbon.',
  49.00, 10, 25,
  'https://images.unsplash.com/photo-1548586196-aa5803b77379?auto=format&fit=crop&w=1200&q=80',
  true, true, 4.8, 342, 2410, 'BB-RED-12',
  array['Anniversary','Love','Romance','Valentine']
),
(
  (select id from public.categories where name = 'Sunflowers'),
  'Sunshine Sunflower Bunch',
  'Five cheerful sunflowers paired with seasonal greenery — guaranteed to make someone smile.',
  32.00, 0, 60,
  'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
  true, true, 4.9, 128, 980, 'BB-SUN-05',
  array['Birthday','Get Well','Friendship','Cheer Up']
),
(
  (select id from public.categories where name = 'Tulips'),
  'Tulip Fiesta (10 stems)',
  'A joyful mix of pink, cream and white tulips that open wider day by day.',
  38.00, 0, 45,
  'https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=1200&q=80',
  false, true, 4.7, 96, 720, 'BB-TUL-10',
  array['Birthday','Cheer Up','Spring','Just Because']
),
(
  (select id from public.categories where name = 'Peonies'),
  'Blush Peony Hand-Tie',
  'Nine of the season''s most coveted blooms in softest pink, hand-wrapped in tissue.',
  59.00, 0, 15,
  'https://images.unsplash.com/photo-1596075780750-81249df16d19?auto=format&fit=crop&w=1200&q=80',
  true, false, 4.9, 74, 430, 'BB-PEO-09',
  array['Anniversary','Mother','Luxury','Romance']
),
(
  (select id from public.categories where name = 'Lilies & Orchids'),
  'White Oriental Lily & Orchid',
  'A serene composition of white lilies and delicate orchids — an elegant, long-lasting choice.',
  55.00, 0, 20,
  'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.8, 53, 310, 'BB-LIL-06',
  array['Sympathy','Thanks','Elegance','Hospital']
),
(
  (select id from public.categories where name = 'Bouquets'),
  'Meadow Wildflower Mix',
  'A country-style gathering of seasonal wildflowers in bright, unstudied disarray.',
  36.00, 0, 50,
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80',
  false, true, 4.8, 61, 505, 'BB-MEA-12',
  array['Just Because','Birthday','Friendship','Housewarming']
),
(
  (select id from public.categories where name = 'Bouquets'),
  'Pastel Dream Bouquet',
  'Cream, dusty pink and lavender stems blended for the softest colour palette imaginable.',
  41.00, 0, 35,
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.9, 42, 260, 'BB-PAS-10',
  array['Birthday','Just Because','Spring','Baby']
),
(
  (select id from public.categories where name = 'Peonies'),
  'Peony & Rose Romance',
  'Peonies and garden roses entwined — the bouquet people write poetry about.',
  68.00, 5, 12,
  'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=1200&q=80',
  false, false, 5.0, 38, 210, 'BB-PRR-01',
  array['Anniversary','Love','Wedding','Luxury']
),
(
  (select id from public.categories where name = 'Sunflowers'),
  'Rustic Sunflower & Rose',
  'Dramatic sunflowers pricked with blooms of deep red rose — rustic charm, modern feel.',
  39.00, 0, 40,
  'https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.7, 29, 180, 'BB-RSR-03',
  array['Birthday','Cheers','Friendship','Cheer Up']
),
(
  (select id from public.categories where name = 'Lilies & Orchids'),
  'Orchid Plant in Ceramic Pot',
  'A phalaenopsis orchid in a blush ceramic pot — long-lasting elegance for the home.',
  49.00, 0, 18,
  'https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=1200&q=80',
  false, true, 4.8, 88, 640, 'BB-ORC-01',
  array['Housewarming','Thanks','Sympathy','Elegance']
),
(
  (select id from public.categories where name = 'Plants & Gifts'),
  'Lavender Jardin Gift Set',
  'A potted lavender plant with a hand-poured soy candle in our signature blush jar.',
  46.00, 0, 30,
  'https://images.unsplash.com/photo-1493957988430-a5f2e15f39a3?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.9, 51, 340, 'BB-LAV-01',
  array['Thank You','Housewarming','Relaxation','Birthday']
),
(
  (select id from public.categories where name = 'Bouquets'),
  'Everlasting Preserved Bouquet',
  'A hand-arranged preserved bouquet that stays beautiful for a year — no water needed.',
  58.00, 0, 22,
  'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.9, 47, 290, 'BB-EVR-01',
  array['Anniversary','Gift','Thanks','Just Because']
),
(
  (select id from public.categories where name = 'Roses'),
  'Dark Crimson Rose Bowl',
  'Deep crimson roses arranged low in a ceramic bowl — rich, moody, unforgettable.',
  62.00, 0, 14,
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.8, 35, 220, 'BB-CRB-01',
  array['Love','Romance','Anniversary','Sympathy']
),
(
  (select id from public.categories where name = 'Bouquets'),
  'The Signature Hydrangea',
  'A single cloud of blush-blue hydrangeas, wrapped in linen — simple, sculptural, stunning.',
  52.00, 0, 16,
  'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.9, 26, 150, 'BB-HYD-01',
  array['Elegance','Thanks','Housewarming','Just Because']
),
(
  (select id from public.categories where name = 'Plants & Gifts'),
  'Monstera Deliciosa Pot',
  'A lush potted monstera with care card — the plant that keeps on giving.',
  34.00, 0, 28,
  'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=80',
  false, false, 4.8, 33, 205, 'BB-MON-01',
  array['Housewarming','Birthday','Office','Just Because']
);

-- A few seed reviews (author names only — linked to recent signups)
insert into public.reviews (product_id, author_name, rating, review) values
  ((select id from public.products where sku = 'BB-PINK-12'), 'Amelia R.', 5, 'Stunning bouquet — the blush roses were absolutely perfect and lasted two weeks.'),
  ((select id from public.products where sku = 'BB-PINK-12'), 'James T.', 5, 'Ordered for our anniversary. Beautifully wrapped and delivered on time.'),
  ((select id from public.products where sku = 'BB-RED-12'), 'Sophie M.', 4, 'Classic red roses, very fresh. Would have loved a note card option at checkout.'),
  ((select id from public.products where sku = 'BB-SUN-05'), 'Nadia K.', 5, 'Bright, cheerful and huge! My mum adored them.'),
  ((select id from public.products where sku = 'BB-PEO-09'), 'Elena V.', 5, 'Peonies are my favourite and these did not disappoint. Gorgeous!'),
  ((select id from public.products where sku = 'BB-ORC-01'), 'Marcus L.', 4, 'Lovely orchid, nice pot. Blooms are still going three weeks on.');