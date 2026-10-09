// src/components/layout/Header.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import './Header.css';
import api from '../../api/axiosInstance';

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
    api.get('/api/members/me').then(({ data }) => {
      setUsername(data.username); setUserRole(data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userRole', data.role);
    }).catch(() => { setUsername(null); setUserRole(null); localStorage.removeItem('username'); localStorage.removeItem('userRole'); });
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

  const handleLogout = useCallback(async (isTimeout = false) => {
    try { await api.post("/api/members/logout"); } catch { toast.error("로그아웃에 실패했습니다. 다시 시도해 주세요."); return; }
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

  const handleExtendSession = async () => {
    try { await api.get("/api/members/me"); } catch { toast.error("다시 로그인해 주세요."); return; }
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

  // 🌟 이모티콘 없이 심플하게 텍스트와 클래스명 반환
  const getRoleBadgeInfo = (role: string | null) => {
    switch (role) {
      case 'ROLE_SUPERVISOR':
        return { text: '관리자', className: 'role-badge-supervisor' };
      case 'ROLE_REGULAR':
        return { text: '정회원', className: 'role-badge-regular' };
      default:
        return { text: '일반회원', className: 'role-badge-associate' };
    }
  };

  const roleBadge = getRoleBadgeInfo(userRole);

  return (
    <>
      <header className={`header-fixed-container ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* 1단: 상단 유틸 탑바 */}
        <div className="login-top-header">
          <div className="login-header-inner">
            <div className="top-header-left-empty"></div>

            <div className="login-right">
              {username ? (
                <div className="user-greet-box">
                  {/* 회원 등급 뱃지 (이모티콘 없이 플랫 텍스트) */}
                  <span className={`clean-role-badge ${roleBadge.className}`}>
                    {roleBadge.text}
                  </span>

                  <div className="user-auth-meta-group">
                    {/* 사용자 성명 & 정보수정 */}
                    <div className="meta-col">
                      <span className="user-name-text">{getFormattedFullName()}님</span>
                      <Link to="/profile" className="meta-btn-action">
                        정보수정
                      </Link>
                    </div>

                    <span className="meta-divider-line"></span>

                    {/* 세션 남은 시간 & 로그인 연장 */}
                    <div className="meta-col">
                      <span className={`session-time-text ${timeLeft <= 300 ? 'warning' : ''}`}>
                        {formatTimeKorean(timeLeft)}
                      </span>
                      <button
                        type="button"
                        className="meta-btn-action btn-extend-clean"
                        onClick={handleExtendSession}
                      >
                        연장
                      </button>
                    </div>
                  </div>

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
              <Link to="/#technology" className="nav-item-box" onClick={closeMenu}>주요 보유 기술</Link>
              <Link to="/#contact" className="nav-item-box" onClick={closeMenu}>문의하기</Link>

              {/* 정회원 이상 연구소 포털 */}
              {(userRole === 'ROLE_REGULAR' || userRole === 'ROLE_SUPERVISOR') && (
                <Link
                  to="/portal"
                  className="nav-item-box portal-nav-item"
                  onClick={closeMenu}
                >
                  연구소 포털
                </Link>
              )}

              {/* 관리자 전용 시스템 관리 */}
              {userRole === 'ROLE_SUPERVISOR' && (
                <Link
                  to="/admin"
                  className="nav-item-box admin-nav-item"
                  onClick={closeMenu}
                >
                  시스템 관리
                </Link>
              )}

              {/* 테마 토글 */}
              <button
                type="button"
                className={`minimal-theme-toggle ${isDark ? 'dark' : 'light'}`}
                onClick={handleToggleTheme}
                aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                aria-pressed={isDark}
              >
                <span className="toggle-track" aria-hidden="true">
                  <span className="toggle-thumb" />
                  <svg className="theme-icon theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
                  <svg className="theme-icon theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z" /></svg>
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
