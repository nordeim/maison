#!/usr/bin/env python3
"""
Maison — Add tsconfig.config.json to 7 library-style packages (v10 Task 4 GREEN).

Creates a `tsconfig.config.json` in each package that has root-level
`*.config.ts` files but whose main `tsconfig.json` only includes `src/**`.
The new tsconfig extends `@maison/typescript-config/base.json` and includes
`*.config.ts` for type-checking only (noEmit, rootDir=".", composite=false).

Also updates each package's `check-types` script to run both tsconfigs:
  "check-types": "tsc -p tsconfig.config.json --noEmit && tsc --noEmit"

Idempotent: if `tsconfig.config.json` already exists, no changes are made
to that package.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

PACKAGES = [
    "services/workers",
    "packages/api",
    "packages/auth",
    "packages/config",
    "packages/db",
    "packages/email",
    "packages/payments",
]

TSCONFIG_CONFIG_TEMPLATE = """{
  "extends": "@maison/typescript-config/base.json",
  "compilerOptions": {
    "noEmit": true,
    "rootDir": ".",
    "composite": false
  },
  "include": ["*.config.ts", "*.config.tsx"]
}
"""


def apply_to_package(pkg_relpath: str) -> bool:
    """Create tsconfig.config.json (if missing) and update check-types script.

    Returns True if any change was applied, False otherwise.
    """
    pkg_dir = REPO_ROOT / pkg_relpath
    cfg_path = pkg_dir / "tsconfig.config.json"
    pkg_json_path = pkg_dir / "package.json"

    changed = False

    # 1. Create tsconfig.config.json if missing
    if not cfg_path.is_file():
        cfg_path.write_text(TSCONFIG_CONFIG_TEMPLATE, encoding="utf-8")
        print(f"  + created {pkg_relpath}/tsconfig.config.json")
        changed = True
    else:
        print(f"  = {pkg_relpath}/tsconfig.config.json already exists")

    # 2. Update check-types script
    if pkg_json_path.is_file():
        text = pkg_json_path.read_text(encoding="utf-8")
        data = json.loads(text)
        scripts = data.get("scripts", {})
        current = scripts.get("check-types", "")
        expected = "tsc -p tsconfig.config.json --noEmit && tsc --noEmit"
        if current != expected:
            scripts["check-types"] = expected
            data["scripts"] = scripts
            new_text = json.dumps(data, indent=2) + "\n"
            pkg_json_path.write_text(new_text, encoding="utf-8")
            print(f"  ~ updated {pkg_relpath}/package.json check-types script")
            changed = True
        else:
            print(f"  = {pkg_relpath}/package.json check-types already up to date")

    return changed


def main() -> int:
    print("== Adding tsconfig.config.json to 7 packages ==")
    changes = sum(apply_to_package(p) for p in PACKAGES)
    print(f"\n== Done: {changes} packages touched ==")
    print("Next: run `pnpm check-types` to verify root configs are now type-checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
