import { useState } from "react";
import { Link } from "react-router-dom";
import CoverGenerator from "./CoverGenerator.jsx";

// 입력 최대 글자 수 (유효성 검사: 길이 제한)
const MAX_LENGTH = {
  title: 50,
  author: 20,
  content: 1000,
};

export default function BookForm({
  heading,
  form,
  setForm,
  error,
  submitting,
  onSubmit,
  onCoverChange,
}) {
    const { title, author, content, coverImageUrl } = form
    const [isGenerating, setIsGenerating] = useState(false)

    const [isUnsavedCover, setIsUnsavedCover] = useState(false)

    const unsavedCover = Boolean(coverImageUrl) && isUnsavedCover

    // 입력 칸의 name을 키로 써서, 기존 값은 복사하고 바뀐 칸만 덮어씀 (불변 업데이트)
    function handleChange(event) {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    function setCoverImageUrl(url) {
        setForm((prev) => ({ ...prev, coverImageUrl: url }))
        setIsUnsavedCover(true)
        onCoverChange?.(true)
    }

    function handleCancel(event) {
        if (unsavedCover && !window.confirm("저장하지 않은 표지는 사라져요. 나갈까요?")) {
            event.preventDefault()
        }
    }

    return (
        <section className="book-form">
            <h2>{heading}</h2>

            <div className="book-form-content">
                <div className="book-form-img-section">
                    <div className="book-form-img">
                        {coverImageUrl ? (
                            <>
                                <img src={coverImageUrl} alt="책 표지" />

                                <button
                                    type="button"
                                    className="book-form-img-remove"
                                    onClick={() => setCoverImageUrl('')}
                                    disabled={isGenerating || submitting}
                                    title="표지 삭제"
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <span>표지 없음</span>
                        )}
                    </div>

                    {unsavedCover && (
                        <p className="cover-unsaved-notice">
                            아직 저장되지 않은 표지예요. 저장하지 않고 나가면 사라져요.
                        </p>
                    )}

                    <CoverGenerator
                        title={title}
                        author={author}
                        content={content}
                        hasCover={Boolean(coverImageUrl)}
                        onGenerated={setCoverImageUrl}
                        onBusyChange={setIsGenerating}
                        successMessage="표지를 만들었어요. 저장해야 반영돼요"
                        description="입력한 제목·저자·내용으로 표지를 그려요. API 키는 저장되지 않고 호출시 비용이 발생해요."
                        disabled={submitting}
                        stacked
                    />
                </div>
                <form className="form" onSubmit={onSubmit}>
                    <label>
                        책 제목
                        <input
                            name="title"
                            value={title}
                            onChange={handleChange}
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
                            name="author"
                            value={author}
                            onChange={handleChange}
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
                            name="content"
                            value={content}
                            onChange={handleChange}
                            placeholder="책의 내용을 작성해주세요."
                            maxLength={MAX_LENGTH.content}
                        />
                        <span className={`char-count ${content.length >= MAX_LENGTH.content ? "char-count-max" : ""}`}>
                            {content.length} / {MAX_LENGTH.content}
                        </span>
                    </label>

                    {error && <p className="error">{error}</p>}

                    <div className="book-form-button">
                        <Link to="/" className="btn" onClick={handleCancel}>취소</Link>
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={submitting || isGenerating}
                            title={isGenerating ? "표지를 만드는 중에는 저장할 수 없어요" : undefined}
                        >
                            {submitting ? '저장 중…' : isGenerating ? '표지 생성 중…' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}
