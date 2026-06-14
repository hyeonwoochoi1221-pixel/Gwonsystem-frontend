import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="main-header">
      <div className="logo-area">
        {/* 로고 클릭 시 홈으로 이동하도록 Link 적용 */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="system-title">GWON SYSTEM</span>
          <span className="badge">INTRANET</span>
        </Link>
      </div>
      <div className="user-profile">
        <span><strong>최현우</strong> 개발자님 환영합니다</span>
      </div>
    </header>
  );
}
