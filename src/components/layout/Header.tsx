import { Link } from 'react-router-dom';
import styles from './Header.module.scss';

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
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link to="/" className={styles.headerLogo}>
          <h1>王二的博客</h1>
        </Link>
        <nav className={styles.headerNav}>
          <Link to="/" className={styles.navLink}>首页</Link>
          <Link to="/tags" className={styles.navLink}>标签</Link>
          <Link to="/archives" className={styles.navLink}>归档</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
