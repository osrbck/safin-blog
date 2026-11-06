export const USER_KEY = 'user'

export const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    return user && typeof user === 'object' && user.token ? user : null
  } catch {
    return null
  }
}

export const writeStoredUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* storage unavailable */
  }
}
