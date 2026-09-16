// src/pages/admin/views/PromotionApprovalView.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PromotionApplication } from '../../../types/admin';

const MOCK_APPLICATIONS: PromotionApplication[] = [
  {
    id: 1,
    memberId: 101,
    username: 'tech_hong',
    applicantName: '홍길동',
    email: 'hong@gwonsystem.com',
    phone: '010-1234-5678',
    targetDepartment: 'AI 연구개발실',
    targetPosition: '연구전담요원',
    targetProject: '반도체 공급망 시세 수집 및 이상치 탐지 AI',
    reason: '사내 R&D 파이프라인 개발 및 알고리즘 구현 전담 참여 목적',
    appliedAt: '2026-09-14 14:30',
    status: 'PENDING',
  },
  {
    id: 2,
    memberId: 102,
    username: 'infra_kim',
    applicantName: '김철수',
    email: 'cskim@gwonsystem.com',
    phone: '010-9876-5432',
    targetDepartment: '인프라 아키텍처팀',
    targetPosition: '선임연구원',
    targetProject: '사내 DX 포털 및 Supabase 인프라 아키텍처',
    reason: '클라우드 인프라 배포 자동화 및 백엔드 Spring Boot 고도화',
    appliedAt: '2026-09-15 09:10',
    status: 'PENDING',
  },
];

export default function PromotionApprovalView() {
  const [applications, setApplications] = useState<PromotionApplication[]>(MOCK_APPLICATIONS);

  const handleApprove = (app: PromotionApplication) => {
    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    toast.success(`${app.applicantName}님이 [${app.targetPosition}] (으)로 정회원 승인되었습니다.`);
  };

  const handleReject = (app: PromotionApplication) => {
    if (window.confirm(`${app.applicantName}님의 신청을 반려하시겠습니까?`)) {
      setApplications((prev) => prev.filter((a) => a.id !== app.id));
      toast.error('승격 신청이 반려되었습니다.');
    }
  };

  return (
    <section className="content-block">
      <div className="view-title-box">
        <h2>정회원(임직원/연구원) 승격 심사함</h2>
        <p>일반회원 중 사내 연구소 정회원 자격을 자율 신청한 인원의 신청서를 심사합니다.</p>
      </div>

      <div className="stat-summary-row">
        <div className="mini-stat-card">
          <span className="stat-label">미처리 신청서</span>
          <span className="stat-value">{applications.length}건</span>
        </div>
        <div className="mini-stat-card">
          <span className="stat-label">심사 방식</span>
          <span className="stat-value status-normal">자율 신청제 (옵션 1)</span>
        </div>
      </div>

      <div className="table-card">
        <table className="admin-data-table">
          <thead>
          <tr>
            <th>신청자</th>
            <th>희망 부서 / 직책</th>
            <th>참여 희망 연구과제</th>
            <th>신청 사유</th>
            <th>신청일시</th>
            <th style={{ textAlign: 'center' }}>심사</th>
          </tr>
          </thead>
          <tbody>
          {applications.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-empty">현재 대기 중인 승격 신청서가 없습니다.</td>
            </tr>
          ) : (
            applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="user-info-stack">
                    <span className="col-name">{app.applicantName}</span>
                    <span className="col-sub">{app.username} ({app.phone})</span>
                  </div>
                </td>
                <td>
                  <strong>{app.targetDepartment}</strong>
                  <div className="col-sub">{app.targetPosition}</div>
                </td>
                <td className="col-project">{app.targetProject}</td>
                <td className="col-reason" title={app.reason}>{app.reason}</td>
                <td className="col-date">{app.appliedAt}</td>
                <td className="col-actions">
                  <button type="button" className="btn-action approve" onClick={() => handleApprove(app)}>승인</button>
                  <button type="button" className="btn-action reject" onClick={() => handleReject(app)}>반려</button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
