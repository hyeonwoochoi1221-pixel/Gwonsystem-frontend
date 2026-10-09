import { Link } from 'react-router-dom';
import { useAuthRole } from '../../../hooks/useAuthRole';

export default function PortalOverviewView() {
  const { username } = useAuthRole();
  return <section className="portal-content-block">
    <div className="portal-title-row"><div><span className="workspace-eyebrow">MY WORKSPACE</span><h2>{username || '연구원'}님, 오늘의 업무를 확인하세요.</h2><p>과제 확인부터 연구 기록까지, 자주 쓰는 업무를 한곳에 모았습니다.</p></div></div>
    <div className="workspace-banner"><strong>업무 서비스 준비 중</strong><p>개인 과제, 연구노트와 근태 기록은 서비스 연결 후 조회할 수 있습니다.</p></div>
    <div className="workspace-grid">{[
      ['/portal/roadmap', '01', '내 연구과제', '과제와 참여 연구원의 구성을 확인하세요.'],
      ['/portal/notes', '02', '연구노트', '연구 기록과 검토 상태를 확인하는 공간입니다.'],
      ['/portal/attendance', '03', '오늘의 근태', '출퇴근과 연구 투입시간을 관리하는 공간입니다.'],
      ['/portal/milestones', '04', '목표와 마일스톤', '과제별 일정과 성과를 확인하는 공간입니다.'],
    ].map(([to, number, title, description]) => <Link className="workspace-link" to={to} key={to}><span className="workspace-eyebrow">{number}</span><h3>{title}</h3><p>{description}</p><span className="workspace-link-label">열기 →</span></Link>)}</div>
    <div className="workspace-banner"><strong>업무 시작 전 확인</strong><p>최신 공지를 확인하고, 소속과 연락처를 최신 정보로 유지해 주세요.</p><div className="action-control-group"><Link to="/notice">공지사항 보기 →</Link><Link to="/profile">내 정보 확인 →</Link></div></div>
  </section>;
}
