// src/pages/admin/views/UserManagementView.tsx
export default function UserManagementView() {
  return (
    <section className="content-block">
      <div className="view-title-box">
        <h2>전체 회원 및 권한 제어</h2>
        <p>일반 고객을 포함한 전체 가입자를 검색하고 권한 등급을 제어합니다.</p>
      </div>
      <div className="placeholder-card">
        <span className="placeholder-icon">👥</span>
        <h3>전체 회원 마스터 테이블 연동 예정</h3>
        <p>URL: /admin/users</p>
      </div>
    </section>
  );
}
