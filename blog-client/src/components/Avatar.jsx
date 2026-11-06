import { assetUrl } from '../lib/constants'
import { initials } from '../lib/format'
import { useObjectUrl } from '../lib/useObjectUrl'

export default function Avatar({ name = '', src, size, className = '' }) {
  const blobUrl = useObjectUrl(src)

  let url = blobUrl
  if (!url && typeof src === 'string' && src) url = /^(https?:|blob:|data:)/.test(src) ? src : assetUrl(src)

  const sizeClass = size ? ` avatar--${size}` : ''
  return (
    <span className={`avatar${sizeClass} ${className}`.trim()} title={name}>
      {url ? <img src={url} alt={name ? `${name}'s avatar` : 'Avatar'} /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  )
}
