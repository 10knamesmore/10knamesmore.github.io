import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PostMeta } from '../types';
import PostCard from '../components/common/PostCard';
import './Tags.css';

interface Metadata {
  totalPosts: number;
  categories: string[];
  tags: string[];
}

const Tags = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [metaResponse, postsResponse] = await Promise.all([
          fetch('/data/metadata.json'),
          fetch('/data/posts-index.json'),
        ]);
        
        const metaData = await metaResponse.json();
        const postsData = await postsResponse.json();
        
        setMetadata(metaData);
        setPosts(postsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedTag) {
      setFilteredPosts(posts.filter(post => post.tags.includes(selectedTag)));
    } else {
      setFilteredPosts([]);
    }
  }, [selectedTag, posts]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
  };

  const getTagCount = (tag: string) => {
    return posts.filter(post => post.tags.includes(tag)).length;
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="tags-page">
      <header className="tags-header">
        <h1>标签</h1>
        <p className="tags-subtitle">共 {metadata?.tags.length || 0} 个标签</p>
      </header>

      <div className="tags-cloud">
        {metadata?.tags.map(tag => (
          <button
            key={tag}
            className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
            <span className="tag-count">{getTagCount(tag)}</span>
          </button>
        ))}
      </div>

      {selectedTag && (
        <div className="filtered-posts">
          <h2 className="filter-title">
            标签: {selectedTag} ({filteredPosts.length})
          </h2>
          <div className="posts-list">
            {filteredPosts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;
