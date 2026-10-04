import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { USE_MOCK } from '../api/client'

export function Shell({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark" aria-hidden="true" />
          Stockboard
        </Link>
        <div className="topbar-meta">
          <span className="chip">{USE_MOCK ? 'Mock API' : 'LavaLust API'}</span>
          <span className="who">{user?.username || user?.email || 'Signed in'}</span>
          <button type="button" className="btn ghost" onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  )
}
