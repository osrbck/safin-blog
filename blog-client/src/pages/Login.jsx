import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LuEye, LuEyeOff, LuLoaderCircle } from 'react-icons/lu'
import Brand from '../components/Brand'
import Alert from '../components/Alert'
import api, { errorMessage } from '../lib/api'
import { useUser } from '../context/userContext'
import { useSeo } from '../lib/seo'

export default function Login() {
  const { currentUser, login } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  // Only redirect visitors who were already signed in when they arrived; a fresh sign-in navigates itself.
  const [alreadySignedIn] = useState(() => Boolean(currentUser))
  const expired = params.get('expired') === '1'
  const from = location.state?.from || params.get('from') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useSeo({ title: 'Editor sign in', noindex: true, path: '/login' })

  if (alreadySignedIn && currentUser) return <Navigate to="/" replace />

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.password) return setError('Enter your email and password.')
    setBusy(true)
    try {
      const { data } = await api.post('/users/login', { email: form.email.trim(), password: form.password })
      login({ token: data.token, id: data.id, name: data.name, avatar: data.avatar ?? null })
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed. Check your details and try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="container auth">
      <form className="auth__card" onSubmit={submit} noValidate>
        <Brand />
        <h1>Editor sign in</h1>
        <p className="lead">Safin is an invite-only newsroom. Use the credentials you were given.</p>
        {!error && expired && <Alert>Your session expired. Please sign in again.</Alert>}
        <Alert>{error}</Alert>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} autoFocus required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input id="password" name="password" type={show ? 'text' : 'password'} className="input" autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={onChange} required />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
          {busy && <LuLoaderCircle className="spin" size={18} />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth__foot">
          Need access? <a href="https://www.osmansaribacak.online/" target="_blank" rel="noopener noreferrer">Contact the publisher</a>
        </p>
      </form>
    </section>
  )
}
