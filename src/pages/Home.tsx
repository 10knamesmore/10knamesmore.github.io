import { useState, useEffect } from 'react';
import type { PostMeta } from '../types';
import PostCard from '../components/common/PostCard';
import Pagination from '../components/common/Pagination';
import './Home.css';

const POSTS_PER_PAGE = 10;

const Home = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/data/posts-index.json');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (posts.length === 0) {
    return <div className="empty">暂无文章</div>;
  }

  return (
    <div className="home">
      <div className="posts-list">
        {currentPosts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Home;
