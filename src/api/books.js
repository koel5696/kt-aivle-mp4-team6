export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// 응답 본문(payload)과 헤더를 함께 반환 — 페이지 조회에서 X-Total-Count를 읽기 위함
async function send(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('서버에 연결할 수 없습니다')
  }

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

  return { payload, headers: res.headers }
}

async function request(path, options) {
  const { payload } = await send(path, options)
  return payload
}

export function getBooks() {
  return request('/books')
}

// 페이지 단위 목록 조회 (최신 등록순 = id 내림차순, id는 json-server가 등록 순서대로 자동 증가)
// json-server 0.17: _page · _limit 사용 시 전체 개수를 X-Total-Count 헤더로 내려줌
export async function getBooksPage({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({
    _page: String(page),
    _limit: String(limit),
    _sort: 'id',
    _order: 'desc',
  })
  const { payload, headers } = await send(`/books?${params}`)
  const books = Array.isArray(payload) ? payload : []
  const total = Number(headers.get('X-Total-Count') ?? books.length)
  return { books, total }
}

export function getBook(id) {
  return request(`/books/${encodeURIComponent(id)}`)
}

export function createBook({ title, author, content, coverImageUrl }) {
  const now = new Date().toISOString()
  return request('/books', {
    method: 'POST',
    body: {
      title,
      author,
      content,
      coverImageUrl,
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

export function addCoverImage(id, coverImageUrl){
  return updateBook(id, {
    coverImageUrl,
  })
}
