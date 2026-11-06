import { Link } from 'react-router-dom'
import { LuUsers } from 'react-icons/lu'
import Avatar from '../components/Avatar'
import { EmptyState, ErrorState } from '../components/States'
import useFetch from '../lib/useFetch'
import { useSeo } from '../lib/seo'

export default function Authors() {
  const { data, loading, error, retry } = useFetch('/users', { fallback: 'We could not load authors right now.' })
  const authors = Array.isArray(data) ? data : []
  useSeo({ title: 'Authors', description: 'Meet the writers behind Safin and browse everything each of them has published.', path: '/authors' })

  return (
    <section className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Community</span>
          <h1>Authors</h1>
          <p>The people writing on Safin. Follow a name to see everything they have published.</p>
        </div>
      </div>
      <div className="grid">
        {loading &&
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="sk" style={{ height: 196, borderRadius: 20 }} aria-hidden="true" />
          ))}
        {!loading && error && <ErrorState message={error} onRetry={retry} />}
        {!loading && !error && authors.length === 0 && <EmptyState icon={<LuUsers />} title="No authors yet" message="Editors will appear here once they publish." action="Back to stories" to="/" />}
        {!loading &&
          !error &&
          authors.map((a) => (
            <Link key={a._id} to={`/posts/users/${a._id}`} className="author-card">
              <Avatar name={a.name} src={a.avatar} size="lg" />
              <h3>{a.name}</h3>
              <p>
                {a.posts ?? 0} {a.posts === 1 ? 'story' : 'stories'}
              </p>
            </Link>
          ))}
      </div>
    </section>
  )
}
