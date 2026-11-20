import { Link, useParams } from 'react-router-dom'
import mockBooks from '../data/mockBooks.js'

// F-02 도서 상세 — 1일차: Mock 데이터 렌더링
// TODO(2일차 M3): useEffect + fetch로 GET /books/:id 연동
// TODO(2일차 M4): [삭제] DELETE 연동 / TODO(3일차 M5·M6): [AI 표지 생성] + 표지 저장
export default function BookDetail() {
  const { id } = useParams()
  const book = mockBooks.find((b) => b.id === Number(id))

  if (!book) return <p>도서를 찾을 수 없습니다.</p>

  return (
    <section className="detail">
      {book.coverImageUrl ? (
        <img src={book.coverImageUrl} alt={`${book.title} 표지`} className="cover detail-cover" />
      ) : (
        <div className="cover cover-empty detail-cover">표지 없음</div>
      )}

      <div className="detail-body">
        <h2>{book.title}</h2>
        <p className="muted">{book.author}</p>
        <p className="muted">
          작성일 {new Date(book.createdAt).toLocaleString('ko-KR')} · 수정일{' '}
          {new Date(book.updatedAt).toLocaleString('ko-KR')}
        </p>
        <p className="content">{book.content}</p>

        <div className="actions">
          <Link to={`/books/${book.id}/edit`} className="btn">수정</Link>
          <button className="btn btn-danger" disabled>삭제</button>
          <button className="btn btn-primary" disabled>AI 표지 생성</button>
        </div>
      </div>
    </section>
  )
}
