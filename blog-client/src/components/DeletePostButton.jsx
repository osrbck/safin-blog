import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LuTrash2 } from 'react-icons/lu'
import api, { errorMessage } from '../lib/api'
import ConfirmDialog from './ConfirmDialog'

export default function DeletePostButton({ postID, title, size = 'sm', onDeleted, onError }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/posts/${postID}`)
      setOpen(false)
      if (onDeleted) onDeleted(postID)
      else if (!location.pathname.startsWith('/myposts')) navigate('/', { replace: true })
    } catch (err) {
      setOpen(false)
      onError?.(errorMessage(err, 'The story could not be deleted.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={`btn btn--danger ${size === 'sm' ? 'btn--sm' : ''}`} onClick={() => setOpen(true)}>
        <LuTrash2 size={14} /> Delete
      </button>
      <ConfirmDialog
        open={open}
        busy={busy}
        title="Delete this story?"
        message={title ? `"${title}" will be permanently removed. This cannot be undone.` : 'This story will be permanently removed. This cannot be undone.'}
        onConfirm={remove}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
