import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBooks } from '../api/books.js'
import BookCard from '../components/BookCard.jsx'
import '../styles/BookList.css'

export default function BookList() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getBooks()
      .then((data) => {
        if (!cancelled) setBooks(data)
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

  // [추가 구현] 책을 네 권씩 묶고, 선반은 최소 두 줄 준비
  const shelves = Array.from(
    { length: Math.max(2, Math.ceil(books.length / 4)) },
    (_, index) => books.slice(index * 4, index * 4 + 4)
  )

  return (
    <section className="book-list-section">
      <div className="page-title">
        <h2>나의 책장</h2>
        <Link to="/books/new" className="btn">신규 등록</Link>
      </div>

      {loading && <p>불러오는 중…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && books.length === 0 && (
        <div className="empty">
          <p>아직 등록된 도서가 없어요</p>
          <Link to="/books/new" className="btn">새 도서 등록</Link>
        </div>
      )}

      {/*  선반별로 최대 네 권씩 표시하도록 변경  */}
      {!loading && !error && books.length > 0 && (
        <div className="book-grid">
          {shelves.map((shelfBooks, shelfIndex) => (
            <div className="book-shelf" key={shelfIndex}>
              {shelfBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}