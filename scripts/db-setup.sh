#!/usr/bin/env bash
# Maison — Database setup helper
# Copies .env.example → .env.local if missing, then runs migrations + seed
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "── Maison DB Setup ──────────────────────────────────────"

# 1. Ensure .env.local exists
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local from .env.example"
    echo "  → Edit .env.local to fill in real values, then re-run."
    exit 0
  else
    echo "✗ No .env.example found. Create .env.local manually."
    exit 1
  fi
fi

# 2. Ensure Docker services are running
if ! docker compose ps postgres 2>/dev/null | grep -q "running"; then
  echo "→ Starting Postgres + Redis via docker compose…"
  docker compose up -d postgres redis
  sleep 5
fi

# 3. Apply migrations
# (Note: pnpm db:generate is NOT included here — it requires schema
# snapshots to produce incremental delta. Run db:generate manually when
# adding migration changes and commit the result.)
echo "→ Applying migrations…"
pnpm db:migrate

# 3. Seed initial data (8 collections, 13 products)
echo "→ Seeding initial catalog…"
pnpm db:seed

echo "── ✓ Database ready ──────────────────────────────────────"
echo "  Postgres: localhost:5432 (maison_dev)"
echo "  Adminer:  http://localhost:8080 (profile: tools)"
echo "  Drizzle Studio: pnpm db:studio"
