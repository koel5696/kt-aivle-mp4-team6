import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooksPage } from '../api/books.js'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'
import '../styles/BookList.css'

const PAGE_SIZE = 8

export default function BookList() {
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

  useEffect(() => {
    if (!loading && !error && total > 0 && page > totalPages) {
      setSearchParams({ page: String(totalPages) }, { replace: true })
    }
  }, [loading, error, total, page, totalPages, setSearchParams])

  function handlePageChange(next) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 현재 페이지의 책을 네 권씩 두 선반에 배치
  const shelves = Array.from(
    { length: 2 },
    (_, index) => books.slice(index * 4, index * 4 + 4)
  )

  return (
    <section className="book-list-section">
      <div className="page-title">
        <div className="page-title-text">
          <span className="page-title-eyebrow">WALKING LIBRARY</span>
          <h2>나의 책장</h2>
          {!loading && !error && total > 0 && (
            <p className="page-title-count">지금 {total}권이 진열되어 있어요</p>
          )}
        </div>
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
            {shelves.map((shelfBooks, shelfIndex) => (
              <div className="book-shelf" key={shelfIndex}>
                {shelfBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </section>
  )
}