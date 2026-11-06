import { Link } from 'react-router-dom'
import { LuInbox, LuTriangleAlert, LuRefreshCw } from 'react-icons/lu'

export function EmptyState({ icon, title = 'Nothing here yet', message, action, to }) {
  return (
    <div className="state">
      <div className="state__icon">{icon ?? <LuInbox />}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && to && (
        <Link to={to} className="btn btn--primary">
          {action}
        </Link>
      )}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__icon">
        <LuTriangleAlert />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          <LuRefreshCw size={16} /> Try again
        </button>
      )}
    </div>
  )
}
