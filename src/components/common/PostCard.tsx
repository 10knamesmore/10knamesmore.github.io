import { Link } from 'react-router-dom';
import type { PostMeta } from '../../types';
import styles from './PostCard.module.scss';

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
    <article className={styles.postCard}>
      <Link to={`/post/${post.slug}`} className={styles.postCardLink}>
        <h2 className={styles.postCardTitle}>{post.title}</h2>
        <p className={styles.postCardExcerpt}>{post.excerpt}</p>
        <div className={styles.postCardMeta}>
          <time className={styles.postDate}>{formatDate(post.date)}</time>
          {post.tags.length > 0 && (
            <div className={styles.postTags}>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className={styles.postTag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

export default PostCard;
