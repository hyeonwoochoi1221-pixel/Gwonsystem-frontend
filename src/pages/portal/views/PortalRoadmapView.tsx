// src/pages/portal/views/PortalRoadmapView.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';

interface OrgMember {
  id: number;
  name: string;
  rdRole: '연구소장' | '연구책임자' | '연구전담요원' | '연구보조원';
  projectId: string;
  projectName: string;
  skills: string[];
  email: string;
}

interface ResearchProject {
  id: string;
  title: string;
  phase: string;
  leaderName: string;
  progress: number;
}

const MOCK_PROJECTS: ResearchProject[] = [
  { id: 'proj-ai', title: '반도체 공급망 시세 수집 및 이상치 탐지 AI', phase: 'Phase 2 진행 중', leaderName: '최현우', progress: 65 },
  { id: 'proj-dx', title: '사내 인트라넷 DX 및 Supabase 인프라 아키텍처', phase: 'v1.0 배포 완료', leaderName: '최현우', progress: 100 },
];

const MOCK_MEMBERS: OrgMember[] = [
  {
    id: 1,
    name: '최현우',
    rdRole: '연구소장',
    projectId: 'proj-ai',
    projectName: '반도체 이상치 탐지 AI',
    skills: ['Full-Stack', 'Spring Boot', 'PostgreSQL', 'AI'],
    email: 'hwchoi@gwonsystem.com',
  },
  {
    id: 2,
    name: '홍길동',
    rdRole: '연구전담요원',
    projectId: 'proj-ai',
    projectName: '반도체 이상치 탐지 AI',
    skills: ['Python', 'FastAPI', 'Data Pipeline'],
    email: 'hong@gwonsystem.com',
  },
  {
    id: 3,
    name: '김철수',
    rdRole: '연구전담요원',
    projectId: 'proj-dx',
    projectName: '사내 DX 포털',
    skills: ['React', 'TypeScript', 'Tailwind'],
    email: 'cskim@gwonsystem.com',
  },
];

export default function PortalRoadmapView() {
  const [viewMode, setViewMode] = useState<'BOARD' | 'TABLE'>('BOARD');
  const [members] = useState<OrgMember[]>(MOCK_MEMBERS);
  const [projects] = useState<ResearchProject[]>(MOCK_PROJECTS);

  const handleExportRoster = () => {
    toast.success('연구전담요원 명부(KOITA 증빙용)가 준비되었습니다.', { id: 'roster-export' });
  };

  return (
    <section className="portal-content-block">
      <div className="portal-title-row">
        <div>
          <h2>기업부설연구소 과제 & 조직 로드맵</h2>
          <p>연구과제(Project) 및 역할(소장/전담요원) 중심으로 인원을 유연하게 관리합니다.</p>
        </div>

        <div className="action-control-group">
          <button type="button" className="btn-export-excel" onClick={handleExportRoster}>
            📥 연구원 명부 다운로드
          </button>

          <div className="view-toggle-capsule">
            <button
              type="button"
              className={`btn-capsule ${viewMode === 'BOARD' ? 'active' : ''}`}
              onClick={() => setViewMode('BOARD')}
            >
              과제별 보드
            </button>
            <button
              type="button"
              className={`btn-capsule ${viewMode === 'TABLE' ? 'active' : ''}`}
              onClick={() => setViewMode('TABLE')}
            >
              스마트 테이블
            </button>
          </div>
        </div>
      </div>

      <div className="kpi-summary-row">
        <div className="kpi-card">
          <span className="kpi-label">수행 과제수</span>
          <span className="kpi-value">{projects.length}개</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">투입 연구인원</span>
          <span className="kpi-value highlight">{members.length}명</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">연구노트 작성률</span>
          <span className="kpi-value success">100%</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">인프라 안정성</span>
          <span className="kpi-value normal">정상 (Online)</span>
        </div>
      </div>

      {viewMode === 'BOARD' ? (
        <div className="project-board-grid">
          {projects.map((proj) => {
            const assigned = members.filter((m) => m.projectId === proj.id);
            return (
              <div key={proj.id} className="project-column-card">
                <div className="proj-card-header">
                  <span className="phase-pill">{proj.phase}</span>
                  <h3>{proj.title}</h3>
                  <div className="proj-meta">
                    <span>연구책임자: <strong>{proj.leaderName}</strong></span>
                    <span>진척률: <strong>{proj.progress}%</strong></span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                </div>

                <div className="member-card-stack">
                  {assigned.map((mem) => (
                    <div key={mem.id} className="researcher-card">
                      <div className="card-top">
                        <span className="researcher-name">{mem.name}</span>
                        <span className={`rd-role-badge ${mem.rdRole === '연구소장' ? 'director' : ''}`}>
                          {mem.rdRole}
                        </span>
                      </div>
                      <span className="researcher-email">{mem.email}</span>
                      <div className="tech-tags-row">
                        {mem.skills.map((skill, i) => (
                          <span key={i} className="skill-chip">#{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="portal-table-card">
          <table className="portal-data-table">
            <thead>
            <tr>
              <th>연구원 성명</th>
              <th>R&D 배정 역할</th>
              <th>수행 연구과제</th>
              <th>보유 기술 스택</th>
              <th>이메일</th>
            </tr>
            </thead>
            <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="col-emp-name">{m.name}</td>
                <td><span className={`rd-role-badge ${m.rdRole === '연구소장' ? 'director' : ''}`}>{m.rdRole}</span></td>
                <td className="col-proj-title">{m.projectName}</td>
                <td>{m.skills.join(', ')}</td>
                <td className="col-email">{m.email}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
