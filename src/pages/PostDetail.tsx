import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Post } from '../types';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import './PostDetail.css';

/**
 * 文章详情页组件
 * 
 * @returns React 组件
 * 
 * @remarks
 * 展示单篇文章的完整内容。主要功能：
 * - 根据 URL 参数中的 slug 加载对应文章
 * - 显示文章标题、日期、分类、标签
 * - 使用 MarkdownRenderer 渲染文章内容
 * - 文章不存在时自动跳转到首页
 * - 提供返回按钮
 */
const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * 加载文章详情数据
     */
    const loadPost = async () => {
      try {
        const response = await fetch(`/data/posts/${slug}.json`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Failed to load post:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug, navigate]);

  /**
   * 格式化日期为中文显示
   * 
   * @param dateString - ISO 8601 格式的日期字符串
   * @returns 格式化后的中文日期字符串
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!post) {
    return <div className="empty">文章不存在</div>;
  }

  return (
    <article className="post-detail">
      <header className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <time className="post-date">{formatDate(post.date)}</time>
          {post.categories.length > 0 && (
            <div className="post-categories">
              {post.categories.map(category => (
                <span key={category} className="category-tag">{category}</span>
              ))}
            </div>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag-item">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      <div className="post-content">
        <MarkdownRenderer content={post.content} />
      </div>

      <footer className="post-footer">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
      </footer>
    </article>
  );
};

export default PostDetail;
