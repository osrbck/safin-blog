import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LuCamera, LuChevronDown, LuLayoutDashboard, LuLoaderCircle } from 'react-icons/lu'
import Alert from '../components/Alert'
import Avatar from '../components/Avatar'
import api, { errorMessage } from '../lib/api'
import { IMAGE_ACCEPT, MAX_AVATAR_BYTES } from '../lib/constants'
import { validateImage } from '../lib/images'
import { useUser } from '../context/userContext'
import { useSeo } from '../lib/seo'

export default function UserProfile() {
  const { id } = useParams()
  const { currentUser, updateUser } = useUser()

  const [profile, setProfile] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState({ kind: 'error', text: '' })
  const [formMsg, setFormMsg] = useState({ kind: 'error', text: '' })
  const [busy, setBusy] = useState(false)

  const ownId = currentUser?.id
  useSeo({ title: 'Profile', noindex: true })

  useEffect(() => {
    if (!ownId) return
    let cancelled = false
    api
      .get(`/users/${ownId}`)
      .then(({ data }) => {
        if (cancelled) return
        setProfile(data)
        setName(data.name ?? '')
        setEmail(data.email ?? '')
      })
      .catch((e) => !cancelled && setLoadError(errorMessage(e, 'We could not load your profile.')))
    return () => {
      cancelled = true
    }
  }, [ownId])

  if (currentUser && id !== currentUser.id) return <Navigate to={`/profile/${currentUser.id}`} replace />

  const pickAvatar = (f) => {
    if (!f) return
    const problem = validateImage(f, { maxBytes: MAX_AVATAR_BYTES, label: 'Profile photo' })
    setAvatarMsg({ kind: 'error', text: problem })
    if (!problem) setAvatarFile(f)
  }

  const saveAvatar = async () => {
    if (!avatarFile) return
    setAvatarBusy(true)
    try {
      const form = new FormData()
      form.set('avatar', avatarFile)
      const { data } = await api.post('/users/change-avatar', form)
      setProfile((p) => ({ ...p, avatar: data.avatar }))
      updateUser({ avatar: data.avatar })
      setAvatarFile(null)
      setAvatarMsg({ kind: 'success', text: 'Profile photo updated.' })
    } catch (e) {
      setAvatarMsg({ kind: 'error', text: errorMessage(e, 'The photo could not be uploaded.') })
    } finally {
      setAvatarBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setFormMsg({ kind: 'error', text: '' })
    if (!name.trim()) return setFormMsg({ kind: 'error', text: 'Your name cannot be empty.' })
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setFormMsg({ kind: 'error', text: 'Enter a valid email address.' })
    if (!currentPassword) return setFormMsg({ kind: 'error', text: 'Enter your current password to save changes.' })
    if (newPassword || confirmNewPassword) {
      if (newPassword.trim().length < 6) return setFormMsg({ kind: 'error', text: 'New password must be at least 6 characters.' })
      if (newPassword !== confirmNewPassword) return setFormMsg({ kind: 'error', text: 'New passwords do not match.' })
    }
    setBusy(true)
    try {
      const payload = { name: name.trim(), email: email.trim(), currentPassword }
      if (newPassword) Object.assign(payload, { newPassword, confirmNewPassword })
      const { data } = await api.patch('/users/edit-user', payload)
      setProfile((p) => ({ ...p, ...data }))
      updateUser({ name: data.name })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setFormMsg({ kind: 'success', text: newPassword ? 'Profile and password updated.' : 'Profile updated.' })
    } catch (err) {
      setFormMsg({ kind: 'error', text: errorMessage(err, 'Your changes could not be saved.') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Account</span>
          <h1>Profile</h1>
          <p>Manage how you appear to readers and keep your account secure.</p>
        </div>
        <Link to={`/myposts/${currentUser.id}`} className="btn">
          <LuLayoutDashboard size={16} /> Dashboard
        </Link>
      </div>

      <Alert>{loadError}</Alert>

      <div className="profile">
        <div className="panel profile__identity">
          <div className="avatar-upload">
            <Avatar name={profile?.name ?? currentUser.name} src={avatarFile ?? profile?.avatar ?? currentUser.avatar} size="xl" />
            <label htmlFor="avatar" title="Change photo">
              <LuCamera size={16} />
              <span className="sr-only">Change profile photo</span>
            </label>
            <input id="avatar" type="file" accept={IMAGE_ACCEPT} onChange={(e) => pickAvatar(e.target.files?.[0])} />
          </div>
          <div>
            <h2>{profile?.name ?? currentUser.name}</h2>
            <p>{profile?.email ?? ''}</p>
            {profile && (
              <p>
                {profile.posts ?? 0} published {profile.posts === 1 ? 'story' : 'stories'}
              </p>
            )}
          </div>
          {avatarFile && (
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn--primary btn--sm" onClick={saveAvatar} disabled={avatarBusy}>
                {avatarBusy && <LuLoaderCircle className="spin" size={14} />}
                {avatarBusy ? 'Uploading…' : 'Save photo'}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAvatarFile(null)} disabled={avatarBusy}>
                Cancel
              </button>
            </div>
          )}
          <Alert kind={avatarMsg.kind}>{avatarMsg.text}</Alert>
        </div>

        <form className="panel" onSubmit={submit} noValidate>
          <h2>Account details</h2>
          <Alert kind={formMsg.kind}>{formMsg.text}</Alert>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="currentPassword">Current password</label>
            <input id="currentPassword" type="password" className="input" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <span className="field__hint">Required to confirm any change.</span>
          </div>

          <details className="collapsible">
            <summary>
              Change password <LuChevronDown size={16} />
            </summary>
            <div className="collapsible__body">
              <div className="field">
                <label htmlFor="newPassword">New password</label>
                <input id="newPassword" type="password" className="input" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <div className="field">
                <label htmlFor="confirmNewPassword">Confirm new password</label>
                <input id="confirmNewPassword" type="password" className="input" autoComplete="new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              </div>
            </div>
          </details>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy && <LuLoaderCircle className="spin" size={16} />}
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
