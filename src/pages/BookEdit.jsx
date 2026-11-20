import { useParams } from 'react-router-dom'

// F-04 도서 수정
// TODO(2일차 M4): 기존 값 불러오기, 변경된 필드 + updatedAt만
//       PATCH /books/:id → 상세(/books/:id)로 이동
export default function BookEdit() {
  const { id } = useParams()

  return (
    <section>
      <h2>도서 수정</h2>
      <p className="muted">#{id} 수정 폼 작업 예정</p>
    </section>
  )
}
