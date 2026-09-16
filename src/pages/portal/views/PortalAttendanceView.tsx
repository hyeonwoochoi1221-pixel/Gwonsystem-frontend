// src/pages/portal/views/PortalAttendanceView.tsx
import toast from 'react-hot-toast';

export default function PortalAttendanceView() {
  return (
    <section className="portal-content-block">
      <div className="portal-title-row">
        <div>
          <h2>연구 전념성 및 근태 기록</h2>
          <p>연구전담요원의 연구 전념 의무(타 업무 미겸직)를 증빙하는 타임스탬프 현황입니다.</p>
        </div>
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => toast.success('금일 출근 타임스탬프가 기록되었습니다.')}
        >
          출근 타임스탬프 찍기
        </button>
      </div>
      <div className="portal-placeholder-card">
        <span className="placeholder-icon">⏰</span>
        <h3>월간 누적 연구 투입시간 로그</h3>
        <p>URL: /portal/attendance</p>
      </div>
    </section>
  );
}
