// 앱에서 구분해서 처리하는 HTTP 상태 코드 (JS에는 enum이 없어 고정 객체로 사용)
export const HTTP_STATUS = Object.freeze({
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
})

// 상태 코드를 함께 들고 다니는 에러
// status가 null이면 서버에 연결조차 하지 못한 경우(서버 꺼짐, 네트워크 끊김 등)
export class ApiError extends Error {
  constructor(message, status = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  get isNetworkError() {
    return this.status === null
  }

  get isNotFound() {
    return this.status === HTTP_STATUS.NOT_FOUND
  }

  get isServerError() {
    return this.status !== null && this.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
  }
}
