import { Link } from 'react-router-dom';
import Logo from "../../assets/logo.svg?react";
import "./Header.css"; // 스타일 파일 임포트

export default function Header() {
  return (
    <header className="main-header">
      <div className="logo-area">
        <Link to="/" className="logo-link">
          {/* Logo 컴포넌트에 직접 클래스를 부여하거나 스타일을 적용합니다 */}
          <Logo className="logo-svg" />
          <span className="system-title">GWONSYSTEM</span>
        </Link>
      </div>
    </header>
  );
}
