import { Suspense, lazy } from 'react'
import { ArticleSkeleton } from '../components/Skeleton'

const PostEditor = lazy(() => import('./PostEditor'))

export default function LazyPostEditor(props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <PostEditor {...props} />
    </Suspense>
  )
}
