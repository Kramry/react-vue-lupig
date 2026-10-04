import { request, storeSession, clearSession, unwrap } from './client'

export async function login(credentials) {
  const payload = await request('POST', '/auth/login', { body: credentials })
  const result = unwrap(payload)
  const user = result?.user || {
    username: result?.username || credentials.username || credentials.email,
    email: credentials.email || '',
  }
  storeSession({
    access_token: result?.access_token || result?.token,
    refresh_token: result?.refresh_token,
    user,
  })
  return user
}

export async function logout() {
  clearSession()
}
