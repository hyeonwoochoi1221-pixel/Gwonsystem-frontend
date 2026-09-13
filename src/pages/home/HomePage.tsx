// src/pages/home/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotices } from '../../api/noticeService';
import { Notice } from '../../types';
import './HomePage.css';

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotices()
      .then((data) => {
        // 메인 화면에는 최신 4개 공지만 잘라서 노출
        setNotices(data.slice(0, 4));
      })
      .catch((err) => {
        console.error(err);
        setError('공지사항을 불러오지 못했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="dashboard-grid">
      {/* 1. 실시간 사내 공지사항 카드 */}
      <section className="dashboard-card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>📢 사내 공지사항</h2>
          <Link to="/notice" style={{ fontSize: '12px', color: '#888', textDecoration: 'none' }}>
            더보기 &gt;
          </Link>
        </div>

        {loading ? (
          <p className="status-msg">공지사항을 불러오는 중...</p>
        ) : error ? (
          <p className="status-msg error-msg">{error}</p>
        ) : notices.length === 0 ? (
          <p className="status-msg">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="list-content" style={{ listStyle: 'none', padding: 0 }}>
            {notices.map((n) => (
              <li key={n.id} className="list-item" style={{ padding: '8px 0', borderBottom: '1px solid #2c2c35' }}>
                <span style={{
                  backgroundColor: n.isPinned ? '#e63946' : '#2c2c35',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  marginRight: '8px'
                }}>
                  {n.isPinned ? '고정' : n.category}
                </span>
                <span className="item-title" style={{ fontWeight: n.isPinned ? 'bold' : 'normal' }}>
                  {n.title}
                </span>
                <span style={{ float: 'right', fontSize: '11px', color: '#888' }}>
                  {n.date}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. 오늘의 일정 등 다른 섹션들... */}
    </main>
  );
}
