import { useParams } from 'react-router-dom'
import PostGrid from '../components/PostGrid'
import Avatar from '../components/Avatar'
import usePosts from '../lib/usePosts'
import useFetch from '../lib/useFetch'
import { SITE_URL, absoluteUrl, useSeo } from '../lib/seo'
import { assetUrl } from '../lib/constants'

export default function AuthorPosts() {
  const { id } = useParams()
  const { posts, loading, error, retry } = usePosts(`/posts/users/${id}`)
  const { data: author } = useFetch(`/users/${id}`)

  const name = author?.name ?? posts[0]?.creator?.name ?? 'Author'
  const avatar = author?.avatar ?? posts[0]?.creator?.avatar
  useSeo({
    title: author?.name ? `Stories by ${author.name}` : 'Author',
    description: author?.name ? `Read every story ${author.name} has published on Safin.` : undefined,
    image: avatar ? absoluteUrl(assetUrl(avatar)) : undefined,
    path: `/posts/users/${id}`,
    type: 'profile',
    jsonLd: author?.name
      ? { '@context': 'https://schema.org', '@type': 'ProfilePage', mainEntity: { '@type': 'Person', name: author.name, url: `${SITE_URL}/posts/users/${id}` } }
      : undefined,
  })

  return (
    <section className="container">
      <div className="author-hero">
        <Avatar name={name} src={avatar} size="lg" />
        <div>
          <span className="eyebrow">Author</span>
          <h1 style={{ fontSize: 'var(--fs-2xl)' }}>{name}</h1>
          <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>
            {loading ? 'Loading…' : `${posts.length} published ${posts.length === 1 ? 'story' : 'stories'}`}
          </p>
        </div>
      </div>
      <PostGrid posts={posts} loading={loading} error={error} onRetry={retry} empty={{ title: 'No stories yet', message: `${name} hasn't published anything yet.`, action: 'Explore all stories', to: '/' }} />
    </section>
  )
}
