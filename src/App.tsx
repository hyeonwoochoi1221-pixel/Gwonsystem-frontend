// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/home/HomePage';
import NoticeListPage from './pages/notice/NoticeListPage'; // 추가
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notice" element={<NoticeListPage />} /> {/* /notice 경로 매핑 */}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
