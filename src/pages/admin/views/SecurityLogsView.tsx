// src/pages/admin/views/SecurityLogsView.tsx
export default function SecurityLogsView() {
  return (
    <section className="content-block">
      <div className="view-title-box">
        <h2>시스템 감사 및 보안 로그</h2>
        <p>슈퍼바이저 계정 보호 및 로그인 접속 이력을 모니터링합니다.</p>
      </div>
      <div className="placeholder-card">
        <span className="placeholder-icon">🛡️</span>
        <h3>보안 감사 콘솔</h3>
        <p>URL: /admin/security</p>
      </div>
    </section>
  );
}
