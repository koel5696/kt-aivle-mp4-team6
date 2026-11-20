import { Link } from 'react-router-dom'
import mockBooks from '../data/mockBooks.js'
import BookCard from '../components/BookCard.jsx'
import '../styles/BookList.css'

// F-01 도서 목록 — 1일차: Mock 데이터 렌더링
// TODO(2일차 M3): useEffect + fetch로 GET /books 연동, 로딩 · 에러 · 빈 목록 처리
export default function BookList() {
  const books = mockBooks

  return (
    <section className='book-list-section'>
      <div className="page-title">
        <h2>나의 책장</h2>
        <Link to="/books/new" className="btn">신규 등록</Link>
      </div>

      {books.length === 0 && <p>등록된 도서가 없습니다.</p>}

      <div className="book-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  )
}
