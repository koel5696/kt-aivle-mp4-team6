// 1일차 Mock 데이터 — db.json과 같은 구조
// 2일차(M3)에 json-server GET 연동으로 교체 예정
const mockBooks = [
  {
    id: 1,
    title: '별빛 아래의 서점',
    author: '홍길동',
    content: '작은 마을 서점의 1년을 담은 에세이',
    coverImageUrl: '',
    createdAt: '2026-11-20T09:00:00.000Z',
    updatedAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: 2,
    title: '바다를 건너는 고양이',
    author: '김하늘',
    content: '항구 마을에 사는 고양이가 먼 섬으로 떠나는 모험 동화',
    coverImageUrl: '',
    createdAt: '2026-11-20T09:10:00.000Z',
    updatedAt: '2026-11-20T09:10:00.000Z',
  },
  {
    id: 3,
    title: '새벽 4시의 코드',
    author: '이개발',
    content: '신입 개발자가 첫 서비스 장애를 겪으며 성장하는 이야기',
    coverImageUrl: '',
    createdAt: '2026-11-20T09:20:00.000Z',
    updatedAt: '2026-11-20T09:20:00.000Z',
  },
]

export default mockBooks
