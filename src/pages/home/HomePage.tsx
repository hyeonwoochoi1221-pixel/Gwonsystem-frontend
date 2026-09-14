import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotices } from '../../api/noticeService';
import { Notice } from '../../types';
import Logo from '../../assets/logo.svg?react';
import './HomePage.css';

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    getNotices()
      .then((data) => setNotices(data.slice(0, 5))) // 최신 공지 5건
      .catch(console.error);
  }, []);

  return (
    <div className="academic-home-container">
      {/* 1. 상단 대형 와이드 배너 */}
      <section className="portal-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-logo-badge">
            <Logo className="hero-logo-svg" />
            <span className="hero-logo-text">G-WON SYSTEM</span>
          </div>
          <p className="hero-subtext">Heterogeneous SoC Innovations & Cloud Infrastructure</p>
          <h1 className="hero-main-title">G-WON SYSTEM 2026</h1>
          <h2 className="hero-conference-desc">Innovative System & Cloud Architecture Portal</h2>
          <div className="hero-meta-badge">
            <span>📅 2026. 10. 11 - 14</span>
            <span className="divider">|</span>
            <span>📍 Pyeongtaek Convention Center, Korea</span>
          </div>
        </div>
      </section>

      {/* 2. 메인 콘텐츠 2x2 카드 그리드 */}
      <main className="portal-grid-section">
        {/* [좌상단] 공지사항 */}
        <div className="portal-card">
          <div className="card-top-bar">
            <h3>공지사항</h3>
            <Link to="/notice" className="btn-more">+ more</Link>
          </div>
          <ul className="portal-notice-list">
            {notices.length === 0 ? (
              <li className="empty-text">등록된 공지사항이 없습니다.</li>
            ) : (
              notices.map((n) => (
                <li key={n.id} className="portal-notice-item">
                  <span className="notice-title">
                    {n.isPinned && <strong className="pinned-star">[중요] </strong>}
                    {n.title}
                  </span>
                  <span className="notice-date">{n.date}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* [우상단] 학술/주요 행사 및 일정 */}
        <div className="portal-card">
          <div className="card-top-bar">
            <h3>주요 행사 및 일정</h3>
            <Link to="/schedules" className="btn-more">+ more</Link>
          </div>
          <div className="event-grid">
            <div className="event-item-box">
              <span className="event-badge">인프라점검</span>
              <p className="event-title">하반기 보안 정기 점검 세미나</p>
              <span className="event-date">2026-10-11 ~ 2026-10-14</span>
            </div>
            <div className="event-item-box">
              <span className="event-badge">전사미팅</span>
              <p className="event-title">클라우드 DX 컨퍼런스 2026</p>
              <span className="event-date">2026-11-05</span>
            </div>
          </div>
        </div>

        {/* [좌하단] 사내 소식 */}
        <div className="portal-card">
          <div className="card-top-bar">
            <h3>사내 소식</h3>
            <Link to="/news" className="btn-more">+ more</Link>
          </div>
          <ul className="portal-notice-list">
            <li className="portal-notice-item">
              <span className="notice-title">2026년 신규 클라우드 인프라 아키텍처 도입</span>
              <span className="notice-date">2026-09-10</span>
            </li>
            <li className="portal-notice-item">
              <span className="notice-title">GWON SYSTEM 평택 데이터센터 증설 안내</span>
              <span className="notice-date">2026-08-28</span>
            </li>
            <li className="portal-notice-item">
              <span className="notice-title">사내 DX 자동화 파이프라인 개발 완료</span>
              <span className="notice-date">2026-08-15</span>
            </li>
          </ul>
        </div>

        {/* [우하단] 포토 갤러리 */}
        <div className="portal-card">
          <div className="card-top-bar">
            <h3>포토갤러리</h3>
            <Link to="/gallery" className="btn-more">+ more</Link>
          </div>
          <div className="gallery-thumbnail-row">
            <div className="gallery-thumb">
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop" alt="행사사진 1" />
              <p>전사 컨퍼런스 현장</p>
            </div>
            <div className="gallery-thumb">
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop" alt="행사사진 2" />
              <p>인프라 기술 연구회</p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. About Us & 회사 위치 구글 지도 (하단 유지) */}
      <section id="about" className="section-wrapper">
        <div className="section-header">
          <h2>About Us & Location</h2>
          <p>GWON SYSTEM 본사 위치 및 회사 개요</p>
        </div>

        <div className="about-grid">
          <div className="about-info-card">
            <h3>디지털 비즈니스의 신뢰할 수 있는 기반</h3>
            <p>
              GWON SYSTEM은 안정적인 백엔드 시스템과 유연한 인터페이스를 기반으로
              엔터프라이즈 사내 인프라 및 대고객 웹 환경을 제공합니다.
            </p>
            <div className="company-details">
              <p><strong>Representative Director:</strong> 최병환(Brian Choi)</p>
              <p><strong>Address:</strong> 서울특별시 서초구 방배동 1002-14 서초타운 202호</p>
              <p><strong>Tel:</strong> 010-3917-1928</p>
              <p><strong>Fax:</strong> 02-598-1924</p>
              {/* 이메일 2개 가로 정렬 유지 */}
              <div className="detail-row">
                <span className="detail-label">E-mail:</span>
                <div className="email-group">
                  <a href="mailto:cmbhchoi@gwonsystem.com">cmbhchoi@gwonsystem.com</a>
                  <a href="mailto:cmbhchoi@naver.com">cmbhchoi@naver.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* 구글 지도 임베드 */}
          <div className="map-container">
            <iframe
              title="GWON SYSTEM 위치"
              src="https://www.google.com/maps/embed?pb=!1m5!3m3!1m2!1s0x357ca104edf5147f%3A0x642c12d36829e252!2z64yA7ZWc66-86rWtIOyEnOyauO2KueuzhOyLnCDshJzstIjqtawg66qF64us66GcIDE5!5e0!3m2!1sko!2sus!4v1789302678606!5m2!1sko!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
