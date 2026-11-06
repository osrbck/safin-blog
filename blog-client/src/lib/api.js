import axios from 'axios'
import { API_URL } from './constants'
import { readStoredUser, writeStoredUser } from './storage'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = readStoredUser()?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// An expired or revoked session: drop the stored user and send the visitor to sign in again.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error?.config?.headers?.Authorization)
    if (error?.response?.status === 401 && sentToken) {
      writeStoredUser(null)
      const here = window.location.pathname
      if (here !== '/login') window.location.assign(`/login?expired=1&from=${encodeURIComponent(here)}`)
    }
    return Promise.reject(error)
  },
)

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.message || (err?.request && !err?.response ? 'Cannot reach the server.' : err?.message) || fallback

export default api
