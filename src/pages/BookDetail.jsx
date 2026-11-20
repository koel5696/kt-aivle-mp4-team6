import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBook, getBook } from '../api/books.js'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [error, setError] = useState(null)
  const [loadedId, setLoadedId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [quality, setQuality] = useState('low')
  const loading = loadedId !== id

  useEffect(() => {
    let cancelled = false
    getBook(id)
      .then((data) => {
        if (cancelled) return
        setBook(data)
        setError(null)
        setLoadedId(id)
      })
      .catch((err) => {
        if (cancelled) return
        setBook(null)
        setError(err.message)
        setLoadedId(id)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!book || !window.confirm('이 도서를 삭제할까요?')) return
    setDeleting(true)
    setError(null)
    try {
      await deleteBook(book.id)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (loading) return <p>불러오는 중…</p>
  if (!book) {
    const message =
      error === '서버에 연결할 수 없습니다' ? error : '도서를 찾을 수 없습니다'
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

      const data = await res.json();
      const b64Json = data.data?.[0]?.b64_json;

      if(!b64Json){
        setIsGenerating(false);
        throw new Error('no image found');
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
                  updatedAt: Date.now()
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
    <section className="detail">
      {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={`${book.title} 표지`} className="cover detail-cover" />
      ) : (
        <div className="cover cover-empty detail-cover">표지 없음</div>
      )}
      
      
      <div className="detail-body">
        <h2>{book.title}</h2>
        <p className="muted">{book.author}</p>
        <p className="muted">
          작성일 {new Date(book.createdAt).toLocaleString('ko-KR')} · 수정일{' '}
          {new Date(book.updatedAt).toLocaleString('ko-KR')}
        </p>
        <p className="content">{book.content}</p>
        {error && <p className="error">{error}</p>}

        <div className="actions">
          <Link to={`/books/${book.id}/edit`} className="btn">수정</Link>
          <button className="btn btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
            삭제
          </button>
          
        </div>
        <div className="genCover">
          <input placeholder="OPENAI API KEY" type="password" value={apiKey} onChange={event=> setApiKey(event.target.value)}/>
          <label htmlFor="quality">표지 화질</label>
          <select id="qualitySelector" name="quality" onChange={event => setQuality(event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="auto">Auto</option>
          </select>
          {console.log(quality)}
          <button className="btn btn-primary" type="button" onClick={handleGenerateCover} disabled= {isGenerating}>
            {isGenerating? "생성 중 ...": "AI 표지 생성"}</button>
        </div>
      </div>
    </section>
  )
}
