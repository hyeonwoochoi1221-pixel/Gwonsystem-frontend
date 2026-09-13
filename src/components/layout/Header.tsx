import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/logo.svg?react';
import './Header.css';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 35) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className={`header-fixed-container ${isScrolled ? 'is-scrolled' : ''}`}>

        {/* 1단: 로그인/계정 생성 전용 탑바 */}
        <div className="login-top-header">
          <div className="login-header-inner">
            <span className="portal-badge">GWON INTRANET PORTAL</span>
            <div className="login-right">
              <Link to="/login" className="login-btn-link">Login</Link>
              <span className="divider">|</span>
              <Link to="/register" className="login-btn-link">Create Account</Link>
            </div>
          </div>
        </div>

        {/* 2단: 메인 네비게이션 헤더 (다크모드 토글 버튼 탑재) */}
        <div className="main-nav-bar">
          <div className="nav-header-inner">
            <div className="logo-area">
              <Link to="/" className="logo-link" onClick={closeMenu}>
                <Logo className="logo-svg" />
                <span className="system-title">GWON SYSTEM</span>
              </Link>
            </div>

            {/* 네비게이션 메뉴 및 테마 전환 버튼 */}
            <nav className={`nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
              <Link to="/#about" className="nav-item-box" onClick={closeMenu}>회사소개</Link>
              <Link to="/notice" className="nav-item-box" onClick={closeMenu}>공지사항</Link>
              <Link to="/services" className="nav-item-box" onClick={closeMenu}>주요기술</Link>
              <Link to="/contact" className="nav-item-box" onClick={closeMenu}>문의하기</Link>

              {/* 메인 헤더로 옮겨온 테마 스위치 */}
              <button
                type="button"
                className="main-theme-toggle-btn"
                onClick={() => setIsDark(!isDark)}
                title="다크/라이트 모드 전환"
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </nav>

            {/* 모바일 햄버거 토글 버튼 */}
            <button
              type="button"
              className={`hamburger-btn ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="메뉴 열기/닫기"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>
        </div>
      </header>

      {/* 헤더 fixed로 인한 본문 겹침 방지 스페이서 */}
      <div className="header-placeholder"></div>
    </>
  );
}
