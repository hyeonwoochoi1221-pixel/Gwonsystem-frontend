import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../../api/userService';
import { User, MOCK_NOTICES, MOCK_SCHEDULES } from '../../types'; // 데이터 import
import './HomePage.css';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dashboard-grid">
      {/* 1. 사내 공지사항 카드 */}
      <section className="dashboard-card">
        <div className="card-header">
          <Link to="/notice" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h2>📢 사내 공지사항</h2>
          </Link>
        </div>
        <ul className="list-content">
          {MOCK_NOTICES.map((n) => (
            <li key={n.id} className="list-item">
              <span className="item-dept">[{n.dept}]</span>
              <span className="item-title">{n.title}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 오늘의 일정 카드 */}
      <section className="dashboard-card">
        <div className="card-header">
          <h2>📅 오늘의 일정</h2>
        </div>
        <ul className="list-content">
          {MOCK_SCHEDULES.map((s) => (
            <li key={s.id} className="list-item">
              <span className="item-time">{s.time}</span>
              <span className="item-text">{s.content}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. 사용자 정보 카드 */}
      <section className="dashboard-card">
        <div className="card-header">
          <h2>👥 실시간 임직원 목록</h2>
        </div>

        {/* 로딩 상태 처리 */}
        {loading && <p className="status-msg">데이터를 불러오는 중...</p>}

        {/* 데이터가 있을 때 렌더링 */}
        {!loading && users.length > 0 && (
          <ul className="list-content scrollable">
            {users.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-avatar">
                  {/* 이름의 앞 두 글자를 따서 아바타 생성 */}
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 데이터가 없을 때 */}
        {!loading && users.length === 0 && <p className="status-msg">등록된 사용자가 없습니다.</p>}
      </section>
    </main>
  );
}
