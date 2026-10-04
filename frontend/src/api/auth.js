import { request, storeSession, clearSession, unwrap } from './client'

export async function login(credentials) {
  const payload = await request('POST', '/auth/login', { body: credentials })
  const user =
    payload.user ||
    unwrap(payload)?.user || {
      username: credentials.username || credentials.email,
      email: credentials.email || '',
    }
  storeSession({
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    user,
  })
  return user
}

export async function logout() {
  try {
    await request('POST', '/auth/logout')
  } catch {
    /* still clear local session */
  }
  clearSession()
}
