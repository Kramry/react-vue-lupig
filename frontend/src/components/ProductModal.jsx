import { useEffect, useId, useState } from 'react'

const empty = {
  product_name: '',
  description: '',
  price: '',
  quantity: '',
}

export function ProductModal({ title, initial, submitting, onClose, onSubmit }) {
  const headingId = useId()
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      product_name: initial?.product_name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? '',
      quantity: initial?.quantity ?? '',
    })
    setError('')
  }, [initial])

  function change(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (!form.product_name.trim()) {
      setError('Product name is required.')
      return
    }
    if (form.product_name.length > 100) {
      setError('Product name must be 100 characters or fewer.')
      return
    }
    if (form.price === '' || Number(form.price) < 0) {
      setError('Enter a valid price.')
      return
    }
    if (form.quantity === '' || Number(form.quantity) < 0 || !Number.isInteger(Number(form.quantity))) {
      setError('Quantity must be a whole number.')
      return
    }

    try {
      await onSubmit({
        product_name: form.product_name.trim(),
        description: form.description.trim(),
        price: Number(form.price).toFixed(2),
        quantity: Number(form.quantity),
      })
    } catch (err) {
      setError(err.message || 'Could not save product.')
    }
  }

  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <h2 id={headingId}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <form className="form" onSubmit={handleSubmit}>
          {error ? <p className="banner error">{error}</p> : null}
          <label>
            Product name
            <input
              name="product_name"
              value={form.product_name}
              onChange={change}
              maxLength={100}
              autoFocus
              required
            />
          </label>
          <label>
            Description
            <textarea name="description" rows="3" value={form.description} onChange={change} />
          </label>
          <div className="grid-2">
            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={change}
                required
              />
            </label>
            <label>
              Quantity
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={change}
                required
              />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ConfirmModal({ title, body, confirmLabel, submitting, onClose, onConfirm }) {
  const headingId = useId()
  return (
    <div className="overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <h2 id={headingId}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <p className="modal-copy">{body}</p>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn danger" onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
