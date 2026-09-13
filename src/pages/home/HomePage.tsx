import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotices } from '../../api/noticeService';
import { Notice } from '../../types';
import './HomePage.css';

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getNotices()
      .then((data) => setNotices(data.slice(0, 4))) // 최신 4건만 노출
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 회사 강점 데이터 (추후 개별 링크 연결용)
  const strengths = [
    { icon: '🛡️', title: '보안 솔루션', desc: '철저한 사내 보안 및 데이터 무결성 보장', link: '/services/security' },
    { icon: '⚡', title: '클라우드 인프라', desc: '고가용성 분산 아키텍처 및 안정적 호스팅', link: '/services/infra' },
    { icon: '📊', title: '시스템 자동화', desc: '업무 효율성을 극대화하는 맞춤형 DX 체계', link: '/services/dx' },
    { icon: '🤝', title: '실시간 기술 지원', desc: '신속한 사내 문제 해결 및 1:1 전담 유지보수', link: '/services/support' },
  ];

  return (
    <div className="home-page-container">
      {/* 1. 배경 사진(애니메이션) + 회사 문구 + 상세 버튼 (Hero Section) */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">INNOVATIVE SYSTEM SOLUTION</span>
          <h1 className="hero-title">
            Completely reliable,<br />
            <span className="hero-highlight">G-WONSYSTEM</span>
          </h1>
          <p className="hero-description">
            Provide the latest technology and high quality at a reasonable price, and trust your customers with thorough maintenance.
          </p>
          <div className="hero-actions">
            <a href="#about" className="btn-hero-primary">Detail</a>
          </div>
        </div>
      </section>

      {/* 2. 회사 강점 아이콘 섹션 (Features Grid) */}
      <section className="section-wrapper">
        <div className="section-header">
          <h2>Core Strengths</h2>
          <p>GWONSYSTEM이 제공하는 4대 핵심 기술 역량입니다.</p>
        </div>
        <div className="strengths-grid">
          {strengths.map((item, idx) => (
            <Link to={item.link} key={idx} className="strength-card">
              <div className="strength-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="strength-link-text">자세히 보기 &gt;</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. 공지사항 섹션 */}
      <section className="section-wrapper bg-alt">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2>Notice & News</h2>
            <p>최신 사내 공지사항 및 시스템 업데이트 소식입니다.</p>
          </div>
          <Link to="/notice" className="more-link">전체보기 &gt;</Link>
        </div>

        <div className="home-notice-box">
          {loading ? (
            <div className="loading-state">공지사항을 불러오는 중입니다...</div>
          ) : notices.length === 0 ? (
            <div className="empty-state">등록된 공지사항이 없습니다.</div>
          ) : (
            <ul className="home-notice-list">
              {notices.map((n) => (
                <li key={n.id} className="home-notice-item">
                  <div className="notice-meta">
                    <span className={`notice-dept-tag ${n.isPinned ? 'pinned' : ''}`}>
                      {n.isPinned ? '★ 중요' : n.category}
                    </span>
                    <span className="notice-title-text">{n.title}</span>
                  </div>
                  <span className="notice-date-text">{n.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 4. About Us & 회사 위치 구글 지도 */}
      <section id="about" className="section-wrapper">
        <div className="section-header">
          <h2>About Us</h2>
        </div>

        <div className="about-grid">
          <div className="about-info-card">
            <h3>디지털 비즈니스의 신뢰할 수 있는 기반</h3>
            <p>
              GWON SYSTEM은 안정적인 백엔드 시스템과 유연한 인터페이스를 기반으로
              엔터프라이즈 사내 인프라 및 대고객 웹 환경을 제공합니다.
            </p>
            <div className="company-details">
              <p><strong>대표자:</strong> GWONSYSTEM Representative Director 최병환(Brian Choi)</p>
              <p><strong>Adress:</strong> 서울특별시 서초구 방배동 1002-14 서초타운 202호</p>
              <p><strong>Tel:</strong> 010-3917-1928</p>
              <p><strong>Fax:</strong> 02-598-1924</p>
              <div className="detail-row">
                <strong>대표 이메일:</strong>
                <span className="email-group">
                  <a href="cmbhchoi@gwonsystem.com">cmbhchoi@gwonsystem.com</a>
                    <span className="divider">/</span>
                  <a href="cmbhchoi@naver.com">cmbhchoi@naver.com</a>
                </span>
              </div>
            </div>
          </div>

          {/* 구글 지도 임베드 */}
          <div className="map-container">
            <iframe
              title="GWON SYSTEM 위치"
              src="https://www.google.com/maps/embed?pb=!1m5!3m3!1m2!1s0x357ca104edf5147f%3A0x9f89e61d81096b4d!2z64yA7ZWc66-86rWtIOyEnOyauO2KueuzhOyLnCDshJzstIjqtawg67Cp67Cw64-ZIDEwMDItMTQ!5e0!3m2!1sko!2sus!4v1789286729415!5m2!1sko!2sus"
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
