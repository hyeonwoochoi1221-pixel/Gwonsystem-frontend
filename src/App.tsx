import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/home/HomePage';
import NoticeListPage from './pages/notice/NoticeListPage';

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notice" element={<NoticeListPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
