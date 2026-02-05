export const highlightCode = (code: string, language: string): string => {
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

  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
  
  highlighted = highlighted.replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="string">$1$2$1</span>');

  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
  });

  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

  highlighted = highlighted.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="class-name">$1</span>');

  return highlighted;
};
