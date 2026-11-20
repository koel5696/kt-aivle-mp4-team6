import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBook, updateBook } from '../api/books.js'

export default function BookEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [loadedId, setLoadedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const loading = loadedId !== id

  useEffect(() => {
    let cancelled = false
    getBook(id)
      .then((data) => {
        if (cancelled) return
        setBook(data)
        setTitle(data.title)
        setAuthor(data.author)
        setContent(data.content)
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

  async function handleSubmit(event) {
    event.preventDefault()
    const next = {
      title: title.trim(),
      author: author.trim(),
      content: content.trim(),
    }
    if (!next.title || !next.author || !next.content) {
      setError('제목, 저자, 내용을 모두 입력하세요.')
      return
    }

    const patch = {}
    if (next.title !== book.title) patch.title = next.title
    if (next.author !== book.author) patch.author = next.author
    if (next.content !== book.content) patch.content = next.content
    if (Object.keys(patch).length === 0) {
      navigate(`/books/${id}`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await updateBook(id, patch)
      navigate(`/books/${id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section>
        <h2>도서 수정</h2>
        <p>불러오는 중…</p>
      </section>
    )
  }

  if (!book) {
    return (
      <section>
        <h2>도서 수정</h2>
        <p className="error">{error || '도서를 찾을 수 없습니다.'}</p>
      </section>
    )
  }

  return (
    <section>
      <h2>도서 수정</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          제목
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          저자
          <input value={author} onChange={(event) => setAuthor(event.target.value)} />
        </label>
        <label>
          내용
          <textarea value={content} onChange={(event) => setContent(event.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>저장</button>
        </div>
      </form>
    </section>
  )
}
