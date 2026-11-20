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

  return (
    <section>
      <div className="page-title">
        <h2>나의 책장</h2>
        <Link to="/books/new" className="btn">신규 등록</Link>
      </div>

      {loading && <p>불러오는 중…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && books.length === 0 && <p>등록된 도서가 없습니다.</p>}

      {!loading && !error && books.length > 0 && (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </section>
  )
}
