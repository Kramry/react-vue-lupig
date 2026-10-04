import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { USE_MOCK, apiErrorMessage } from '../api/client'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState(USE_MOCK ? 'admin@stockboard.local' : '')
  const [password, setPassword] = useState(USE_MOCK ? 'password123' : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/'} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login({ username: email, password })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-screen">
      <section className="login-panel">
        <p className="eyebrow">Lab 6 · Product Management</p>
        <h1>Sign in to Stockboard</h1>
        <p className="lede">
          Authenticated staff can list, add, edit, and remove products through the LavaLust API.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          {error ? <p className="banner error">{error}</p> : null}
          <label>
            Email or username
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="btn primary full" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Login'}
          </button>
        </form>
        {USE_MOCK ? (
          <p className="hint">
            Demo account: <code>admin</code> / <code>admin123</code>
          </p>
        ) : (
          <p className="hint">Use the account configured by the LavaLust API.</p>
        )}
      </section>
      <aside className="login-aside">
        <h2>Required flow</h2>
        <ol>
          <li>Login</li>
          <li>Product list</li>
          <li>Add / Edit / Delete</li>
        </ol>
        <p>CRUD never talks to MySQL directly. Every change goes through the API with a Bearer token.</p>
      </aside>
    </div>
  )
}
