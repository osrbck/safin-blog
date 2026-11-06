import { useEffect } from 'react'
import { stripHtml } from './format'

export const SITE_NAME = 'Safin'
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '')
export const DEFAULT_TITLE = 'Safin · Stories worth growing into'
export const DEFAULT_DESCRIPTION =
  'Safin is a calm publishing space for curious readers: long-form stories on houseplants, poisonous plants, flower legends, art and investing.'
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

/** Makes a site path or an asset URL absolute, as required by canonical and Open Graph tags. */
export const absoluteUrl = (url) => {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  const base = url.startsWith('/uploads/') ? window.location.origin : SITE_URL
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Plain-text summary of editor HTML, cut on a word boundary. */
export const summarize = (html = '', max = 160) => {
  // A lead paragraph written as a summary reads better than a cut across two paragraphs.
  const lead = stripHtml(html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? '')
  const text = lead.length >= 80 && lead.length <= max ? lead : stripHtml(html)
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max * 0.6)).replace(/[\s,.;:–-]+$/, '')}…`
}

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const setJsonLd = (data) => {
  let el = document.getElementById('seo-jsonld')
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'seo-jsonld'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

const apply = ({ title, description, image, path, type = 'website', noindex = false, jsonLd, article } = {}) => {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE
  const desc = description || DEFAULT_DESCRIPTION
  const url = `${SITE_URL}${path ?? window.location.pathname}`
  const img = absoluteUrl(image) || DEFAULT_IMAGE

  document.title = fullTitle
  setMeta('name', 'description', desc)
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  setCanonical(url)

  setMeta('property', 'og:type', type)
  setMeta('property', 'og:title', title || DEFAULT_TITLE)
  setMeta('property', 'og:description', desc)
  setMeta('property', 'og:url', url)
  setMeta('property', 'og:image', img)
  setMeta('property', 'og:image:alt', title || SITE_NAME)
  setMeta('property', 'article:published_time', article?.publishedTime)
  setMeta('property', 'article:modified_time', article?.modifiedTime)
  setMeta('property', 'article:section', article?.section)

  setMeta('name', 'twitter:title', title || DEFAULT_TITLE)
  setMeta('name', 'twitter:description', desc)
  setMeta('name', 'twitter:image', img)

  setJsonLd(jsonLd)
}

/**
 * Sets the document title, description, canonical URL, Open Graph / Twitter tags and JSON-LD for a page.
 * Every routed page calls it; on unmount the defaults are restored before the next page applies its own.
 */
export function useSeo(options) {
  const key = JSON.stringify(options ?? {})
  useEffect(() => {
    apply(JSON.parse(key))
    return () => apply()
  }, [key])
}
