import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // 로그인 유저 정보 상태
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // 테마 상태
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // 스크롤 감지
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

  // 테마 적용
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

  // 페이지 이동 시 로컬스토리지 로그인 세션 정보 동기화
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole');
    setUsername(storedUser);
    setUserRole(storedRole);
  }, [location]);

  // 토스트 팝업 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setUsername(null);
    setUserRole(null);

    toast.success('안전하게 로그아웃되었습니다.');
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  // 테마 토글 핸들러
  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <>
      <header className={`header-fixed-container ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* 1단: 탑바 (로그인 상태에 따라 환영 문구 또는 로그인 링크 표시) */}
        <div className="login-top-header">
          <div className="login-header-inner">
            <span className="portal-badge">GWON INTRANET PORTAL</span>

            <div className="login-right">
              {username ? (
                // 💡 로그인 완료 상태: 닉네임, 뱃지, 로그아웃 버튼 노출
                <div className="user-greet-box">
                  <span className="user-greet-text">
                    <strong>{username}</strong>님 환영합니다
                  </span>
                  {userRole && (
                    <span className="user-role-tag">
                      {userRole === 'ROLE_SUPERVISOR'
                        ? '관리자'
                        : userRole === 'ROLE_REGULAR'
                          ? '정회원'
                          : '일반회원'}
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn-header-logout"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                // 비로그인 상태
                <>
                  <Link to="/login" className="login-btn-link">Login</Link>
                  <span className="divider">|</span>
                  <Link to="/register" className="login-btn-link">Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2단: 메인 네비게이션 헤더 */}
        <div className="main-nav-bar">
          <div className="nav-header-inner">
            <div className="logo-area">
              <Link to="/" className="logo-link" onClick={closeMenu}>
                <Logo className="logo-svg" />
                <span className="system-title">GWON SYSTEM</span>
              </Link>
            </div>

            {/* 네비게이션 메뉴 및 하드웨어 토글 스위치 */}
            <nav className={`nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
              <Link to="/#about" className="nav-item-box" onClick={closeMenu}>회사소개</Link>
              <Link to="/notice" className="nav-item-box" onClick={closeMenu}>공지사항</Link>
              <Link to="/services" className="nav-item-box" onClick={closeMenu}>주요기술</Link>
              <Link to="/contact" className="nav-item-box" onClick={closeMenu}>문의하기</Link>

              {/* ⚡ 반도체 테크 인라인 슬라이드 토글 스위치 */}
              <div
                className={`tech-theme-switch ${isDark ? 'is-dark' : 'is-light'}`}
                onClick={handleToggleTheme}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleTheme();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="다크 및 라이트 테마 전환 스위치"
              >
                <span className="switch-label label-light">LIGHT</span>
                <div className="switch-track">
                  <div className="switch-thumb">
                    {/* 웨이퍼/IC 전원 인가 LED 인디케이터 코어 */}
                    <span className="thumb-core-led"></span>
                  </div>
                </div>
                <span className="switch-label label-dark">DARK</span>
              </div>
            </nav>

            {/* 모바일 햄버거 토글 */}
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
