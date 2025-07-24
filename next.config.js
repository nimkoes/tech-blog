/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/tech-blog',
  assetPrefix: '/tech-blog/',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  
  // GitHub Pages 배포를 위한 추가 설정
  trailingSlash: true,
  distDir: 'out',
}

module.exports = nextConfig 