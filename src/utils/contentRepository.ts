import 'server-only';

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import categoryData from '~/resources/category.json';
import { slugifyTag } from '~/utils/tags';
import type { CategoryNode, PostContent, PostMeta } from '~/types/content';

export { slugifyTag };

const POSTS_DIRECTORY = path.join(process.cwd(), 'public/resources');
const DEFAULT_PRODUCTION_SITE_ORIGIN = 'https://nimkoes.github.io';
const DEFAULT_DEVELOPMENT_SITE_ORIGIN = 'http://localhost:3000';

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
  const defaultOrigin =
    process.env.NODE_ENV === 'production'
      ? DEFAULT_PRODUCTION_SITE_ORIGIN
      : DEFAULT_DEVELOPMENT_SITE_ORIGIN;
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || defaultOrigin).replace(/\/+$/, '');
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

interface GroupedPost {
  meta: PostMeta;
  groupId: string;
  groupName: string;
}

function collectPostsWithGroups(nodes: CategoryNode[]): GroupedPost[] {
  const results: GroupedPost[] = [];

  const walk = (node: CategoryNode, parent: CategoryNode | null) => {
    if (isPostNode(node)) {
      results.push({
        meta: {
          title: node.displayName,
          tags: node.tags,
          fileName: node.fileName,
          regDate: node.regDate,
          lastModifiedDate: node.lastModifiedDate,
        },
        groupId: parent?.id ?? '',
        groupName: parent?.displayName ?? '',
      });
    }

    node.children?.forEach(child => walk(child, node));
  };

  nodes.forEach(node => walk(node, null));
  return results;
}

export interface SeriesInfo {
  name: string;
  index: number;
  total: number;
  posts: PostMeta[];
}

export interface PostNavigation {
  series: SeriesInfo | null;
  prev: PostMeta | null;
  next: PostMeta | null;
  related: PostMeta[];
}

export function getPostNavigation(slug: string, relatedLimit = 4): PostNavigation | null {
  const ordered = collectPostsWithGroups(categoryData as CategoryNode[]);
  const index = ordered.findIndex(post => post.meta.fileName === slug);
  if (index === -1) {
    return null;
  }

  const current = ordered[index];
  const prev = index > 0 ? ordered[index - 1].meta : null;
  const next = index < ordered.length - 1 ? ordered[index + 1].meta : null;

  const siblings = ordered.filter(post => post.groupId === current.groupId);
  const series: SeriesInfo | null =
    siblings.length >= 2
      ? {
          name: current.groupName,
          index: siblings.findIndex(post => post.meta.fileName === slug) + 1,
          total: siblings.length,
          posts: siblings.map(post => post.meta),
        }
      : null;

  const currentTags = new Set(current.meta.tags.map(tag => tag.toLowerCase()));
  const related = ordered
    .filter(post => post.meta.fileName !== slug && post.groupId !== current.groupId)
    .map(post => ({
      meta: post.meta,
      score: post.meta.tags.reduce(
        (acc, tag) => acc + (currentTags.has(tag.toLowerCase()) ? 1 : 0),
        0
      ),
    }))
    .filter(entry => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || b.meta.lastModifiedDate.localeCompare(a.meta.lastModifiedDate)
    )
    .slice(0, relatedLimit)
    .map(entry => entry.meta);

  return { series, prev, next, related };
}

export interface TagSummary {
  tag: string;
  slug: string;
  count: number;
}

export function getAllTags(): TagSummary[] {
  const posts = collectPosts(categoryData as CategoryNode[]);
  const bySlug = new Map<string, TagSummary>();

  posts.forEach(post => {
    post.tags.forEach(tag => {
      const slug = slugifyTag(tag);
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        bySlug.set(slug, { tag, slug, count: 1 });
      }
    });
  });

  return Array.from(bySlug.values()).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag)
  );
}

export function getPostsByTagSlug(slug: string): { tag: string; posts: PostMeta[] } | null {
  const decoded = decodeURIComponent(slug);
  const summary = getAllTags().find(entry => entry.slug === decoded);
  if (!summary) {
    return null;
  }

  const posts = sortPosts(
    collectPosts(categoryData as CategoryNode[]).filter(post =>
      post.tags.some(tag => slugifyTag(tag) === summary.slug)
    )
  );

  return { tag: summary.tag, posts };
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
