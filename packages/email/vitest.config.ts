import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Phase 0: email templates/transport are React + Resend-driven and need a
    // mock harness that doesn't exist yet. Without this, vitest exits 1 with
    // "No test files found" and blocks `turbo test`. Matches the Stillwater
    // reference pattern (services/workers, packages/email, payments, ui).
    passWithNoTests: true,
  },
});
