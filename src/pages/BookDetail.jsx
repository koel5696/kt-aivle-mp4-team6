import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook } from '../api/books.js'
import useBook from '../hooks/useBook.js'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookDetail.css'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { book, loading, error: loadError } = useBook(id)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!book || !window.confirm(`「${book.title}」을(를) 삭제할까요?`)) return
    setDeleting(true)
    try {
      await deleteBook(book.id)
      toast.success(`「${book.title}」을(를) 삭제했어요`)
      navigate('/')
    } catch (err) {
      toast.error(`도서 삭제에 실패했어요 (${err.message})`)
      setDeleting(false)
    }
  }

  if (loading) return <p>불러오는 중…</p>
  if (!book) {
    const message =
      loadError === '서버에 연결할 수 없습니다' ? loadError : '도서를 찾을 수 없습니다'
    return (
      <section>
        <p className="error">{message}</p>
        <div className="actions">
          <Link to="/" className="btn">목록으로</Link>
        </div>
      </section>
    )
  }

  return (
    <div className='book-detail-section'>
      <h2>도서 정보</h2>
      <section className="detail">
        <div className="detail-img">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`${book.title} 표지`}
            />
          ) : (
            <span>표지 없음</span>
          )}
        </div>

        <div className="detail-body">
          <div className='detail-body-title'>
            <h2>{book.title}</h2>
            <h3 className="muted">{book.author}</h3>
            <p className="muted">
              작성 {new Date(book.createdAt).toLocaleString('ko-KR')} · 수정 {new Date(book.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <p className="detail-content">{book.content}</p>

          <div className="detail-buttons">
            <Link to={`/books/${book.id}/edit`} className="btn btn-primary">수정</Link>
            <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중…' : '삭제'}
            </button>
            {/* <button className="btn btn-primary" type="button" disabled>AI 표지 생성</button> */}
          </div>
        </div>
      </section>
    </div>
  )
}
