import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { updateBook } from '../api/books.js'
import useBook from '../hooks/useBook.js'

export default function BookEdit() {
  const { id } = useParams()
  const { book, loading, error } = useBook(id)

  if (loading) {
    return (
      <section>
        <h2>도서 수정</h2>
        <p>불러오는 중…</p>
      </section>
    )
  }

  if (!book) {
    const message =
      error === '서버에 연결할 수 없습니다' ? error : '도서를 찾을 수 없습니다'
    return (
      <section>
        <h2>도서 수정</h2>
        <p className="error">{message}</p>
        <div className="actions">
          <Link to="/" className="btn">목록으로</Link>
        </div>
      </section>
    )
  }

  // 불러온 도서로 폼 초기값을 채움 (key: 다른 도서로 이동하면 폼을 새로 만듦)
  return <BookEditForm key={book.id} book={book} />
}

function BookEditForm({ book }) {
  const navigate = useNavigate()
  const [title, setTitle] = useState(book.title)
  const [author, setAuthor] = useState(book.author)
  const [content, setContent] = useState(book.content)
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

    const patch = {}
    if (next.title !== book.title) patch.title = next.title
    if (next.author !== book.author) patch.author = next.author
    if (next.content !== book.content) patch.content = next.content
    if (Object.keys(patch).length === 0) {
      navigate(`/books/${book.id}`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await updateBook(book.id, patch)
      navigate(`/books/${book.id}`)
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
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
