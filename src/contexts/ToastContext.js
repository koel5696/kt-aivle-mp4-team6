import { createContext, useContext } from 'react'

// 토스트 알림 컨텍스트 — ToastProvider 안에서 useToast()로 사용
export const ToastContext = createContext(null)

// 사용 예: const toast = useToast(); toast.success('저장했어요'); toast.error('실패했어요')
export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) throw new Error('useToast는 ToastProvider 안에서만 사용할 수 있습니다')
  return toast
}
