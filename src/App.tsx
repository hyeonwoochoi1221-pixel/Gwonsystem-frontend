// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import HomePage from './pages/home/HomePage';
import NoticeListPage from './pages/notice/NoticeListPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import './App.css';

export default function App() {
  return (
    <Router>
      {/* 🌟 세련된 토스트 팝업 컨테이너 등록 */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 2500,
          style: {
            background: 'var(--bg-card, #1c1c24)',
            color: 'var(--text-main, #f1f5f9)',
            border: '1px solid var(--border-color, #2e2e38)',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            borderRadius: '8px',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#0ea5e9',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notice" element={<NoticeListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
        <Footer />
        <ScrollToTopButton />
      </div>
    </Router>
  );
}
