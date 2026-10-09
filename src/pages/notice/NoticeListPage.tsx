import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotices, deleteNotice } from '../../api/noticeService';
import { Notice } from '../../types';
import NoticeCreateModal from './NoticeCreateModal';
import NoticeDetailModal from '../../components/common/NoticeDetailModal';
import PermissionGate from '../../components/common/PermissionGate';
import './NoticeListPage.css';

export default function NoticeListPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);

  // 1회 클릭 시 띄울 팝업 모달 상태
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

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

  // 1회 클릭으로 모달 열기
  const handleRowClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDetailOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation(); // 모달 팝업 방지
    if (!window.confirm(`"${title}" 공지사항을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteNotice(id);
      alert('공지사항이 삭제되었습니다.');
      setNotices((prev) => prev.filter((item) => item.id !== id));
      if (selectedNotice?.id === id) {
        setIsDetailOpen(false);
      }
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
            <p className="notice-subtext">* 항목을 클릭하면 상세 내용을 확인하실 수 있습니다.</p>
          </div>
          <div className="notice-header-actions">
            {/* 정회원 및 관리자 전용 작성 버튼 */}
            <PermissionGate requiresManager>
              <button
                type="button"
                className="btn-create-notice"
                onClick={() => setIsWriteModalOpen(true)}
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
              {notices.map((notice) => (
                <tr
                  key={notice.id}
                  onClick={() => handleRowClick(notice)}
                  className={`notice-row ${notice.isPinned ? 'row-pinned' : ''}`}
                  style={{ cursor: 'pointer' }}
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
              ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 신규 등록 모달 */}
        <NoticeCreateModal
          isOpen={isWriteModalOpen}
          onClose={() => setIsWriteModalOpen(false)}
          onSuccess={fetchNotices}
        />

        {/* 1회 클릭 시 열리는 상세 보기 모달 */}
        <NoticeDetailModal
          notice={selectedNotice}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </div>
  );
}
