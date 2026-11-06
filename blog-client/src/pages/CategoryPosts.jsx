import { useParams } from 'react-router-dom'
import PostGrid from '../components/PostGrid'
import usePosts from '../lib/usePosts'
import { CATEGORY_DESCRIPTIONS, POST_CATEGORIES, categoryPath } from '../lib/constants'
import { useSeo } from '../lib/seo'

export default function CategoryPosts() {
  const { category } = useParams()
  const { posts, loading, error, retry } = usePosts(`/posts/categories/${encodeURIComponent(category)}`)
  const known = POST_CATEGORIES.includes(category)
  const about = CATEGORY_DESCRIPTIONS[category]
  useSeo({ title: `${category} stories`, description: about, path: categoryPath(category), noindex: !known })
  return (
    <section className="container">
      <div className="page-head">
        <div>
          <span className="eyebrow">Category</span>
          <h1>{category}</h1>
          {about && <p>{about}</p>}
          <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
            {loading ? 'Loading…' : `${posts.length} ${posts.length === 1 ? 'story' : 'stories'} in this collection.`}
          </p>
        </div>
      </div>
      <PostGrid posts={posts} loading={loading} error={error} onRetry={retry} empty={{ title: `No ${category} stories yet`, message: 'Check back soon, or browse everything else.', action: 'Explore all stories', to: '/' }} />
    </section>
  )
}
