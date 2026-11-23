import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/books.js'
import BookForm from '../components/BookForm.jsx'
import '../styles/BookForm.css'

export default function BookCreate() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const next = {
      title: title.trim(),
      author: author.trim(),
      content: content.trim(),
      coverImageUrl,
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
    <BookForm heading={"도서 등록"} title={title} setTitle={setTitle} 
          author={author} setAuthor={setAuthor} content={content} setContent={setContent}
          coverImageUrl={coverImageUrl} setCoverImageUrl={setCoverImageUrl}
          error={error} submitting={submitting} onSubmit={handleSubmit} />
  )
}
