# 王二的博客

基于 React + TypeScript + Vite 完全自建的个人博客系统。

## ✨ 特性

- 🚀 **完全自建** - 所有组件从零开始实现，无第三方 UI 库
- 📝 **Markdown 原生支持** - 自动解析 `.md` 文档
- 🎨 **现代化设计** - 简洁优雅的阅读体验
- 📱 **响应式布局** - 完美适配所有设备
- 🏷️ **标签系统** - 智能分类和筛选
- 📅 **时间归档** - 按年份组织文章
- 🎯 **代码高亮** - 自实现的语法高亮引擎
- 🖼️ **图片资源** - 完整的静态资源管理
- 🔧 **可扩展** - 预留 React 组件嵌入能力
- ⚡ **零依赖部署** - 纯静态站点，GitHub Pages 友好

## 🛠️ 技术栈

- React 19
- TypeScript 5.9
- Vite 7
- React Router 7
- SCSS + CSS Modules（无 UI 框架）
- pnpm

## 📦 项目结构

```
wanger-blog/
├── source/                 # 内容源文件
│   ├── posts/             # Markdown 文章
│   ├── images/            # 图片资源
│   └── components/        # (未来) React 组件
├── src/                   # React 应用源码
│   ├── components/
│   │   ├── layout/       # 布局组件
│   │   └── common/       # 通用组件
│   ├── pages/            # 页面
│   ├── utils/            # 工具函数
│   └── types/            # 类型定义
├── scripts/              # 构建脚本
│   └── parse-posts.ts     # Markdown 解析器
├── public/               # 静态资源
│   ├── data/            # 生成的 JSON 数据
│   └── images/          # 复制的图片
└── dist/                 # 构建输出
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 解析文章

```bash
pnpm run parse
```

### 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm run build
```

### 预览构建

```bash
pnpm run preview
```

## 📝 写作指南

### 创建新文章

在 `source/posts/` 创建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2026-02-05
tags:
  - React
  - TypeScript
categories:
  - 前端开发
description: 文章摘要（可选）
cover: /images/cover.jpg（可选）
---

# 正文开始

这是文章内容...
```

### 使用图片

1. 将图片放到 `source/images/` 目录
2. 在文章中引用：

```markdown
![描述](/images/your-image.jpg)
```

### 重新解析

修改文章后运行：

```bash
pnpm run parse
```

浏览器会自动刷新（开发模式下）。

## 🌐 部署

### GitHub Pages（推荐）

1. 推送代码到 GitHub
2. GitHub Actions 会自动构建和部署
3. 确保 GitHub Pages 设置为"GitHub Actions"

### 手动部署

```bash
pnpm run build
# 将 dist/ 目录部署到服务器
```

## 🎨 自定义

### 修改样式

样式采用 SCSS + CSS Modules，每个组件配套一个 `.module.scss`：

- 全局: `src/index.scss`, `src/App.module.scss`
- 共享变量 / mixin: `src/styles/_variables.scss`, `src/styles/_mixins.scss`
- Header: `src/components/layout/Header.module.scss`
- 文章卡片: `src/components/common/PostCard.module.scss`
- Markdown: `src/components/common/MarkdownRenderer.module.scss`

### 修改配置

- 网站标题: `src/components/layout/Header.tsx`
- 分页数量: `src/pages/Home.tsx` 中的 `POSTS_PER_PAGE`
- 摘要长度: `scripts/parse-posts.ts` 中的 `generateExcerpt`

## 🔧 架构设计

### 核心组件

- **MarkdownRenderer**: 自实现的 Markdown 解析器
- **Syntax Highlighter**: 多语言代码高亮
- **Pagination**: 自定义分页器
- **Layout System**: Header + Footer + 内容区

### 数据流

```
source/posts/*.md
    ↓ (parse-posts.ts)
public/data/*.json
    ↓ (fetch)
React Components
    ↓ (render)
用户界面
```

### 扩展性

未来可以支持：
- MDX（在 Markdown 中使用 React 组件）
- 自定义组件标记
- 交互式代码演示

## 📊 特色功能

### 完全自建
- ❌ 无 Material-UI / Ant Design
- ❌ 无 react-markdown
- ❌ 无 highlight.js / prism.js
- ✅ 所有 UI 组件自己实现
- ✅ Markdown 渲染自己实现
- ✅ 代码高亮自己实现
- ✅ 分页逻辑自己实现

### 性能优化
- 静态站点生成（SSG）
- 按需加载文章内容
- 轻量级打包（< 250KB）
- 无服务端依赖

## 🔍 SEO

基础 SEO 已内置：
- 语义化 HTML
- 合理的标题层级
- Meta 标签支持（可扩展）

## 📄 许可证

MIT

## 👤 作者

wanger - 王二的博客

---

**从 Hexo 迁移？** 所有 `.md` 文件和图片已保留，无缝迁移！

## 📝 开发规范

### 脚本开发

- **必须使用 TypeScript** - 所有脚本使用 `.ts` 格式
- **中文 TSDoc 注释** - 每个函数必须有完整的中文 TSDoc 风格注释
- **类型完整** - 所有参数和返回值都要有类型注解

详见 [SCRIPT_GUIDELINES.md](./SCRIPT_GUIDELINES.md)

### 示例

```typescript
/**
 * 从 Markdown 内容生成摘要
 * 
 * @param content - Markdown 内容
 * @param length - 摘要最大长度（默认：200）
 * @returns 提取的摘要文本
 * 
 * @example
 * ```ts
 * generateExcerpt("# 标题\n\n内容", 50)
 * ```
 */
function generateExcerpt(content: string, length: number = 200): string {
  // 实现代码
}
```
