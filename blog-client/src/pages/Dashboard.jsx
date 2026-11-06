import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LuEye, LuFileText, LuPencil, LuPlus } from 'react-icons/lu'
import Alert from '../components/Alert'
import DeletePostButton from '../components/DeletePostButton'
import { RowSkeleton } from '../components/Skeleton'
import { EmptyState, ErrorState } from '../components/States'
import usePosts from '../lib/usePosts'
import { assetUrl } from '../lib/constants'
import { formatDate } from '../lib/format'
import { useUser } from '../context/userContext'
import { useSeo } from '../lib/seo'

export default function Dashboard() {
  const { id } = useParams()
  const { currentUser } = useUser()
  const { posts, loading, error, retry, removeLocal } = usePosts(`/posts/users/${id}`)
  const [actionError, setActionError] = useState('')
  useSeo({ title: 'Dashboard', noindex: true })

  if (currentUser && id !== currentUser.id) return <Navigate to={`/myposts/${currentUser.id}`} replace />

  const categories = new Set(posts.map((p) => p.category)).size
  const latest = posts[0]?.createdAt

  return (
    <section className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Your stories</h1>
          <p>Everything you have published on Safin, in one place.</p>
        </div>
        <Link to="/create" className="btn btn--primary">
          <LuPlus size={16} /> New story
        </Link>
      </div>

      <div className="stats">
        <div className="stat">
          <span>Published</span>
          <strong>{loading ? '–' : posts.length}</strong>
        </div>
        <div className="stat">
          <span>Categories</span>
          <strong>{loading ? '–' : categories}</strong>
        </div>
        <div className="stat">
          <span>Last published</span>
          <strong style={{ fontSize: 'var(--fs-lg)' }}>{loading ? '–' : latest ? formatDate(latest) : '—'}</strong>
        </div>
      </div>

      <Alert>{actionError}</Alert>

      {loading ? (
        <RowSkeleton />
      ) : error ? (
        <div className="grid">
          <ErrorState message={error} onRetry={retry} />
        </div>
      ) : posts.length === 0 ? (
        <div className="grid">
          <EmptyState icon={<LuFileText />} title="You haven't published yet" message="Your stories will appear here once you publish them." action="Write your first story" to="/create" />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Story</th>
                <th scope="col" className="hide-sm">
                  Category
                </th>
                <th scope="col" className="hide-sm">
                  Published
                </th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table__post">
                      <img className="table__thumb" src={assetUrl(p.thumbnail)} alt="" loading="lazy" />
                      <Link to={`/posts/${p._id}`} className="table__title">
                        {p.title}
                      </Link>
                    </div>
                  </td>
                  <td className="hide-sm">
                    <span className="chip">{p.category}</span>
                  </td>
                  <td className="hide-sm muted">{formatDate(p.createdAt)}</td>
                  <td>
                    <div className="table__actions">
                      <Link to={`/posts/${p._id}`} className="btn btn--sm btn--ghost" aria-label={`View ${p.title}`}>
                        <LuEye size={14} /> View
                      </Link>
                      <Link to={`/posts/${p._id}/edit`} className="btn btn--sm" aria-label={`Edit ${p.title}`}>
                        <LuPencil size={14} /> Edit
                      </Link>
                      <DeletePostButton postID={p._id} title={p.title} onDeleted={removeLocal} onError={setActionError} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
