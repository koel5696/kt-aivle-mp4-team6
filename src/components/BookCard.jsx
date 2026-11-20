import { Link } from 'react-router-dom'
import '../styles/BookCard.css'

// F-01 목록 카드: 표지 썸네일 · 제목 · 저자 · 등록일
export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-card-img">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={`${book.title} 표지`}
          />
        ) : (
          <span>표지 없음</span>
        )}
      </div>
      <div className="book-card-body">
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <p>{new Date(book.createdAt).toLocaleDateString('ko-KR')}</p>
      </div>
    </Link>
  )
}
