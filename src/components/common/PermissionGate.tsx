// src/components/common/PermissionGate.tsx
import React from 'react';
import { useAuthRole, UserRole } from '../../hooks/useAuthRole';

interface PermissionGateProps {
  allowedRoles?: UserRole[]; // 특정 권한 목록 허용
  requiresManager?: boolean;  // 정회원 이상 (관리자 + 정회원) 일괄 허용
  children: React.ReactNode;
  fallback?: React.ReactNode; // 권한 없을 때 띄울 대체 UI (선택사항)
}

export default function PermissionGate({
                                         allowedRoles,
                                         requiresManager = false,
                                         children,
                                         fallback = null,
                                       }: PermissionGateProps) {
  const { role, canManageContent } = useAuthRole();

  if (requiresManager && canManageContent) {
    return <>{children}</>;
  }

  if (allowedRoles && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
