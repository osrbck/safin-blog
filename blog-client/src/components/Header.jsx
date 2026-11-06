import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LuChevronDown, LuLayoutDashboard, LuLogOut, LuMenu, LuPenLine, LuUser, LuUsers, LuX, LuHouse } from 'react-icons/lu'
import Brand from './Brand'
import Avatar from './Avatar'
import ThemeToggle from './ThemeToggle'
import { useUser } from '../context/userContext'

function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-menu__trigger" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} src={user.avatar} />
        <LuChevronDown size={14} style={{ color: 'var(--text-3)', marginRight: 6 }} />
      </button>
      {open && (
        <div className="menu" role="menu">
          <div className="menu__head">
            <strong>{user.name}</strong>
            <span>Signed in</span>
          </div>
          <Link role="menuitem" to={`/profile/${user.id}`} onClick={() => setOpen(false)}>
            <LuUser size={16} /> Profile
          </Link>
          <Link role="menuitem" to={`/myposts/${user.id}`} onClick={() => setOpen(false)}>
            <LuLayoutDashboard size={16} /> Dashboard
          </Link>
          <Link role="menuitem" to="/create" onClick={() => setOpen(false)}>
            <LuPenLine size={16} /> Write a story
          </Link>
          <Link role="menuitem" to="/logout" className="danger" onClick={() => setOpen(false)}>
            <LuLogOut size={16} /> Sign out
          </Link>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { currentUser } = useUser()
  const location = useLocation()
  // The drawer remembers the path it was opened on, so navigating closes it without an effect.
  const [drawerAt, setDrawerAt] = useState(null)
  const drawer = drawerAt === location.pathname
  const setDrawer = (open) => setDrawerAt(open ? location.pathname : null)

  useEffect(() => {
    if (!drawer) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setDrawerAt(null)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [drawer])

  return (
    <header className="header">
      <div className="container header__inner">
        <Brand />
        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Explore
          </NavLink>
          <NavLink to="/authors">Authors</NavLink>
          {currentUser && <NavLink to={`/myposts/${currentUser.id}`}>Dashboard</NavLink>}
        </nav>
        <div className="header__actions">
          <ThemeToggle />
          {currentUser ? (
            <>
              <Link to="/create" className="btn btn--primary header__cta">
                <LuPenLine size={16} /> Write
              </Link>
              <UserMenu user={currentUser} />
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--primary header__cta">
                Sign in
              </Link>
            </>
          )}
          <button type="button" className="btn btn--ghost btn--icon menu-btn" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
            <LuMenu size={20} />
          </button>
        </div>
      </div>

      {drawer &&
        createPortal(
        <>
          <div className="drawer-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="drawer__head">
              <Brand onClick={() => setDrawer(false)} />
              <button type="button" className="btn btn--ghost btn--icon" aria-label="Close menu" onClick={() => setDrawer(false)}>
                <LuX size={20} />
              </button>
            </div>
            <nav aria-label="Mobile">
              <NavLink onClick={() => setDrawer(false)} to="/" end>
                <LuHouse size={18} /> Explore
              </NavLink>
              <NavLink onClick={() => setDrawer(false)} to="/authors">
                <LuUsers size={18} /> Authors
              </NavLink>
              {currentUser && (
                <>
                  <NavLink onClick={() => setDrawer(false)} to={`/myposts/${currentUser.id}`}>
                    <LuLayoutDashboard size={18} /> Dashboard
                  </NavLink>
                  <NavLink onClick={() => setDrawer(false)} to={`/profile/${currentUser.id}`}>
                    <LuUser size={18} /> Profile
                  </NavLink>
                </>
              )}
            </nav>
            <div className="drawer__foot">
              {currentUser ? (
                <>
                  <Link to="/create" className="btn btn--primary btn--block">
                    <LuPenLine size={16} /> Write a story
                  </Link>
                  <Link to="/logout" className="btn btn--danger btn--block">
                    <LuLogOut size={16} /> Sign out
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn--primary btn--block">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>,
          document.body,
        )}
    </header>
  )
}
