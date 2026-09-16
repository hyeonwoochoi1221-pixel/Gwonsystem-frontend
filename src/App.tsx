// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import HomePage from './pages/home/HomePage';
import NoticeListPage from './pages/notice/NoticeListPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallback from './pages/auth/OAuthCallback';
import ProfilePage from './pages/profile/ProfilePage'; // 🌟 회원 정보수정 및 정회원 신청 페이지
import FindAccountPage from './pages/auth/FindAccountPage'; // 🌟 아이디/비밀번호 찾기 페이지

// 🛡️ 슈퍼바이저 관리자 레이아웃 및 하위 뷰
import SupervisorAdminPage from './pages/admin/SupervisorAdminPage';
import PromotionApprovalView from './pages/admin/views/PromotionApprovalView';
import UserManagementView from './pages/admin/views/UserManagementView';
import OrgStructureView from './pages/admin/views/OrgStructureView';
import SecurityLogsView from './pages/admin/views/SecurityLogsView';

// 🏢 연구소 포털 레이아웃 및 하위 뷰
import RegularPortalPage from './pages/portal/RegularPortalPage';
import PortalRoadmapView from './pages/portal/views/PortalRoadmapView';
import PortalResearchNoteView from './pages/portal/views/PortalResearchNoteView';
import PortalMilestonesView from './pages/portal/views/PortalMilestonesView';
import PortalAttendanceView from './pages/portal/views/PortalAttendanceView';
import './App.css';

export default function App() {
  return (
    <Router>
      {/* 🌟 헤더에 가려지지 않도록 top 여백 및 zIndex 최상위 격상 */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          top: 85,          // 상단 고정 헤더 높이를 피해 바로 아래로 노출
          zIndex: 99999,    // 헤더 및 모달 레이어보다 무조건 위에 뜨도록 보장
        }}
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card, #1c1c24)',
            color: 'var(--text-main, #f1f5f9)',
            border: '1px solid var(--border-color, #2e2e38)',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
            borderRadius: '8px',
            padding: '12px 18px',
          },
          success: {
            iconTheme: {
              primary: '#0ea5e9',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <div className="app-container">
        <Header />
        <Routes>
          {/* 1. 공개 페이지 라우트 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/notice" element={<NoticeListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          {/* 🌟 계정 찾기 라우트 */}
          <Route path="/find-account" element={<FindAccountPage />} />

          {/* 🌟 2. 회원정보 수정 & 정회원 승격 신청 라우트 */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* 3. 🛡️ 슈퍼바이저 관리자 콘솔 (사이드바 중첩 라우트) */}
          <Route path="/admin" element={<SupervisorAdminPage />}>
            <Route index element={<Navigate to="promotions" replace />} />
            <Route path="promotions" element={<PromotionApprovalView />} />
            <Route path="users" element={<UserManagementView />} />
            <Route path="org" element={<OrgStructureView />} />
            <Route path="security" element={<SecurityLogsView />} />
          </Route>

          {/* 4. 🏢 정회원용 기업부설연구소 포털 (사이드바 중첩 라우트) */}
          <Route path="/portal" element={<RegularPortalPage />}>
            <Route index element={<Navigate to="roadmap" replace />} />
            <Route path="roadmap" element={<PortalRoadmapView />} />
            <Route path="notes" element={<PortalResearchNoteView />} />
            <Route path="milestones" element={<PortalMilestonesView />} />
            <Route path="attendance" element={<PortalAttendanceView />} />
          </Route>
        </Routes>
        <Footer />
        <ScrollToTopButton />
      </div>
    </Router>
  );
}
