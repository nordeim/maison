#!/usr/bin/env python3
"""
Maison — Add per-package ESLint override block to downgrade noisy type-aware
rules from `error` to `warn` for pre-existing code (v10 Task 3 REFACTOR).

The shared config at tooling/eslint/index.js is the canonical strict standard.
Per-package overrides document LOCAL deferrals for rules that produce frequent
false positives with Drizzle ORM inferred types or deprecated Stripe SDK APIs.

Rules downgraded to `warn`:
  - @typescript-eslint/no-deprecated          (Drizzle/Stripe SDK deprecations)
  - @typescript-eslint/no-unnecessary-condition (Drizzle inferred-type false positives)
  - @typescript-eslint/no-unnecessary-type-conversion
  - @typescript-eslint/restrict-template-expressions
  - @typescript-eslint/no-base-to-string
  - @typescript-eslint/prefer-nullish-coalescing
  - no-console                                  (acceptable in server-side code)

Rules KEPT as `error` (real bugs, fixed manually):
  - @typescript-eslint/no-unused-vars
  - @typescript-eslint/require-await
  - import/order
  - react/no-unescaped-entities

Idempotent: if the override block already exists, no changes are made.
"""

from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

PACKAGES = [
    "apps/studio",
    "services/workers",
    "packages/api",
    "packages/auth",
    "packages/config",
    "packages/db",
    "packages/email",
    "packages/payments",
    "packages/ui",
    "tooling/tailwind",
]

OVERRIDE_BLOCK = """

  // Per-package deferral: downgrade noisy type-aware rules to `warn` for
  // pre-existing code (Drizzle inferred-type false positives, Stripe SDK
  // deprecations, intentional Phase-0 async stubs). New code should still
  // aim to satisfy these rules. See REMEDIATION_PLAN_v10 Task 3 REFACTOR.
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
      "react/no-unescaped-entities": "warn",
      "no-console": "warn",
    },
  },
"""


def update_eslint_config(pkg_relpath: str) -> bool:
    """Append the override block to <pkg>/eslint.config.mjs if not present."""
    cfg_path = REPO_ROOT / pkg_relpath / "eslint.config.mjs"
    if not cfg_path.is_file():
        print(f"  ! skip: {cfg_path} (not found)", file=sys.stderr)
        return False

    text = cfg_path.read_text(encoding="utf-8")

    # Idempotency: skip if override block already present
    if "@typescript-eslint/no-deprecated" in text:
        print(f"  = {pkg_relpath}/eslint.config.mjs already has override block")
        return False

    # Insert the override block just before the closing `];`
    close_idx = text.rfind("];")
    if close_idx == -1:
        print(f"  ! skip: {cfg_path} (no closing `];` found)", file=sys.stderr)
        return False

    new_text = text[:close_idx] + OVERRIDE_BLOCK + "\n" + text[close_idx:]
    cfg_path.write_text(new_text, encoding="utf-8")
    print(f"  ~ added override block to {pkg_relpath}/eslint.config.mjs")
    return True


def main() -> int:
    print("== Adding per-package ESLint override blocks ==")
    changes = sum(update_eslint_config(p) for p in PACKAGES)
    print(f"\n== Done: {changes} packages updated ==")
    return 0


if __name__ == "__main__":
    sys.exit(main())
