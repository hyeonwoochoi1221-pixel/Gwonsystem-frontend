import React, { useEffect, useRef } from 'react';
import { Notice } from '../../types';

interface NoticeDetailModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoticeDetailModal({ notice, isOpen, onClose }: NoticeDetailModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => { previousFocus?.focus(); };
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !notice) return null;

  return (
    <div className="notice-modal-overlay" onClick={onClose}>
      <div className="notice-modal-dialog" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="notice-detail-title" onClick={(e) => e.stopPropagation()}>
        <div className="notice-modal-header">
          <span className={`modal-badge ${notice.isPinned ? 'pinned' : ''}`}>
            {notice.isPinned ? '★ 중요 공지' : notice.category || notice.dept || '일반'}
          </span>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <h2 className="modal-title" id="notice-detail-title">{notice.title}</h2>

        <div className="modal-meta-info">
          <span>등록일: {notice.date}</span>
          {notice.viewCount !== undefined && <span>조회수: {notice.viewCount}</span>}
        </div>

        <hr className="modal-separator" />

        <div className="modal-body-content">
          {notice.content ? notice.content : '본문 상세 내용이 등록되지 않은 공지사항입니다.'}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-confirm" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
