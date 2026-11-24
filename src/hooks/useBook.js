import { useEffect, useState } from 'react'
import { getBook } from '../api/books.js'

// 불러오기 실패를 상태 코드로 구분해 화면에 보여줄 문구로 변환
function getLoadErrorMessage(err) {
  if (err.isNetworkError) return '서버에 연결할 수 없습니다'
  if (err.isNotFound) return '도서를 찾을 수 없습니다'
  return '도서를 불러오지 못했어요. 잠시 후 다시 시도해 주세요'
}

// id로 도서 한 권을 불러오는 훅 (상세 · 수정 페이지 공통)
// - id가 바뀌면 다시 불러오고, 이전 요청 결과는 무시(cancelled)
// - loading: 아직 현재 id의 결과가 도착하지 않음
// - error: 불러오기 실패 문구 (연결 실패 / 없는 도서 / 그 밖의 오류를 상태 코드로 구분)
export default function useBook(id) {
  const [result, setResult] = useState({ id: null, book: null, error: null })
  
  useEffect(() => {
    let cancelled = false

    async function loadBook() {
      try {
        const book = await getBook(id)
        if (!cancelled) setResult({ id, book, error: null })
      } catch (err) {
        if (!cancelled) setResult({ id, book: null, error: getLoadErrorMessage(err) })
      }
    }

    loadBook()

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
