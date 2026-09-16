// src/pages/auth/LoginPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.svg?react';
import { loginMember } from '../../api/authService';
import './Auth.css';

// 백엔드 LoginResponse DTO 규격 반영
interface LoginResponse {
  message?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🌟 회원가입 성공 모달에서 전달된 아이디가 있다면 기본값으로 자동 채움
  const registeredUsername = (location.state as any)?.registeredUsername || '';

  const [username, setUsername] = useState(registeredUsername);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 자동 포커싱을 위한 비밀번호 input ref
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // 회원가입 직후 넘어온 경우 비밀번호 입력란으로 바로 커서 이동
  useEffect(() => {
    if (registeredUsername && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [registeredUsername]);

  // TS6385 해결: React.SyntheticEvent<HTMLFormElement> 적용
  const handleLoginSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = (await loginMember({ username, password })) as LoginResponse;

      // 1. 기본 계정 정보 및 권한 localStorage 보관
      if (res?.username) {
        localStorage.setItem('username', res.username);
      }
      if (res?.role) {
        localStorage.setItem('userRole', res.role);
      }

      // 2. DB에서 전달된 성(lastName)과 이름(firstName) localStorage 보관
      if (res?.lastName) {
        localStorage.setItem('lastName', res.lastName);
      } else {
        localStorage.removeItem('lastName');
      }

      if (res?.firstName) {
        localStorage.setItem('firstName', res.firstName);
      } else {
        localStorage.removeItem('firstName');
      }

      // 3. 환영 토스트 메시지 구성 (성+이름 우선, 없을 시 아이디 fallback)
      const fullName = `${res?.lastName || ''}${res?.firstName || ''}`.trim();
      const welcomeName = fullName || res?.username || username;
      toast.success(`${welcomeName}님, 로그인되었습니다.`);

      // 4. 메인 대시보드로 이동
      navigate('/');
    } catch (error: any) {
      console.error('로그인 에러:', error);
      const serverMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        '아이디 또는 비밀번호가 올바르지 않습니다.';

      setErrorMessage(serverMessage);
      toast.error(serverMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'naver') => {
    const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${backendBaseUrl}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card login-card">
        {/* 헤더 로고 영역 */}
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <Logo className="auth-logo-svg" />
            <span className="auth-logo-text">G-WON SYSTEM</span>
          </Link>
          <h2>로그인</h2>
        </div>

        {/* 에러 메시지 알림 바 */}
        {errorMessage && <div className="auth-error-alert">{errorMessage}</div>}

        {/* 로그인 폼 */}
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="login-username">아이디</label>
            <input
              id="login-username"
              type="text"
              placeholder="아이디 입력"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="login-password">비밀번호</label>
              {/* 🌟 아이디/비밀번호 찾기 페이지 링크 연결 */}
              <Link to="/find-account" className="forgot-link">아이디/비밀번호 찾기</Link>
            </div>
            <input
              ref={passwordInputRef}
              id="login-password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={isLoading}>
            {isLoading ? '로그인 처리 중...' : '로그인'}
          </button>
        </form>

        {/* 소셜 로그인 구분선 */}
        <div className="auth-divider">
          <span>또는 소셜 계정으로 로그인</span>
        </div>

        {/* OAuth2 소셜 버튼 그룹 */}
        <div className="social-auth-group">
          <button
            type="button"
            className="btn-social btn-google"
            onClick={() => handleSocialLogin('google')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
              />
            </svg>
            <span>Google 로그인</span>
          </button>

          <button
            type="button"
            className="btn-social btn-naver"
            onClick={() => handleSocialLogin('naver')}
          >
            <span className="naver-logo-n">N</span>
            <span>네이버 아이디로 로그인</span>
          </button>
        </div>

        {/* 회원가입 전환 */}
        <div className="auth-footer-nav">
          아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
