import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from '../contexts/ToastContext.js'
import '../styles/Toast.css'

const DURATION = 3000 // 자동으로 사라지기까지(ms)
const ICONS = { success: '✓', error: '!', info: 'i' }

// 화면 하단에 성공 · 실패 · 안내 알림을 띄우는 Provider
// 페이지를 이동해도 유지되도록 App 최상단에서 감쌉니다.
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (type, message) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => dismiss(id), DURATION)
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon" aria-hidden="true">{ICONS[t.type]}</span>
            <span className="toast-message">{t.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(t.id)}
              aria-label="알림 닫기"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
