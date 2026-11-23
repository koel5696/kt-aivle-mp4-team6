import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook } from '../api/books.js'
import useBook from '../hooks/useBook.js'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/BookDetail.css'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { book, loading, error: loadError } = useBook(id)
  const [deleting, setDeleting] = useState(false)
  
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [quality, setQuality] = useState('low')
  
  async function handleDelete() {
    if (!book || !window.confirm(`「${book.title}」을(를) 삭제할까요?`)) return
    setDeleting(true)
    try {
      await deleteBook(book.id)
      toast.success(`「${book.title}」을(를) 삭제했어요`)
      navigate('/')
    } catch (err) {
      toast.error(`도서 삭제에 실패했어요 (${err.message})`)
      setDeleting(false)
    }
  }

  if (loading) return <p>불러오는 중…</p>
  if (!book) {
    const message =
      loadError === '서버에 연결할 수 없습니다' ? loadError : '도서를 찾을 수 없습니다'
    return (
      <section>
        <p className="error">{message}</p>
        <div className="actions">
          <Link to="/" className="btn">목록으로</Link>
        </div>
      </section>
    )
  }

  const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations" 
  const API_BASE = 'http://localhost:3000/books/'

  async function handleGenerateCover(){
      
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
      if(!apiKey.trim()) return;

      setApiKey(apiKey.trim());
      setIsGenerating(true);

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

      if(!res.ok){ 
        setIsGenerating(false);
        throw new Error('OpenAI 표지 생성 불가...');
      }
      console.log(res);
      const data = await res.json();
      const b64Json = data.data?.[0]?.b64_json;

      if(!b64Json){
        setIsGenerating(false);
        throw new Error('이미지 ');
      }

      const imageSrc = `data:image/png;base64,${b64Json}`;
      try{
          await fetch(`${API_BASE}${book.id}`, {
              method: 'PATCH',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  coverImageUrl: imageSrc,
                  updatedAt: new Date().toISOString()
              }),
          });
      }catch(e){
          console.log(e.message);
      }finally{
        setIsGenerating(false);
        setApiKey('');
      }
  }

  return (
    <div className='book-detail-section'>
      <h2>도서 정보</h2>
      <section className="detail">
        <div className="detail-img">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={`${book.title} 표지`}
            />
          ) : (
            <span>표지 없음</span>
          )}
        </div>

        <div className="detail-body">
          <div className='detail-body-title'>
            <h2>{book.title}</h2>
            <h3 className="muted">{book.author}</h3>
            <p className="muted">
              작성 {new Date(book.createdAt).toLocaleString('ko-KR')} · 수정 {new Date(book.updatedAt).toLocaleString('ko-KR')}
            </p>
          </div>
          <p className="detail-content">{book.content}</p>

          <div className="detail-buttons">
            <Link to={`/books/${book.id}/edit`} className="btn btn-primary">수정</Link>
            <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? '삭제 중…' : '삭제'}
            </button>
          </div>

          <div className="book-form-img-section">
              <input type="password" placeholder="API키를 입력하세요."  value={apiKey} onChange={event=> setApiKey(event.target.value)}/>
              <label htmlFor="quality">표지 화질:</label>
              <select id="qualitySelector" name="quality" onChange={event => setQuality(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="auto">Auto</option>
              </select>
              {console.log(quality)}
              <div className="book-form-img-button">
                  <button className="btn btn-primary" type="submit"  onClick={handleGenerateCover} disabled={isGenerating}>
                    {isGenerating ? "생성 중 ...": "AI 표지 생성"} </button>
                  <button className="btn btn-danger" type="submit"  onClick={handleGenerateCover} disabled={isGenerating}>
                    {isGenerating ? "생성 중 ...": "AI 표지 재생성"} </button>
              </div>
          </div>


          {/* <div className="genCover">
            <div className = "apiDiv">
              <label htmlFor="quality">API KEY:</label>
              <input placeholder="OPENAI API KEY" type="password" value={apiKey} onChange={event=> setApiKey(event.target.value)}/>
              <label htmlFor="quality">표지 화질:</label>
              <select id="qualitySelector" name="quality" onChange={event => setQuality(event.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="auto">Auto</option>
              </select>
              
            </div>
            <div className="book-form-img-button">
              <button className="btn btn-primary" type="button" onClick={handleGenerateCover} disabled= {isGenerating}>
                {isGenerating? "생성 중 ...": "AI 표지 생성"}</button>
            </div>
          </div> */}
        </div>
      </section>
    </div>
  )
}
