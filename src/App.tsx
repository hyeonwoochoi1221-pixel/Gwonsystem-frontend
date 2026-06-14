import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // 글로벌 스타일 적용
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/home/HomePage';
// import NoticePage from './pages/notice/NoticePage'; // 나중에 페이지가 생기면 추가

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header /> {/* 모든 페이지에서 고정으로 보임 */}

        {/* URL에 따라 바뀌는 콘텐츠 영역 */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/notice" element={<NoticePage />} /> */}
        </Routes>

        <Footer /> {/* 모든 페이지에서 고정으로 보임 */}
      </div>
    </Router>
  );
}

export default App;
