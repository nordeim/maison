#!/usr/bin/env python3
"""
Maison — Replace non-null assertions (!) with explicit TRPCError guards.

Handles two patterns:
1. `variable!.property` → guard + `variable.property`
2. `expression)!` → remove the `!` (the expression is already type-safe via or/and)

For pattern 1, inserts a guard before the line:
  if (!variable) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '...' });
"""
import re
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

# Files to process (router files only, not test files)
FILES = [
    "packages/api/src/routers/trade.ts",
    "packages/api/src/routers/admin.ts",
    "packages/api/src/routers/account.ts",
    "packages/api/src/routers/reviews.ts",
    "packages/api/src/routers/discounts.ts",
    "packages/api/src/routers/loyalty.ts",
    "packages/api/src/routers/products.ts",
]

def fix_file(rel_path: str) -> int:
    """Fix non-null assertions in a single file. Returns count of fixes."""
    file_path = REPO_ROOT / rel_path
    content = file_path.read_text(encoding="utf-8")
    lines = content.split("\n")
    fixes = 0
    new_lines = []

    for i, line in enumerate(lines):
        # Pattern 1: variable!.property (but not )!)
        # Match: identifier!.something
        matches = re.findall(r'(\b\w+)!\.', line)
        for var in matches:
            if var in ("return", "if", "else", "const", "let", "var", "await", "throw"):
                continue
            # Check if a guard already exists on the previous line
            prev_line = lines[i - 1] if i > 0 else ""
            if f"if (!{var})" not in prev_line:
                # Add a guard before this line
                indent = len(line) - len(line.lstrip())
                guard = " " * indent + f"if (!{var}) {{"
                guard2 = " " * indent + f"  throw new TRPCError({{ code: 'INTERNAL_SERVER_ERROR', message: '{var} not found' }});"
                guard3 = " " * indent + "}"
                new_lines.append(guard)
                new_lines.append(guard2)
                new_lines.append(guard3)
                fixes += 1

        # Pattern 2: remove )! at end of expression (or/and results in products.ts)
        # These are safe to just remove the ! because the expression is used in .push()
        cleaned = re.sub(r'\)!\s*$', '))', line)  # )! at end → ))
        cleaned = re.sub(r'\)!\s*;', ');', cleaned)  # )!; → ));
        cleaned = re.sub(r'\)!\s*,', '),', cleaned)  # )!, → ),
        if cleaned != line:
            fixes += 1

        # Pattern 1 replacement: variable!.property → variable.property (after guard added)
        cleaned = re.sub(r'(\b\w+)!\.', r'\1.', cleaned)
        new_lines.append(cleaned)

    if fixes > 0:
        file_path.write_text("\n".join(new_lines), encoding="utf-8")

    return fixes

def main():
    total = 0
    for rel_path in FILES:
        n = fix_file(rel_path)
        if n > 0:
            print(f"  ~ {rel_path}: {n} fixes")
            total += n
    print(f"\n== Done: {total} fixes ==")

if __name__ == "__main__":
    main()
