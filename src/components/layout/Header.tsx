import { Link } from 'react-router-dom';
import Logo from "../../assets/logo.svg?react";
import "./Header.css";

export default function Header() {
  return (
    <header className="main-header">
      <div className="logo-area">
        <Link to="/" className="logo-link">
          <Logo className="logo-svg" />
          <span className="system-title">G-WONSYSTEM</span>
        </Link>
      </div>
    </header>
  );
}
