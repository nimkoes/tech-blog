import { MetadataRoute } from 'next';
import { getBasePath, getCategoryPosts, getPostUrl, getSiteOrigin } from '~/utils/contentRepository';

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

  const staticRoutes: SitemapItem[] = [
    createSitemapItem(`${siteOrigin}${basePath}`, 'daily', 1),
    createSitemapItem(`${siteOrigin}${basePath}/feed.xml`, 'daily', 0.6),
    createSitemapItem(`${siteOrigin}${basePath}/google-site-verification.html`, 'yearly', 0.2),
  ];

  const postRoutes = posts.map(post =>
    createSitemapItem(getPostUrl(post.fileName), 'weekly', 0.8, post.lastModifiedDate)
  );

  return [...staticRoutes, ...postRoutes];
}
