import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's', 'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'a', 'img', 'span']
const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'class']

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('rel', 'noopener noreferrer')
    if (node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer nofollow')
  }
})

/** Sanitises editor HTML for rendering and turns lone non-breaking spaces into normal ones so text wraps. */
export const sanitizeHtml = (html = '') =>
  DOMPurify.sanitize(html.replace(/(?:&nbsp;|\u00a0)(?=[^\s&])/g, ' '), { ALLOWED_TAGS, ALLOWED_ATTR })

const UNITS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export const formatRelative = (date) => {
  const then = new Date(date).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Math.round((then - Date.now()) / 1000)
  for (const [unit, secs] of UNITS) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return 'just now'
}

export const formatDate = (date) => {
  const d = new Date(date)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const stripHtml = (html = '') => {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

export const readingTime = (html = '') => {
  const words = stripHtml(html).split(' ').filter(Boolean).length
  return `${Math.max(1, Math.round(words / 220))} min read`
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'
