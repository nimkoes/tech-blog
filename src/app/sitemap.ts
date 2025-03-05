import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOMAIN = 'https://nimkoes.dev' // 실제 도메인으로 변경해주세요

export default function sitemap(): MetadataRoute.Sitemap {
  const postsDirectory = path.join(process.cwd(), "public/resources")
  
  // 정적 페이지 목록
  const staticPages = [
    {
      url: DOMAIN,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${DOMAIN}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${DOMAIN}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // 블로그 포스트 목록
  const files = fs.readdirSync(postsDirectory)
  const posts = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const fileContents = fs.readFileSync(path.join(postsDirectory, file), 'utf8')
      const { data } = matter(fileContents)
      const slug = file.replace('.md', '')
      
      return {
        url: `${DOMAIN}/post/${slug}`,
        lastModified: new Date(data.date).toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified))

  // 태그 페이지 목록 (고유한 태그 추출)
  const tags = new Set<string>()
  files.forEach(file => {
    const fileContents = fs.readFileSync(path.join(postsDirectory, file), 'utf8')
    const { data } = matter(fileContents)
    if (Array.isArray(data.tags)) {
      data.tags.forEach((tag: string) => tags.add(tag))
    }
  })

  const tagPages = Array.from(tags).map(tag => ({
    url: `${DOMAIN}/tags/${tag}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...posts, ...tagPages]
} 