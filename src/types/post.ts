/**
 * 文章前置元数据接口
 * 
 * @remarks
 * 对应 Markdown 文件头部的 YAML frontmatter 字段
 */
export interface PostFrontMatter {
  /** 文章标题 */
  title: string;
  /** 发布日期（ISO 8601 格式） */
  date: string;
  /** 文章分类列表 */
  categories?: string[];
  /** 文章标签列表 */
  tags?: string[];
  /** 文章描述/摘要 */
  description?: string;
  /** 封面图片 URL */
  cover?: string;
}

/**
 * 完整文章数据接口
 * 
 * @remarks
 * 包含文章元数据和完整内容，用于文章详情页
 */
export interface Post {
  /** 文章唯一标识符（URL slug） */
  slug: string;
  /** 文章标题 */
  title: string;
  /** 发布日期（ISO 8601 格式） */
  date: string;
  /** 文章分类列表 */
  categories: string[];
  /** 文章标签列表 */
  tags: string[];
  /** 文章摘要 */
  excerpt: string;
  /** 文章完整内容（Markdown 格式） */
  content: string;
  /** 封面图片 URL */
  cover?: string;
}

/**
 * 文章索引元数据接口
 * 
 * @remarks
 * 用于文章列表展示，不包含完整内容以减少数据传输
 */
export interface PostMeta {
  /** 文章唯一标识符（URL slug） */
  slug: string;
  /** 文章标题 */
  title: string;
  /** 发布日期（ISO 8601 格式） */
  date: string;
  /** 文章分类列表 */
  categories: string[];
  /** 文章标签列表 */
  tags: string[];
  /** 文章摘要 */
  excerpt: string;
  /** 封面图片 URL */
  cover?: string;
}
