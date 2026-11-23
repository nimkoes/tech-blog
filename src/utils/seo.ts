import type { PostContent, PostMeta } from '~/types/content';
import { getBasePath, getSiteOrigin } from '~/utils/contentRepository';

export const SITE_NAME = 'Nimkoes Tech Blog';
export const SITE_TITLE = 'Nimkoes Tech Blog | 백엔드와 인프라를 기록하는 기술 블로그';
export const SITE_DESCRIPTION =
  '백엔드, 인프라, 소프트웨어 설계와 개발 경험을 쉬운 말로 정리하는 기술 블로그입니다.';
export const SITE_LOCALE = 'ko_KR';
export const SITE_LANGUAGE = 'ko-KR';
export const AUTHOR_NAME = 'nimkoes';
export const DEFAULT_POST_DESCRIPTION = '개념과 원리를 중심으로 정리한 기술 글입니다.';

export function getSiteUrl() {
  return `${getSiteOrigin()}${getBasePath()}`;
}

// trailingSlash: true 이므로 페이지 주소는 / 로 끝나는 것이 정식 주소다.
export function getHomeUrl() {
  return `${getSiteUrl()}/`;
}

// 작성자 정보는 About 페이지의 Person 과 같은 주소로 연결한다.
export function getAuthorUrl() {
  return `${getSiteUrl()}/about/`;
}

export function getDefaultOgImageUrl() {
  return `${getSiteUrl()}/og-image.png`;
}

export function getPostOgImageUrl(slug: string) {
  return `${getSiteUrl()}/og/${slug}.png`;
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

// Google 검색은 meta keywords 를 쓰지 않는다. JSON-LD keywords 에만 실제 글 태그를 넣는다.
export function getPostKeywords(post: PostMeta) {
  return Array.from(new Set(post.tags));
}

// 화면, Open Graph, JSON-LD 가 같은 날짜를 쓰도록 날짜 원본을 한 곳으로 모은다.
// PostContent.date 와 updatedAt 은 frontmatter 값이 없으면 색인의 regDate, lastModifiedDate 로 채워진다.
export function getPostDates(postContent: Pick<PostContent, 'date' | 'updatedAt'>) {
  const published = postContent.date;
  const modified = postContent.updatedAt || postContent.date;

  return {
    published,
    modified,
    publishedIso: parseIsoDate(published),
    modifiedIso: parseIsoDate(modified),
  };
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

// 사이트 기본 Open Graph. url 은 넣지 않는다.
// layout 에 url 을 두면 자기 openGraph 를 정의하지 않은 모든 페이지(404 포함)가 og:url 로 홈을 주장하게 된다.
export function getDefaultOpenGraph() {
  return {
    type: 'website' as const,
    locale: SITE_LOCALE,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: getDefaultOgImageUrl(),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
        type: 'image/png',
      },
    ],
  };
}

// 페이지 단위 openGraph 는 layout 의 openGraph 를 통째로 대체한다(Next.js 메타데이터 얕은 병합).
// 고유 Canonical 을 가진 페이지는 이 함수로 기본값 위에 제목, 설명, url 을 얹는다.
// twitter 는 layout 에 card 만 두어서, Next.js 가 페이지의 openGraph 제목·설명·이미지로 채우게 한다.
export function getPageOpenGraph({ title, description, url }: { title: string; description: string; url: string }) {
  return {
    ...getDefaultOpenGraph(),
    url,
    title: `${title} | ${SITE_NAME}`,
    description,
  };
}
