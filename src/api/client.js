import axios from 'axios'
import { mockRequest } from './mock'

export const USE_MOCK = true
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

const TOKEN_KEY = 'stockboard.access_token'
const REFRESH_KEY = 'stockboard.refresh_token'
const USER_KEY = 'stockboard.user'

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function storeSession({ access_token, refresh_token, user }) {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token)
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function unwrap(payload) {
  if (Array.isArray(payload)) return payload
  if (payload?.data !== undefined) return payload.data
  if (payload?.products !== undefined) return payload.products
  return payload
}

export function apiErrorMessage(error) {
  const data = error?.response?.data ?? error?.data
  if (typeof data === 'string') return data
  return data?.error || data?.message || error?.message || 'Request failed'
}

const http = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const url = original?.url || ''
    const skipRefresh = url.includes('/auth/login') || url.includes('/auth/refresh')
    if (error.response?.status !== 401 || original?._retry || skipRefresh) {
      return Promise.reject(error)
    }

    const refresh = localStorage.getItem(REFRESH_KEY)
    if (!refresh) {
      clearSession()
      return Promise.reject(error)
    }

    original._retry = true
    try {
      if (!refreshPromise) {
        refreshPromise = request('POST', '/auth/refresh', { body: { refresh_token: refresh } }).finally(
          () => {
            refreshPromise = null
          },
        )
      }
      const tokens = await refreshPromise
      storeSession(tokens)
      original.headers.Authorization = `Bearer ${tokens.access_token}`
      return http(original)
    } catch (refreshError) {
      clearSession()
      return Promise.reject(refreshError)
    }
  },
)

export async function request(method, path, { body, token } = {}) {
  if (USE_MOCK) {
    return mockRequest(method, path, { body, token: token ?? getAccessToken() })
  }

  const response = await http.request({
    method,
    url: path,
    data: body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  return response.data
}
