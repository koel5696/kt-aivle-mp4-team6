import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook } from '../api/books.js'
import { isUnsavedCover, uploadCover } from '../api/images.js'
import BookForm from '../components/BookForm.jsx'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookForm.css'

export default function BookCreate() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({
    title: '',
    author: '',
    content: '',
    coverImageUrl: '',
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const next = {
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
      content: form.content.trim(),
    }
    if (!next.title || !next.author || !next.content) {
      setError('제목, 저자, 내용을 모두 입력하세요.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // 생성한 표지는 저장할 때 이미지 서버에 올림 (저장하지 않고 나가면 버려짐)
      if (isUnsavedCover(next.coverImageUrl)) {
        next.coverImageUrl = await uploadCover(next.coverImageUrl)
      }
      await createBook(next)
      toast.success(`「${next.title}」을(를) 등록했어요`)
      navigate('/')
    } catch (err) {
      toast.error(`도서 등록에 실패했어요 (${err.message})`)
      setSubmitting(false)
    }
  }

  return (
    <BookForm heading={"도서 등록"} form={form} setForm={setForm}
          error={error} submitting={submitting} onSubmit={handleSubmit} />
  )
}
