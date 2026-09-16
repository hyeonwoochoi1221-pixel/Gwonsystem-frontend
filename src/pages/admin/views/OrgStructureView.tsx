// src/pages/admin/views/OrgStructureView.tsx
export default function OrgStructureView() {
  return (
    <section className="content-block">
      <div className="view-title-box">
        <h2>연구소 R&D 과제 및 역할 체계 설정</h2>
        <p>승격 시 배정할 연구과제(Project)와 직무 코드(소장, 전담요원 등)를 관리합니다.</p>
      </div>
      <div className="placeholder-card">
        <span className="placeholder-icon">🏢</span>
        <h3>과제 및 직무 기준정보 마스터</h3>
        <p>URL: /admin/org</p>
      </div>
    </section>
  );
}
