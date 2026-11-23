import { Link } from "react-router-dom";
import {generateBookCover} from '../api/cover.js'

export default function BookForm({
  heading,
  title,
  setTitle,
  author,
  setAuthor,
  content,
  setContent,
  error,
  submitting,
  onSubmit,
}) {
    return (
        <section className="book-form">
            <h2>{heading}</h2>

            <div className="book-form-content">
                <div className="book-form-img-section">
                    <div className="book-form-img">
                        <span>표지 없음</span>
                    </div>
                    <input type="password" placeholder="API키를 입력하세요."/>
                    <div className="book-form-img-button">
                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                            생성
                        </button>
                        <button className="btn btn-danger" type="submit" disabled={submitting}>
                            재생성
                        </button>
                    </div>
                </div>
                <form className="form" onSubmit={onSubmit}>
                    <label>
                        책 제목
                        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="책의 제목을 작성해주세요."/>
                    </label>

                    <label>
                        저자
                        <input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="책의 저자를 작성해주세요."/>
                    </label>

                    <label>
                        내용
                        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="책의 내용을 작성해주세요."/>
                    </label>

                    {error && <p className="error">{error}</p>}

                    <div className="book-form-button">
                        <Link to="/" className="btn">취소</Link>
                        <button className="btn btn-primary" type="submit" disabled={submitting}>
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )   
}