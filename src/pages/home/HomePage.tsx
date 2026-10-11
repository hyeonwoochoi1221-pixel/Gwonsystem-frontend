import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getNotices } from '../../api/noticeService';
import { Notice } from '../../types';
import { useAuthRole } from '../../hooks/useAuthRole';
import SemiconductorHero from '../../components/home/SemiconductorHero';
import HomeEvents from '../../components/home/HomeEvents';
import HomeGallery from '../../components/home/HomeGallery';
import NoticeDetailModal from '../../components/common/NoticeDetailModal';
import './HomePage.css';
import { useNoticeDetail } from '../../hooks/useNoticeDetail';

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const detail = useNoticeDetail(loaded => {
    setNotices(prev => prev.map(item => item.id === loaded.id ? loaded : item));
  });
  const { canManageContent, isSupervisor, isLoading } = useAuthRole();
  const location = useLocation();
  const load = () => { setStatus('loading'); getNotices().then(data => { setNotices(data); setStatus('ready'); }).catch(() => setStatus('error')); };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' }); }, [location.hash]);
  const sorted = [...notices].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)) || b.date.localeCompare(a.date));
  const renderBoard = (title: string, news: boolean) => {
    const entries = sorted.filter(n => (n.category === '사내소식') === news).slice(0, 5);
    return <section className="home-news home-overview-card" aria-label={title}>
      <div className="home-section-heading"><h2>{title}</h2><Link to="/notice">전체 보기 →</Link></div>
      <div className="portal-notice-list" aria-live="polite">
        {status === 'loading' ? <p className="empty-text">소식을 불러오고 있습니다…</p> : status === 'error' ? <div className="empty-text"><p>소식을 불러오지 못했습니다.</p><button type="button" className="tab-btn" onClick={load}>다시 시도</button></div> : entries.length === 0 ? <p className="empty-text">등록된 {title}이 없습니다.</p> : entries.map(n => <button type="button" key={n.id} className="interactive-notice-row" onClick={() => { void detail.open(n.id); }}>{n.isPinned && <span className="category-tag pinned">중요</span>}<span className="row-title">{n.title}</span><time className="row-date">{n.date}</time></button>)}
      </div>
    </section>;
  };
  return <div className="academic-home-container">
    <SemiconductorHero />
    <main className="home-content" id="home-updates">
      <div className="home-overview-grid">
        {renderBoard('공지사항', false)}
        <HomeEvents canAdd={isSupervisor && !isLoading} />
        <HomeGallery compact canAdd={canManageContent && !isLoading} />
        <section id="technology" className="home-overview-card home-research" aria-labelledby="research-heading">
          <div className="home-section-heading"><h2 id="research-heading">주요 보유 기술</h2><span className="research-example-label">예시 데이터</span></div>
          <p className="research-intro">기업부설연구소의 기술 분야를 소개합니다. 아래 내용은 구성 검토를 위한 예시입니다.</p>
          <div className="research-list">
            {[
              { title: '반도체 시스템 설계', description: '다양한 연산 장치를 연결하는 시스템 구조와 인터페이스 설계 기술을 연구합니다.', keywords: ['SoC', '인터페이스', '시스템 설계'], application: '센서 데이터 처리 및 연산 모듈 연동', scope: '시스템 요구사항 분석, 구조 설계, 기능 검증' },
              { title: '데이터 수집·분석 플랫폼', description: '연구 데이터를 수집하고 분석할 수 있는 통합 플랫폼 기술을 연구합니다.', keywords: ['데이터 파이프라인', '분석', '모니터링'], application: '실험 데이터 통합 관리 및 결과 시각화', scope: '데이터 수집 구조 설계, 처리 자동화, 분석 화면 구현' },
              { title: '클라우드 인프라·자동화', description: '연구 서비스의 안정적인 운영을 위한 인프라 구성과 자동화 기술을 연구합니다.', keywords: ['클라우드', '운영 자동화', '인프라'], application: '연구 환경 구축 및 서비스 운영', scope: '환경 구성, 배포 자동화, 운영 상태 모니터링' },
            ].map(technology => <details className="research-item" key={technology.title}>
              <summary><span>{technology.title}</span><span className="research-expand" aria-hidden="true">+</span></summary>
              <p>{technology.description}</p>
              <ul className="research-keywords" aria-label="핵심 키워드">{technology.keywords.map(keyword => <li key={keyword}>{keyword}</li>)}</ul>
              <dl><dt>적용 분야</dt><dd>{technology.application}</dd><dt>연구 범위</dt><dd>{technology.scope}</dd></dl>
            </details>)}
          </div>
        </section>
      </div>
      <section id="about" className="home-company">
        <div className="section-header">
          <h2>About Us & Location</h2>
          <p>GWON SYSTEM 본사 위치 및 회사 개요</p>
        </div>

        <div id="contact" className="about-grid">
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
              src="https://maps.google.com/maps?q=서울특별시%20서초구%20방배동%201002-14&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </main>
    <NoticeDetailModal notice={detail.notice} isOpen={detail.isOpen} loading={detail.loading} error={detail.error} onClose={detail.close} />
  </div>;
}
