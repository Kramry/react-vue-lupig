const STORAGE_KEY = 'stockboard.mock'

const seed = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@stockboard.local',
      password: 'password123',
      role: 'admin',
    },
  ],
  products: [
    {
      id: 1,
      product_name: 'Oak shelf board',
      description: '1.8m unfinished oak board for retail shelving.',
      price: '42.50',
      quantity: 18,
      created_at: '2026-03-12 09:14:00',
    },
    {
      id: 2,
      product_name: 'Brass bin labels',
      description: 'Set of 24 stamped brass labels for storage bins.',
      price: '16.00',
      quantity: 40,
      created_at: '2026-04-02 11:02:00',
    },
    {
      id: 3,
      product_name: 'Canvas tote pack',
      description: 'Heavy-duty natural canvas totes, pack of 10.',
      price: '28.75',
      quantity: 7,
      created_at: '2026-05-21 16:40:00',
    },
  ],
  nextId: 4,
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return structuredClone(seed)
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function wait(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function tokenFor(user) {
  return `mock.${user.id}.${user.role}`
}

export async function mockRequest(method, path, { body, token } = {}) {
  await wait()
  const state = load()
  const verb = method.toUpperCase()
  const clean = path.replace(/\/+$/, '') || '/'

  if (verb === 'POST' && clean === '/auth/login') {
    const identity = (body?.email || body?.username || '').trim().toLowerCase()
    const password = body?.password || ''
    const user = state.users.find(
      (u) =>
        (u.email.toLowerCase() === identity || u.username.toLowerCase() === identity) &&
        u.password === password,
    )
    if (!user) {
      const error = new Error('Invalid credentials')
      error.status = 401
      error.data = { error: 'Invalid credentials', status: 401 }
      throw error
    }
    return {
      access_token: tokenFor(user),
      refresh_token: `refresh.${user.id}`,
      expires_in: 900,
      token_type: 'Bearer',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    }
  }

  if (verb === 'POST' && clean === '/auth/refresh') {
    return {
      access_token: body?.refresh_token?.replace('refresh.', 'mock.1.') || 'mock.1.admin',
      expires_in: 900,
      token_type: 'Bearer',
    }
  }

  if (verb === 'POST' && clean === '/auth/logout') {
    return { message: 'Logged out' }
  }

  if (!token) {
    const error = new Error('Unauthorized')
    error.status = 401
    error.data = { error: 'Unauthorized', status: 401 }
    throw error
  }

  if (verb === 'GET' && clean === '/products') {
    return { data: state.products }
  }

  const productMatch = clean.match(/^\/products\/(\d+)$/)

  if (verb === 'POST' && clean === '/products') {
    const product = {
      id: state.nextId++,
      product_name: body.product_name,
      description: body.description || '',
      price: Number(body.price).toFixed(2),
      quantity: Number(body.quantity),
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
    state.products.unshift(product)
    save(state)
    return { data: product }
  }

  if (productMatch && verb === 'PUT') {
    const id = Number(productMatch[1])
    const index = state.products.findIndex((p) => p.id === id)
    if (index === -1) {
      const error = new Error('Product not found')
      error.status = 404
      error.data = { error: 'Product not found', status: 404 }
      throw error
    }
    state.products[index] = {
      ...state.products[index],
      product_name: body.product_name,
      description: body.description || '',
      price: Number(body.price).toFixed(2),
      quantity: Number(body.quantity),
    }
    save(state)
    return { data: state.products[index] }
  }

  if (productMatch && verb === 'DELETE') {
    const id = Number(productMatch[1])
    state.products = state.products.filter((p) => p.id !== id)
    save(state)
    return { message: 'Product deleted' }
  }

  const error = new Error('Not found')
  error.status = 404
  error.data = { error: 'Not found', status: 404 }
  throw error
}
