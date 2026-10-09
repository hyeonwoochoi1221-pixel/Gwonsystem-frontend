import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthRole, UserRole } from '../../hooks/useAuthRole';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { role, isLoading } = useAuthRole();
  const location = useLocation();
  if (isLoading) return <main className="access-state" role="status">사용자 권한을 확인하고 있습니다…</main>;
  if (role === 'GUEST') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!allowedRoles.includes(role)) return <main className="access-state"><h1>접근 권한이 필요합니다</h1><p>이 메뉴를 이용하려면 담당 관리자에게 권한을 요청해 주세요.</p><Link to="/">메인으로 돌아가기</Link></main>;
  return <Outlet />;
}
