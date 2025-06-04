import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  const postsDirectory = path.join(process.cwd(), 'public/resources')
  const files = fs.readdirSync(postsDirectory)

  const posts = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const fileContents = fs.readFileSync(path.join(postsDirectory, file), 'utf8')
      const { data, content } = matter(fileContents)
      return {
        title: data.title,
        description: data.description || '',
        date: data.date,
        slug: file.replace('.md', ''),
        content: content.slice(0, 300) + '...' // 미리보기 내용
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nimkoes Tech Blog</title>
    <link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
    <description>개발과 소프트웨어 아키텍처, 개발 문화에 대한 이야기를 공유합니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${process.env.NEXT_PUBLIC_SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}</link>
      <guid isPermaLink="true">${process.env.NEXT_PUBLIC_SITE_URL}/post/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description || post.content}]]></description>
    </item>`).join('')}
  </channel>
</rss>`

  return new NextResponse(feed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  })
} 