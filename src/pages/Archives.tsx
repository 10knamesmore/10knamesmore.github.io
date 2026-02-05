import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { PostMeta } from '../types';
import './Archives.css';

interface YearGroup {
  year: string;
  posts: PostMeta[];
}

const Archives = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
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

  const groupByYear = (): YearGroup[] => {
    const groups: { [key: string]: PostMeta[] } = {};
    
    posts.forEach(post => {
      const year = new Date(post.date).getFullYear().toString();
      if (!groups[year]) {
        groups[year] = [];
      }
      groups[year].push(post);
    });

    return Object.keys(groups)
      .sort((a, b) => Number(b) - Number(a))
      .map(year => ({ year, posts: groups[year] }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  const yearGroups = groupByYear();

  return (
    <div className="archives-page">
      <header className="archives-header">
        <h1>归档</h1>
        <p className="archives-subtitle">共 {posts.length} 篇文章</p>
      </header>

      <div className="archives-timeline">
        {yearGroups.map(({ year, posts: yearPosts }) => (
          <div key={year} className="year-group">
            <h2 className="year-title">{year}</h2>
            <div className="posts-timeline">
              {yearPosts.map(post => (
                <div key={post.slug} className="timeline-item">
                  <time className="timeline-date">{formatDate(post.date)}</time>
                  <Link to={`/post/${post.slug}`} className="timeline-link">
                    <h3 className="timeline-title">{post.title}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Archives;
