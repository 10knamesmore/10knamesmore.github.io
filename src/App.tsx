import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Tags from './pages/Tags';
import Archives from './pages/Archives';
import './App.css';

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
