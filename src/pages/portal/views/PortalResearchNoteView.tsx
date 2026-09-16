// src/pages/portal/views/PortalResearchNoteView.tsx
import toast from 'react-hot-toast';

export default function PortalResearchNoteView() {
  return (
    <section className="portal-content-block">
      <div className="portal-title-row">
        <div>
          <h2>R&D 연구노트 및 기술 개발 일지</h2>
          <p>일일 연구개발 진행 상황을 기록하고 세액공제/KOITA 실사를 대비한 서명 검토를 수행합니다.</p>
        </div>
        <button
          type="button"
          className="btn-primary-action"
          onClick={() => toast.success('연구노트 작성 폼이 열립니다.')}
        >
          + 새 연구노트 작성
        </button>
      </div>

      <div className="portal-table-card">
        <table className="portal-data-table">
          <thead>
          <tr>
            <th>작성일자</th>
            <th>과제명</th>
            <th>개발 내역 및 주제</th>
            <th>작성자</th>
            <th>상태</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>2026-09-14</td>
            <td className="col-proj-title">사내 인트라넷 DX</td>
            <td>Spring Security RBAC 및 관리자 콘솔 아키텍처 재설계</td>
            <td>최현우</td>
            <td><span className="status-badge-ok">검토 완료</span></td>
          </tr>
          <tr>
            <td>2026-09-12</td>
            <td className="col-proj-title">반도체 이상치 탐지 AI</td>
            <td>Supabase PostgreSQL RLS 연동 및 시세 데이터 수집 파이프라인 검증</td>
            <td>홍길동</td>
            <td><span className="status-badge-pending">승인 대기</span></td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
