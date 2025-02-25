/** @type {import('next').NextConfig['webpack']} */
const webpack = (config) => {
  // css에서 케밥케이스와 tsx에서 카멜케이스 간의 전환
  config.module.rules
    .find(({ oneOf }) => !!oneOf)
    .oneOf.filter(({ use }) => JSON.stringify(use)?.includes("css-loader"))
    .reduce((acc, { use }) => acc.concat(use), [])
    .forEach(({ options }) => {
      // eslint-disable-next-line no-param-reassign
      if (options.modules) options.modules.exportLocalsConvention = "camelCase";
    });

  return config;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/tech-blog", // GitHub Pages에서 배포될 경로 설정
  assetPrefix: "/tech-blog/", // 정적 파일 경로 설정
  trailingSlash: true, // GitHub Pages에서 모든 페이지가 `/`로 끝나도록 설정
  webpack,
};

export default nextConfig;
