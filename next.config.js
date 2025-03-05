/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/tech-blog',
  assetPrefix: '/tech-blog',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 