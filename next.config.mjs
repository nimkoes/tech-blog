const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/tech-blog",
  assetPrefix: "/tech-blog/",
  trailingSlash: true,
};

export default nextConfig;