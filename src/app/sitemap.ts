import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BASE_PATH = '/tech-blog';
const DOMAIN = 'https://nimkoes.github.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const postsDirectory = path.join(process.cwd(), 'public/resources');
  let posts: MetadataRoute.Sitemap = [];

  try {
    if (fs.existsSync(postsDirectory)) {
      const files = fs.readdirSync(postsDirectory);
      posts = files
        .filter(file => file.endsWith('.md'))
        .map(file => {
          try {
            const fullPath = path.join(postsDirectory, file);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);
            const slug = file.replace('.md', '');

            return {
              url: `${DOMAIN}${BASE_PATH}/post/${slug}`,
              lastModified: new Date(data.date || new Date()).toISOString(),
              changeFrequency: 'weekly',
              priority: 0.8,
            };
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }
  } catch (error) {
    console.error('Error reading posts directory:', error);
  }

  const routes: MetadataRoute.Sitemap = [
    {
      url: DOMAIN,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${DOMAIN}${BASE_PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${DOMAIN}/google-site-verification.html`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    ...posts,
  ];

  return routes;
}