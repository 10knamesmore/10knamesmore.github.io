import { Link } from 'react-router-dom';
import './Header.css';

/**
 * 网站头部导航组件
 * 
 * @returns React 组件
 * 
 * @remarks
 * 提供网站主导航栏，包括：
 * - Logo/标题（点击返回首页）
 * - 导航链接：首页、标签、归档
 */
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
