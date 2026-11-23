import { ApiError, HTTP_STATUS } from '../constants/http.js'

const OPENAI_IMAGE_API_URL = 'https://api.openai.com/v1/images/generations'

// OpenAI 응답 상태 코드를 사용자에게 보여줄 문구로 변환
async function getErrorMessage(res) {
  if (res.status === HTTP_STATUS.UNAUTHORIZED) return 'API 키가 올바르지 않아요. 키를 다시 확인해 주세요.'
  if (res.status === HTTP_STATUS.TOO_MANY_REQUESTS) return '요청 한도를 초과했어요. 잠시 후 다시 시도하거나 결제 한도를 확인해 주세요.'
  if (res.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) return 'OpenAI 서버에 문제가 있어요. 잠시 후 다시 시도해 주세요.'
  try {
    const data = await res.json()
    if (data.error?.message) return data.error.message
  } catch {
    // 응답 본문이 JSON이 아니면 기본 문구 사용
  }
  return `표지 생성에 실패했어요 (${res.status})`
}

// 제목·저자·내용으로 표지를 생성하고 Data URL(base64)로 반환
export async function generateCoverImage({ apiKey, quality, title, author, content }) {
  const prompt = `
    # 역할
    전문 책 표지 생성 AI

    # 지침
    - 주어진 책 이름, 작가, 내용을 바탕으로 가장 적합한 책 표지 만들기
    - 책 이름과 작가 이름이 표지에 나오도록 하기

    제목: ${title}
    작가: ${author}
    내용: ${content}
    `

  let res
  try {
    res = await fetch(OPENAI_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: 1,
        size: '1024x1536',
        quality,
        output_format: 'png',
      }),
    })
  } catch {
    // 브라우저는 CORS 헤더가 없는 오류 응답(잘못된 키의 401 등)을 막아서 상태 코드를 알 수 없음
    // → 오프라인일 때만 네트워크 문제로 보고, 온라인이면 키 문제일 가능성이 높다고 안내
    if (!navigator.onLine) {
      throw new ApiError('인터넷 연결이 끊겨 있어요. 연결을 확인한 뒤 다시 시도해 주세요.')
    }
    throw new ApiError('OpenAI 요청이 거절됐어요. API 키가 올바른지 확인해 주세요.')
  }

  if (!res.ok) throw new ApiError(await getErrorMessage(res), res.status)

  const data = await res.json()
  const b64Json = data.data?.[0]?.b64_json
  if (!b64Json) throw new Error('생성된 이미지를 받지 못했어요. 다시 시도해 주세요.')

  return `data:image/png;base64,${b64Json}`
}
