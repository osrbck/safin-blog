import { IMAGE_TYPES } from './constants'

const mb = (bytes) => `${Number((bytes / (1024 * 1024)).toFixed(1)).toString()} MB`

/** Returns an error message for an unsupported image, or an empty string when the file is acceptable. */
export const validateImage = (file, { maxBytes, label = 'Image' }) => {
  if (!file) return ''
  if (!IMAGE_TYPES.includes(file.type)) return `${label} must be a PNG, JPG or WebP file.`
  if (file.size > maxBytes) return `${label} must be smaller than ${mb(maxBytes)}.`
  return ''
}
