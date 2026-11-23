const IMAGE_SERVER = 'http://localhost:3001'

// 아직 저장되지 않은 표지(Data URL)인지 확인
export function isUnsavedCover(url) {
  return typeof url === 'string' && url.startsWith('data:')
}

// Data URL 표지를 이미지 서버에 파일로 올리고, 저장된 이미지 주소를 반환
export async function uploadCover(dataUrl) {
  const blob = await fetch(dataUrl).then((res) => res.blob())
  const formData = new FormData()
  formData.append('image', blob, 'book-cover.png')

  let res
  try {
    res = await fetch(`${IMAGE_SERVER}/upload`, { method: 'POST', body: formData })
  } catch {
    throw new Error('이미지 서버에 연결할 수 없어요. 이미지 서버(3001)가 켜져 있는지 확인해 주세요.')
  }
  if (!res.ok) throw new Error(`표지 업로드에 실패했어요 (${res.status})`)

  const data = await res.json()
  return data.imageUrl
}
