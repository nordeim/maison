#!/usr/bin/env bash
# Maison — Pre-commit check
# Runs typecheck + lint + format check before allowing a commit.
# Symlinked into .git/hooks/pre-commit by `pnpm install` (via prepare script).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "── Maison pre-commit check ──────────────────────────────────────"

echo "→ Format check (Prettier)…"
pnpm format:check

echo "→ Type-check (TypeScript)…"
pnpm check-types

echo "→ Lint (ESLint)…"
# Use --concurrency=1 to avoid OOM when type-aware ESLint runs on large
# packages (e.g. @maison/studio with Sanity schemas) in parallel with
# other packages. Serial execution adds ~10s but is reliable.
pnpm turbo lint --concurrency=1

echo "── ✓ Pre-commit checks passed ───────────────────────────────────"
