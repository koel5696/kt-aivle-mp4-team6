import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooksPage } from '../api/books.js'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'
import '../styles/BookList.css'

// 데스크톱 4열 / 태블릿 3열 / 모바일 2열
function getColumns() {
  if (typeof window === 'undefined') return 4
  if (window.matchMedia('(max-width: 599px)').matches) return 2
  if (window.matchMedia('(max-width: 1023px)').matches) return 3
  return 4
}

function useColumns() {
  const [columns, setColumns] = useState(getColumns)

  useEffect(() => {
    const queries = [
      window.matchMedia('(max-width: 599px)'),
      window.matchMedia('(max-width: 1023px)'),
    ]
    const update = () => setColumns(getColumns())

    queries.forEach((q) => q.addEventListener('change', update))
    update()
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])

  return columns
}

// 4열 → 8권(2줄), 3열 → 6권(2줄), 2열 → 6권(3줄)
function getPageSize(columns) {
  return columns === 4 ? 8 : 6
}

// 책 배열을 columns 권씩 잘라 선반 배열로 만든다 (빈 선반은 생기지 않음)
function chunk(items, size) {
  const result = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const columns = useColumns()
  const pageSize = getPageSize(columns)

  const [books, setBooks] = useState([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(null)

  const requestKey = `${page}:${pageSize}`
  const [loadedKey, setLoadedKey] = useState(null)
  const loading = loadedKey !== requestKey
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    let cancelled = false

    getBooksPage({ page, limit: pageSize })
      .then((data) => {
        if (cancelled) return
        setBooks(data.books)
        setTotal(data.total)
        setError(null)
        setLoadedKey(requestKey)
      })
      .catch((err) => {
        if (cancelled) return
        setBooks([])
        setError(err.message)
        setLoadedKey(requestKey)
      })

    return () => {
      cancelled = true
    }
  }, [page, pageSize, requestKey])

  // 범위를 넘어선 페이지면 마지막 페이지로 이동
  useEffect(() => {
    if (!loading && !error && total > 0 && page > totalPages) {
      setSearchParams({ page: String(totalPages) }, { replace: true })
    }
  }, [loading, error, total, page, totalPages, setSearchParams])

  function handlePageChange(next) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const shelves = chunk(books, columns)

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