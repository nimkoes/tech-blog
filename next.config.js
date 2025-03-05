/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  basePath: "/tech-blog",
  assetPrefix: "/tech-blog/",
  trailingSlash: true,
}

module.exports = nextConfig 