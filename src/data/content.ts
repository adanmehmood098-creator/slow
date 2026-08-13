import { IMAGES, unsplash } from '@/lib/utils'

export interface OccasionItem {
  name: string
  image: string
  tagline: string
}

export const OCCASION_CARDS: OccasionItem[] = [
  { name: 'Birthday', image: unsplash(IMAGES.pinkRoses, 700), tagline: 'Celebrate in bloom' },
  { name: 'Anniversary', image: unsplash(IMAGES.redRoses, 700), tagline: 'Love, remembered' },
  { name: 'Wedding', image: unsplash(IMAGES.weddingArch, 700), tagline: 'Say I do with petals' },
  { name: "Valentine's Day", image: unsplash(IMAGES.redRoseDark, 700), tagline: 'For the one you love' },
  { name: 'Congratulations', image: unsplash(IMAGES.giftBox, 700), tagline: 'Cheers to you' },
  { name: 'Thank You', image: unsplash(IMAGES.mixedBouquet, 700), tagline: 'Gratitude in petals' },
  { name: 'Get Well Soon', image: unsplash(IMAGES.sunflower, 700), tagline: 'Sunshine & healing' },
  { name: 'Just Because', image: unsplash(IMAGES.pinkBloom, 700), tagline: 'Thinking of you' },
]

export const FEATURES = [
  {
    icon: '🌅',
    title: 'Fresh Every Morning',
    text: 'Hand-picked flowers delivered daily, straight from the growers to our studio at dawn.',
  },
  {
    icon: '🚚',
    title: 'Fast Flower Delivery',
    text: 'Same-day delivery available across the city — carefully packed to arrive perfect.',
  },
  {
    icon: '💝',
    title: 'Made With Love',
    text: 'Every arrangement is designed by expert florists who pour their heart into each stem.',
  },
]

export const TESTIMONIALS = [
  {
    quote: 'The bouquet was even more beautiful than the pictures. The scent filled the whole room — my partner actually teared up.',
    name: 'Sophie Martin',
    role: 'Anniversary order · Verified buyer',
  },
  {
    quote: 'Perfect flowers and incredibly fast delivery. Ordered at 9am, they arrived by lunchtime, still fresh and wrapped to perfection.',
    name: 'James Whitfield',
    role: 'Same-day delivery · Verified buyer',
  },
  {
    quote: 'My wife absolutely loved them. The roses were lush, the wrapping was elegant, and the card was handwritten. Extraordinary service.',
    name: 'Daniel Reyes',
    role: "Valentine's Day order · Verified buyer",
  },
  {
    quote: 'I send Bloom & Blush flowers to my mum every month. The quality is always consistent and the arrangements look like art.',
    name: 'Amelia Chen',
    role: 'Monthly subscriber · Verified buyer',
  },
]

export const CARE_GUIDES = [
  {
    flower: 'Roses',
    emoji: '🌹',
    image: unsplash(IMAGES.pinkRoses, 500),
    care: 'Trim stems at a 45° angle every two days and remove any leaves below the water line.',
    water: 'Fresh lukewarm water every day; add flower food.',
    sun: 'Bright, indirect light — away from direct sun and fruit bowls.',
    lifespan: '7–12 days',
  },
  {
    flower: 'Tulips',
    emoji: '🌷',
    image: unsplash(IMAGES.tulips, 500),
    care: 'Tulips keep growing in the vase — re-trim stems daily and keep them tightly wrapped for the first hour.',
    water: 'Cold water, topped up daily.',
    sun: 'Cool room, out of direct sunlight.',
    lifespan: '5–10 days',
  },
  {
    flower: 'Sunflowers',
    emoji: '🌻',
    image: unsplash(IMAGES.sunflower, 500),
    care: 'Cut stems short and change water every day to prevent sliminess.',
    water: 'Plenty of fresh water — sunflowers drink a lot.',
    sun: 'Bright, sunny windowsill (they love it).',
    lifespan: '6–12 days',
  },
  {
    flower: 'Lilies',
    emoji: '🌸',
    image: unsplash(IMAGES.whiteBouquet, 500),
    care: 'Remove the orange pollen stamens as they open to avoid stains and extend vase life.',
    water: 'Room-temperature water, refreshed every two days.',
    sun: 'Bright indirect light, cool evening temperatures.',
    lifespan: '8–14 days',
  },
]

