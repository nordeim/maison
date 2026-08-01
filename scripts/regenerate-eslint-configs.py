#!/usr/bin/env python3
"""
Maison — Regenerate per-package eslint.config.mjs with expanded override (v10 Task 3).

Overwrites each per-package eslint.config.mjs with a fresh template that
includes the expanded override block (downgrading noisy type-aware rules
to `warn`). Idempotent: always writes the canonical template.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

# (relpath, name, extra_ignores)
PACKAGES = [
    ("apps/studio", "@maison/studio", [".sanity/**"]),
    ("services/workers", "@maison/workers", []),
    ("packages/api", "@maison/api", []),
    ("packages/auth", "@maison/auth", []),
    ("packages/config", "@maison/config", []),
    ("packages/db", "@maison/db", []),
    ("packages/email", "@maison/email", []),
    ("packages/payments", "@maison/payments", []),
    ("packages/ui", "@maison/ui", []),
    ("tooling/tailwind", "@maison/tailwind-config", []),
]

TEMPLATE = '''/**
 * Maison — ESLint v9 Flat Config Entry Point ({pkg_name})
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

  {{
    ignores: [{ignores}],
  }},

  // Per-package deferral block — downgrade noisy rules to `warn`.
  {{
    rules: {{
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
    }},
  }},

  // Scoped deferral for JSX-only rules (react plugin is only loaded for .tsx/.jsx).
  {{
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {{
      "react/no-unescaped-entities": "warn",
    }},
  }},
];
'''

STUDIO_IGNORES = '"dist/**", "node_modules/**", ".turbo/**", "coverage/**", ".sanity/**"'
DEFAULT_IGNORES = '"dist/**", "node_modules/**", ".turbo/**", "coverage/**"'


def apply_to_package(pkg_relpath: str, pkg_name: str, extra_ignores: list[str]) -> bool:
    cfg_path = REPO_ROOT / pkg_relpath / "eslint.config.mjs"
    ignores = STUDIO_IGNORES if extra_ignores else DEFAULT_IGNORES
    content = TEMPLATE.format(pkg_name=pkg_name, ignores=ignores)
    cfg_path.write_text(content, encoding="utf-8")
    print(f"  ~ regenerated {pkg_relpath}/eslint.config.mjs")
    return True


def main() -> int:
    print("== Regenerating per-package eslint.config.mjs with expanded override ==")
    for relpath, name, extra in PACKAGES:
        apply_to_package(relpath, name, extra)
    print("\n== Done ==")
    return 0


if __name__ == "__main__":
    sys.exit(main())
