#!/usr/bin/env python3
"""
Maison — Migrate Zod v3 string-validation APIs to v4 native APIs.

Replaces:
  z.string().uuid()     → z.uuid()
  z.string().url()      → z.url()
  z.string().email()    → z.email()
  z.string().datetime() → z.iso.datetime()

Idempotent: re-running on already-migrated files is a no-op.
"""
import re
from pathlib import Path

REPO_ROOT = Path("/home/z/my-project/maison")

REPLACEMENTS = [
    (r'z\.string\(\)\.uuid\(\)', 'z.uuid()'),
    (r'z\.string\(\)\.url\(\)', 'z.url()'),
    (r'z\.string\(\)\.email\(\)', 'z.email()'),
    (r'z\.string\(\)\.datetime\(\)', 'z.iso.datetime()'),
]

# Directories to scan
SCAN_DIRS = [
    REPO_ROOT / "packages",
    REPO_ROOT / "apps" / "web" / "src",
]

SKIP_DIRS = {"node_modules", ".next", ".turbo", "dist", "skills", "docs"}
SKIP_SUFFIXES = {".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx", ".d.ts"}

def list_ts_files(dir_path: Path) -> list[Path]:
    """Recursively list .ts/.tsx files, skipping test/docs/node_modules."""
    files = []
    for entry in dir_path.iterdir():
        if entry.is_dir():
            if entry.name not in SKIP_DIRS:
                files.extend(list_ts_files(entry))
        elif entry.suffix in (".ts", ".tsx"):
            if not any(str(entry).endswith(s) for s in SKIP_SUFFIXES):
                files.append(entry)
    return files

def migrate_file(file_path: Path) -> int:
    """Apply replacements to a single file. Returns number of replacements made."""
    content = file_path.read_text(encoding="utf-8")
    original = content
    count = 0

    for pattern, replacement in REPLACEMENTS:
        new_content, n = re.subn(pattern, replacement, content)
        count += n
        content = new_content

    if count > 0:
        file_path.write_text(content, encoding="utf-8")

    return count

def main():
    total_replacements = 0
    files_changed = 0

    for scan_dir in SCAN_DIRS:
        if not scan_dir.exists():
            continue
        for ts_file in list_ts_files(scan_dir):
            n = migrate_file(ts_file)
            if n > 0:
                rel = ts_file.relative_to(REPO_ROOT)
                print(f"  ~ {rel}: {n} replacements")
                files_changed += 1
                total_replacements += n

    print(f"\n== Done: {total_replacements} replacements across {files_changed} files ==")

if __name__ == "__main__":
    main()
