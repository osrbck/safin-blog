import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './styles/index.css'

import { ThemeProvider } from './context/themeContext'
import { UserProvider } from './context/userContext'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Login from './pages/Login'
import Logout from './pages/Logout'
import UserProfile from './pages/UserProfile'
import Authors from './pages/Authors'
import CategoryPosts from './pages/CategoryPosts'
import AuthorPosts from './pages/AuthorPosts'
import Dashboard from './pages/Dashboard'
import Editor from './pages/LazyPostEditor'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ThemeProvider>
        <UserProvider>
          <Layout />
        </UserProvider>
      </ThemeProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:id', element: <PostDetail /> },
      { path: 'posts/categories/:category', element: <CategoryPosts /> },
      { path: 'posts/users/:id', element: <AuthorPosts /> },
      { path: 'authors', element: <Authors /> },
      { path: 'register', element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'logout', element: <Logout /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'profile/:id', element: <UserProfile /> },
          { path: 'create', element: <Editor mode="create" /> },
          { path: 'posts/:id/edit', element: <Editor mode="edit" /> },
          { path: 'myposts/:id', element: <Dashboard /> },
        ],
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
