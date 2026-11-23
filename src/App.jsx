import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import BookList from './pages/BookList.jsx'
import BookDetail from './pages/BookDetail.jsx'
import BookCreate from './pages/BookCreate.jsx'
import BookEdit from './pages/BookEdit.jsx'
import Footer from './components/Footer.jsx'
import ToastProvider from './components/ToastProvider.jsx'
import NotFound from './pages/NotFound.jsx'

// 라우터 설정 — 화면 구성은 README "화면 구성" 참고
export default function App() {
  return (
    <ToastProvider>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/books/new" element={<BookCreate />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/books/:id/edit" element={<BookEdit />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </ToastProvider>
  )
}
