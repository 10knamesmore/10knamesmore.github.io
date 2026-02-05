import styles from './Footer.module.scss';

/**
 * 网站底部组件
 * 
 * @returns React 组件
 * 
 * @remarks
 * 显示版权信息和技术栈说明，年份自动更新为当前年份
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p>&copy; {currentYear} 王二的博客. All rights reserved.</p>
        <p className={styles.footerSubtitle}>Built with React & TypeScript</p>
      </div>
    </footer>
  );
};

export default Footer;
