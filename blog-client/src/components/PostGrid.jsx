import PostCard from './PostCard'
import { PostGridSkeleton } from './Skeleton'
import { EmptyState, ErrorState } from './States'

export default function PostGrid({ posts, loading, error, onRetry, empty }) {
  if (loading) return <PostGridSkeleton />
  if (error) return <div className="grid"><ErrorState message={error} onRetry={onRetry} /></div>
  if (!posts?.length) return <div className="grid"><EmptyState {...empty} /></div>
  return (
    <div className="grid">
      {posts.map((p) => (
        <PostCard key={p._id} post={p} />
      ))}
    </div>
  )
}
