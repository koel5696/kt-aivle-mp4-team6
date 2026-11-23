import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useBookOpenEffect from '../hooks/useBookOpenEffect.js'
import '../styles/BookCard.css'

// 책 펼침 → 책 속으로 들어가기 → 상세 페이지 등장 (전체 약 1초)
// 표지 펼침 시간은 BookCard.css의 --open-duration(550ms)과 맞춤
const ZOOM_START = 400 // 표지가 거의 펼쳐졌을 때 확대 시작
const ZOOM_DURATION = 360 // 속지가 화면을 덮을 때까지
const FADE_DURATION = 240 // 상세 페이지 위의 속지가 걷히는 시간

// 속지 자리에 같은 크기의 판을 띄워 화면 전체로 키운 뒤, 다 덮이면 onCovered 실행
function zoomIntoBook(pagesEl, onCovered) {
  const rect = pagesEl.getBoundingClientRect()
  const overlay = document.createElement('div')
  overlay.className = 'book-zoom-overlay'
  Object.assign(overlay.style, {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  })
  document.body.appendChild(overlay)

  const scale = Math.max(window.innerWidth / rect.width, window.innerHeight / rect.height) * 1.15
  const dx = window.innerWidth / 2 - (rect.left + rect.width / 2)
  const dy = window.innerHeight / 2 - (rect.top + rect.height / 2)

  const zoom = overlay.animate(
    [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
    ],
    { duration: ZOOM_DURATION, easing: 'cubic-bezier(0.6, 0, 0.3, 1)', fill: 'forwards' }
  )
  // 이동·정리는 타이머로 처리 (탭이 가려져 애니메이션이 멈춰도 이동은 진행되도록)
  setTimeout(() => {
    zoom.finish()
    onCovered()
    // 상세 페이지 위의 속지를 걷어 냄
    overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: FADE_DURATION,
      easing: 'ease-out',
      fill: 'forwards',
    })
    setTimeout(() => overlay.remove(), FADE_DURATION + 50)
  }, ZOOM_DURATION)
}

// 표지가 없는 책에 입힐 양장본 색상 (책마다 고정된 색이 나오도록 id로 선택)
const CLOTH_TONES = ['#6b4f3a', '#3f5a4c', '#2f4a6b', '#7a3b3b', '#8a6d3b', '#4a4a5e']

function pickTone(id) {
  const hash = String(id)
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return CLOTH_TONES[hash % CLOTH_TONES.length]
}

// 목록 카드: 진열대에 세워 둔 표지 + 선반 아래 이름표(제목 · 저자 · 등록일)
// 클릭하면 표지가 펼쳐지고 책 속으로 들어가듯 상세 페이지로 이동 (헤더 스위치로 끌 수 있음)
export default function BookCard({ book }) {
  const navigate = useNavigate()
  const [effectOn] = useBookOpenEffect()
  const [opening, setOpening] = useState(false)
  const timerRef = useRef(null)
  const pagesRef = useRef(null)
  const to = `/books/${book.id}`

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleClick(event) {
    // 새 탭 열기(Ctrl·Cmd 클릭 등), 효과 끔, 움직임 줄이기 설정이면 바로 이동
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!effectOn || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    event.preventDefault()
    if (opening) return
    setOpening(true)
    timerRef.current = setTimeout(() => {
      zoomIntoBook(pagesRef.current, () => navigate(to))
    }, ZOOM_START)
  }

  return (
    <Link
      to={to}
      className={`book-card${opening ? ' is-opening' : ''}`}
      onClick={handleClick}
    >
      <div className="book-card-cover">
        {/* 표지를 넘기면 보이는 속지 */}
        <div className="book-card-pages" aria-hidden="true" ref={pagesRef}>
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
