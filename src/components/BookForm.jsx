import { useState } from "react";
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
  coverImageUrl,
  setCoverImageUrl,
  error,
  submitting,
  onSubmit,
}) {

    const [apiKey, setApiKey] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations" 

    async function handleGenerateCover() {
        const key = apiKey.trim();

        if (!key) {
            alert("API 키를 입력해주세요.");
            return;
        }

        if (!title.trim() || !author.trim() || !content.trim()) {
            alert("책 제목, 저자, 내용을 먼저 입력해주세요.");
            return;
        }

        const prompt = `
        # 역할
        전문 책 표지 생성 AI

        # 지침
        - 주어진 책 이름, 작가, 내용을 바탕으로 가장 적합한 책 표지 만들기
        - 책 이름과 작가 이름이 표지에 나오도록 하기

        제목: ${title}
        작가: ${author}
        내용: ${content}
        `;

        setIsGenerating(true);

        try {
            const res = await fetch(OPENAI_IMAGE_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${key}`,
                },
                body: JSON.stringify({
                    model: "gpt-image-2",
                    prompt,
                    n: 1,
                    size: "1024x1536",
                    quality: "low",
                    output_format: "png",
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.error?.message || "표지 생성에 실패했습니다."
                );
            }

            const data = await res.json();
            const b64Json = data.data?.[0]?.b64_json;

            if (!b64Json) {
                throw new Error("생성된 이미지를 찾을 수 없습니다.");
            }

            // Base64를 이미지 파일로 변환
            const blob = await fetch(`data:image/png;base64,${b64Json}`).then(res => res.blob())

            const formData = new FormData()
            formData.append('image', blob, 'book-cover.png')

            // 이미지 서버에 업로드
            const uploadRes = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            })

            if (!uploadRes.ok) {
                throw new Error('이미지 업로드에 실패했습니다.')
            }

            const uploadData = await uploadRes.json()

            // 이미지 경로만 저장
            setCoverImageUrl(uploadData.imageUrl)

            alert('표지가 생성되었습니다.')
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsGenerating(false);
            setApiKey("");
        }
    }

    function handleRemoveCover() {
        setCoverImageUrl('')
    }

    return (
        <section className="book-form">
            <h2>{heading}</h2>

            <div className="book-form-content">
                <div className="book-form-img-section">
                    <div className="book-form-img">
                        {coverImageUrl ? (
                            <>
                                <img src={coverImageUrl} alt="생성된 책 표지" />

                                <button
                                    type="button"
                                    className="book-form-img-remove"
                                    onClick={handleRemoveCover}
                                    disabled={isGenerating}
                                    title="표지 삭제"
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <span>표지 없음</span>
                        )}
                    </div>
                    <input type="password" value={apiKey} onChange={event=> setApiKey(event.target.value)} placeholder="API키를 입력하세요."/>
                    <div className="book-form-img-button">
                        {!coverImageUrl ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleGenerateCover}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "생성 중..." : "생성"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleGenerateCover}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "생성 중..." : "재생성"}
                            </button>
                        )}
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
                            {submitting ? '저장 중…' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )   
}