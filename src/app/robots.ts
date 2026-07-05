import { MetadataRoute } from 'next'
import { getBasePath, getSiteOrigin } from '~/utils/contentRepository';

const DOMAIN = getSiteOrigin();
const BASE_PATH = getBasePath();
const SITEMAP_URL = `${DOMAIN}${BASE_PATH}/sitemap.xml`;

// robots.txt 형식의 문자열 생성
export function generateRobotsContent() {
  const sitemap = SITEMAP_URL;
  return `User-agent: *
Allow: ${BASE_PATH}/
Disallow: /private/
Disallow: /admin/
Disallow: /*?*
Disallow: /*.json$

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${sitemap}
Host: ${DOMAIN}
`
}

// Next.js의 robots API를 위한 기본 export
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [`${BASE_PATH}/`],
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
    sitemap: SITEMAP_URL,
    host: DOMAIN,
  }
}
