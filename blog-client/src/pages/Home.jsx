import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuArrowRight, LuPenLine, LuSparkles } from 'react-icons/lu'
import PostGrid from '../components/PostGrid'
import Avatar from '../components/Avatar'
import usePosts from '../lib/usePosts'
import { POST_CATEGORIES, categoryPath } from '../lib/constants'
import { useSeo } from '../lib/seo'
import { useUser } from '../context/userContext'

export default function Home() {
  const { currentUser } = useUser()
  const { posts, loading, error, retry } = usePosts('/posts')
  const [active, setActive] = useState('All')
  useSeo({ path: '/' })

  const filtered = useMemo(() => (active === 'All' ? posts : posts.filter((p) => p.category === active)), [posts, active])

  const authors = useMemo(() => {
    const seen = new Map()
    for (const p of posts) {
      const c = p.creator
      if (c && typeof c === 'object' && !seen.has(c._id)) seen.set(c._id, c)
      if (seen.size === 4) break
    }
    return [...seen.values()]
  }, [posts])

  return (
    <>
      <section className="hero">
        <div className="container">
          <Link to={categoryPath('Poisonous Plants')} className="hero__badge">
            <b>NEW</b> The Poisonous Plants series: beautiful, common and dangerous
          </Link>
          <h1>
            Stories worth <em>growing</em> into.
          </h1>
          <p>Safin is a calm publishing space for writers and curious readers. Long-form pieces on houseplants, poisonous plants, the legends behind flowers, art and investing.</p>
          <div className="hero__actions">
            {currentUser ? (
              <Link to="/create" className="btn btn--primary btn--lg">
                <LuPenLine size={18} /> Write a story
              </Link>
            ) : (
              <Link to="/login" className="btn btn--primary btn--lg">
                Editor sign in <LuArrowRight size={18} />
              </Link>
            )}
            <a href="#stories" className="btn btn--lg">
              Browse stories
            </a>
          </div>
          <div className="hero__trust">
            {authors.length > 0 && (
              <span className="avatars" aria-hidden="true">
                {authors.map((a) => (
                  <Avatar key={a._id} name={a.name} src={a.avatar} />
                ))}
              </span>
            )}
            <span className="hero__trust__text">
              <LuSparkles size={14} aria-hidden="true" />
              Free to read. No sign-up, no ads, ever.
            </span>
          </div>
        </div>
      </section>

      <section id="stories" className="container" aria-labelledby="latest-heading">
        <div className="filterbar">
          <div className="pills" role="group" aria-label="Filter by category">
            {['All', ...POST_CATEGORIES].map((c) => (
              <button key={c} type="button" className="pill" aria-pressed={active === c} onClick={() => setActive(c)}>
                {c}
              </button>
            ))}
          </div>
          <span className="filterbar__count" id="latest-heading">
            {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'story' : 'stories'}`}
          </span>
        </div>
        <PostGrid
          posts={filtered}
          loading={loading}
          error={error}
          onRetry={retry}
          empty={{
            title: active === 'All' ? 'No stories yet' : `Nothing in ${active} yet`,
            message: currentUser ? 'Be the first to publish something here.' : 'New stories are on their way. Check back soon.',
            action: currentUser ? 'Write a story' : 'Browse authors',
            to: currentUser ? '/create' : '/authors',
          }}
        />
      </section>
    </>
  )
}
