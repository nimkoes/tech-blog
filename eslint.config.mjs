import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  prettier,
  {
    rules: {
      // 모달을 열 때 입력값을 초기화하는 등 UI 전환에 필요한 기존 패턴입니다.
      // React의 무한 렌더링 방지 규칙은 그대로 유지합니다.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'coverage/**',
    'next-env.d.ts',
    'public/search-index.json',
    'public/og/**',
    'src/resources/post-index.json',
    'src/resources/image-metadata.json',
  ]),
]);
