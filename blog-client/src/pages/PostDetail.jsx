import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuPencil } from 'react-icons/lu'
import Avatar from '../components/Avatar'
import Alert from '../components/Alert'
import DeletePostButton from '../components/DeletePostButton'
import { ArticleSkeleton } from '../components/Skeleton'
import { ErrorState } from '../components/States'
import useFetch from '../lib/useFetch'
import { assetUrl, categoryPath } from '../lib/constants'
import { formatDate, readingTime, sanitizeHtml } from '../lib/format'
import { SITE_NAME, SITE_URL, absoluteUrl, summarize, useSeo } from '../lib/seo'
import { useUser } from '../context/userContext'

const postSeo = (post, id, { loading, error }) => {
  if (loading) return { title: 'Loading story', path: `/posts/${id}` }
  if (error || !post) return { title: 'Story not found', noindex: true, path: `/posts/${id}` }
  const author = post.creator && typeof post.creator === 'object' ? post.creator : null
  const url = `${SITE_URL}/posts/${post._id}`
  const image = absoluteUrl(assetUrl(post.thumbnail))
  const description = summarize(post.description)
  return {
    title: post.title,
    description,
    image,
    path: `/posts/${post._id}`,
    type: 'article',
    article: { publishedTime: post.createdAt, modifiedTime: post.updatedAt, section: post.category },
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `${url}#article`,
          mainEntityOfPage: url,
          headline: post.title,
          description,
          image: image ? [image] : undefined,
          datePublished: post.createdAt,
          dateModified: post.updatedAt ?? post.createdAt,
          articleSection: post.category,
          inLanguage: 'en',
          author: author ? { '@type': 'Person', name: author.name, url: `${SITE_URL}/posts/users/${author._id}` } : undefined,
          publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` } },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Stories', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: post.category, item: `${SITE_URL}${categoryPath(post.category)}` },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
          ],
        },
      ],
    },
  }
}

export default function PostDetail() {
  const { id } = useParams()
  const { currentUser } = useUser()
  const { data: post, loading, error, retry } = useFetch(`/posts/${id}`, { fallback: 'We could not load this story.' })
  const [actionError, setActionError] = useState('')

  useSeo(postSeo(post, id, { loading, error }))

  if (loading) return <ArticleSkeleton />
  if (error || !post)
    return (
      <div className="container container--narrow">
        <div className="grid">
          <ErrorState title="Story not found" message={error || 'This story may have been removed.'} onRetry={retry} />
        </div>
      </div>
    )

  const author = post.creator && typeof post.creator === 'object' ? post.creator : null
  const authorId = author?._id ?? post.creator
  const isOwner = currentUser && authorId === currentUser.id

  return (
    <article className="container container--narrow">
      <header className="article__head">
        <div>
          <Link to={categoryPath(post.category)} className="chip">
            {post.category}
          </Link>
        </div>
        <h1 className="article__title">{post.title}</h1>
        <div className="article__meta">
          <Link to={`/posts/users/${authorId}`} className="author-row">
            <Avatar name={author?.name} src={author?.avatar} />
            <span className="author-row__meta">
              <strong>{author?.name ?? 'Unknown author'}</strong>
              <span>
                {formatDate(post.createdAt)} · {readingTime(post.description)}
              </span>
            </span>
          </Link>
          {isOwner && (
            <div className="article__actions">
              <Link to={`/posts/${post._id}/edit`} className="btn btn--sm">
                <LuPencil size={14} /> Edit
              </Link>
              <DeletePostButton postID={post._id} title={post.title} onError={setActionError} />
            </div>
          )}
        </div>
        <Alert>{actionError}</Alert>
      </header>

      {post.thumbnail && (
        <figure className="article__cover">
          <img src={assetUrl(post.thumbnail)} alt={`Cover for ${post.title}`} fetchPriority="high" />
        </figure>
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.description) }} />

      <footer className="article__foot">
        <Link to="/" className="btn btn--ghost">
          <LuArrowLeft size={16} /> Back to stories
        </Link>
        <Link to={`/posts/users/${authorId}`} className="btn">
          More from {author?.name?.split(' ')[0] ?? 'this author'}
        </Link>
      </footer>
    </article>
  )
}
