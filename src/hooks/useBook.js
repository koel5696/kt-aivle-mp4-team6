import { useEffect, useState } from 'react'
import { getBook } from '../api/books.js'

// id로 도서 한 권을 불러오는 훅 (상세 · 수정 페이지 공통)
// - id가 바뀌면 다시 불러오고, 이전 요청 결과는 무시(cancelled)
// - loading: 아직 현재 id의 결과가 도착하지 않음
// - error: 불러오기 실패 메시지 (실패 시 book은 null)
export default function useBook(id) {
  const [result, setResult] = useState({ id: null, book: null, error: null })

  useEffect(() => {
    let cancelled = false
    getBook(id)
      .then((book) => {
        if (!cancelled) setResult({ id, book, error: null })
      })
      .catch((err) => {
        if (!cancelled) setResult({ id, book: null, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const loading = result.id !== id
  return {
    book: loading ? null : result.book,
    error: loading ? null : result.error,
    loading,
  }
}
