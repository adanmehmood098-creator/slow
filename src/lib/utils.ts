export const US_DOLLAR = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatPrice(n: number): string {
  return US_DOLLAR.format(n)
}

export function discountedPrice(p: { price: number; discount: number }): number {
  return Math.round(p.price * (1 - p.discount / 100) * 100) / 100
}

export function discountAmount(p: { price: number; discount: number }): number {
  return Math.round(p.price * (p.discount / 100) * 100) / 100
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function stockLabel(p: { stock: number }): { text: string; cls: string } {
  if (p.stock === 0) return { text: 'Sold Out', cls: 'out' }
  if (p.stock <= 5) return { text: 'Only ' + p.stock + ' left', cls: 'low' }
  return { text: 'In Stock', cls: 'in' }
}

export function stockDotCls(stock: number): string {
  if (stock === 0) return 'out'
  if (stock <= 5) return 'low'
  return ''
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + 'h ago'
  const days = Math.floor(hrs / 24)
  if (days < 7) return days + 'd ago'
  return formatDate(iso)
}

export const FREE_DELIVERY_THRESHOLD = 50
export const DELIVERY_FEE = 7.9
export const COUPON_CODE = 'BLOOM20'
export const COUPON_DISCOUNT = 0.2

export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946',
  pinkRoses: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321',
  whiteBouquet: 'https://images.unsplash.com/photo-1520763185298-1b434c919102',
  redRoses: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd',
  sunflower: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e',
  tulips: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51',
  pinkBloom: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833',
  peony: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7',
  mixedBouquet: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac',
  peonies: 'https://images.unsplash.com/photo-1468327768560-75b778cbb551',
  darkPinkRoses: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e',
  redRoseDark: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94',
  pinkRoseBouquet: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
  orchid: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11',
  lavenderField: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735',
  springFlowers: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3',
  whiteRose: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
  giftBox: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48',
  weddingArch: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
  fallback: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321',
} as const

export function unsplash(id: string, w = 900): string {
  return id + `?auto=format&fit=crop&w=${w}&q=80`
}

export function productImg(p: { image_url: string | null }): string {
  return p.image_url || IMAGES.fallback
}

export function productGallery(p: { image_url: string | null; images?: { image_url: string }[] | null }): string[] {
  const list: string[] = []
  if (p.image_url) list.push(p.image_url)
  for (const i of p.images ?? []) if (i.image_url && !list.includes(i.image_url)) list.push(i.image_url)
  if (list.length === 0) list.push(IMAGES.fallback)
  return list
}