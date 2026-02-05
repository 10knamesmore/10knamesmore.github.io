import { Link } from 'react-router-dom';
import type { PostMeta } from '../../types';
import './PostCard.css';

interface PostCardProps {
  post: PostMeta;
}

const PostCard = ({ post }: PostCardProps) => {
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
