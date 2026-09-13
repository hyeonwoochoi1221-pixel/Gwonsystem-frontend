import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 기본 비활동 제한 시간: 30분 (밀리초 단위)
const TIMEOUT_MS = 30 * 60 * 1000;

export function useAutoLogout() {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // 기존 타이머 클리어
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 로그인된 상태일 때만 타이머 가동
    if (localStorage.getItem('username')) {
      timerRef.current = setTimeout(() => {
        // 세션 만료 시 스토리지 비우기
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');

        toast.error('장시간 활동이 없어 안전을 위해 자동 로그아웃되었습니다.', {
          duration: 4000,
        });

        navigate('/login');
      }, TIMEOUT_MS);
    }
  };

  useEffect(() => {
    // 감지할 유저 인터랙션 이벤트 목록
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer(); // 컴포넌트 마운트 시 최초 실행

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [navigate]);
}
