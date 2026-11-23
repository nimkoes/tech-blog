import { MetadataRoute } from 'next';
import { getAllTags, getBasePath, getCategoryPosts, getPostUrl, getSiteOrigin } from '~/utils/contentRepository';

export const dynamic = 'force-static';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapItem {
  url: string;
  lastModified?: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

// lastmod 는 실제 콘텐츠 수정일만 쓴다. 날짜를 알 수 없으면 빌드 시각으로 채우지 않고 생략한다.
// 콘텐츠 날짜는 시각 없이 YYYY-MM-DD 로 관리하므로, 있지도 않은 시각(UTC 00:00)을 붙이지 않고 날짜만 쓴다.
// (W3C Datetime 은 날짜만 쓰는 형식을 허용한다.)
const toLastModified = (date?: string) => {
  if (!date) return undefined;
  const dateOnly = date.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly) && !Number.isNaN(new Date(dateOnly).getTime())) {
    return dateOnly;
  }
  return undefined;
};

const createSitemapItem = (
  url: string,
  changeFrequency: ChangeFrequency,
  priority: number,
  date?: string
): SitemapItem => {
  const lastModified = toLastModified(date);
  return {
    url,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  };
};

export default function sitemap(): MetadataRoute.Sitemap {
  const siteOrigin = getSiteOrigin();
  const basePath = getBasePath();
  const posts = getCategoryPosts();
  const latestPostDate = posts[0]?.lastModifiedDate;

  const staticRoutes: SitemapItem[] = [
    // trailingSlash: true 이므로 모든 페이지 주소는 / 로 끝나는 것이 정식 주소다.
    createSitemapItem(`${siteOrigin}${basePath}/`, 'weekly', 1, latestPostDate),
    // About 은 실제 수정일을 계산할 수 없으므로 lastmod 를 생략한다.
    createSitemapItem(`${siteOrigin}${basePath}/about/`, 'monthly', 0.5),
    createSitemapItem(`${siteOrigin}${basePath}/tags/`, 'weekly', 0.5, latestPostDate),
  ];

  const postRoutes = posts.map(post =>
    createSitemapItem(getPostUrl(post.fileName), 'weekly', 0.8, post.lastModifiedDate)
  );

  // 태그 페이지 lastmod 는 그 태그가 달린 글 중 가장 최근 수정일이다.
  const tagRoutes = getAllTags().filter(({ count }) => count >= 2).map(({ slug, lastModified }) =>
    createSitemapItem(
      `${siteOrigin}${basePath}/tags/${encodeURIComponent(slug)}/`,
      'weekly',
      0.4,
      lastModified
    )
  );

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
