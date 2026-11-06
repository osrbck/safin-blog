import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { readStoredUser, writeStoredUser } from '../lib/storage'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(readStoredUser)

  const login = useCallback((user) => {
    writeStoredUser(user)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    writeStoredUser(null)
    setCurrentUser(null)
  }, [])

  const updateUser = useCallback((patch) => {
    setCurrentUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      writeStoredUser(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({ currentUser, login, logout, updateUser }), [currentUser, login, logout, updateUser])
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}
