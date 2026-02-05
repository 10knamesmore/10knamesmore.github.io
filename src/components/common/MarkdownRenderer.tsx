import { useEffect, useRef } from 'react';
import { highlightCode } from '../../utils/highlight';
import './MarkdownRenderer.css';

/**
 * Markdown 渲染器组件属性
 */
interface MarkdownRendererProps {
  /** Markdown 格式的内容字符串 */
  content: string;
}

/**
 * Markdown 内容渲染组件
 * 
 * @param props - 组件属性
 * @returns React 组件
 * 
 * @remarks
 * 将 Markdown 格式文本转换为 HTML 并渲染。支持的语法包括：
 * - 代码块（带语法高亮）和行内代码
 * - 标题（h1-h3）
 * - 粗体、斜体、删除线
 * - 链接和图片
 * - 引用块
 * - 有序和无序列表
 * - 水平分割线
 * - 段落
 * 
 * 使用自定义解析器，避免引入第三方 Markdown 库
 * 
 * @example
 * ```tsx
 * <MarkdownRenderer content="# 标题\n\n这是一段**加粗**的文本" />
 * ```
 */
const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let html = content;

    // 处理代码块（带语法高亮）
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      const highlightedCode = lang 
        ? highlightCode(code.trim(), lang) 
        : escapeHtml(code.trim());
      return `<pre><code class="language-${lang || 'plaintext'}">${highlightedCode}</code></pre>`;
    });

    // 处理行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 处理标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 处理粗体和斜体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // 处理图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // 处理引用
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // 处理无序列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // 处理有序列表
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      if (!match.includes('<ul>')) {
        return `<ol>${match}</ol>`;
      }
      return match;
    });

    // 处理水平线
    html = html.replace(/^---$/gm, '<hr />');

    // 处理段落
    html = html.split('\n\n').map(paragraph => {
      if (paragraph.match(/^<[^>]+>/)) {
        return paragraph;
      }
      if (paragraph.trim()) {
        return `<p>${paragraph}</p>`;
      }
      return '';
    }).join('\n');

    containerRef.current.innerHTML = html;
  }, [content]);

  return <div ref={containerRef} className="markdown-content" />;
};

/**
 * HTML 转义函数
 * 
 * @param text - 需要转义的文本
 * @returns 转义后的安全 HTML 文本
 * 
 * @remarks
 * 防止 XSS 攻击，将特殊字符转换为 HTML 实体
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export default MarkdownRenderer;
