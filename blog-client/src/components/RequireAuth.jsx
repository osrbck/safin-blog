import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useUser } from '../context/userContext'

export default function RequireAuth() {
  const { currentUser } = useUser()
  const location = useLocation()
  if (!currentUser?.token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
