import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotices, deleteNotice } from '../../api/noticeService';
import { Notice } from '../../types';
import NoticeCreateModal from './NoticeCreateModal';
import PermissionGate from '../../components/common/PermissionGate';
import './NoticeListPage.css';

export default function NoticeListPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  const handleRowDoubleClick = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation();
    if (!window.confirm(`"${title}" 공지사항을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteNotice(id);
      alert('공지사항이 삭제되었습니다.');
      setNotices((prev) => prev.filter((item) => item.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert('삭제 처리에 실패했습니다. (권한을 확인하세요)');
    }
  };

  return (
    <div className="notice-page-container">
      <div className="notice-card-wrapper">
        {/* 상단 헤더 영역 */}
        <div className="notice-page-header">
          <div className="notice-header-title">
            <h1>📢 사내 공지사항 목록</h1>
            <p className="notice-subtext">* 항목을 더블클릭하면 본문 내용을 열람할 수 있습니다.</p>
          </div>
          <div className="notice-header-actions">
            {/* 정회원 및 최고관리자에게만 작성 버튼 노출 */}
            <PermissionGate requiresManager>
              <button
                type="button"
                className="btn-create-notice"
                onClick={() => setIsModalOpen(true)}
              >
                + 공지 작성
              </button>
            </PermissionGate>
            <Link to="/" className="btn-back-home">← 메인 홈</Link>
          </div>
        </div>

        {/* 테이블 컨텐츠 영역 */}
        {loading ? (
          <div className="notice-loading">공지사항을 불러오는 중입니다...</div>
        ) : notices.length === 0 ? (
          <div className="notice-empty">등록된 공지사항이 없습니다.</div>
        ) : (
          <div className="notice-table-responsive">
            <table className="notice-main-table">
              <thead>
              <tr>
                <th className="th-category">분류</th>
                <th className="th-title">제목</th>
                <th className="th-views">조회수</th>
                <th className="th-date">등록일</th>
                <PermissionGate requiresManager>
                  <th className="th-manage">관리</th>
                </PermissionGate>
              </tr>
              </thead>
              <tbody>
              {notices.map((notice) => {
                const isExpanded = expandedId === notice.id;

                return (
                  <React.Fragment key={notice.id}>
                    <tr
                      onDoubleClick={() => handleRowDoubleClick(notice.id)}
                      className={`notice-row ${isExpanded ? 'row-expanded' : ''} ${notice.isPinned ? 'row-pinned' : ''}`}
                    >
                      <td className="td-category">
                          <span className={notice.isPinned ? 'badge-pinned' : 'badge-category'}>
                            {notice.isPinned ? '★ 중요' : notice.category || notice.dept || '일반'}
                          </span>
                      </td>
                      <td className="td-title">
                        {notice.isPinned && <strong className="pinned-mark">[공지] </strong>}
                        {notice.title}
                      </td>
                      <td className="td-views">{notice.viewCount ?? 0}</td>
                      <td className="td-date">{notice.date}</td>

                      {/* 정회원 및 관리자 전용 삭제 버튼 */}
                      <PermissionGate requiresManager>
                        <td className="td-manage">
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, notice.id, notice.title)}
                            className="btn-delete-item"
                          >
                            삭제
                          </button>
                        </td>
                      </PermissionGate>
                    </tr>

                    {/* 더블클릭 시 슬라이드되는 본문 영역 */}
                    {isExpanded && (
                      <tr className="notice-detail-row">
                        <td colSpan={6} className="notice-detail-content">
                          <div className="detail-header">[공지 본문 내용]</div>
                          <div className="detail-body">
                            {notice.content || '등록된 본문 상세 내용이 없습니다.'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              </tbody>
            </table>
          </div>
        )}

        {/* 작성 모달 */}
        <NoticeCreateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchNotices}
        />
      </div>
    </div>
  );
}
