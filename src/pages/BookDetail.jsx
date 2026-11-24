import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook } from '../api/books.js'
import {downloadCover} from '../api/images.js'
import useBook from '../hooks/useBook.js'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookDetail.css'
import NotFound from './NotFound.jsx'

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
    if (loadError === '서버에 연결할 수 없습니다') {
      return <NotFound title="서버에 연결할 수 없어요" desc="잠시 후 다시 시도해주세요." />
    }
    if (loadError && loadError !== '도서를 찾을 수 없습니다') {
      return <NotFound title="도서를 불러오지 못했어요" desc={loadError} />
    }
    return <NotFound title="도서를 찾을 수 없어요" desc="삭제되었거나 존재하지 않는 도서예요." />
  }

  const coverImageUrl =  book.coverImageUrl

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
              {(
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
            <button
              className="btn btn-primary" 
              type="button"
              onClick={async ()=>{
                try{
                  const downResult = await downloadCover(book.title, coverImageUrl)
                  
                  downResult.success ? toast.success(downResult.message):toast.error(downResult.message)
                }catch(err){
                  toast.error('커버 다운로드 불가')
                }
                }}
              disabled={!coverImageUrl || deleting}>
                 커버 이미지 다운로드
            </button>

            <Link to={`/books/${book.id}/edit`} className="btn btn-primary">수정하기</Link>
            
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
