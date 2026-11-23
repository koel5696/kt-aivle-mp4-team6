import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook, updateBook } from '../api/books.js'
import useBook from '../hooks/useBook.js'
import { useToast } from '../contexts/ToastContext.js'
import CoverGenerator from '../components/CoverGenerator.jsx'
import '../styles/BookDetail.css'

// 2026년 11월 23일 형태로 표시
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { book, loading, error: loadError } = useBook(id)
  const [deleting, setDeleting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  // 방금 생성한 표지 (새로고침 없이 바로 보여주기 위함)
  const [newCover, setNewCover] = useState(null)

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

  const coverImageUrl = newCover ?? book.coverImageUrl

  // 상세 화면에서는 생성 즉시 저장
  async function handleCoverGenerated(dataUrl) {
    try {
      await updateBook(book.id, { coverImageUrl: dataUrl })
    } catch (err) {
      throw new Error(`표지는 만들었지만 저장하지 못했어요 (${err.message})`)
    }
    setNewCover(dataUrl)
  }

  const isEdited = book.updatedAt && book.updatedAt !== book.createdAt

  return (
    <div className="book-detail-section">
      <Link to="/" className="detail-back">← 목록으로</Link>

      <section className="detail">
        <div className="detail-img">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt={`${book.title} 표지`} />
          ) : (
            <div className="detail-img-empty">
              <span className="detail-img-empty-title">{book.title}</span>
              <span className="detail-img-empty-hint">아직 표지가 없어요</span>
            </div>
          )}
        </div>

        <div className="detail-body">
          <header className="detail-header">
            <h2 className="detail-title">{book.title}</h2>
            <p className="detail-author">
              <span className="detail-label">지은이</span>
              {book.author}
            </p>
            <dl className="detail-meta">
              <div>
                <dt>등록일</dt>
                <dd>{formatDate(book.createdAt)}</dd>
              </div>
              {isEdited && (
                <div>
                  <dt>수정일</dt>
                  <dd>{formatDate(book.updatedAt)}</dd>
                </div>
              )}
            </dl>
          </header>

          <div className="detail-section">
            <h3 className="detail-section-title">책 소개</h3>
            <p className="detail-content">{book.content}</p>
          </div>

          <div className="detail-buttons">
            <Link to={`/books/${book.id}/edit`} className="btn btn-primary">수정하기</Link>
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleDelete}
              disabled={deleting || isGenerating}
            >
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </div>

          <CoverGenerator
            title={book.title}
            author={book.author}
            content={book.content}
            hasCover={Boolean(coverImageUrl)}
            onGenerated={handleCoverGenerated}
            onBusyChange={setIsGenerating}
            successMessage="AI 표지를 저장했어요"
            description="제목·지은이·책 소개를 바탕으로 표지를 그려요. API 키는 저장되지 않아요."
          />
        </div>
      </section>
    </div>
  )
}
