import { MetadataRoute } from 'next'

const DOMAIN = 'https://nimkoes.dev' // 실제 도메인으로 변경해주세요

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'],
    },
    sitemap: '/sitemap.xml',
  }
} 