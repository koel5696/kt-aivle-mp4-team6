// 표지 이미지 관련 도우미 (저장은 api/books.js의 createBook · updateBook으로 처리)

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
    // Data URL 형식(data:image/webp, data:image/png 등)에 맞춰 확장자를 정함
    const ext = imgUrl.match(/^data:image\/(\w+)/)?.[1] ?? 'webp'
    link.download = `${title}_cover.${ext}`

    document.body.appendChild(link)
    link.click()
    link.remove()

    return {success:true, message:"이미지 다운로드 시작했습니다."}
  }catch(error){
    return {success:false, message:"이미지 다운로드 실패했습니다."}
  }
}
