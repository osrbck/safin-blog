import { useCallback } from 'react'
import useFetch from './useFetch'

export default function usePosts(path) {
  const { data, loading, error, retry, setData } = useFetch(path, { fallback: 'We could not load stories right now.' })
  const removeLocal = useCallback((id) => setData((p) => (Array.isArray(p) ? p.filter((x) => x._id !== id) : p)), [setData])
  return { posts: Array.isArray(data) ? data : [], loading, error, retry, removeLocal }
}
