import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook, updateBook } from '../api/books.js'
import useBook from '../hooks/useBook.js'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookDetail.css'
import NotFound from './NotFound.jsx'

const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations'

// 2026년 11월 23일 형태로 표시
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// OpenAI 응답 상태 코드를 사용자에게 보여줄 문구로 변환
async function getOpenAIErrorMessage(res) {
  if (res.status === 401) return 'API 키가 올바르지 않아요. 키를 다시 확인해 주세요.'
  if (res.status === 429) return '요청 한도를 초과했어요. 잠시 후 다시 시도하거나 결제 한도를 확인해 주세요.'
  try {
    const data = await res.json()
    if (data.error?.message) return data.error.message
  } catch {
    // 응답 본문이 JSON이 아니면 기본 문구 사용
  }
  return `표지 생성에 실패했어요 (${res.status})`
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { book, loading, error: loadError } = useBook(id)
  const [deleting, setDeleting] = useState(false)

  const [apiKey, setApiKey] = useState('')
  const [quality, setQuality] = useState('low')
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverError, setCoverError] = useState(null)
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
    if (loadError === '서버에 연결할 수 없습니다') {
      return <NotFound title="서버에 연결할 수 없어요" desc="잠시 후 다시 시도해주세요." />
    }
    return <NotFound title="도서를 찾을 수 없어요" desc="삭제되었거나 존재하지 않는 도서예요." />
  }

  const coverImageUrl = newCover ?? book.coverImageUrl

  async function handleGenerateCover() {
    const key = apiKey.trim()
    if (!key) {
      setCoverError('API 키를 입력해 주세요.')
      return
    }

    const prompt = `
      #역할
      전문 책 표지 생성 AI
      #지침
      - 주어진 책 이름, 작가, 내용을 바탕으로 가장 적합한 책 표지 만들어
      - 책 이름, 작가 이름이 표지에 나오도록
      제목: ${book.title}
      작가: ${book.author}
      내용: ${book.content}
      `

    setIsGenerating(true)
    setCoverError(null)

    let res
    try {
      res = await fetch(OPENAI_IMAGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt,
          n: 1,
          size: '1024x1536',
          quality,
          output_format: 'png',
        }),
      })
    } catch {
      setCoverError('네트워크 오류로 OpenAI에 연결하지 못했어요.')
      setIsGenerating(false)
      return
    }

    try {
      if (!res.ok) throw new Error(await getOpenAIErrorMessage(res))

      const data = await res.json()
      const b64Json = data.data?.[0]?.b64_json
      if (!b64Json) throw new Error('생성된 이미지를 받지 못했어요. 다시 시도해 주세요.')

      const imageSrc = `data:image/png;base64,${b64Json}`
      try {
        await updateBook(book.id, { coverImageUrl: imageSrc })
      } catch (err) {
        throw new Error(`표지는 만들었지만 저장하지 못했어요 (${err.message})`)
      }

      setNewCover(imageSrc)
      setApiKey('')
      toast.success('AI 표지를 저장했어요')
    } catch (err) {
      setCoverError(err.message)
    } finally {
      setIsGenerating(false)
    }
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
            <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </div>

          <div className="cover-gen">
            <div className="cover-gen-head">
              <h3 className="detail-section-title">AI 표지 만들기</h3>
              <p className="cover-gen-desc">
                제목·지은이·책 소개를 바탕으로 표지를 그려요. API 키는 저장되지 않아요.
              </p>
            </div>

            <div className="cover-gen-fields">
              <label className="cover-gen-field cover-gen-key">
                <span>OpenAI API 키</span>
                <input
                  type="password"
                  placeholder="sk-..."
                  autoComplete="off"
                  value={apiKey}
                  onChange={(event) => {
                    setApiKey(event.target.value)
                    if (coverError) setCoverError(null)
                  }}
                  disabled={isGenerating}
                  aria-invalid={coverError ? true : undefined}
                  aria-describedby={coverError ? 'cover-gen-error' : undefined}
                />
              </label>

              <label className="cover-gen-field">
                <span>화질</span>
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  disabled={isGenerating}
                >
                  <option value="low">Low (빠름)</option>
                  <option value="medium">Medium (보통)</option>
                  <option value="high">High (느림)</option>
                  <option value="auto">Auto (자동)</option>
                </select>
              </label>
            </div>

            {coverError && (
              <p id="cover-gen-error" className="cover-gen-error" role="alert">
                {coverError}
              </p>
            )}

            <button
              className="btn btn-primary cover-gen-submit"
              type="button"
              onClick={handleGenerateCover}
              disabled={isGenerating}
            >
              {isGenerating
                ? '표지 그리는 중… (최대 1분 정도 걸려요)'
                : coverImageUrl ? 'AI 표지 다시 만들기' : 'AI 표지 만들기'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
