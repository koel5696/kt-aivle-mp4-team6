import { Link, NavLink } from 'react-router-dom'

// C-01 공통 레이아웃: 로고 + 네비게이션
export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">📚 AI 표지 도서관</Link>
        <nav className="nav">
          <NavLink to="/" end>목록</NavLink>
          <NavLink to="/books/new">신규 등록</NavLink>
        </nav>
      </div>
    </header>
  )
}
