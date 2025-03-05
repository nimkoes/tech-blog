import { MetadataRoute } from 'next'

const DOMAIN = 'https://nimkoes.github.io'
const REPO = 'tech-blog'

// robots.txt 형식의 문자열 생성
export function generateRobotsContent() {
  return `User-agent: *
Allow: /
Allow: /tech-blog/
Disallow: /private/
Disallow: /admin/
Disallow: /*?*
Disallow: /*.json$

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: ${DOMAIN}/sitemap.xml
Host: ${DOMAIN}
`
}

// Next.js의 robots API를 위한 기본 export
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tech-blog/'],
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
    sitemap: `${DOMAIN}/sitemap.xml`,
    host: DOMAIN,
  }
} 