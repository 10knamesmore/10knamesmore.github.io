import { useEffect } from 'react';

/** 站点名，作为页面标题后缀 */
const SITE_NAME = '王二的博客';

/**
 * 设置浏览器文档标题（`document.title`）。
 *
 * @param title - 页面标题，如文章标题或页面名；传 `undefined`（如数据加载中）时只显示站点名。
 *
 * @remarks
 * 最终标题格式为「{title} · {站点名}」；当 title 省略或恰为站点名时，只显示站点名。
 * 纯客户端设置，主要改善浏览体验与标签页可读性；按文章给爬虫的 OG 预览需后续预渲染。
 *
 * @example
 * ```ts
 * useDocumentTitle();            // "王二的博客"
 * useDocumentTitle('标签');      // "标签 · 王二的博客"
 * useDocumentTitle(post?.title); // 加载完成后为「文章标题 · 王二的博客」
 * ```
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title =
      title && title !== SITE_NAME ? `${title} · ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
