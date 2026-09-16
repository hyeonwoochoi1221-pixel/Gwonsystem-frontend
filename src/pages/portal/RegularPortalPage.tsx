// src/pages/portal/RegularPortalPage.tsx
import { NavLink, Outlet } from 'react-router-dom';
import './RegularPortalPage.css';

export default function RegularPortalPage() {
  return (
    <div className="portal-page-wrapper">
      {/* 좌측 고정 연구소 사이드바 */}
      <aside className="portal-sidebar">
        <div className="sidebar-header">
          <div className="portal-badge-label">R&D WORKSPACE</div>
          <h2 className="sidebar-title">연구소 포털</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/portal/roadmap"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📌</span>
            <span className="nav-text">연구과제 & 조직 로드맵</span>
          </NavLink>

          <NavLink
            to="/portal/notes"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">연구노트 & R&D 일지</span>
          </NavLink>

          <NavLink
            to="/portal/milestones"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">기술 마일스톤 & KPI</span>
          </NavLink>

          <NavLink
            to="/portal/attendance"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">⏰</span>
            <span className="nav-text">연구 전념성 & 근태 기록</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="researcher-info-pill">
            <span className="online-indicator"></span>
            <span>연구전담 인력 활성화됨</span>
          </div>
        </div>
      </aside>

      {/* 우측 작업 영역: URL 경로에 따라 해당 포털 뷰 렌더링 */}
      <main className="portal-main-viewport">
        <Outlet />
      </main>
    </div>
  );
}
