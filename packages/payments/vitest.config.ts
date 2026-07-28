import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Keep the test gate green even before the suite is filled in. Without this
    // vitest exits 1 with "No test files found" and blocks `turbo test`.
    // Matches the Stillwater reference pattern.
    passWithNoTests: true,
  },
});
