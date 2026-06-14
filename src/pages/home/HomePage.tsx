import { useState, useEffect } from 'react';
import { getUsers } from '../../api/userService';
import { User, Notice, Schedule } from '../../types';
import './HomePage.css'; // 홈페이지만의 전용 스타일 불러오기

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 사내 가짜 데이터
  const notices: Notice[] = [
    { id: 1, title: '2026년 하반기 보안 정기 점검 안내', date: '2026-06-14', dept: '보안팀' },
    { id: 2, title: '서버 인프라 마이그레이션 작업으로 인한 시스템 단절 안내', date: '2026-06-12', dept: '인프라팀' },
    { id: 3, title: '6월 전사 타운홀 미팅 일정 공유', date: '2026-06-10', dept: '인사팀' },
  ];

  const schedules: Schedule[] = [
    { id: 1, time: '10:00', content: '주간 부서 외근 및 업무 보고 회의' },
    { id: 2, time: '14:00', content: '프론트엔드 - 백엔드 API 명세서 검토' },
    { id: 3, time: '16:30', content: 'Supabase 데이터 정기 백업 확인' },
  ];

  useEffect(() => {
    getUsers()
      .then((data) => setUsers(data))
      .catch((err) => {
        setError('백엔드 데이터를 불러오지 못했습니다.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="dashboard-grid">
      {/* 섹션 1: 사내 공지사항 */}
      <section className="dashboard-card">
        <div className="card-header">
          <h2>📢 사내 공지사항</h2>
        </div>
        <ul className="list-content">
          {notices.map((notice) => (
            <li key={notice.id} className="list-item">
              <span className="item-dept">[{notice.dept}]</span>
              <span className="item-title">{notice.title}</span>
              <span className="item-date">{notice.date}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 섹션 2: 오늘의 업무 일정 */}
      <section className="dashboard-card">
        <div className="card-header">
          <h2>📅 오늘의 일정</h2>
        </div>
        <ul className="list-content">
          {schedules.map((schedule) => (
            <li key={schedule.id} className="list-item timeline-item">
              <span className="item-time">{schedule.time}</span>
              <span className="item-text">{schedule.content}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 섹션 3: 임직원 목록 */}
      <section className="dashboard-card">
        <div className="card-header">
          <h2>👥 최근 등록 임직원</h2>
        </div>

        {loading && <p className="status-msg">데이터를 불러오는 중...</p>}
        {error && <p className="status-msg error-msg">{error}</p>}
        {!loading && !error && users.length === 0 && <p className="status-msg">등록된 사용자가 없습니다.</p>}

        {!loading && !error && users.length > 0 && (
          <ul className="list-content scrollable">
            {users.slice(0, 5).map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-avatar">
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
      </section>
    </main>
  );
}
