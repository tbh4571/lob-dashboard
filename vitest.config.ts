import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/**/*.{test,spec}.{ts,tsx}', 'packages/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['apps/bff/src/**/*.ts', 'packages/shared/src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/mocks/**', '**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@lob/shared': path.resolve(__dirname, 'packages/shared/src/index.ts'),
    },
  },
});
