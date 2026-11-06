import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LuLoaderCircle, LuSend } from 'react-icons/lu'
import Alert from '../components/Alert'
import CoverDropzone from '../components/CoverDropzone'
import Editor from '../components/Editor'
import { ArticleSkeleton } from '../components/Skeleton'
import api, { errorMessage } from '../lib/api'
import { POST_CATEGORIES, assetUrl } from '../lib/constants'
import { stripHtml } from '../lib/format'
import { useUser } from '../context/userContext'
import { useSeo } from '../lib/seo'

export default function PostEditor({ mode = 'create' }) {
  const isEdit = mode === 'edit'
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useUser()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(POST_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState(null)
  const [existingThumb, setExistingThumb] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [fileError, setFileError] = useState('')
  const [busy, setBusy] = useState(false)
  useSeo({ title: isEdit ? 'Edit story' : 'New story', noindex: true })

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    api
      .get(`/posts/${id}`)
      .then(({ data }) => {
        if (cancelled) return
        const ownerId = data.creator && typeof data.creator === 'object' ? data.creator._id : data.creator
        if (currentUser && ownerId !== currentUser.id) {
          setLoadError('You can only edit your own stories.')
          return
        }
        setTitle(data.title ?? '')
        setCategory(data.category ?? POST_CATEGORIES[0])
        setDescription(data.description ?? '')
        setExistingThumb(data.thumbnail ?? null)
      })
      .catch((e) => !cancelled && setLoadError(errorMessage(e, 'We could not load this story.')))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id, isEdit, currentUser])

  const words = stripHtml(description).split(' ').filter(Boolean).length

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) return setError('Give your story a title.')
    if (words < 3) return setError('Write a little more before publishing.')
    if (!isEdit && !thumbnail) return setError('Add a cover image.')

    const form = new FormData()
    form.set('title', title.trim())
    form.set('category', category)
    form.set('description', description)
    if (thumbnail) form.set('thumbnail', thumbnail)

    setBusy(true)
    try {
      const res = isEdit ? await api.patch(`/posts/${id}`, form) : await api.post('/posts', form)
      navigate(`/posts/${res.data?._id ?? id}`, { replace: true })
    } catch (err) {
      setError(errorMessage(err, isEdit ? 'The story could not be updated.' : 'The story could not be published.'))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <ArticleSkeleton />
  if (loadError)
    return (
      <section className="container container--narrow">
        <Alert>{loadError}</Alert>
        <div style={{ marginTop: 16 }}>
          <Link to="/" className="btn">
            Back to stories
          </Link>
        </div>
      </section>
    )

  return (
    <form className="container container--editor" onSubmit={submit} noValidate>
      <div className="page-head">
        <div>
          <span className="eyebrow">{isEdit ? 'Edit story' : 'New story'}</span>
          <h1>{isEdit ? 'Refine your story' : 'Write something worth reading'}</h1>
        </div>
      </div>
      <Alert>{error}</Alert>
      <div className="editor" style={{ marginTop: error ? 16 : 0 }}>
        <div className="editor__main">
          <label className="sr-only" htmlFor="title">
            Title
          </label>
          <input id="title" className="title-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} autoFocus={!isEdit} />
          <Editor value={description} onChange={setDescription} />
          <p className="field__hint">
            {words} {words === 1 ? 'word' : 'words'}
          </p>
        </div>
        <aside className="editor__side">
          <div className="panel">
            <h2>Publish settings</h2>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {POST_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <span className="field__label">Cover image</span>
              <CoverDropzone file={thumbnail} existingUrl={assetUrl(existingThumb)} onChange={setThumbnail} onError={setFileError} />
              {fileError && (
                <span className="field__hint" style={{ color: 'var(--danger)' }}>
                  {fileError}
                </span>
              )}
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
                {busy ? <LuLoaderCircle className="spin" size={18} /> : <LuSend size={16} />}
                {busy ? (isEdit ? 'Saving…' : 'Publishing…') : isEdit ? 'Save changes' : 'Publish story'}
              </button>
              <Link to={isEdit ? `/posts/${id}` : '/'} className="btn btn--ghost btn--block">
                Cancel
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}
