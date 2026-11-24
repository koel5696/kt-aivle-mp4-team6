import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'
import '../styles/BookList.css'

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

    queries.forEach((query) => query.addEventListener('change', update))
    update()

    return () => {
      queries.forEach((query) => query.removeEventListener('change', update))
    }
  }, [])

  return columns
}

function getPageSize(columns) {
  return columns === 4 ? 8 : 6
}

function chunk(items, size) {
  const result = []
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size))
  }
  return result
}

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const columns = useColumns()
  const pageSize = getPageSize(columns)

  const [books, setBooks] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCoverFilter, setSelectedCoverFilter] = useState('all')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [appliedCoverFilter, setAppliedCoverFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let cancelled = false

    // 교안 패턴: useEffect 안에 비동기 함수를 만들고 바로 호출
    async function loadBooks() {
      try {
        const data = await getBooks()
        if (cancelled) return
        setBooks(Array.isArray(data) ? data : [])
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadBooks()

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

  const totalPages = Math.ceil(filteredBooks.length / pageSize)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const visibleBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => {
    if (!loading && !error && page !== currentPage) {
      setSearchParams(
        currentPage === 1 ? {} : { page: String(currentPage) },
        { replace: true }
      )
    }
  }, [loading, error, page, currentPage, setSearchParams])

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

  const shelves = chunk(visibleBooks, columns)

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

          <button className="btn btn-primary book-list-search-button" type="submit">
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
            {(shelves.length > 0 ? shelves : [[]]).map(
              (shelfBooks, shelfIndex) => (
                <div
                  className={`book-shelf${
                    filteredBooks.length === 0 ? ' book-shelf--empty' : ''
                  }`}
                  key={shelfIndex}
                >
                  {shelfBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                  {filteredBooks.length === 0 && shelfIndex === 0 && (
                    <p className="book-list-empty-result" role="status">
                      검색 조건에 맞는 도서가 없어요
                    </p>
                  )}
                </div>
              )
            )}
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