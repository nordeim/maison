/**
 * Maison — ESLint v9 Flat Config Entry Point (@maison/eslint-config)
 *
 * Self-lint: this package IS the shared config, so we can't import
 * @maison/eslint-config (workspace self-reference). Importing ./index.js
 * directly fails because ESLint's jiti loader doesn't support
 * `import.meta.dirname` used in that file. Use a minimal @eslint/js
 * recommended config for the package's own files instead.
 */

import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: ["node_modules/**", ".turbo/**"],
  },
];
