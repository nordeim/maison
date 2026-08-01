import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Keep the test gate green even before the suite is filled in. Without this
    // vitest exits 1 with "No test files found" and blocks `turbo test`.
    // Matches the Stillwater reference pattern.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },

  resolve: {
    alias: {
      'server-only': resolve(__dirname, '../../scripts/server-only-stub.js'),
    },
  },
});
