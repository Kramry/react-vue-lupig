import { request, unwrap } from './client'

export async function listProducts() {
  const payload = await request('GET', '/products')
  const rows = unwrap(payload)
  return Array.isArray(rows) ? rows : []
}

export async function createProduct(product) {
  const payload = await request('POST', '/products', { body: product })
  return unwrap(payload) ?? payload
}

export async function updateProduct(id, product) {
  const payload = await request('POST', `/products/${id}`, { body: product })
  return unwrap(payload) ?? payload
}

export async function deleteProduct(id) {
  return request('GET', `/products/${id}/delete`)
}
