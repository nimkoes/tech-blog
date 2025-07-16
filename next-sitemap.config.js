/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://nimkoes.github.io/tech-blog/',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: './public',
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      'https://nimkoes.github.io/tech-blog/sitemap.xml',
    ],
  },
  // 추가 URL들을 동적으로 생성
  additionalPaths: async (config) => {
    const result = [];
    
    // resources 디렉토리의 모든 .md 파일을 sitemap에 추가
    const fs = require('fs');
    const path = require('path');
    
    const resourcesDir = path.join(process.cwd(), 'public', 'resources');
    if (fs.existsSync(resourcesDir)) {
      const files = fs.readdirSync(resourcesDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const fileName = file.replace('.md', '');
          result.push({
            loc: `/tech-blog/post/${fileName}`,
            lastmod: new Date().toISOString(),
            changefreq: 'monthly',
            priority: 0.7,
          });
        }
      });
    }
    
    return result;
  },
} 