import 'server-only';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import categoryData from '~/resources/category.json';
import type { CategoryNode, PostContent, PostMeta } from '~/types/content';

const POSTS_DIRECTORY = path.join(process.cwd(), 'public/resources');
const DEFAULT_SITE_URL = 'https://nimkoes.github.io';

function normalizeBasePath(basePath?: string) {
  if (!basePath) return '/tech-blog';
  const normalized = basePath.startsWith('/') ? basePath : `/${basePath}`;
  return normalized.replace(/\/+$/, '');
}

function isPostNode(node: CategoryNode): node is CategoryNode &
  Required<Pick<CategoryNode, 'fileName' | 'tags' | 'regDate' | 'lastModifiedDate'>> {
  return Boolean(
    node.fileName &&
      node.displayName &&
      node.tags &&
      node.regDate &&
      node.lastModifiedDate
  );
}

function collectPosts(nodes: CategoryNode[]): PostMeta[] {
  const results: PostMeta[] = [];

  const walk = (node: CategoryNode) => {
    if (isPostNode(node)) {
      results.push({
        title: node.displayName,
        tags: node.tags,
        fileName: node.fileName,
        regDate: node.regDate,
        lastModifiedDate: node.lastModifiedDate,
      });
    }

    node.children?.forEach(walk);
  };

  nodes.forEach(walk);
  return results;
}

function sortPosts(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => {
    if (a.lastModifiedDate !== b.lastModifiedDate) {
      return b.lastModifiedDate.localeCompare(a.lastModifiedDate);
    }

    return b.fileName.localeCompare(a.fileName);
  });
}

function readMarkdown(slug: string): { data: Record<string, unknown>; content: string } | null {
  const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  return matter(raw);
}

export function getSiteOrigin() {
  const basePath = getBasePath();
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
  if (configured.endsWith(basePath)) {
    return configured.slice(0, configured.length - basePath.length);
  }
  return configured;
}

export function getBasePath() {
  return normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
}

export function getCategoryPosts(): PostMeta[] {
  return sortPosts(collectPosts(categoryData as CategoryNode[]));
}

export function getCategoryPostBySlug(slug: string): PostMeta | null {
  const posts = collectPosts(categoryData as CategoryNode[]);
  return posts.find(post => post.fileName === slug) ?? null;
}

export function getPostContent(slug: string): PostContent | null {
  const post = getCategoryPostBySlug(slug);
  const markdown = readMarkdown(slug);

  if (!post || !markdown) {
    return null;
  }

  const title = String(markdown.data.title || post.title);
  const description = String(markdown.data.description || '');
  const date = String(markdown.data.date || post.lastModifiedDate);

  return {
    slug,
    title,
    description,
    date,
    content: markdown.content,
  };
}

export function getAllMarkdownSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''))
    .sort();
}

export function getPostUrl(slug: string) {
  return `${getSiteOrigin()}${getBasePath()}/post/${slug}`;
}
