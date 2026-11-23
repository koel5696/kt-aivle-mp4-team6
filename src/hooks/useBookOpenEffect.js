import { useSyncExternalStore } from 'react'

// 책 펼침 효과 켜기/끄기 설정 (이 브라우저에만 저장되는 개인 설정)
const STORAGE_KEY = 'book-open-effect'
const CHANGE_EVENT = 'book-open-effect-change'

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true // 저장소를 못 쓰는 환경이면 기본값(켜짐)
  }
}

function subscribe(callback) {
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', callback) // 다른 탭에서 바꾼 경우
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function setBookOpenEffect(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // 저장 실패해도 이번 화면에서는 반영되도록 이벤트만 보냄
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

// [켜져 있는지, 바꾸는 함수]
export default function useBookOpenEffect() {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => true)
  return [enabled, setBookOpenEffect]
}
