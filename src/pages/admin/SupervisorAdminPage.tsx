// src/pages/admin/SupervisorAdminPage.tsx
import { NavLink, Outlet } from 'react-router-dom';
import './SupervisorAdminPage.css';

export default function SupervisorAdminPage() {
  return (
    <div className="admin-page-wrapper">
      {/* 좌측 고정 사이드바 */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-badge">SUPERVISOR CONSOLE</div>
          <h2 className="sidebar-title">시스템 관리자</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin/promotions"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">정회원 승격 심사함</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">전체 회원 및 권한 제어</span>
          </NavLink>

          <NavLink
            to="/admin/org"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🏢</span>
            <span className="nav-text">연구소 과제·역할 설정</span>
          </NavLink>

          <NavLink
            to="/admin/security"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">🛡️</span>
            <span className="nav-text">시스템 감사 및 보안</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status-indicator">
            <span className="status-dot"></span>
            <span>시스템 정상 가동 중</span>
          </div>
        </div>
      </aside>

      {/* 우측 메인 작업 영역: URL 경로에 따라 해당 뷰 컴포넌트 렌더링 */}
      <main className="admin-main-viewport">
        <Outlet />
      </main>
    </div>
  );
}
