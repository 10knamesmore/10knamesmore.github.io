import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Tags from './pages/Tags';
import Archives from './pages/Archives';
import './App.css';

/**
 * 应用根组件
 * 
 * @returns React 组件
 * 
 * @remarks
 * 配置应用路由和整体布局。路由结构：
 * - `/` - 首页（文章列表）
 * - `/post/:slug` - 文章详情页
 * - `/tags` - 标签页
 * - `/archives` - 归档页
 * - `*` - 404 页面
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="*" element={<div className="not-found">页面不存在</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
