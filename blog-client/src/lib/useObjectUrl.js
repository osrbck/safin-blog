import { useEffect, useState } from 'react'

/**
 * Returns a previewable data: URL for a File/Blob (null otherwise).
 * Reading asynchronously keeps the hook StrictMode-safe and leaves nothing to revoke.
 */
export function useObjectUrl(file) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    if (!(file instanceof Blob)) return undefined
    const reader = new FileReader()
    reader.onload = () => setUrl(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
    return () => reader.abort()
  }, [file])
  return file instanceof Blob ? url : null
}
