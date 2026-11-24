import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { updateBook } from '../api/books.js'
import {  uploadCover } from '../api/images.js'
import useBook from '../hooks/useBook.js'
import BookForm from '../components/BookForm.jsx'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookForm.css'
import NotFound from './NotFound.jsx'

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
    if (error === '서버에 연결할 수 없습니다') {
      return <NotFound title="서버에 연결할 수 없어요" desc="잠시 후 다시 시도해주세요." />
    }
    if (error && error !== '도서를 찾을 수 없습니다') {
      return <NotFound title="도서를 불러오지 못했어요" desc={error} />
    }
    return <NotFound title="도서를 찾을 수 없어요" desc="삭제되었거나 존재하지 않는 도서예요." />
  }

  // 불러온 도서로 폼 초기값을 채움 (key: 다른 도서로 이동하면 폼을 새로 만듦)
  return <BookEditForm key={book.id} book={book} />
}

function BookEditForm({ book }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [isUnsavedCover, setIsUnsavedCover] = useState(false)

  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    content: book.content,
    coverImageUrl: book.coverImageUrl || '',
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

    const patch = {}
    if (next.title !== book.title) patch.title = next.title
    if (next.author !== book.author) patch.author = next.author
    if (next.content !== book.content) patch.content = next.content
    if (next.coverImageUrl !== (book.coverImageUrl || '')) {patch.coverImageUrl = next.coverImageUrl}
    if (Object.keys(patch).length === 0) {
      toast.info('변경된 내용이 없어요')
      navigate(`/books/${book.id}`)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      // 새로 생성한 표지는 저장할 때 이미지 서버에 올림 (저장하지 않고 나가면 버려짐)
      if (isUnsavedCover) {
        patch.coverImageUrl = await uploadCover(book.id, patch.coverImageUrl)
      }
      await updateBook(book.id, patch)
      toast.success('수정 내용을 저장했어요')
      navigate(`/books/${book.id}`)
    } catch (err) {
      toast.error(`수정 내용 저장에 실패했어요 (${err.message})`)
      setSubmitting(false)
    }
  }

  return (
    <BookForm heading={"도서 수정"} form={form} setForm={setForm}
      error={error} submitting={submitting} onSubmit={handleSubmit} onCoverChange={setIsUnsavedCover} />
  )
}
