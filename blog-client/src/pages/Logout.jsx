import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../context/userContext'

export default function Logout() {
  const { logout } = useUser()
  useEffect(() => {
    logout()
  }, [logout])
  return <Navigate to="/login" replace />
}
