import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'trigger.config.test.ts'],
    // Phase 0: worker jobs are Trigger.dev stubs. Tests need a mock harness
    // for task()/Resend; not authored yet. Without this vitest exits 1 with
    // "No test files found" and blocks `turbo test`. Matches the Stillwater
    // reference pattern (services/workers uses the same flag for Phase 0).
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'trigger.config.ts'],
      exclude: ['src/**/*.test.ts', 'trigger.config.test.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
});
