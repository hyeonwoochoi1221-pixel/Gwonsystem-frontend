import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
export default function OAuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    api.get('/api/members/me').then(({ data }) => {
      for (const key of ['username', 'role', 'lastName', 'firstName'])
        localStorage.setItem(key === 'role' ? 'userRole' : key, data[key] || '');
      navigate('/', { replace: true });
    }).catch(() => navigate('/login', { replace: true }));
  }, [navigate]);
  return <div>로그인을 확인하는 중입니다.</div>;
}
