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
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
