import { NextResponse } from 'next/server'
import { getBasePath, getCategoryPosts, getPostContent, getPostUrl, getSiteOrigin } from '~/utils/contentRepository';
import { getPostSeoDescription } from '~/utils/seo';

export async function GET() {
  const siteOrigin = getSiteOrigin();
  const basePath = getBasePath();
  const posts = getCategoryPosts()
    .map(post => {
      const content = getPostContent(post.fileName);

      return {
        title: content?.title || post.title,
        description: getPostSeoDescription(content),
        date: content?.date || post.regDate,
        slug: post.fileName,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nimkoes Tech Blog</title>
    <link>${siteOrigin}${basePath}</link>
    <description>개발과 소프트웨어 아키텍처, 개발 문화에 대한 이야기를 공유합니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteOrigin}${basePath}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${getPostUrl(post.slug)}</link>
      <guid isPermaLink="true">${getPostUrl(post.slug)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.description}]]></description>
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
