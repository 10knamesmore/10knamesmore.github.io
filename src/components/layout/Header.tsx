import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1>王二的博客</h1>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/tags" className="nav-link">标签</Link>
          <Link to="/archives" className="nav-link">归档</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
