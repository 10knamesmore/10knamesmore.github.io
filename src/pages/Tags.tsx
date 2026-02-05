import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PostMeta } from '../types';
import PostCard from '../components/common/PostCard';
import styles from './Tags.module.scss';

/**
 * 站点元数据接口
 */
interface Metadata {
  /** 文章总数 */
  totalPosts: number;
  /** 分类列表 */
  categories: string[];
  /** 标签列表 */
  tags: string[];
}

/**
 * 标签页组件
 * 
 * @returns React 组件
 * 
 * @remarks
 * 展示所有标签的云图，支持标签筛选功能。主要功能：
 * - 显示所有标签及其文章数量
 * - 点击标签筛选对应文章
 * - 使用 URL 查询参数保持筛选状态
 * - 再次点击已选标签可取消筛选
 */
const Tags = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * 加载元数据和文章索引
     */
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

  /**
   * 处理标签点击事件
   * 
   * @param tag - 点击的标签名称
   * 
   * @remarks
   * 点击已选标签会取消筛选，点击未选标签会进行筛选
   */
  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSearchParams({});
    } else {
      setSearchParams({ tag });
    }
  };

  /**
   * 获取指定标签的文章数量
   * 
   * @param tag - 标签名称
   * @returns 包含该标签的文章数量
   */
  const getTagCount = (tag: string) => {
    return posts.filter(post => post.tags.includes(tag)).length;
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.tagsPage}>
      <header className={styles.tagsHeader}>
        <h1>标签</h1>
        <p className={styles.tagsSubtitle}>共 {metadata?.tags.length || 0} 个标签</p>
      </header>

      <div className={styles.tagsCloud}>
        {metadata?.tags.map(tag => (
          <button
            key={tag}
            className={`${styles.tagButton} ${selectedTag === tag ? 'active' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
            <span className={styles.tagCount}>{getTagCount(tag)}</span>
          </button>
        ))}
      </div>

      {selectedTag && (
        <div className={styles.filteredPosts}>
          <h2 className={styles.filterTitle}>
            标签: {selectedTag} ({filteredPosts.length})
          </h2>
          <div className={styles.postsList}>
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
