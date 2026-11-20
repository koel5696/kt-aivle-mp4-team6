import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/books.js'

export default function BookCreate() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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

    setSubmitting(true)
    setError(null)
    try {
      await createBook(next)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2>도서 등록</h2>
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
