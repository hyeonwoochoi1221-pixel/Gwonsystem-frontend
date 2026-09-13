// src/hooks/useAuthRole.ts
export type UserRole = 'ROLE_SUPERVISOR' | 'ROLE_REGULAR' | 'ROLE_ASSOCIATE' | 'GUEST';

export const useAuthRole = () => {
  // 실제 서비스 환경에서는 LocalStorage, 쿠키 또는 전역 상태(Context/Zustand)의 JWT 파싱 값을 사용합니다.
  const role = (localStorage.getItem('userRole') as UserRole) || 'GUEST';

  // 정회원 이상 (SUPERVISOR, REGULAR)
  const canManageContent = role === 'ROLE_SUPERVISOR' || role === 'ROLE_REGULAR';

  // 최고관리자 전용 (사용자 권한 승격 등)
  const isSupervisor = role === 'ROLE_SUPERVISOR';

  return {
    role,
    canManageContent,
    isSupervisor,
    isAuthenticated: role !== 'GUEST',
  };
};
