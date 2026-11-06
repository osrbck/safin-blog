import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { ThemeProvider } from '../context/themeContext'
import { UserProvider } from '../context/userContext'
import { useSeo } from '../lib/seo'

export default function ErrorPage() {
  const error = useRouteError()
  const notFound = !error || (isRouteErrorResponse(error) && error.status === 404)
  useSeo({ title: notFound ? 'Page not found' : 'Something went wrong', noindex: true })
  return (
    <ThemeProvider>
      <UserProvider>
        <Header />
        <main>
          <section className="container error-page">
            <div>
              <div className="code">{notFound ? '404' : 'Oops'}</div>
              <h1>{notFound ? 'This page does not exist' : 'Something went wrong'}</h1>
              <p>{notFound ? 'The link may be broken, or the page may have moved.' : error?.statusText || error?.message || 'An unexpected error occurred.'}</p>
              <Link to="/" className="btn btn--primary">
                Back to home
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </UserProvider>
    </ThemeProvider>
  )
}
