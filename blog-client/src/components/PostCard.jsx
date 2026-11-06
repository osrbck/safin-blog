import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { assetUrl, categoryPath } from '../lib/constants'
import { formatRelative, stripHtml } from '../lib/format'

export default function PostCard({ post }) {
  const { _id, title, category, description, creator, thumbnail, createdAt } = post
  const author = creator && typeof creator === 'object' ? creator : null
  const authorId = author?._id ?? creator
  const excerpt = stripHtml(description).slice(0, 180)

  return (
    <article className="card">
      <div className="card__media">
        <img src={assetUrl(thumbnail)} alt="" loading="lazy" />
        <Link to={categoryPath(category)} className="chip chip--on-image">
          {category}
        </Link>
      </div>
      <div className="card__body">
        <h3 className="card__title">
          <Link to={`/posts/${_id}`}>{title}</Link>
        </h3>
        <p className="card__excerpt">{excerpt}</p>
        <div className="card__foot">
          <div className="author-row">
            <Link to={`/posts/users/${authorId}`} className="author-row" aria-label={`Stories by ${author?.name ?? 'author'}`}>
              <Avatar name={author?.name} src={author?.avatar} size="sm" />
              <span className="author-row__meta">
                <strong>{author?.name ?? 'Unknown author'}</strong>
                <span>{formatRelative(createdAt)}</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
