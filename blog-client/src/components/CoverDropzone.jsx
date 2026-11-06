import { useState } from 'react'
import { LuImagePlus } from 'react-icons/lu'
import { IMAGE_ACCEPT, MAX_THUMBNAIL_BYTES } from '../lib/constants'
import { validateImage } from '../lib/images'
import { useObjectUrl } from '../lib/useObjectUrl'

export default function CoverDropzone({ file, existingUrl, onChange, onError }) {
  const [over, setOver] = useState(false)
  const preview = useObjectUrl(file)

  const accept = (f) => {
    if (!f) return
    const problem = validateImage(f, { maxBytes: MAX_THUMBNAIL_BYTES, label: 'Cover image' })
    onError?.(problem)
    if (!problem) onChange(f)
  }

  const shown = preview ?? existingUrl

  return (
    <div
      className={`dropzone${over ? ' is-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        accept(e.dataTransfer.files?.[0])
      }}
    >
      {shown ? (
        <>
          <img src={shown} alt="Cover preview" />
          <div className="dropzone__overlay">{preview ? 'New cover selected · click to change' : 'Current cover · click to replace'}</div>
        </>
      ) : (
        <div className="dropzone__inner">
          <LuImagePlus />
          <strong>Add a cover image</strong>
          <span>Drag & drop or click · PNG, JPG, WebP · up to 2 MB</span>
        </div>
      )}
      <input type="file" accept={IMAGE_ACCEPT} aria-label="Cover image" onChange={(e) => accept(e.target.files?.[0])} />
    </div>
  )
}
