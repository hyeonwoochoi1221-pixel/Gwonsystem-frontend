// src/pages/notice/NoticeListPage.tsx

import { Link } from 'react-router-dom';
import { MOCK_NOTICES } from '../../types'; // import한 데이터를 바로 사용
import './NoticeListPage.css';

export default function NoticeListPage() {
  // 정의되어 있던 const notices: Notice[] = ... 를 삭제하고 MOCK_NOTICES를 직접 사용합니다.

  return (
    <main className="notice-container">
      <header className="notice-header">
        <h1>📢 사내 공지사항</h1>
        <Link to="/" className="back-link">← 대시보드로 돌아가기</Link>
      </header>

      <section className="notice-list-wrapper">
        <table className="notice-table">
          <thead>
          <tr>
            <th style={{ width: '8%' }}>번호</th>
            <th style={{ width: '12%' }}>부서</th>
            <th>제목</th>
            <th style={{ width: '15%' }}>등록일</th>
          </tr>
          </thead>
          <tbody>
          {MOCK_NOTICES.map((n) => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td><span className="dept-badge">{n.dept}</span></td>
              <td className="title-cell">{n.title}</td>
              <td>{n.date}</td>
            </tr>
          ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
