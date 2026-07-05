import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      // 'server-only'는 RSC 밖에서 import 시 throw 하므로 테스트에서는 빈 모듈로 대체
      'server-only': path.resolve(__dirname, 'src/test/server-only-stub.ts'),
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
