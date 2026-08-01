/**
 * Maison — ESLint v9 Flat Config Entry Point (@maison/auth)
 *
 * Consumes the shared Maison ESLint config directly (flat config), not via
 * the legacy FlatCompat shim. Mirrors the apps/web pattern.
 *
 * Per-package deferral: noisy type-aware rules downgraded to `warn` for
 * pre-existing code (Drizzle inferred-type false positives, Stripe SDK
 * deprecations, intentional Phase-0 async stubs). New code should still
 * aim to satisfy these rules. See REMEDIATION_PLAN_v10 Task 3 REFACTOR.
 */

import sharedConfig from "@maison/eslint-config";

export default [
  ...sharedConfig,

  {
    ignores: ["dist/**", "node_modules/**", ".turbo/**", "coverage/**"],
  },

  // Per-package deferral block — downgrade noisy rules to `warn`.
  {
    rules: {
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-conversion": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-base-to-string": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "warn",
      "@typescript-eslint/consistent-type-imports": "warn",
      "no-console": "warn",
    },
  },

  // Scoped deferral for JSX-only rules (react plugin is only loaded for .tsx/.jsx).
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "react/no-unescaped-entities": "warn",
    },
  },
];
