import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const KEY = 'safin-theme'
const ThemeContext = createContext(null)

const systemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const storedTheme = () => {
  try {
    const t = localStorage.getItem(KEY)
    return t === 'dark' || t === 'light' ? t : null
  } catch {
    return null
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => storedTheme() ?? systemTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext)
