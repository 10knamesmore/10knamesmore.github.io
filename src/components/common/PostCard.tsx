import { Link } from 'react-router-dom';
import type { PostMeta } from '../../types';
import './PostCard.css';

/**
 * 文章卡片组件属性
 */
interface PostCardProps {
  /** 文章元数据 */
  post: PostMeta;
}

/**
 * 文章卡片组件
 * 
 * @param props - 组件属性
 * @returns React 组件
 * 
 * @remarks
 * 在文章列表中展示单篇文章的摘要信息，包括：
 * - 标题（可点击跳转到详情页）
 * - 摘要
 * - 发布日期
 * - 标签（最多显示 3 个）
 * 
 * @example
 * ```tsx
 * <PostCard post={{
 *   slug: 'my-post',
 *   title: '我的文章',
 *   excerpt: '文章摘要...',
 *   date: '2024-01-01',
 *   tags: ['React', 'TypeScript'],
 *   categories: []
 * }} />
 * ```
 */
const PostCard = ({ post }: PostCardProps) => {
  /**
   * 格式化日期为中文显示
   * 
   * @param dateString - ISO 8601 格式的日期字符串
   * @returns 格式化后的中文日期字符串（如 "2024年1月1日"）
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="post-card">
      <Link to={`/post/${post.slug}`} className="post-card-link">
        <h2 className="post-card-title">{post.title}</h2>
        <p className="post-card-excerpt">{post.excerpt}</p>
        <div className="post-card-meta">
          <time className="post-date">{formatDate(post.date)}</time>
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="post-tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default PostCard;
