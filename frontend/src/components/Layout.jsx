import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Assignments' },
  { to: '/blog', label: 'Blog' },
  { to: '/instructions', label: 'GitHub Guide' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold text-brand-700">
                EduResources
              </Link>
              <nav className="hidden sm:flex gap-1">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === to
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    to="/submit"
                    className={`text-sm px-3 py-2 ${
                      location.pathname === '/submit'
                        ? 'text-brand-700 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Submit
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                  >
                    {user.display_name}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm bg-brand-600 text-white rounded-md px-4 py-2 hover:bg-brand-700 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          Edu Resource Site
        </div>
      </footer>
    </div>
  )
}
