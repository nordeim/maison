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
pnpm lint

echo "── ✓ Pre-commit checks passed ───────────────────────────────────"
