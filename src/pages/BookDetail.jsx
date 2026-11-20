import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook, getBook } from '../api/books.js'
import '../styles/BookDetail.css'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [error, setError] = useState(null)
  const [loadedId, setLoadedId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const loading = loadedId !== id

  useEffect(() => {
    let cancelled = false
    getBook(id)
      .then((data) => {
        if (cancelled) return
        setBook(data)
        setError(null)
        setLoadedId(id)
      })
      .catch((err) => {
        if (cancelled) return
        setBook(null)
        setError(err.message)
        setLoadedId(id)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!book || !window.confirm('이 도서를 삭제할까요?')) return
    setDeleting(true)
    setError(null)
    try {
      await deleteBook(book.id)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (loading) return <p>불러오는 중…</p>
  if (!book) {
    const message =
      error === '서버에 연결할 수 없습니다' ? error : '도서를 찾을 수 없습니다'
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
        {error && <p className="error">{error}</p>}

        <div className="detail-buttons">
          <Link to={`/books/${book.id}/edit`} className="btn">수정</Link>
          <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
            삭제
          </button>
          {/* <button className="btn btn-primary" type="button" disabled>AI 표지 생성</button> */}
        </div>
      </div>
    </section>
  )
}
