import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../source/posts');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const POSTS_OUTPUT = path.join(OUTPUT_DIR, 'posts');
const IMAGES_SRC = path.join(__dirname, '../source/images');
const IMAGES_DEST = path.join(__dirname, '../public/images');
const PUBLIC_DIR = path.join(__dirname, '../public');

/** 站点公开 URL（用于 SEO 文件中的绝对链接） */
const SITE_URL = 'https://10knamesmore.github.io';

/**
 * 文章前置元数据接口
 */
interface PostFrontMatter {
  title?: string;
  date?: string;
  categories?: string | string[];
  tags?: string | string[];
  description?: string;
  cover?: string;
}

/**
 * 文章索引元数据接口
 */
interface PostMeta {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  excerpt: string;
  cover?: string;
}

/**
 * 完整文章数据接口（包含内容）
 */
interface PostData extends PostMeta {
  content: string;
}

/**
 * 所有文章的汇总元数据
 */
interface Metadata {
  totalPosts: number;
  categories: string[];
  tags: string[];
}

/**
 * 确保值为数组类型
 * 
 * @param value - 需要转换为数组的值
 * @returns 数组形式的值
 * 
 * @example
 * ```ts
 * ensureArray('tag1') // ['tag1']
 * ensureArray('rust, 源码') // ['rust', '源码']（按逗号拆分并 trim）
 * ensureArray(['tag1', 'tag2']) // ['tag1', 'tag2']
 * ensureArray(undefined) // []
 * ```
 */
function ensureArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : String(value).split(',');
  return list.map(item => String(item).trim()).filter(Boolean);
}

/**
 * 从 Markdown 内容生成摘要
 * 
 * @param content - Markdown 内容
 * @param length - 摘要最大长度（默认：200）
 * @returns 提取的摘要文本
 * 
 * @remarks
 * 此函数会：
 * - 移除代码块
 * - 移除 Markdown 标题标记
 * - 移除 Markdown 链接（保留链接文本）
 * - 移除 Markdown 格式化字符
 * - 截断到指定长度
 * 
 * @example
 * ```ts
 * const content = "# 标题\n\n一些**加粗**的内容";
 * generateExcerpt(content, 50) // "一些加粗的内容"
 * ```
 */
function generateExcerpt(content: string, length: number = 200): string {
  const plainText = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .trim();

  return plainText.length > length
    ? plainText.slice(0, length) + '...'
    : plainText;
}

/**
 * 确保目录存在，不存在则创建
 * 
 * @param dirPath - 目录路径
 * 
 * @throws 如果创建目录失败则抛出错误
 * 
 * @example
 * ```ts
 * ensureDirectory('./public/data')
 * ```
 */
function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 复制图片资源从源目录到 public 目录
 * 
 * @remarks
 * - 如果目标目录已存在则先删除
 * - 递归复制源目录中的所有文件
 * - 完成后在控制台输出成功消息
 * 
 * @throws 如果复制操作失败则抛出错误
 * 
 * @example
 * ```ts
 * copyImages() // 从 source/images 复制到 public/images
 * ```
 */
function copyImages(): void {
  if (fs.existsSync(IMAGES_SRC)) {
    if (fs.existsSync(IMAGES_DEST)) {
      fs.rmSync(IMAGES_DEST, { recursive: true, force: true });
    }
    fs.cpSync(IMAGES_SRC, IMAGES_DEST, { recursive: true });
    console.log('📸 Copied images to public/');
  }
}

/**
 * 解析单个 Markdown 文件并提取元数据
 * 
 * @param file - Markdown 文件名
 * @returns 文章元数据和内容
 * 
 * @remarks
 * 此函数会：
 * - 读取 Markdown 文件
 * - 使用 gray-matter 解析前置元数据
 * - 生成文章元数据
 * - 如果没有提供描述则自动生成摘要
 * 
 * @throws 如果文件读取失败则抛出错误
 * 
 * @example
 * ```ts
 * const post = parseMarkdownFile('my-post.md')
 * console.log(post.title) // "我的文章标题"
 * ```
 */
function parseMarkdownFile(file: string): PostData {
  const filePath = path.join(POSTS_DIR, file);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);

  const frontMatter = data as PostFrontMatter;
  const slug = file.replace(/\.md$/, '');

  const postData: PostData = {
    slug,
    title: frontMatter.title || slug,
    date: frontMatter.date || new Date().toISOString(),
    categories: ensureArray(frontMatter.categories),
    tags: ensureArray(frontMatter.tags),
    excerpt: frontMatter.description || generateExcerpt(content),
    cover: frontMatter.cover,
    content,
  };

  return postData;
}

/**
 * 保存文章数据到 JSON 文件
 * 
 * @param post - 要保存的文章数据
 * 
 * @remarks
 * 将文章数据以格式化的 JSON 形式写入到 `public/data/posts/{slug}.json`
 * 
 * @throws 如果文件写入失败则抛出错误
 * 
 * @example
 * ```ts
 * savePostData({ slug: 'my-post', title: '我的文章', ... })
 * ```
 */
function savePostData(post: PostData): void {
  fs.writeFileSync(
    path.join(POSTS_OUTPUT, `${post.slug}.json`),
    JSON.stringify(post, null, 2)
  );
}

/**
 * 保存文章索引到 JSON 文件
 * 
 * @param posts - 文章元数据数组
 * 
 * @remarks
 * - 按日期排序（最新的在前）
 * - 写入到 `public/data/posts-index.json`
 * 
 * @throws 如果文件写入失败则抛出错误
 * 
 * @example
 * ```ts
 * savePostsIndex([post1, post2, post3])
 * ```
 */
