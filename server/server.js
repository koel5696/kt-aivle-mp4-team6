import express from 'express'
import multer from 'multer'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const app = express()
const PORT = 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '../uploads')

// 폴더 자동 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

app.use(cors())

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: '이미지가 없습니다.'
    })
  }

  res.json({
    imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`
  })
})

app.use('/uploads', express.static(uploadDir))

// 오류 확인용 미들웨어
app.use((err, req, res, next) => {
  console.error('이미지 업로드 오류:', err)

  res.status(500).json({
    message: err.message || '이미지 업로드 실패'
  })
})

app.listen(PORT, () => {
  console.log(`이미지 서버 실행: http://localhost:${PORT}`)
  console.log(`이미지 저장 위치: ${uploadDir}`)
})