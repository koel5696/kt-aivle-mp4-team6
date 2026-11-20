import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooksPage } from '../api/books.js'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'

const PAGE_SIZE = 10 // 한 페이지에 보여줄 도서 수

export default function BookList() {
  // 현재 페이지는 URL(?page=2)에 보관 → 새로고침 · 뒤로가기 시에도 유지
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)
  const [loadedPage, setLoadedPage] = useState(null)
  const loading = loadedPage !== page
  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    let cancelled = false
    getBooksPage({ page, limit: PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setBooks(data.books)
        setTotal(data.total)
        setError(null)
        setLoadedPage(page)
      })
      .catch((err) => {
        if (cancelled) return
        setBooks([])
        setError(err.message)
        setLoadedPage(page)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  // 삭제 등으로 현재 페이지가 비어 버리면 마지막 페이지로 이동
  useEffect(() => {
    if (!loading && !error && total > 0 && page > totalPages) {
      setSearchParams({ page: String(totalPages) }, { replace: true })
    }
  }, [loading, error, total, page, totalPages, setSearchParams])

  function handlePageChange(next) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section>
      <div className="page-title">
        <h2>도서 목록</h2>
        <Link to="/books/new" className="btn">신규 등록</Link>
      </div>

      {loading && <p>불러오는 중…</p>}
      {!loading && error && <p className="error">{error}</p>}
      {!loading && !error && total === 0 && (
        <div className="empty">
          <p>아직 등록된 도서가 없어요</p>
          <Link to="/books/new" className="btn">새 도서 등록</Link>
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
        </>
      )}
    </section>
  )
}
