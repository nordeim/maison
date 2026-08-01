import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },

  resolve: {
    alias: {
      'server-only': resolve(__dirname, '../../scripts/server-only-stub.js'),
    },
  },
});
