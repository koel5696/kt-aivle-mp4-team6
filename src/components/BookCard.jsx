import { Link } from 'react-router-dom'

// F-01 목록 카드: 표지 썸네일 · 제목 · 저자 · 등록일
export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      {book.coverImageUrl ? (
        <img src={book.coverImageUrl} alt={`${book.title} 표지`} className="cover" />
      ) : (
        <div className="cover cover-empty">표지 없음</div>
      )}
      <div className="book-card-body">
        <h3>{book.title}</h3>
        <p className="muted">{book.author}</p>
        <p className="muted small">{new Date(book.createdAt).toLocaleDateString('ko-KR')}</p>
      </div>
    </Link>
  )
}
