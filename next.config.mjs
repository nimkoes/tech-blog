const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/tech-blog", // ✅ 서브 디렉토리 설정
  assetPrefix: "/tech-blog/", // ✅ 정적 파일 경로 설정
  trailingSlash: true, // ✅ URL이 항상 `/`로 끝나도록 설정
};

export default nextConfig;