import { ApiError, HTTP_STATUS } from '../constants/http.js'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// 응답 본문(payload)과 헤더를 함께 반환 — 페이지 조회에서 X-Total-Count를 읽기 위함
// 상태 코드를 사용자에게 보여줄 문구로 변환
function getErrorMessage(status) {
  if (status === HTTP_STATUS.NOT_FOUND) return '해당 도서를 찾을 수 없어요'
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) return '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요'
  return `요청을 처리하지 못했어요 (${status})`
}

async function send(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다')
  }

  // 응답 본문을 받는 도중 연결이 끊겨도 연결 실패로 안내
  let text
  try {
    text = await res.text()
  } catch {
    throw new ApiError('서버 응답을 끝까지 받지 못했어요. 다시 시도해 주세요')
  }
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!res.ok) {
    throw new ApiError(getErrorMessage(res.status), res.status)
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
