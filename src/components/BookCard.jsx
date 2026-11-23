import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useBookOpenEffect from '../hooks/useBookOpenEffect.js'
import '../styles/BookCard.css'

// 표지가 펼쳐지는 애니메이션 시간 (BookCard.css의 --open-duration과 맞춤)
const OPEN_DURATION = 700

// 표지가 없는 책에 입힐 양장본 색상 (책마다 고정된 색이 나오도록 id로 선택)
const CLOTH_TONES = ['#6b4f3a', '#3f5a4c', '#2f4a6b', '#7a3b3b', '#8a6d3b', '#4a4a5e']

function pickTone(id) {
  const hash = String(id)
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return CLOTH_TONES[hash % CLOTH_TONES.length]
}

// 목록 카드: 진열대에 세워 둔 표지 + 선반 아래 이름표(제목 · 저자 · 등록일)
// 클릭하면 표지가 펼쳐진 뒤 상세 페이지로 이동 (헤더의 펼침 효과 스위치로 끌 수 있음)
export default function BookCard({ book }) {
  const navigate = useNavigate()
  const [effectOn] = useBookOpenEffect()
  const [opening, setOpening] = useState(false)
  const timerRef = useRef(null)
  const to = `/books/${book.id}`

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleClick(event) {
    // 새 탭 열기(Ctrl·Cmd 클릭 등), 효과 끔, 움직임 줄이기 설정이면 바로 이동
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!effectOn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    event.preventDefault()
    if (opening) return
    setOpening(true)
    timerRef.current = setTimeout(() => navigate(to), OPEN_DURATION)
  }

  return (
    <Link
      to={to}
      className={`book-card${opening ? ' is-opening' : ''}`}
      onClick={handleClick}
    >
      <div className="book-card-cover">
        {/* 표지를 넘기면 보이는 속지 */}
        <div className="book-card-pages" aria-hidden="true">
          <span className="book-card-pages-title">{book.title}</span>
          <span className="book-card-pages-author">{book.author}</span>
        </div>

        {/* 넘어가는 표지 (앞면: 표지 그림, 뒷면: 면지) */}
        <div className="book-card-face">
          <div className="book-card-front">
            {book.coverImageUrl ? (
              <img src={book.coverImageUrl} alt={`${book.title} 표지`} />
            ) : (
              <div
                className="book-card-placeholder"
                style={{ '--tone': pickTone(book.id) }}
              >
                <span className="book-card-placeholder-title">{book.title}</span>
                <span className="book-card-placeholder-author">{book.author}</span>
              </div>
            )}
          </div>
          <div className="book-card-back" aria-hidden="true" />
        </div>
      </div>

      <div className="book-card-tag">
        <strong>{book.title}</strong>
        <span>
          {book.author} · {new Date(book.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>
    </Link>
  )
}
