export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    const message =
      payload && typeof payload === 'object' && payload.message
        ? payload.message
        : res.statusText || 'Request failed'
    throw new Error(`${res.status} ${message}`.trim())
  }

  return payload
}

export function getBooks() {
  return request('/books')
}

export function getBook(id) {
  return request(`/books/${encodeURIComponent(id)}`)
}

export function createBook({ title, author, content }) {
  const now = new Date().toISOString()
  return request('/books', {
    method: 'POST',
    body: {
      title,
      author,
      content,
      coverImageUrl: '',
      createdAt: now,
      updatedAt: now,
    },
  })
}

export function updateBook(id, patch) {
  return request(`/books/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { ...patch, updatedAt: new Date().toISOString() },
  })
}

export function deleteBook(id) {
  return request(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
