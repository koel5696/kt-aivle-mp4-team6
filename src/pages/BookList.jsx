import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'
import '../styles/BookList.css'

const PAGE_SIZE = 8

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [books, setBooks] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCoverFilter, setSelectedCoverFilter] = useState('all')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [appliedCoverFilter, setAppliedCoverFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    getBooks()
      .then((data) => {
        if (cancelled) return
        setBooks(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredBooks = useMemo(() => {
    const keyword = appliedQuery.trim().toLocaleLowerCase()

    return books
      .filter((book) => {
        const title = String(book.title ?? '').toLocaleLowerCase()
        const author = String(book.author ?? '').toLocaleLowerCase()
        const matchesSearch =
          !keyword || title.includes(keyword) || author.includes(keyword)

        const hasCover = Boolean(book.coverImageUrl)
        const matchesCover =
          appliedCoverFilter === 'all' ||
          (appliedCoverFilter === 'with-cover' && hasCover) ||
          (appliedCoverFilter === 'without-cover' && !hasCover)

        return matchesSearch && matchesCover
      })
      .sort((a, b) => Number(b.id) - Number(a.id))
  }, [books, appliedQuery, appliedCoverFilter])

  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const visibleBooks = filteredBooks.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    if (!loading && page !== currentPage) {
      setSearchParams(
        currentPage === 1 ? {} : { page: String(currentPage) },
        { replace: true }
      )
    }
  }, [loading, page, currentPage, setSearchParams])

  function handleSearch(event) {
    event.preventDefault()
    const value = event.currentTarget.elements.namedItem('book-query').value
    setQuery(value)
    setAppliedQuery(value.trim())
    setAppliedCoverFilter(selectedCoverFilter)
    setSearchParams({}, { replace: true })
  }

  function handlePageChange(next) {
    setSearchParams(next === 1 ? {} : { page: String(next) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const shelves = Array.from(
    { length: 2 },
    (_, index) => visibleBooks.slice(index * 4, index * 4 + 4)
  )

  return (
    <section className="book-list-section">
      <div className="page-title">
        <div className="page-title-text">
          <span className="page-title-eyebrow">WALKING LIBRARY</span>
          <h2>나의 책장</h2>
          {!loading && !error && books.length > 0 && (
            <p className="page-title-count">
              {appliedQuery || appliedCoverFilter !== 'all'
                ? `검색 결과 ${filteredBooks.length}권 · 전체 ${books.length}권`
                : `지금 ${books.length}권이 진열되어 있어요`}
            </p>
          )}
        </div>
        <Link to="/books/new" className="btn">신규 등록</Link>
      </div>

      {!loading && !error && books.length > 0 && (
        <form className="book-list-filters" onSubmit={handleSearch}>
          <label className="book-list-search">
            <span>도서 검색</span>
            <input
              name="book-query"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목 또는 작가 검색"
            />
          </label>

          <label className="book-list-cover-filter">
            <span>표지</span>
            <select
              value={selectedCoverFilter}
              onChange={(event) => setSelectedCoverFilter(event.target.value)}
            >
              <option value="all">전체</option>
              <option value="with-cover">표지 있음</option>
              <option value="without-cover">표지 없음</option>
            </select>
          </label>

          <button
            className="btn btn-primary"
            type="submit"
            style={{
              height: 42,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <span>검색</span>
          </button>
        </form>
      )}

      {loading && <p>불러오는 중…</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && books.length === 0 && (
        <div className="empty">
          <p>아직 등록된 도서가 없어요</p>
          <Link to="/books/new" className="btn">새 도서 등록</Link>
        </div>
      )}

      {!loading && !error && books.length > 0 && (
        <>
          <div className="book-grid">
            {shelves.map((shelfBooks, shelfIndex) => (
              <div
                className="book-shelf"
                key={shelfIndex}
                style={{ minHeight: 330 }}
              >
                {shelfBooks.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
                {filteredBooks.length === 0 && shelfIndex === 0 && (
                  <p
                    role="status"
                    style={{
                      alignSelf: 'center',
                      position: 'relative',
                      zIndex: 2,
                      padding: '16px 24px',
                      borderRadius: 8,
                      background: '#fffdf8',
                    }}
                  >
                    검색 조건에 맞는 도서가 없어요
                  </p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          )}
        </>
      )}
    </section>
  )
}