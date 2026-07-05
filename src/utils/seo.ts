import type { PostContent, PostMeta } from '~/types/content';
import { getBasePath, getSiteOrigin } from '~/utils/contentRepository';

export const SITE_NAME = 'Nimkoes Tech Blog';
export const SITE_TITLE = 'Nimkoes Tech Blog | 백엔드와 인프라를 기록하는 기술 블로그';
export const SITE_DESCRIPTION =
  '백엔드, 인프라, 소프트웨어 설계와 개발 경험을 쉬운 말로 정리하는 기술 블로그입니다.';
export const SITE_LOCALE = 'ko_KR';
export const SITE_LANGUAGE = 'ko-KR';
export const AUTHOR_NAME = 'Nimkoes';
export const DEFAULT_POST_DESCRIPTION = '개념과 원리를 중심으로 정리한 기술 글입니다.';
export const DEFAULT_KEYWORDS = [
  '개발 블로그',
  '기술 블로그',
  '백엔드',
  '인프라',
  '소프트웨어 설계',
  '아키텍처',
  'Next.js',
  'React',
];

export function getSiteUrl() {
  return `${getSiteOrigin()}${getBasePath()}`;
}

export function getDefaultOgImageUrl() {
  return `${getSiteUrl()}/og-image.png`;
}

export function toAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, getSiteOrigin()).toString();
}

export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, ' ')
    .replace(/^\s*[-*+]\s+/gm, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/^\s*>\s?/gm, ' ')
    .replace(/\|/g, ' ')
    .replace(/[*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(text: string, maxLength = 160) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function extractExcerpt(markdown: string, maxLength = 160) {
  const text = stripMarkdown(markdown);
  return truncateText(text, maxLength);
}

export function getPostSeoDescription(postContent: PostContent | null) {
  const description = postContent?.description?.trim();

  if (description) {
    return truncateText(description, 160);
  }

  const excerpt = postContent?.content ? extractExcerpt(postContent.content, 160) : '';
  return excerpt || DEFAULT_POST_DESCRIPTION;
}

export function getPostKeywords(post: PostMeta) {
  const titleKeywords = post.title
    .split(/[\s/()[\],:+-]+/)
    .map(value => value.trim())
    .filter(value => value.length >= 2);

  return Array.from(new Set([...DEFAULT_KEYWORDS, ...post.tags, ...titleKeywords]));
}

export function parseIsoDate(date?: string) {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

export function serializeJsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function deriveImageAlt(src: string, fallback = '본문 이미지') {
  const fileName = decodeURIComponent(src.split('/').pop()?.split('?')[0] || '');
  const normalized = fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  return normalized || fallback;
}
