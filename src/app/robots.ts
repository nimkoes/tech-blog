import { MetadataRoute } from 'next'

const BASE_PATH = '/tech-blog'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/private/',
          '/admin/',
          '/*?*',
          '/*.json$',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_PATH}/sitemap.xml`,
    host: 'https://nimkoes.github.io',
  }
} 