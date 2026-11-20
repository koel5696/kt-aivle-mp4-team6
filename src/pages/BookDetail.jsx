import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook, getBook } from '../api/books.js'

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
  if (!book) return <p className="error">{error || '도서를 찾을 수 없습니다.'}</p>

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
        <p className="muted small">
          작성일 {new Date(book.createdAt).toLocaleString('ko-KR')} · 수정일{' '}
          {new Date(book.updatedAt).toLocaleString('ko-KR')}
        </p>
        <p className="content">{book.content}</p>
        {error && <p className="error">{error}</p>}

        <div className="actions">
          <Link to={`/books/${book.id}/edit`} className="btn">수정</Link>
          <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
            삭제
          </button>
          <button className="btn btn-primary" type="button" disabled>AI 표지 생성</button>
        </div>
      </div>
    </section>
  )
}