function savePostsIndex(posts: PostMeta[]): void {
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'posts-index.json'),
    JSON.stringify(posts, null, 2)
  );
}

/**
 * 从文章列表生成并保存元数据
 * 
 * @param posts - 文章元数据数组
 * @returns 生成的元数据对象
 * 
 * @remarks
 * 提取并统计：
 * - 文章总数
 * - 唯一的分类列表（已排序）
 * - 唯一的标签列表（已排序）
 * 
 * @throws 如果文件写入失败则抛出错误
 * 
 * @example
 * ```ts
 * const metadata = generateMetadata([post1, post2])
 * console.log(metadata.totalPosts) // 2
 * ```
 */
function generateMetadata(posts: PostMeta[]): Metadata {
  const categories = new Set<string>();
  const tags = new Set<string>();

  posts.forEach(post => {
    post.categories.forEach(cat => categories.add(cat));
    post.tags.forEach(tag => tags.add(tag));
  });

  const metadata: Metadata = {
    totalPosts: posts.length,
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  return metadata;
}

/**
 * 转义 XML 特殊字符，使文本可安全嵌入 XML
 *
 * @param text - 原始文本
 * @returns 转义后的文本
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 构造单篇文章的绝对 URL
 *
 * @param slug - 文章 slug（可能含中文，按 path 段编码）
 * @returns 文章详情页的绝对 URL
 */
function postUrl(slug: string): string {
  return `${SITE_URL}/post/${encodeURIComponent(slug)}`;
}

/**
 * 生成 SEO 静态文件：robots.txt、sitemap.xml、feed.xml（RSS 2.0）
 *
 * @param posts - 已按日期倒序排列的文章索引
 *
 * @remarks
 * 输出到 public/ 根目录，构建后位于站点根，`/sitemap.xml`、`/feed.xml`、
 * `/robots.txt` 可直接访问。文章 URL 的中文 slug 用 encodeURIComponent 编码，
 * 标题/摘要文本用 escapeXml 转义。
 */
function generateSeoFiles(posts: PostMeta[]): void {
  // robots.txt：允许全部抓取并指向 sitemap
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots);

  // sitemap.xml：静态页 + 每篇文章
  const staticUrls = ['/', '/tags', '/archives'].map(
    p => `  <url>\n    <loc>${SITE_URL}${p}</loc>\n  </url>`
  );
  const postUrls = posts.map(post => {
    const lastmod = new Date(post.date).toISOString().slice(0, 10);
    return `  <url>\n    <loc>${postUrl(post.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  });
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...postUrls].join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);

  // feed.xml：RSS 2.0
  const items = posts.map(post => {
    const url = postUrl(post.slug);
    return `    <item>\n      <title>${escapeXml(post.title)}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>${new Date(post.date).toUTCString()}</pubDate>\n      <description>${escapeXml(post.excerpt)}</description>\n    </item>`;
  });
  const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>王二的博客</title>\n    <link>${SITE_URL}/</link>\n    <description>王二的个人博客</description>\n    <language>zh-CN</language>\n    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n${items.join('\n')}\n  </channel>\n</rss>\n`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'feed.xml'), rss);

  console.log('🔎 Generated robots.txt, sitemap.xml, feed.xml');
}

/**
 * 解析所有 Markdown 文件的主函数
 * 
 * @remarks
 * 此函数协调整个解析流程：
 * 1. 确保输出目录存在
 * 2. 复制图片资源
 * 3. 读取并解析所有 Markdown 文件
 * 4. 生成每篇文章的 JSON 文件
 * 5. 生成文章索引
 * 6. 生成元数据
 * 7. 输出统计信息
 * 
 * @throws 如果任何步骤失败则抛出错误
 * 
 * @example
 * ```ts
 * parseMarkdownFiles()
 * // 输出：
 * // 📸 Copied images to public/
 * // ✅ Parsed 15 posts
 * // 📁 Categories: 5
 * // 🏷️  Tags: 16
 * ```
 */
function parseMarkdownFiles(): void {
  // 确保目录存在
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(POSTS_OUTPUT);

  // 复制图片资源
  copyImages();

  // 读取所有 Markdown 文件
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
  const postsIndex: PostMeta[] = [];

  // 解析每个文件
  files.forEach(file => {
    const postData = parseMarkdownFile(file);

    // 保存单篇文章数据
    savePostData(postData);

    // 添加到索引（剔除正文，索引只保留元数据，避免列表页下载冗余）
    const postMeta: PostMeta = {
      slug: postData.slug,
      title: postData.title,
      date: postData.date,
      categories: postData.categories,
      tags: postData.tags,
      excerpt: postData.excerpt,
      cover: postData.cover,
    };
    postsIndex.push(postMeta);
  });

  // 保存文章索引
  savePostsIndex(postsIndex);

  // 生成并保存元数据
  const metadata = generateMetadata(postsIndex);

  // 生成 SEO 静态文件（robots.txt / sitemap.xml / feed.xml）
  generateSeoFiles(postsIndex);

  // 输出统计信息
  console.log(`✅ Parsed ${files.length} posts`);
  console.log(`📁 Categories: ${metadata.categories.length}`);
  console.log(`🏷️  Tags: ${metadata.tags.length}`);
}

// 执行主函数
parseMarkdownFiles();
