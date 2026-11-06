import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from './api'

/**
 * Minimal data hook. Loading is derived from a request key, so no state is
 * written synchronously inside the effect (satisfies react-hooks v7 rules).
 */
export default function useFetch(path, { fallback = 'Something went wrong.' } = {}) {
  const [tick, setTick] = useState(0)
  const key = `${path}#${tick}`
  const [state, setState] = useState({ key: null, data: null, error: '' })

  useEffect(() => {
    if (!path) return undefined
    let cancelled = false
    api
      .get(path)
      .then((res) => !cancelled && setState({ key, data: res.data, error: '' }))
      .catch((err) => !cancelled && setState({ key, data: null, error: errorMessage(err, fallback) }))
    return () => {
      cancelled = true
    }
  }, [path, key, fallback])

  const loading = Boolean(path) && state.key !== key
  const retry = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), [])

  return { data: loading ? null : state.data, error: loading ? '' : state.error, loading, retry, setData }
}
