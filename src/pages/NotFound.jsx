import { Link } from 'react-router-dom'
import '../styles/NotFound.css'

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="not-found-icon">📚</p>
      <h2 className="not-found-title">길을 잃으셨나요?</h2>
      <p className="not-found-desc">
        요청하신 페이지를 찾을 수 없어요.
        <br />
        주소가 바뀌었거나 삭제된 페이지일 수 있어요.
      </p>
      <Link to="/" className="btn btn-primary">목록으로 돌아가기</Link>
    </section>
  )
}