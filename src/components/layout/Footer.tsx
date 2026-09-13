// src/components/layout/Footer.tsx
import React, { useRef } from 'react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const formRef = useRef<HTMLFormElement>(null);

  const onPopKBAuthMark = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open(
      '',
      'KB_AUTHMARK',
      'height=604, width=648, status=yes, toolbar=no, menubar=no, location=no'
    );
    if (formRef.current) {
      formRef.current.action = 'https://escrow1.kbstar.com/quics';
      formRef.current.target = 'KB_AUTHMARK';
      formRef.current.submit();
    }
  };

  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* KB에스크로 인증마크 (크기 확대) */}
        <div className="escrow-area">
          <a
            href="#kb-escrow"
            onClick={onPopKBAuthMark}
            className="escrow-link"
            title="KB국민은행 에스크로 이체 인증마크 확인 (새창)"
          >
            <img
              src="https://img1.kbstar.com/img/escrow/escrowcmark.gif"
              alt="KB에스크로 이체 인증마크"
              className="escrow-badge-img"
            />
          </a>
          <form ref={formRef} name="KB_AUTHMARK_FORM" method="get" style={{ display: 'none' }}>
            <input type="hidden" name="page" value="B009111" />
            <input type="hidden" name="cc" value="b010807:b008491" />
            <input type="hidden" name="mHValue" value="6f3425d3052161848fb49e73bbe7f57b" />
          </form>
        </div>

        {/* 푸터 텍스트 영역 (가운데 정렬) */}
        <div className="footer-info">
          <p className="company-text"><strong>GWON SYSTEM</strong> | 대표자: 최현우</p>
          <p className="company-text">본사: 대한민국 경기도 평택시 | 문의: contact@gwonsystem.com</p>
          <p className="copyright">© {currentYear} GWON System Inc. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
