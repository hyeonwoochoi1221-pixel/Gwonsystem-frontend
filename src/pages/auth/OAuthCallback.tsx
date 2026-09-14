import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasHandled = useRef(false);

  useEffect(() => {
    // React 18 개발 환경의 이중 렌더링 방지
    if (hasHandled.current) return;

    const username = searchParams.get('username');
    const role = searchParams.get('role');
    const lastName = searchParams.get('lastName');
    const firstName = searchParams.get('firstName');

    if (username) {
      hasHandled.current = true;

      // 1. 사용자 기본 계정 및 권한 저장
      localStorage.setItem('username', username);
      if (role) {
        localStorage.setItem('userRole', role);
      }

      // 2. 디코딩된 성명 저장
      const decodedLastName = lastName ? decodeURIComponent(lastName) : '';
      const decodedFirstName = firstName ? decodeURIComponent(firstName) : '';

      if (decodedLastName) {
        localStorage.setItem('lastName', decodedLastName);
      } else {
        localStorage.removeItem('lastName');
      }

      if (decodedFirstName) {
        localStorage.setItem('firstName', decodedFirstName);
      } else {
        localStorage.removeItem('firstName');
      }

      // 3. 헤더 30분 카운트다운 세션 타이머 기준 시각 기록
      localStorage.setItem('loginTime', Date.now().toString());

      // 4. 환영 토스트 알림 표시 (성+이름 우선)
      const fullName = `${decodedLastName}${decodedFirstName}`.trim();
      const welcomeName = fullName || username;
      toast.success(`${welcomeName}님, 로그인되었습니다.`);

      // 5. 메인 대시보드로 이동
      navigate('/', { replace: true });
    } else {
      hasHandled.current = true;
      toast.error('소셜 로그인 인증에 실패했습니다.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        fontSize: '15px',
        fontWeight: '600',
        color: 'var(--text-main)',
      }}
    >
      소셜 계정 인증을 처리하는 중입니다. 잠시만 기다려주세요...
    </div>
  );
}
