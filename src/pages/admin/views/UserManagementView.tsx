import { useEffect, useState } from 'react';
import api from '../../../api/axiosInstance';
import toast from 'react-hot-toast';
import { MemberRole } from '../../../types/admin';

interface Member { id: number; username: string; firstName?: string; lastName?: string; email: string; role: MemberRole; departmentName?: string; position?: string; }
const roles: Record<MemberRole, string> = { ROLE_ASSOCIATE: '일반회원', ROLE_REGULAR: '정회원', ROLE_SUPERVISOR: '슈퍼바이저' };
export default function UserManagementView() {
  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const load = () => { setStatus('loading'); api.get<Member[]>('/api/members').then(({ data }) => { setMembers(data); setStatus('ready'); }).catch(() => setStatus('error')); };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try { await api.patch(`/api/members/${selected.id}/role`, { role: selected.role, departmentName: selected.departmentName || '', position: selected.position || '' }); setMembers(prev => prev.map(m => m.id === selected.id ? selected : m)); setSelected(null); toast.success('회원 권한과 소속을 저장했습니다.'); }
    catch { toast.error('저장하지 못했습니다. 권한과 연결 상태를 확인해 주세요.'); }
    finally { setSaving(false); }
  };
  const visible = members.filter(m => (filter === 'ALL' || m.role === filter) && `${m.username} ${m.lastName || ''}${m.firstName || ''} ${m.email} ${m.departmentName || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="content-block"><div className="view-title-box"><span className="workspace-eyebrow">MEMBER MANAGEMENT</span><h2>회원 및 권한 관리</h2><p>회원의 소속을 확인하고 필요한 권한을 배정합니다.</p></div>
    <div className="workspace-toolbar"><label>회원 검색<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="이름, 아이디, 이메일, 부서" /></label><label>권한<select value={filter} onChange={e => setFilter(e.target.value)}><option value="ALL">전체 권한</option>{Object.entries(roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><span>{status === 'ready' ? `${visible.length}명` : '조회 중'}</span></div>
    {status === 'error' ? <div className="workspace-banner" role="alert"><p>회원 목록을 불러오지 못했습니다.</p><button className="btn-action approve" onClick={load}>다시 시도</button></div> : status === 'loading' ? <p role="status">회원 목록을 불러오고 있습니다…</p> : <div className="table-card"><table className="admin-data-table"><thead><tr><th>회원</th><th>이메일</th><th>소속 / 직위</th><th>권한</th><th>관리</th></tr></thead><tbody>{visible.map(m => <tr key={m.id}><td><strong>{`${m.lastName || ''}${m.firstName || ''}` || m.username}</strong><div className="col-sub">{m.username}</div></td><td>{m.email}</td><td>{m.departmentName || '미배정'}<div className="col-sub">{m.position || '직위 미배정'}</div></td><td>{roles[m.role]}</td><td><button className="btn-action approve" onClick={() => setSelected({ ...m })}>상세 / 수정</button></td></tr>)}{!visible.length && <tr><td colSpan={5} className="table-empty">검색 조건에 맞는 회원이 없습니다.</td></tr>}</tbody></table></div>}
    {selected && <section className="workspace-editor" aria-labelledby="member-editor-title"><h3 id="member-editor-title">{selected.username} 회원 정보 수정</h3><p>저장하면 해당 회원의 접근 권한이 변경됩니다.</p><div className="workspace-toolbar"><label>권한<select value={selected.role} disabled={saving} onChange={e => setSelected({ ...selected, role: e.target.value as MemberRole })}>{Object.entries(roles).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>부서<input value={selected.departmentName || ''} maxLength={50} disabled={saving} onChange={e => setSelected({ ...selected, departmentName: e.target.value })} /></label><label>직위<input value={selected.position || ''} maxLength={30} disabled={saving} onChange={e => setSelected({ ...selected, position: e.target.value })} /></label></div><div className="action-control-group"><button className="btn-action reject" disabled={saving} onClick={() => setSelected(null)}>취소</button><button className="btn-action approve" disabled={saving} onClick={save}>{saving ? '저장 중…' : '변경 사항 저장'}</button></div></section>}
  </section>;
}
