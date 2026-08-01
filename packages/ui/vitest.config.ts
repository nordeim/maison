import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Phase 0: @maison/ui is currently a CSS-token + font package with no
    // runtime tests. Without this, vitest exits 1 with "No test files found"
    // and blocks `turbo test`. Matches the Stillwater reference pattern
    // (packages/email, packages/auth, packages/payments).
    passWithNoTests: true,
  },

  resolve: {
    alias: {
      'server-only': resolve(__dirname, '../../scripts/server-only-stub.js'),
    },
  },
});
