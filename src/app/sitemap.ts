import { MetadataRoute } from 'next';
import { getAllTags, getBasePath, getCategoryPosts, getPostUrl, getSiteOrigin } from '~/utils/contentRepository';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapItem {
  url: string;
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const createSitemapItem = (
  url: string,
  changeFrequency: ChangeFrequency,
  priority: number,
  date?: string
): SitemapItem => ({
  url,
  lastModified: new Date(date || new Date()).toISOString(),
  changeFrequency,
  priority,
});

export default function sitemap(): MetadataRoute.Sitemap {
  const siteOrigin = getSiteOrigin();
  const basePath = getBasePath();
  const posts = getCategoryPosts();
  const latestPostDate = posts[0]?.lastModifiedDate;

  const staticRoutes: SitemapItem[] = [
    createSitemapItem(`${siteOrigin}${basePath}`, 'weekly', 1, latestPostDate),
    createSitemapItem(`${siteOrigin}${basePath}/about`, 'monthly', 0.5, latestPostDate),
    createSitemapItem(`${siteOrigin}${basePath}/tags`, 'weekly', 0.5, latestPostDate),
    createSitemapItem(`${siteOrigin}${basePath}/feed.xml`, 'weekly', 0.6, latestPostDate),
  ];

  const postRoutes = posts.map(post =>
    createSitemapItem(getPostUrl(post.fileName), 'weekly', 0.8, post.lastModifiedDate)
  );

  const tagRoutes = getAllTags().map(({ slug }) =>
    createSitemapItem(
      `${siteOrigin}${basePath}/tags/${encodeURIComponent(slug)}`,
      'weekly',
      0.4,
      latestPostDate
    )
  );

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
