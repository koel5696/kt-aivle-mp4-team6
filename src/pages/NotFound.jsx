import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

// 찾는 대상이 없을 때 공통 안내 화면 (404, 없는 도서, 서버 연결 실패 등)
export default function NotFound({
  title = '길을 잃으셨나요?',
  desc = '요청하신 페이지를 찾을 수 없어요.\n주소가 바뀌었거나 삭제된 페이지일 수 있어요.',
}) {
  return (
    <section className="not-found">
      <p className="not-found-icon">📚</p>
      <h2 className="not-found-title">{title}</h2>
      <p className="not-found-desc">{desc}</p>
      <Link to="/" className="btn btn-primary">목록으로 돌아가기</Link>
    </section>
  )
}