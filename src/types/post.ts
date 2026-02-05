export interface PostFrontMatter {
  title: string;
  date: string;
  categories?: string[];
  tags?: string[];
  description?: string;
  cover?: string;
}

export interface Post {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  excerpt: string;
  content: string;
  cover?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  excerpt: string;
  cover?: string;
}
