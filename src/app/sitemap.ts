import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Constants
const BASE_PATH = '/tech-blog';
const DOMAIN = 'https://nimkoes.github.io';
const POSTS_DIRECTORY = path.join(process.cwd(), 'public/resources');

// Types
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapItem {
  url: string;
  lastModified: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

// Helper functions
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

const processMarkdownFile = (file: string): SitemapItem | null => {
  try {
    const fullPath = path.join(POSTS_DIRECTORY, file);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    const slug = file.replace('.md', '');

    return createSitemapItem(
      `${DOMAIN}${BASE_PATH}/post/${slug}`,
      'weekly',
      0.8,
      data.date
    );
  } catch (error) {
    console.error(`Error processing file ${file}:`, error);
    return null;
  }
};

export default function sitemap(): MetadataRoute.Sitemap {
  const posts: SitemapItem[] = [];

  try {
    if (fs.existsSync(POSTS_DIRECTORY)) {
      const files = fs.readdirSync(POSTS_DIRECTORY);
      const processedPosts = files
        .filter(file => file.endsWith('.md'))
        .map(processMarkdownFile)
        .filter((item): item is SitemapItem => item !== null);
      
      posts.push(...processedPosts);
    }
  } catch (error) {
    console.error('Error reading posts directory:', error);
  }

  const staticRoutes: SitemapItem[] = [
    createSitemapItem(DOMAIN, 'daily', 1),
    createSitemapItem(`${DOMAIN}${BASE_PATH}`, 'daily', 1),
    createSitemapItem(`${DOMAIN}/google-site-verification.html`, 'yearly', 0.1),
  ];

  return [...staticRoutes, ...posts];
}