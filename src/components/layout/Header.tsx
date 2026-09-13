import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import './Header.css';

// ⏱️ 기본 세션 유효 시간: 30분 (1800초)
const SESSION_DURATION_SEC = 30 * 60;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // 로그인 유저 정보 상태
  const [username, setUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ⏱️ 세션 잔여 시간(초 단위) 상태 및 타이머 Ref
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_DURATION_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 테마 상태
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 35);
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

  // localStorage 정보 동기화 함수
  const syncUserInfo = useCallback(() => {
    const storedUser = localStorage.getItem('username');
    const storedRole = localStorage.getItem('userRole');

    setUsername(storedUser);
    setUserRole(storedRole);
  }, []);

  // 페이지 이동 시 및 마운트 시 localStorage 로그인 세션 동기화
  useEffect(() => {
    syncUserInfo();
    if (localStorage.getItem('username')) {
      setTimeLeft(SESSION_DURATION_SEC);
    }
  }, [location, syncUserInfo]);

  // 다른 탭이나 창에서 로그인/로그아웃 시 스토리지 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (['username', 'userRole', 'lastName', 'firstName', 'last_name', 'first_name'].includes(e.key || '')) {
        syncUserInfo();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [syncUserInfo]);

  // 로그아웃 처리
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
      toast.error('세션이 만료되었습니다. 다시 로그인해 주세요.', {
        duration: 4000,
      });
    } else {
      toast.success('안전하게 로그아웃되었습니다.');
    }
    navigate('/login');
  }, [navigate]);

  // 1초 단위 타이머 카운트다운
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

  // 로그인 연장 버튼 핸들러
  const handleExtendSession = () => {
    setTimeLeft(SESSION_DURATION_SEC);
    toast.success('로그인 세션이 30분 연장되었습니다.', { id: 'session-extend' });
  };

  // 00분 00초 한글 포맷 변환
  const formatTimeKorean = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${String(secs).padStart(2, '0')}초`;
  };

  const closeMenu = () => setIsMenuOpen(false);
  const handleToggleTheme = () => setIsDark((prev) => !prev);

  // ✨ first_name과 last_name을 읽어와 결합하는 함수
  const getFormattedFullName = () => {
    // 1. 단일 키 (카멜/스네이크 케이스 모두 지원)
    const lastName =
      localStorage.getItem('lastName') ||
      localStorage.getItem('last_name') ||
      '';
    const firstName =
      localStorage.getItem('firstName') ||
      localStorage.getItem('first_name') ||
      '';

    if (lastName || firstName) {
      // 한국어 표기법: 성(lastName) + 이름(firstName)
      return `${lastName}${firstName}`.trim();
    }

    // 2. 만약 user 객체(JSON) 형태로 저장되어 있는 경우 대응
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        const lName = parsed.lastName || parsed.last_name || '';
        const fName = parsed.firstName || parsed.first_name || '';
        if (lName || fName) {
          return `${lName}${fName}`.trim();
        }
      } catch (e) {
        // ignore
      }
    }

    // 3. 성과 이름이 모두 없을 때만 아이디 표시
    return localStorage.getItem('username') || '';
  };

  return (
    <>
      <header className={`header-fixed-container ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* 1단: 로그인 유틸 탑바 */}
        <div className="login-top-header">
          <div className="login-header-inner">
            <span className="portal-badge">GWON INTRANET PORTAL</span>

            <div className="login-right">
              {username ? (
                <div className="user-greet-box">
                  {/* ✨ [성명 / 정보수정] & [시간 / 로그인 연장] 2열 구조 */}
                  <div className="user-auth-meta-group">
                    {/* 1열: first_name + last_name 결합 성명 직접 출력 */}
                    <div className="meta-col">
                      <span className="user-name-text">
                        {getFormattedFullName()}
                      </span>
                      <Link to="/profile" className="meta-link-action">정보수정</Link>
                    </div>

                    {/* 2열: 잔여 시간 & 로그인 연장 */}
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

                  {/* 권한 등급 뱃지 */}
                  {userRole && (
                    <span className="user-role-tag">
                      {userRole === 'ROLE_SUPERVISOR'
                        ? '관리자'
                        : userRole === 'ROLE_REGULAR'
                          ? '정회원'
                          : '일반회원'}
                    </span>
                  )}

                  {/* 로그아웃 버튼 */}
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

            {/* 네비게이션 메뉴 및 미니멀 테마 스위치 */}
            <nav className={`nav-menu ${isMenuOpen ? 'mobile-open' : ''}`}>
              <Link to="/#about" className="nav-item-box" onClick={closeMenu}>회사소개</Link>
              <Link to="/notice" className="nav-item-box" onClick={closeMenu}>공지사항</Link>
              <Link to="/services" className="nav-item-box" onClick={closeMenu}>주요기술</Link>
              <Link to="/contact" className="nav-item-box" onClick={closeMenu}>문의하기</Link>

              {/* 미니멀 테마 토글 */}
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

      <div className="header-placeholder"></div>
    </>
  );
}
