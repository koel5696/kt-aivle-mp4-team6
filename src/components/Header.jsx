import { Link, NavLink } from 'react-router-dom'
import '../styles/Header.css'

// C-01 공통 레이아웃: 로고 + 네비게이션
export default function Header() {
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
        </nav>
      </div>
    </header>
  )
}
