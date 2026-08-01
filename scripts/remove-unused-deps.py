#!/usr/bin/env python3
"""
Maison — Remove unused deps from package.json files (v10 Task 2 GREEN phase)

Removes the 38 high-confidence unused dependencies identified in
REMEDIATION_PLAN_v10 §1.3 from the corresponding package.json files.

Idempotent: if a dep is already removed, this script is a no-op for it.

Also cleans up dead 'serverExternalPackages' entries in apps/web/next.config.ts
for deps that are no longer declared.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

# (package_relpath, dep_name) pairs to remove from package.json
REMOVALS: list[tuple[str, str]] = [
    # MEDIUM-1: @maison/api
    ("packages/api", "@maison/config"),
    # MEDIUM-2: @maison/auth
    ("packages/auth", "zod"),
    # MEDIUM-3: @maison/db
    ("packages/db", "zod"),
    ("packages/db", "testcontainers"),
    # MEDIUM-4: @maison/payments
    ("packages/payments", "zod"),
    # MEDIUM-5: @maison/email
    ("packages/email", "zod"),
    ("packages/email", "react-dom"),
    ("packages/email", "@types/react-dom"),
    # MEDIUM-6: @maison/web — 19 original AUDIT_REPORT deps (excl. stripe)
    ("apps/web", "lucide-react"),
    ("apps/web", "react-hook-form"),
    ("apps/web", "sonner"),
    ("apps/web", "cmdk"),
    ("apps/web", "class-variance-authority"),
    ("apps/web", "@radix-ui/react-separator"),
    ("apps/web", "@radix-ui/react-slot"),
    ("apps/web", "@radix-ui/react-tabs"),
    ("apps/web", "@radix-ui/react-toast"),
    ("apps/web", "@radix-ui/react-tooltip"),
    ("apps/web", "@sanity/client"),
    ("apps/web", "@sanity/image-url"),
    ("apps/web", "@t3-oss/env-nextjs"),
    ("apps/web", "@trpc/next"),
    ("apps/web", "next-sanity"),
    ("apps/web", "nuqs"),
    ("apps/web", "posthog-js"),
    ("apps/web", "superjson"),
    ("apps/web", "zod"),
    # 12 additional unused deps discovered during independent re-audit
    ("apps/web", "@hookform/resolvers"),
    ("apps/web", "@radix-ui/react-avatar"),
    ("apps/web", "@radix-ui/react-dialog"),
    ("apps/web", "@radix-ui/react-dropdown-menu"),
    ("apps/web", "@radix-ui/react-label"),
    ("apps/web", "@radix-ui/react-popover"),
    ("apps/web", "@radix-ui/react-select"),
    ("apps/web", "@tailwindcss/typography"),
    ("apps/web", "@testing-library/react"),
    ("apps/web", "@testing-library/user-event"),
    ("apps/web", "autoprefixer"),
]


def remove_dep_from_package_json(pkg_relpath: str, dep: str) -> bool:
    """Remove `dep` from `dependencies` or `devDependencies` of the given package.json.

    Returns True if a removal happened, False otherwise.
    Preserves 2-space indentation (matching the existing files).
    """
    pkg_path = REPO_ROOT / pkg_relpath / "package.json"
    if not pkg_path.is_file():
        print(f"  ! skip: {pkg_path} (not found)", file=sys.stderr)
        return False

    text = pkg_path.read_text(encoding="utf-8")
    data = json.loads(text)

    changed = False
    for section in ("dependencies", "devDependencies"):
        if section in data and dep in data[section]:
            del data[section][dep]
            changed = True
            print(f"  - removed {dep!r} from {pkg_relpath}/{section}")

    if changed:
        # Preserve trailing newline + 2-space indent (json.dumps default is 2-space)
        new_text = json.dumps(data, indent=2) + "\n"
        pkg_path.write_text(new_text, encoding="utf-8")

    return changed


def cleanup_next_config_server_external_packages() -> int:
    """Remove dead entries from apps/web/next.config.ts serverExternalPackages.

    After removing @sanity/client and posthog-js from package.json, the
    serverExternalPackages entries for them are no-ops. Remove them.
    """
    cfg_path = REPO_ROOT / "apps/web" / "next.config.ts"
    if not cfg_path.is_file():
        return 0
    text = cfg_path.read_text(encoding="utf-8")

    # Only remove @sanity/client (posthog-js is NOT in serverExternalPackages per audit).
    # Use a simple line-based removal: any line whose stripped form is a string
    # literal containing '@sanity/client' inside the serverExternalPackages array.
    pattern = re.compile(
        r"^(\s*)['\"]@sanity/client['\"],?\s*$", re.MULTILINE
    )
    new_text, n = pattern.subn("", text)
    if n > 0:
        # Clean up any blank lines left behind
        new_text = re.sub(r"\n{3,}", "\n\n", new_text)
        cfg_path.write_text(new_text, encoding="utf-8")
        print(f"  - removed {n} @sanity/client reference(s) from apps/web/next.config.ts serverExternalPackages")
    return n


def main() -> int:
    print("== Removing unused deps ==")
    changes = 0
    for pkg_relpath, dep in REMOVALS:
        if remove_dep_from_package_json(pkg_relpath, dep):
            changes += 1

    print("\n== Cleaning up next.config.ts dead entries ==")
    cleanup_next_config_server_external_packages()

    print(f"\n== Done: {changes} dep removals applied ==")
    print("Next: run `pnpm install` to regenerate pnpm-lock.yaml, then re-run the test.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
