import { Link } from 'react-router-dom'
import '../styles/BookCard.css'

// 표지가 없는 책에 입힐 양장본 색상 (책마다 고정된 색이 나오도록 id로 선택)
const CLOTH_TONES = ['#6b4f3a', '#3f5a4c', '#2f4a6b', '#7a3b3b', '#8a6d3b', '#4a4a5e']

function pickTone(id) {
  const hash = String(id)
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return CLOTH_TONES[hash % CLOTH_TONES.length]
}

// 목록 카드: 진열대에 세워 둔 표지 + 선반 아래 이름표(제목 · 저자 · 등록일)
export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <div className="book-card-cover">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={`${book.title} 표지`} />
        ) : (
          <div
            className="book-card-placeholder"
            style={{ '--tone': pickTone(book.id) }}
          >
            <span className="book-card-placeholder-title">{book.title}</span>
            <span className="book-card-placeholder-author">{book.author}</span>
          </div>
        )}
      </div>

      <div className="book-card-tag">
        <strong>{book.title}</strong>
        <span>
          {book.author} · {new Date(book.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
    </Link>
  )
}
