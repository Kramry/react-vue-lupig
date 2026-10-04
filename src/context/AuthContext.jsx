import { createContext, useContext, useMemo, useState } from 'react'
import { clearSession, getAccessToken, getStoredUser } from '../api/client'
import { login as loginRequest, logout as logoutRequest } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [token, setToken] = useState(() => getAccessToken())

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      async login(credentials) {
        const nextUser = await loginRequest(credentials)
        setUser(nextUser)
        setToken(getAccessToken())
        return nextUser
      },
      async logout() {
        await logoutRequest()
        setUser(null)
        setToken(null)
      },
      expire() {
        clearSession()
        setUser(null)
        setToken(null)
      },
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