export const INSTAGRAM_POSTS = [
  unsplash(IMAGES.peonies, 500),
  unsplash(IMAGES.pinkBloom, 500),
  unsplash(IMAGES.tulips, 500),
  unsplash(IMAGES.darkPinkRoses, 500),
  unsplash(IMAGES.mixedBouquet, 500),
  unsplash(IMAGES.sunflower, 500),
  unsplash(IMAGES.whiteBouquet, 500),
  unsplash(IMAGES.orchid, 500),
  unsplash(IMAGES.pinkRoses, 500),
  unsplash(IMAGES.lavenderField, 500),
  unsplash(IMAGES.weddingArch, 500),
  unsplash(IMAGES.redRoseDark, 500),
]

export const STORE_HOURS = [
  { day: 'Monday – Friday', time: '9:00 AM – 8:00 PM' },
  { day: 'Saturday', time: '9:00 AM – 8:00 PM' },
  { day: 'Sunday', time: '10:00 AM – 6:00 PM', sunday: true },
]

export const ABOUT_STATS = [
  { value: 10000, suffix: '+', label: 'Happy Customers' },
  { value: 25000, suffix: '+', label: 'Bouquets Delivered' },
  { value: 4.9, suffix: '/5', label: 'Customer Rating', decimals: 1 },
  { value: 8, suffix: '+', label: 'Years of Experience' },
]

export const FLORIST_TEAM = [
  { name: 'Isabella Laurent', role: 'Head Florist', emoji: '👩‍🌾' },
  { name: 'Marco Delgado', role: 'Senior Designer', emoji: '💐' },
  { name: 'Hannah Kim', role: 'Wedding Specialist', emoji: '🤍' },
  { name: 'Theo Bennett', role: 'Delivery Director', emoji: '🚚' },
]

export const FAQS = [
  {
    q: 'How fast can you deliver?',
    a: 'Same-day delivery is available for orders placed before 2:00 PM within our delivery area. Standard delivery takes 1–2 business days.',
  },
  {
    q: 'Do the flowers arrive fresh?',
    a: 'Every stem is picked at dawn and conditioned in our studio. Bouquets are packed with hydration tubes and protective wrap.',
  },
  {
    q: 'Can I add a handwritten note?',
    a: 'Of course — every order includes a complimentary handwritten card. Just tell us what to write at checkout.',
  },
  {
    q: 'What if I am not home?',
    a: 'We will deliver to a neighbour, or you can select "leave at door" at checkout. We always text a delivery photo.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes — if your flowers arrive damaged we replace them free of charge within 24 hours of delivery.',
  },
]

export const PRODUCT_CARE_NOTES = {
  care: [
    { icon: '✂️', title: 'Trim the stems', text: 'Cut 2–3 cm off each stem at a 45° angle with a sharp knife. This opens the water channels so flowers drink freely.' },
    { icon: '💧', title: 'Fresh water daily', text: 'Change the water every day and use the flower food sachet included with your bouquet.' },
    { icon: '🌡️', title: 'Cool & cosy', text: 'Keep flowers away from radiators, direct sun and fruit bowls. A cool room keeps them fresh for days longer.' },
    { icon: '🌬️', title: 'Mist & revive', text: 'Mist petals lightly each morning. If a rose droops, re-trim the stem and place it in warm water for an hour.' },
  ],
  delivery: [
    { icon: '🚚', title: 'Same-day delivery', text: 'Order before 2:00 PM for same-day delivery across the city. A 2-hour delivery window is chosen at checkout.' },
    { icon: '🧊', title: 'Cold-chain packing', text: 'Every bouquet travels in our temperature-controlled vans with hydration packs — guaranteed to arrive perfect.' },
    { icon: '📸', title: 'Photo confirmation', text: 'You will receive a photo of your flowers at the door, so you know they arrived in pristine condition.' },
    { icon: '💌', title: 'Handwritten notes', text: 'Add a complimentary handwritten card to any order — our florists write it by hand, not machine.' },
  ],
}

export const SHOP_IMAGE = unsplash(IMAGES.peonies, 1800)
