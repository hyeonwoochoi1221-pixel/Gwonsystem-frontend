import React, { useEffect, useState } from 'react';
import { getNotices, deleteNotice } from '../../api/noticeService';
import { Notice } from '../../types';
import NoticeCreateModal from './NoticeCreateModal';
import './NoticeListPage.css';

export default function NoticeListPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 더블클릭하여 열어둘 공지사항 ID 저장 상태 (null이면 모두 닫힘)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchNotices = () => {
    setLoading(true);
    getNotices()
      .then(setNotices)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 더블클릭 핸들러 (본문 펼침 / 접기 토글)
  const handleRowDoubleClick = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // 삭제 핸들러
  const handleDelete = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation(); // 더블클릭 또는 행 클릭 이벤트 방지
    if (!window.confirm(`"${title}" 공지사항을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteNotice(id);
      alert('삭제되었습니다.');
      // 삭제 후 UI 동기화: 목록에서 제거
      setNotices((prev) => prev.filter((item) => item.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert('삭제 처리에 실패했습니다.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>📢 사내 공지사항 목록</h1>
          <span style={{ fontSize: '12px', color: '#888' }}>* 글을 더블클릭하면 본문을 열람할 수 있습니다.</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 18px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + 공지 작성
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
          <tr style={{ borderBottom: '2px solid #4ea8de', padding: '10px 0', color: '#a8a8b3' }}>
            <th style={{ width: '80px', padding: '12px' }}>분류</th>
            <th style={{ padding: '12px' }}>제목</th>
            <th style={{ width: '80px', padding: '12px', textAlign: 'center' }}>조회수</th>
            <th style={{ width: '110px', padding: '12px', textAlign: 'right' }}>등록일</th>
            <th style={{ width: '70px', padding: '12px', textAlign: 'center' }}>관리</th>
          </tr>
          </thead>
          <tbody>
          {notices.map((notice) => {
            const isExpanded = expandedId === notice.id;

            return (
              <React.Fragment key={notice.id}>
                {/* 기본 공지사항 행: 더블클릭 이벤트 설정 */}
                <tr
                  onDoubleClick={() => handleRowDoubleClick(notice.id)}
                  style={{
                    borderBottom: isExpanded ? 'none' : '1px solid #2c2c35',
                    cursor: 'pointer',
                    userSelect: 'none', // 더블클릭 시 텍스트 블록 방지
                    backgroundColor: isExpanded ? '#24242c' : 'transparent'
                  }}
                >
                  <td style={{ padding: '14px 12px' }}>
                      <span style={{ color: notice.isPinned ? '#e63946' : '#a8a8b3', fontWeight: notice.isPinned ? 'bold' : 'normal' }}>
                        {notice.isPinned ? '★ 공지' : notice.category}
                      </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: notice.isPinned ? 'bold' : 'normal' }}>
                    {notice.title}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: '#888' }}>
                    {notice.viewCount}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#888' }}>
                    {notice.date}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => handleDelete(e, notice.id, notice.title)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #ff4d4f',
                        color: '#ff4d4f',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>

                {/* 더블클릭 시 나타나는 상세 본문 영역 */}
                {isExpanded && (
                  <tr style={{ borderBottom: '1px solid #2c2c35', backgroundColor: '#1c1c22' }}>
                    <td colSpan={5} style={{ padding: '20px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#d1d1d6' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4ea8de' }}>[공지 내용]</div>
                      {notice.content}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          </tbody>
        </table>
      )}

      {/* 등록 모달 유지 */}
      <NoticeCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchNotices}
      />
    </div>
  );
}
