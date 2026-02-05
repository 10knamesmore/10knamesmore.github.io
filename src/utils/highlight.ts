/**
 * 代码高亮处理函数
 * 
 * @param code - 原始代码字符串
 * @param language - 编程语言标识（如 'javascript', 'typescript', 'python' 等）
 * @returns 包含 HTML 高亮标记的代码字符串
 * 
 * @remarks
 * 使用正则表达式对代码进行词法分析，为不同的语法元素添加 CSS 类名：
 * - `comment`: 注释
 * - `string`: 字符串字面量
 * - `keyword`: 关键字
 * - `number`: 数字字面量
 * - `class-name`: 类型名称（首字母大写）
 * 
 * @example
 * ```ts
 * const highlighted = highlightCode('const x = 42;', 'javascript');
 * // 返回: '<span class="keyword">const</span> x = <span class="number">42</span>;'
 * ```
 */
export const highlightCode = (code: string, language: string): string => {
  /** 各语言的关键字映射表 */
  const keywords: { [key: string]: string[] } = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'interface', 'type', 'enum', 'public', 'private', 'protected'],
    python: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'return', 'import', 'from', 'as', 'try', 'except', 'with', 'lambda', 'yield', 'async', 'await'],
    rust: ['fn', 'let', 'mut', 'const', 'struct', 'enum', 'impl', 'trait', 'pub', 'use', 'mod', 'if', 'else', 'match', 'loop', 'while', 'for', 'return', 'async', 'await'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'new', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'throw', 'import'],
    go: ['func', 'var', 'const', 'type', 'struct', 'interface', 'package', 'import', 'return', 'if', 'else', 'for', 'range', 'go', 'defer', 'select', 'case'],
  };

  const langKeywords = keywords[language.toLowerCase()] || [];
  
  let highlighted = code;

  // 高亮注释
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  
  // 高亮字符串
  highlighted = highlighted.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="string">$1$2$1</span>');

  // 高亮关键字
  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
  });

  // 高亮数字
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

  // 高亮类型名（首字母大写）
  highlighted = highlighted.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="class-name">$1</span>');

  return highlighted;
};
