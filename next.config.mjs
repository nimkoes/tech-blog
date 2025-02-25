/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/tech-blog", // ✅ 서브 디렉토리 설정
  assetPrefix: "/tech-blog/", // ✅ 정적 파일 경로 설정
  trailingSlash: true, // ✅ URL이 항상 `/`로 끝나도록 설정
  async rewrites() {
    return [
      {
        source: "/posts/:path*", // ✅ 원래 md 파일 경로
        destination: "/tech-blog/posts/:path*", // ✅ GitHub Pages에서 요청할 실제 경로
      },
    ];
  },
};

export default nextConfig;