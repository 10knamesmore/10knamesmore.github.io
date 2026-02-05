# 脚本开发规范

## 核心原则

### ✅ 必须使用 TypeScript
所有脚本必须使用 TypeScript 编写，禁止使用 JavaScript。

**正确：**
```ts
// scripts/my-script.ts
import fs from 'fs';

function processFiles(): void {
  // ...
}
```

**错误：**
```js
// ❌ scripts/my-script.js
// ❌ scripts/my-script.mjs
```

---

## TSDoc 注释规范

### 必需的文档注释

**所有注释必须使用中文。** 每个函数都必须包含 TSDoc 风格的文档注释，包含：

1. **函数描述** - 简要说明函数的用途
2. **@param** - 每个参数的说明
3. **@returns** - 返回值说明（如有）
4. **@remarks** - 详细说明（可选但推荐）
5. **@example** - 使用示例（推荐）
6. **@throws** - 可能抛出的异常（如有）

### 完整示例

```typescript
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
 * 
 * @throws 如果内容为 null 则抛出错误
 */
function generateExcerpt(content: string, length: number = 200): string {
  // 实现代码
}
```

---

## 类型定义规范

### 接口定义

每个数据结构都应该有明确的接口定义，并附带中文注释：

```typescript
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
```

### 类型注解

所有变量、参数和返回值都应该有明确的类型：

```typescript
// ✅ 正确
function readFiles(dirPath: string): string[] {
  const files: string[] = fs.readdirSync(dirPath);
  return files;
}

// ❌ 错误 - 缺少类型
function readFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  return files;
}
```

---

## 函数组织规范

### 单一职责

每个函数应该只做一件事：

```typescript
// ✅ 正确 - 职责清晰
function ensureArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function generateExcerpt(content: string, length: number = 200): string {
  // 仅生成摘要
}

// ❌ 错误 - 做太多事情
function processAndSave(content) {
  // 解析内容
  // 生成摘要
  // 保存文件
  // 输出日志
}
```

### 函数顺序

按照逻辑顺序组织函数：

1. 工具函数（通用、底层）
2. 核心业务函数（中层）
3. 主函数（顶层、调度）

```typescript
// 1. 工具函数
function ensureArray(value: string | string[] | undefined): string[] { }
function generateExcerpt(content: string, length: number): string { }

// 2. 核心业务函数
function parseMarkdownFile(file: string): PostData { }
function savePostData(post: PostData): void { }

// 3. 主函数
function parseMarkdownFiles(): void { }

// 执行主函数
parseMarkdownFiles();
```

---

## 错误处理

### 明确错误类型

使用 @throws 标注可能的错误（使用中文）：

```typescript
/**
 * 读取配置文件
 * 
 * @param filePath - 配置文件路径
 * @returns 解析后的配置对象
 * 
 * @throws 如果文件不存在则抛出错误
 * @throws 如果 JSON 格式错误则抛出 SyntaxError
 * 
 * @example
 * ```ts
 * try {
 *   const config = readConfig('./config.json')
 * } catch (error) {
 *   console.error('读取配置失败:', error)
 * }
 * ```
 */
function readConfig(filePath: string): Config {
  if (!fs.existsSync(filePath)) {
    throw new Error(`配置文件不存在: ${filePath}`);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new SyntaxError(`配置文件 JSON 格式错误: ${filePath}`);
  }
}
```

---

## 运行脚本

### 使用 tsx

所有 TypeScript 脚本使用 `tsx` 运行：

```json
{
  "scripts": {
    "parse": "tsx scripts/parse-posts.ts",
    "build:data": "tsx scripts/build-data.ts",
    "clean": "tsx scripts/clean.ts"
  }
}
```

### 开发依赖

确保安装了必要的依赖：

```bash
pnpm add -D tsx @types/node
```

---

## 示例模板

### 新脚本模板（中文注释）

```typescript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 配置接口
 */
interface Config {
  // 定义配置结构
}

/**
 * 辅助函数描述
 * 
 * @param param1 - 参数1的描述
 * @param param2 - 参数2的描述
 * @returns 返回值描述
 * 
 * @example
 * ```ts
 * helperFunction('值1', '值2')
 * ```
 */
function helperFunction(param1: string, param2: string): string {
  // 实现代码
  return param1 + param2;
}

/**
 * 主函数描述
 * 
 * @remarks
 * 此函数的详细说明：
 * - 步骤 1
 * - 步骤 2
 * - 步骤 3
 * 
 * @throws 如果操作失败则抛出错误
 */
function main(): void {
  try {
    // 实现代码
    console.log('✅ 任务完成');
  } catch (error) {
    console.error('❌ 任务失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
```

---

## 代码检查清单

在提交脚本前，确保：

- [ ] 使用 TypeScript（.ts 文件）
- [ ] **每个函数都有中文 TSDoc 注释**
- [ ] 所有参数都有类型注解
- [ ] 所有返回值都有类型注解
- [ ] 接口定义完整且有中文注释
- [ ] 有使用示例
- [ ] 标注了可能的异常
- [ ] 代码格式化良好
- [ ] 通过 TypeScript 编译
- [ ] 实际测试通过

---

## 最佳实践

### 1. 使用常量

```typescript
// ✅ 正确
const MAX_EXCERPT_LENGTH = 200;
const POSTS_DIR = path.join(__dirname, '../source/posts');

function generateExcerpt(content: string): string {
  return content.slice(0, MAX_EXCERPT_LENGTH);
}
```

### 2. 避免魔法数字

```typescript
// ❌ 错误
content.slice(0, 200)

// ✅ 正确
const DEFAULT_EXCERPT_LENGTH = 200;
content.slice(0, DEFAULT_EXCERPT_LENGTH)
```

### 3. 使用解构

```typescript
// ✅ 正确
const { data, content } = matter(fileContent);

// 不建议
const result = matter(fileContent);
const data = result.data;
const content = result.content;
```

### 4. 合理使用箭头函数

```typescript
// ✅ 正确 - 简单的数组操作
const slugs = files.map(f => f.replace(/\.md$/, ''));

// ✅ 正确 - 复杂逻辑用完整函数
function parseMarkdownFile(file: string): PostData {
  // 复杂逻辑
}
```

### 5. 合理使用可选参数

```typescript
/**
 * 生成摘要，可选长度参数
 * 
 * @param content - 内容
 * @param length - 可选长度（默认：200）
 */
function generateExcerpt(content: string, length: number = 200): string {
  // 实现代码
}
```

---

## 中文注释示例对照

### 函数注释

```typescript
/**
 * 确保值为数组类型
 * 
 * @param value - 需要转换为数组的值
 * @returns 数组形式的值
 * 
 * @example
 * ```ts
 * ensureArray('标签1') // ['标签1']
 * ensureArray(['标签1', '标签2']) // ['标签1', '标签2']
 * ensureArray(undefined) // []
 * ```
 */
function ensureArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
```

### 接口注释

```typescript
/**
 * 文章完整数据接口（包含内容）
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
```

### 行内注释

```typescript
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
    
    // 添加到索引（不包含内容）
    const { content, ...postMeta } = postData;
    postsIndex.push(postMeta);
  });

  // 输出统计信息
  console.log(`✅ 解析了 ${files.length} 篇文章`);
}
```

---

## 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TSDoc 规范](https://tsdoc.org/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

**记住：好的代码是写给人读的，顺便让机器执行。使用中文注释让团队成员更容易理解！**
