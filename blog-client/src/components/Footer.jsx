import { Link } from 'react-router-dom'
import Brand from './Brand'
import { POST_CATEGORIES, categoryPath } from '../lib/constants'
import { useUser } from '../context/userContext'

export default function Footer() {
  const { currentUser } = useUser()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Brand />
            <p>A calm place to write and read. Stories about growing things, making things, and the ideas worth keeping.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <Link to="/">All stories</Link>
              </li>
              {POST_CATEGORIES.map((c) => (
                <li key={c}>
                  <Link to={categoryPath(c)}>{c}</Link>
                </li>
              ))}
              <li>
                <Link to="/authors">Authors</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              {currentUser ? (
                <>
                  <li>
                    <Link to="/create">Write a story</Link>
                  </li>
                  <li>
                    <Link to={`/myposts/${currentUser.id}`}>Dashboard</Link>
                  </li>
                  <li>
                    <Link to={`/profile/${currentUser.id}`}>Profile</Link>
                  </li>
                  <li>
                    <Link to="/logout">Sign out</Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login">Editor sign in</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="footer__bar">
          <span>© {new Date().getFullYear()} Safin. All rights reserved.</span>
          <a href="https://www.osmansaribacak.online/" target="_blank" rel="noreferrer">
            Built by OSRBCK
          </a>
        </div>
      </div>
    </footer>
  )
}
