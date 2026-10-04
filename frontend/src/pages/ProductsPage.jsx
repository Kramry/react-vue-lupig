import { useEffect, useMemo, useState } from 'react'
import { Shell } from '../components/Shell'
import { ConfirmModal, ProductModal } from '../components/ProductModal'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import { apiErrorMessage } from '../api/client'

function money(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function stockTone(qty) {
  if (qty <= 0) return 'out'
  if (qty < 10) return 'low'
  return 'ok'
}

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [pending, setPending] = useState(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setProducts(await listProducts())
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      [p.product_name, p.description].join(' ').toLowerCase().includes(q),
    )
  }, [products, query])

  async function saveProduct(payload) {
    setSaving(true)
    try {
      if (modal?.mode === 'edit') {
        await updateProduct(modal.product.id, payload)
        setNotice(`Updated “${payload.product_name}”.`)
      } else {
        await createProduct(payload)
        setNotice(`Added “${payload.product_name}”.`)
      }
      setModal(null)
      await refresh()
    } catch (err) {
      throw new Error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!pending) return
    setSaving(true)
    setError('')
    try {
      await deleteProduct(pending.id)
      setNotice(`Deleted “${pending.product_name}”.`)
      setPending(null)
      await refresh()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Shell>
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1>Products</h1>
        </div>
        <button type="button" className="btn primary" onClick={() => setModal({ mode: 'add' })}>
          Add product
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search by name or description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="button" className="btn ghost" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {notice ? <p className="banner ok">{notice}</p> : null}
      {error ? <p className="banner error">{error}</p> : null}

      <div className="ledger">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="muted">
                  Loading products…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="muted">
                  No products to show.
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id}>
                  <td className="mono">{product.id}</td>
                  <td>
                    <strong>{product.product_name}</strong>
                    {product.description ? <p className="desc">{product.description}</p> : null}
                  </td>
                  <td>{money(product.price)}</td>
                  <td>
                    <span className={`stock ${stockTone(Number(product.quantity))}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="muted">{product.created_at || '—'}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => setModal({ mode: 'edit', product })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => setPending(product)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal ? (
        <ProductModal
          title={modal.mode === 'edit' ? 'Edit product' : 'Add product'}
          initial={modal.product}
          submitting={saving}
          onClose={() => setModal(null)}
          onSubmit={saveProduct}
        />
      ) : null}

      {pending ? (
        <ConfirmModal
          title="Delete product"
          body={`Remove “${pending.product_name}” from inventory? This cannot be undone.`}
          confirmLabel="Delete"
          submitting={saving}
          onClose={() => setPending(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </Shell>
  )
}
