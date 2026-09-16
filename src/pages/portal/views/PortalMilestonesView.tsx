// src/pages/portal/views/PortalMilestonesView.tsx
export default function PortalMilestonesView() {
  return (
    <section className="portal-content-block">
      <div className="portal-title-row">
        <div>
          <h2>R&D 기술 마일스톤 및 성과 지표</h2>
          <p>연간 연구 과제별 주요 릴리즈 및 개발 태스크 진척을 점검합니다.</p>
        </div>
      </div>
      <div className="portal-placeholder-card">
        <span className="placeholder-icon">📊</span>
        <h3>과제별 마일스톤 차트</h3>
        <p>URL: /portal/milestones</p>
      </div>
    </section>
  );
}
