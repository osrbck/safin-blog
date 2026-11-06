import { useEffect, useRef } from 'react'
import { LuLoaderCircle, LuTrash2 } from 'react-icons/lu'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy = false, onConfirm, onCancel }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, busy, onCancel])

  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
        <div className="modal__icon">
          <LuTrash2 />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-desc">{message}</p>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button ref={confirmRef} type="button" className="btn btn--danger-solid" onClick={onConfirm} disabled={busy}>
            {busy ? <LuLoaderCircle className="spin" size={16} /> : <LuTrash2 size={16} />}
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
