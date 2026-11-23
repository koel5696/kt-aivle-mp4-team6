const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations" 
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

 export async function generateBookCover({book, apiKey, quality='low'}){
        
    if(!apiKey.trim()) return;

    const prompt = `
    #역할
    전문 책 표지 생성 AI
    #지침
    - 주어진 책 이름, 작가, 내용을 바탕으로 가장 적합한 책 표지 만들어
    - 책 이름, 작가 이름이 표지에 나오도록
    - 
    제목: ${book.title}
    작가: ${book.author}
    내용: ${book.content}
    `

    const res = await fetch(OPENAI_IMAGE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization:`Bearer ${apiKey}`
        },

        body:JSON.stringify({
            model: 'gpt-image-2',
            prompt,
            n:1,
            size:'1024x1536',
            quality: `${quality}`,
            output_format:'png'
        })
    });

    const data = await res.json();

    if(!res.ok){ 
        throw new Error(data.error?.message || 'OpenAI 표지 생성 불가...');
    }
    
    const b64Json = data.data?.[0]?.b64_json;

    if(!b64Json){ throw new Error('이미지 데이터 없음'); }

    return `data:image/png;base64,${b64Json}`;
}