// src/components/layout/Header.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import './Header.css';

const SESSION_DURATION_SEC = 30 * 60;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 35);
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

  const syncUserInfo = useCallback(() => {
    const storedUser = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole');
    setUsername(storedUser);
    setUserRole(storedRole);
  }, []);

  useEffect(() => {
    syncUserInfo();
    if (localStorage.getItem('username')) {
      setTimeLeft(SESSION_DURATION_SEC);
    }
  }, [location, syncUserInfo]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (['username', 'userRole', 'lastName', 'firstName', 'last_name', 'first_name'].includes(e.key || '')) {
        syncUserInfo();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncUserInfo]);

  const handleLogout = useCallback((isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastName');
    localStorage.removeItem('firstName');
    localStorage.removeItem('last_name');
    localStorage.removeItem('first_name');
    setUsername(null);
    setUserRole(null);

    if (isTimeout) {
      toast.error('세션이 만료되었습니다. 다시 로그인해 주세요.', { duration: 4000 });
    } else {
      toast.success('안전하게 로그아웃되었습니다.');
    }
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!username) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleLogout(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [username, handleLogout]);

  const handleExtendSession = () => {
    setTimeLeft(SESSION_DURATION_SEC);
    toast.success('로그인 세션이 30분 연장되었습니다.', { id: 'session-extend' });
  };

  const formatTimeKorean = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${String(secs).padStart(2, '0')}초`;
  };

  const closeMenu = () => setIsMenuOpen(false);
  const handleToggleTheme = () => setIsDark((prev) => !prev);

  const getFormattedFullName = () => {
    const lastName = localStorage.getItem('lastName') || localStorage.getItem('last_name') || '';
    const firstName = localStorage.getItem('firstName') || localStorage.getItem('first_name') || '';

    if (lastName || firstName) {
      return `${lastName}${firstName}`.trim();
    }

    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        const lName = parsed.lastName || parsed.last_name || '';
        const fName = parsed.firstName || parsed.first_name || '';
        if (lName || fName) return `${lName}${fName}`.trim();
      } catch (e) {
        // ignore
      }
    }
    return localStorage.getItem('username') || '';
  };

  return (
    <>
      <header className={`header-fixed-container ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* 1단: 상단 유틸 탑바 */}
        <div className="login-top-header">
          <div className="login-header-inner">
            <span className="portal-badge">GWON INTRANET PORTAL</span>

            <div className="login-right">
              {username ? (
                <div className="user-greet-box">
                  <div className="user-auth-meta-group">
                    <div className="meta-col">
                      <span className="user-name-text">{getFormattedFullName()}</span>
                      <Link to="/profile" className="meta-link-action">정보수정</Link>
                    </div>

                    <div className="meta-col">
                      <span className={`session-time-text ${timeLeft <= 300 ? 'warning' : ''}`}>
                        {formatTimeKorean(timeLeft)}
                      </span>
                      <button
                        type="button"
                        className="meta-link-action btn-link"
                        onClick={handleExtendSession}
                      >
                        로그인 연장
                      </button>
                    </div>
                  </div>

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
                    onClick={() => handleLogout(false)}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
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
                <span className="system-title">G-WON SYSTEM</span>
              </Link>
            </div>

            {/* 메인 네비 메뉴 */}
            <nav className={`nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
              <Link to="/#about" className="nav-item-box" onClick={closeMenu}>회사소개</Link>
              <Link to="/notice" className="nav-item-box" onClick={closeMenu}>공지사항</Link>
              <Link to="/services" className="nav-item-box" onClick={closeMenu}>주요기술</Link>
              <Link to="/contact" className="nav-item-box" onClick={closeMenu}>문의하기</Link>

              {/* 🏢 정회원 이상 (ROLE_REGULAR, ROLE_SUPERVISOR) 포털 메뉴 */}
              {(userRole === 'ROLE_REGULAR' || userRole === 'ROLE_SUPERVISOR') && (
                <Link
                  to="/portal"
                  className="nav-item-box portal-nav-item"
                  onClick={closeMenu}
                  style={{ color: 'var(--accent-color)', fontWeight: '700' }}
                >
                  🏢 연구소 포털
                </Link>
              )}

              {/* ⚙️ 슈퍼바이저(ROLE_SUPERVISOR) 전용 시스템 콘솔 메뉴 */}
              {userRole === 'ROLE_SUPERVISOR' && (
                <Link
                  to="/admin"
                  className="nav-item-box admin-nav-item"
                  onClick={closeMenu}
                  style={{ color: '#ef4444', fontWeight: '700' }}
                >
                  ⚙️ 시스템 관리
                </Link>
              )}

              {/* 테마 토글 */}
              <button
                type="button"
                className={`minimal-theme-toggle ${isDark ? 'dark' : 'light'}`}
                onClick={handleToggleTheme}
                aria-label="다크/라이트 테마 전환"
                title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                <span className="toggle-track">
                  <span className="toggle-thumb">
                    {isDark ? '🌙' : '☀️'}
                  </span>
                </span>
              </button>
            </nav>

            {/* 모바일 햄버거 버튼 */}
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

      <div className="header-placeholder"></div>
    </>
  );
}
