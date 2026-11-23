import { Link } from "react-router-dom";

// 입력 최대 글자 수 (유효성 검사: 길이 제한)
const MAX_LENGTH = {
  title: 50,
  author: 20,
  content: 1000,
};

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
                        <input
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="책의 제목을 작성해주세요."
                            maxLength={MAX_LENGTH.title}
                        />
                        <span className={`char-count ${title.length >= MAX_LENGTH.title ? "char-count-max" : ""}`}>
                            {title.length} / {MAX_LENGTH.title}
                        </span>
                    </label>

                    <label>
                        저자
                        <input
                            value={author}
                            onChange={(event) => setAuthor(event.target.value)}
                            placeholder="책의 저자를 작성해주세요."
                            maxLength={MAX_LENGTH.author}
                        />
                        <span className={`char-count ${author.length >= MAX_LENGTH.author ? "char-count-max" : ""}`}>
                            {author.length} / {MAX_LENGTH.author}
                        </span>
                    </label>

                    <label>
                        내용
                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="책의 내용을 작성해주세요."
                            maxLength={MAX_LENGTH.content}
                        />
                        <span className={`char-count ${content.length >= MAX_LENGTH.content ? "char-count-max" : ""}`}>
                            {content.length} / {MAX_LENGTH.content}
                        </span>
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