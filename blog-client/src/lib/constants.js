export const POST_CATEGORIES = ['Houseplants', 'Poisonous Plants', 'Flower Legends', 'Art', 'Investment']

export const CATEGORY_DESCRIPTIONS = {
  Houseplants: 'Care guides and stories about the plants we share our homes with: light, water, soil and the quiet pleasure of keeping something alive.',
  'Poisonous Plants': 'How to recognise the beautiful but dangerous plants in gardens, hedgerows and living rooms, and how to keep children, pets and yourself safe around them.',
  'Flower Legends': 'Myths, folklore and history behind the flowers people have loved, feared and named for thousands of years.',
  Art: 'Essays on making things and looking closely: painting, craft, design and the ideas behind them.',
  Investment: 'Long-term thinking about money, patience and compounding, written for curious non-specialists.',
}

export const ASSETS_URL = import.meta.env.VITE_ASSETS_URL ?? ''
export const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024
export const MAX_AVATAR_BYTES = 1.5 * 1024 * 1024
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const IMAGE_ACCEPT = 'image/png, image/jpeg, image/webp'

export const assetUrl = (file) => (file ? `${ASSETS_URL}/uploads/${file}` : null)

export const categoryPath = (category) => `/posts/categories/${encodeURIComponent(category)}`
