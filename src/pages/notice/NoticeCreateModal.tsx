import React, { useState } from 'react';
import { createNotice } from '../../api/noticeService';
import { NoticeCreateRequest } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // 등록 완료 후 목록 새로고침용 콜백
}

export default function NoticeCreateModal({ isOpen, onClose, onSuccess }: Props) {
  const [category, setCategory] = useState('일반');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: NoticeCreateRequest = {
        authorId: 1, // 테스트용 임직원 ID
        category,
        title,
        content,
        isPinned
      };

      await createNotice(payload);
      alert('공지사항이 정상적으로 등록되었습니다.');
      onSuccess(); // 부모 컴포넌트 목록 재조회
      onClose();   // 모달 닫기
    } catch (error) {
      console.error(error);
      alert('공지 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#1e1e24', padding: '24px', borderRadius: '8px', width: '450px', color: '#fff' }}>
        <h3 style={{ marginTop: 0 }}>새 공지사항 등록</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', background: '#2c2c35', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            >
              <option value="일반">일반</option>
              <option value="보안팀">보안팀</option>
              <option value="인사팀">인사팀</option>
              <option value="인프라팀">인프라팀</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지 제목을 입력하세요"
              style={{ width: '100%', padding: '8px', background: '#2c2c35', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>내용</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 작성하세요"
              style={{ width: '100%', padding: '8px', background: '#2c2c35', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            상단 고정 공지로 등록
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
