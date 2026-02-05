import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { PostMeta } from '../types';
import './Archives.css';

/**
 * 年份分组接口
 */
interface YearGroup {
  /** 年份 */
  year: string;
  /** 该年份的文章列表 */
  posts: PostMeta[];
}

/**
 * 归档页组件
 * 
 * @returns React 组件
 * 
 * @remarks
 * 按年份时间线展示所有文章。主要功能：
 * - 按发布年份倒序分组展示文章
 * - 每篇文章显示月日和标题
 * - 点击标题跳转到文章详情
 * - 显示文章总数统计
 */
const Archives = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * 加载文章索引数据
     */
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

  /**
   * 将文章按年份分组
   * 
   * @returns 年份分组数组，按年份倒序排列
   */
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

  /**
   * 格式化日期为月日显示
   * 
   * @param dateString - ISO 8601 格式的日期字符串
   * @returns 格式化后的月日字符串（如 "01-15"）
   */
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
