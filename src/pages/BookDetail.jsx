import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook, updateBook } from '../api/books.js'
import useBook from '../hooks/useBook.js'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookDetail.css'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { book, loading, error: loadError } = useBook(id)
  const [deleting, setDeleting] = useState(false)
  
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [quality, setQuality] = useState('low')
  const [generatedCover, setGeneratedCover] = useState(null)
  
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

  async function handleGenerateCover() {
    const key = apiKey.trim()
    if (!key) {
      toast.error('API 키를 입력해주세요')
      return
    }

    const prompt = `책 제목과 작가 이름이 포함된 책 표지를 만들어주세요.
제목: ${book.title}
작가: ${book.author}
내용: ${book.content}`

    setIsGenerating(true)
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
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

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error?.message || '표지 생성에 실패했어요')
      }

      const data = await res.json()
      const b64Json = data.data?.[0]?.b64_json
      if (!b64Json) throw new Error('생성된 이미지를 찾을 수 없어요')

      const blob = await fetch(`data:image/png;base64,${b64Json}`).then((response) => response.blob())
      const formData = new FormData()
      formData.append('image', blob, 'book-cover.png')
      const uploadRes = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('이미지 업로드에 실패했어요')
      const { imageUrl } = await uploadRes.json()
      if (!imageUrl) throw new Error('업로드된 이미지 주소가 없어요')

      await updateBook(book.id, { coverImageUrl: imageUrl })
      setGeneratedCover({ id, url: imageUrl })
      toast.success('표지가 생성되었어요')
    } catch (err) {
      toast.error(`표지 생성에 실패했어요 (${err.message})`)
    } finally {
      setIsGenerating(false)
      setApiKey('')
    }
  }

  const coverImageUrl = generatedCover?.id === id ? generatedCover.url : book.coverImageUrl

  return (
    <div className='book-detail-section'>
      <h2>도서 정보</h2>
      <section className="detail">
        <div className="detail-img">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
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
          </div>

          <div className="book-form-img-section">
              <input type="password" placeholder="API키를 입력하세요."  value={apiKey} onChange={event=> setApiKey(event.target.value)}/>
              <label htmlFor="quality">표지 화질:</label>
              <select id="qualitySelector" name="quality" onChange={event => setQuality(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="auto">Auto</option>
              </select>
              <div className="book-form-img-button">
                <button className={coverImageUrl ? 'btn btn-danger' : 'btn btn-primary'} type="button" onClick={handleGenerateCover} disabled={isGenerating}>
                  {isGenerating ? '생성 중 ...' : coverImageUrl ? 'AI 표지 재생성' : 'AI 표지 생성'}
                </button>
              </div>
          </div>

        </div>
      </section>
    </div>
  )
}
