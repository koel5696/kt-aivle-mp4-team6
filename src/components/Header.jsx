import { Link, NavLink } from 'react-router-dom'
import useBookOpenEffect from '../hooks/useBookOpenEffect.js'
import '../styles/Header.css'

// C-01 공통 레이아웃: 로고 + 네비게이션
export default function Header() {
  const [effectOn, setEffectOn] = useBookOpenEffect()

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="logo" className="logo-img" />
          <span>걷기가 서재</span>
        </Link>
        <nav className="nav">
          <NavLink to="/" end>목록</NavLink>
          <NavLink to="/books/new">신규 등록</NavLink>
          <button
            type="button"
            className="effect-toggle"
            role="switch"
            aria-checked={effectOn}
            onClick={() => setEffectOn(!effectOn)}
            title={effectOn ? '책 펼침 효과 끄기' : '책 펼침 효과 켜기'}
          >
            <span className="effect-toggle-label">펼침 효과</span>
            <span className="effect-toggle-track" aria-hidden="true">
              <span className="effect-toggle-thumb" />
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}
