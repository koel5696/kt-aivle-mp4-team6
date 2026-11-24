import { ApiError } from '../constants/http.js'

const IMAGE_SERVER = 'http://localhost:3000'

// OpenAI base64 이미지를 json-server db.json 해당 book id에 patch
export async function uploadCover(id, imgUrl) {
  
  try {
    const res = await fetch(`${IMAGE_SERVER}/books/${id}`,  {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coverImageUrl: imgUrl,
      }),
    })
    
    if (!res.ok) throw new ApiError(`표지 업로드에 실패했어요 (${res.status})`, res.status)

    const data = await res.json()
    return data.coverImageUrl
  } catch (error){
    if(error instanceof ApiError) throw error

    throw new ApiError('이미지 서버에 연결할 수 없어요. 이미지 서버(3000)가 켜져 있는지 확인해 주세요.')
  }  
}

export async function downloadCover(title, imgUrl){
  if (!imgUrl) {
    return{
      success: false,
      message: "다운로드할 표지 없음"
    }
  }

  try{
    const link = document.createElement('a')
    link.href = imgUrl
    link.download = `${title}_cover.webp`

    document.body.appendChild(link)
    link.click()
    link.remove()

    return {success:true, message:"이미지 다운로드 시작했습니다."}
  }catch(error){
    return {success:false, message:"이미지 다운로드 실패했습니다."}
  }
}
