// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/common/ScrollToTopButton'; // 버튼 컴포넌트
import HomePage from './pages/home/HomePage';
import NoticeListPage from './pages/notice/NoticeListPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notice" element={<NoticeListPage />} />
        </Routes>

        <Footer />

        {/* 플로팅 최상단 이동 버튼 */}
        <ScrollToTopButton />
      </div>
    </Router>
  );
}

export default App;
