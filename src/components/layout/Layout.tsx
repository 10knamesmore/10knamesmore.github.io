import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.scss';

/**
 * 页面布局组件属性
 */
interface LayoutProps {
  /** 页面主内容 */
  children: ReactNode;
}

/**
 * 页面整体布局组件
 * 
 * @param props - 组件属性
 * @returns React 组件
 * 
 * @remarks
 * 提供统一的页面结构，包含头部、主内容区和底部
 * 所有页面都应使用此组件包裹以保持布局一致性
 * 
 * @example
 * ```tsx
 * <Layout>
 *   <h1>页面标题</h1>
 *   <p>页面内容...</p>
 * </Layout>
 * ```
 */
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
