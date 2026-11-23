import '../styles/Pagination.css'

const WINDOW = 5 // 한 번에 보여줄 페이지 번호 개수

// 목록 페이지네이션: [이전] 1 2 3 4 5 [다음]
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  let start = Math.max(1, page - Math.floor(WINDOW / 2))
  const end = Math.min(totalPages, start + WINDOW - 1)
  start = Math.max(1, end - WINDOW + 1)

  const pages = []
  for (let p = start; p <= end; p += 1) pages.push(p)

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        이전
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`page-btn${p === page ? ' is-active' : ''}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        다음
      </button>
    </nav>
  )
}
