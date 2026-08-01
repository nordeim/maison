#!/usr/bin/env python3
"""
Maison — Add eslint.config.mjs + lint scripts to 11 packages (v10 Task 3 GREEN).

For each of the 11 TS/JS packages that lack a lint script, this script:
  1. Creates `<pkg>/eslint.config.mjs` importing @maison/eslint-config
  2. Adds `lint` and `lint:fix` scripts to <pkg>/package.json
  3. Adds `@maison/eslint-config` to devDependencies (if missing)
  4. Adds `eslint` to devDependencies (if missing AND not already in dependencies)

For tooling/eslint (which IS @maison/eslint-config itself), the eslint.config.mjs
imports from "./index.js" directly to avoid the workspace self-reference.

Idempotent: re-running on already-fixed packages is a no-op.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

ESLINT_CONFIG_TEMPLATE = '''/**
 * Maison — ESLint v9 Flat Config Entry Point ({pkg_name})
 *
 * Consumes the shared Maison ESLint config directly (flat config), not via
 * the legacy FlatCompat shim. Mirrors the apps/web pattern.
 */

import sharedConfig from "@maison/eslint-config";

export default [
  ...sharedConfig,

  {{
    ignores: ["dist/**", "node_modules/**", ".turbo/**", "coverage/**"],
  }},
];
'''

# For tooling/eslint, which IS @maison/eslint-config, import from ./index.js
ESLINT_CONFIG_SELF_TEMPLATE = '''/**
 * Maison — ESLint v9 Flat Config Entry Point (@maison/eslint-config)
 *
 * Self-lint: imports the package's own flat config from ./index.js.
 */

import sharedConfig from "./index.js";

export default [
  ...sharedConfig,

  {{
    ignores: ["node_modules/**", ".turbo/**"],
  }},
];
'''

PACKAGES = [
    ("apps/studio", "@maison/studio"),
    ("services/workers", "@maison/workers"),
    ("packages/api", "@maison/api"),
    ("packages/auth", "@maison/auth"),
    ("packages/config", "@maison/config"),
    ("packages/db", "@maison/db"),
    ("packages/email", "@maison/email"),
    ("packages/payments", "@maison/payments"),
    ("packages/ui", "@maison/ui"),
    ("tooling/eslint", "@maison/eslint-config"),
    ("tooling/tailwind", "@maison/tailwind-config"),
]

# Versions matching other packages in the repo (so pnpm dedupes)
ESLINT_VERSION = "^9.39.4"


def apply_to_package(pkg_relpath: str, pkg_name: str) -> bool:
    """Create eslint.config.mjs and update package.json scripts/devDeps."""
    pkg_dir = REPO_ROOT / pkg_relpath
    cfg_path = pkg_dir / "eslint.config.mjs"
    pkg_json_path = pkg_dir / "package.json"

    changed = False

    # 1. Create eslint.config.mjs if missing
    if not cfg_path.is_file():
        # Special case: tooling/eslint imports from ./index.js
        if pkg_relpath == "tooling/eslint":
            cfg_path.write_text(ESLINT_CONFIG_SELF_TEMPLATE, encoding="utf-8")
        else:
            cfg_path.write_text(
                ESLINT_CONFIG_TEMPLATE.format(pkg_name=pkg_name),
                encoding="utf-8",
            )
        print(f"  + created {pkg_relpath}/eslint.config.mjs")
        changed = True
    else:
        print(f"  = {pkg_relpath}/eslint.config.mjs already exists")

    # 2. Update package.json: add scripts + devDeps
    if not pkg_json_path.is_file():
        print(f"  ! skip: {pkg_json_path} (not found)", file=sys.stderr)
        return changed

    text = pkg_json_path.read_text(encoding="utf-8")
    data = json.loads(text)

    scripts = data.setdefault("scripts", {})

    # Add lint / lint:fix scripts
    if scripts.get("lint") != "eslint .":
        scripts["lint"] = "eslint ."
        print(f"  ~ added lint script to {pkg_relpath}/package.json")
        changed = True
    if scripts.get("lint:fix") != "eslint . --fix":
        scripts["lint:fix"] = "eslint . --fix"
        print(f"  ~ added lint:fix script to {pkg_relpath}/package.json")
        changed = True

    # Add devDependencies (skip for tooling/eslint — it IS @maison/eslint-config)
    dev_deps = data.setdefault("devDependencies", {})

    if pkg_relpath != "tooling/eslint":
        if "@maison/eslint-config" not in dev_deps:
            dev_deps["@maison/eslint-config"] = "workspace:*"
            print(
                f"  ~ added @maison/eslint-config to {pkg_relpath}/devDependencies"
            )
            changed = True

    # Add eslint to devDependencies if not already in deps or devDeps
    deps = data.get("dependencies", {})
    if "eslint" not in dev_deps and "eslint" not in deps:
        dev_deps["eslint"] = ESLINT_VERSION
        print(f"  ~ added eslint@{ESLINT_VERSION} to {pkg_relpath}/devDependencies")
        changed = True

    # Re-serialize. Sort devDependencies alphabetically for deterministic output.
    if dev_deps:
        data["devDependencies"] = dict(sorted(dev_deps.items()))

    new_text = json.dumps(data, indent=2) + "\n"
    if new_text != text:
        pkg_json_path.write_text(new_text, encoding="utf-8")

    return changed


def main() -> int:
    print("== Adding eslint.config.mjs + lint scripts to 11 packages ==")
    changes = sum(apply_to_package(p, n) for p, n in PACKAGES)
    print(f"\n== Done: {changes} packages touched ==")
    print("Next: run `pnpm install` (to install new devDeps), then `pnpm lint`.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
