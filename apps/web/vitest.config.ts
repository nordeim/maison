import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/vitest-setup.d.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Phase 0: component tests need a tRPC + auth mock harness that isn't
    // scaffolded yet. Without this vitest exits 1 with "No test files found"
    // and blocks `turbo test`. Matches the Stillwater reference pattern.
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.d.ts',
        'src/vitest-setup.d.ts',
        'next-env.d.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Stub `server-only` so tests can transitively import server-only
      // modules without throwing. Per skill §13.3 + Lesson 89.
      'server-only': resolve(__dirname, '..', '..', 'scripts', 'server-only-stub.js'),
    },
  },
});
