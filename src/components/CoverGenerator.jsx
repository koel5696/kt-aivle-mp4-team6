import { useState } from 'react'
import { generateCoverImage } from '../api/openai.js'
import { useToast } from '../contexts/ToastContext.js'
import '../styles/CoverGenerator.css'

// AI 표지 만들기 패널 (상세 · 등록 · 수정 화면 공통)
// onGenerated(dataUrl): 생성된 표지를 받아 처리. 실패하면 throw → 패널에 안내 표시
export default function CoverGenerator({
  title,
  author,
  content,
  hasCover,
  onGenerated,
  onBusyChange,
  successMessage,
  description,
  disabled = false,
  stacked = false,
}) {
  const toast = useToast()
  const [apiKey, setApiKey] = useState('')
  const [quality, setQuality] = useState('low')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  function setBusy(busy) {
    setIsGenerating(busy)
    onBusyChange?.(busy)
  }

  async function handleGenerate() {
    const key = apiKey.trim()
    if (!key) {
      setError('API 키를 입력해 주세요.')
      return
    }
    if (!title.trim() || !author.trim() || !content.trim()) {
      setError('제목, 저자, 내용을 먼저 입력해 주세요.')
      return
    }

    setBusy(true)
    setError(null)
    try {
      const dataUrl = await generateCoverImage({
        apiKey: key,
        quality,
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
      })
      await onGenerated(dataUrl)
      setApiKey('')
      toast.success(successMessage)
    } catch (err) {
      // 실패하면 입력한 키는 그대로 두어 바로 고칠 수 있게 함
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const locked = disabled || isGenerating

  return (
    <div className={`cover-gen${stacked ? ' cover-gen-stacked' : ''}`}>
      <div className="cover-gen-head">
        <h3 className="cover-gen-title">AI 표지 만들기</h3>
        <p className="cover-gen-desc">{description}</p>
      </div>

      <div className="cover-gen-fields">
        <label className="cover-gen-field cover-gen-key">
          <span>OpenAI API 키</span>
          <input
            type="password"
            placeholder="sk-..."
            autoComplete="off"
            value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value)
              if (error) setError(null)
            }}
            disabled={locked}
            aria-invalid={error ? true : undefined}
          />
        </label>

        <label className="cover-gen-field">
          <span>화질</span>
          <select
            value={quality}
            onChange={(event) => setQuality(event.target.value)}
            disabled={locked}
          >
            <option value="low">Low (빠름)</option>
            <option value="medium">Medium (보통)</option>
            <option value="high">High (느림)</option>
            <option value="auto">Auto (자동)</option>
          </select>
        </label>
      </div>

      {error && (
        <p className="cover-gen-error" role="alert">
          {error}
        </p>
      )}

      <button
        className="btn btn-primary cover-gen-submit"
        type="button"
        onClick={handleGenerate}
        disabled={locked}
      >
        {isGenerating
          ? '표지 그리는 중…'
          : hasCover ? 'AI 표지 다시 만들기' : 'AI 표지 만들기'}
      </button>
      {isGenerating && (
        <p className="cover-gen-hint">최대 1분 정도 걸려요</p>
      )}
    </div>
  )
}
