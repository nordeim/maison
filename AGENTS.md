# AGENTS.md

> High-signal instructions for AI coding agents working in the Maison monorepo. Every line answers: "Would an agent likely miss this without help?" If not, it's not here.

---

## What this repo is

Maison is a **Turborepo monorepo** for a premium DTC e-commerce platform (Scandinavian home goods). The build target is Next.js 16 + React 19 + Tailwind v4 + tRPC v11 + Drizzle ORM + Better Auth + Stripe. The repo currently contains the design mockup, unified PRD, and documentation suite — the application code is to be scaffolded per `docs/PRD_unified.md` §8.2.

**Canonical visual reference:** `docs/landing_page_unified.html` — every CSS custom property and typography choice in that file is the source of truth for the design system.

**Architecture skills to read before touching code:**
- `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` — generic stack patterns, 50+ anti-patterns
- `skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md` — concrete Stillwater reference (651 tests, 11 ADRs, battle-tested)

---

## Essential commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Dev server (all apps) | `pnpm dev` |
| Dev server (web only) | `pnpm --filter=@maison/web dev` |
| Build all packages | `pnpm build` |
| Type-check everything | `pnpm check-types` |
| Lint everything | `pnpm lint` |
| Lint + auto-fix | `pnpm lint:fix` |
| Format check | `pnpm format:check` |
| Format write | `pnpm format` |
| Unit/integration tests | `pnpm test` |
| E2E tests | `pnpm test:e2e` (requires `pnpm build` first) |
| Test coverage | `pnpm test:coverage` |
| Generate migrations | `pnpm db:generate` |
| Apply migrations | `pnpm db:migrate` |
| Push schema directly (dev only) | `pnpm db:push` |
| Seed database | `pnpm db:seed` |
| Drizzle Studio GUI | `pnpm db:studio` |
| Reset database ⚠️ | `pnpm db:reset` |
| Start local Postgres + Redis | `docker compose up -d postgres redis` |
| One-shot DB setup | `bash scripts/db-setup.sh` |
| Audit deps for CVEs | `pnpm audit --audit-level=high` |
| Bundle size analysis | `pnpm bundle-size` |
| Lighthouse CI | `pnpm lighthouse` |

**Required order before pushing:** `lint` → `check-types` → `test` → `build`. CI enforces this; doing it locally saves a round-trip.

---

## Monorepo boundaries

```
apps/          → Deployable Next.js apps (web, studio)
packages/      → Shared libraries consumed by apps + services
services/      → Background job workers (Trigger.dev v4)
tooling/       → Shared configs (ESLint, TypeScript, Tailwind)
```

**Workspace protocol:** Always use `workspace:*` to reference `@maison/*` packages. Never use file: paths or relative imports across package boundaries.

**Source resolution:** `pnpm-workspace.yaml` sets `customConditions: ["@maison/source"]`. This means `@maison/*` packages resolve to their `src/` directly (no build step needed in dev). The `exports` field in each package's `package.json` must include both `"@maison/source"` and `"default"` conditions pointing to `./src/index.ts`.

---

## Next.js 16 breaking changes (will bite you)

These are documented in the architecture skills but repeatedly cause bugs:

1. **`proxy.ts` replaces `middleware.ts`.** The file must be at `apps/web/proxy.ts` (NOT `src/proxy.ts`, NOT `middleware.ts`). It supports async — use it for auth checks, locale detection, security headers.

2. **Params are async.** Page signatures are now `async function Page({ params }: { params: Promise<{ slug: string }> })`. You MUST `await params` before accessing properties. Forgetting this gives `Promise<{ slug: string }>` instead of the string.

3. **Turbopack is the default dev bundler.** `next dev` uses Turbopack. `next build` still uses webpack unless you pass `--turbopack`. Some webpack loaders don't work with Turbopack — prefer Turbopack-compatible alternatives.

4. **`forwardRef` is removed in React 19.** Pass `ref` as a normal prop. The only exception: third-party components that haven't updated.

5. **`use()` hook replaces `useContext` for async values.** For synchronous context, `useContext` still works.

---

## Tailwind v4 (CSS-first, no config file)

- ❌ Do NOT create `tailwind.config.js` or `tailwind.config.ts`.
- ✅ Define tokens in `apps/web/src/app/globals.css` using `@theme { ... }`.
- ✅ Use `@tailwindcss/postcss` in `postcss.config.mjs` (NOT `autoprefixer` — Tailwind v4 handles it).
- ✅ Custom utilities go in `@layer utilities { ... }` in `globals.css`.
- ✅ The `prettier-plugin-tailwindcss` is installed — class order is auto-sorted on format.

The design tokens from `docs/landing_page_unified.html` (CSS custom properties like `--bg`, `--clay`, `--gold`) must be ported to `@theme` in `globals.css` AND to `packages/ui/src/tokens/colors.css` for cross-package sharing.

---

## Drizzle ORM pitfalls

1. **Always use `DATABASE_URL_UNPOOLED` for migrations.** The pooled URL (PgBouncer) breaks prepared statements in migration scripts. `packages/db/drizzle.config.ts` enforces this — don't "fix" it to use `DATABASE_URL`.

2. **One file per table** in `packages/db/src/schema/`. Re-export from `index.ts`. Never put all tables in one file — it makes migrations harder to review.

3. **Money is stored in cents (integer), not dollars (float).** Column names end in `_cents`. Display logic divides by 100. Never use `numeric`/`decimal` for money — integer cents is the canonical pattern.

4. **Migrations are version-controlled.** `pnpm db:generate` creates SQL files in `packages/db/drizzle/migrations/`. Commit them. The `_journal.json` tracks order — never edit it manually.

5. **`drizzle-kit push` is dev-only.** It pushes schema directly to DB, skipping migrations. Never use in production. Always use `db:migrate` for prod.

---

## Better Auth (replaces Auth.js v5)

- Config lives in `packages/auth/src/config.ts`. The web app imports via `@maison/auth`.
- Sessions are stored in PostgreSQL (table `sessions`), not JWTs. This enables revocation.
- RBAC roles: `customer`, `staff`, `admin`. Checked via tRPC middleware, not in `proxy.ts` (proxy only checks "is authenticated").
- `BETTER_AUTH_URL` MUST be set in production. The config throws at module load if unset — this is intentional (fail fast, not fail silently).
- OAuth providers (Google, Apple) are Phase 2. Email/password is the v1 auth method.

---

## tRPC v11 patterns

1. **Server-side caller for RSC.** Import from `apps/web/src/lib/trpc/server.ts`. This calls the router directly (no HTTP round-trip) — perfect for Server Components.

2. **Client-side caller via React Query.** Import `trpc` from `apps/web/src/lib/trpc/client.tsx`. Wrap the app in `TRPCProvider`. Mutations use `useMutation` pattern.

3. **Input validation with Zod.** Every procedure has an `input` parser. Never trust untyped input.

4. **Rate limiting middleware** in `packages/api/src/middleware/rateLimit.ts`. Uses Upstash Redis. **Fails open** if Redis is down — do not "fix" this to fail-closed (would block legitimate users during outages).

5. **Idempotency keys** on all payment/inventory mutations. Client generates a UUID, passes as header `x-idempotency-key`. Server stores in `orders.stripe_idempotency_key` (unique constraint).

---

## Stripe webhook idempotency

Stripe retries webhooks. If your handler isn't idempotent, you'll double-process orders.

- The `orders.stripe_idempotency_key` column has a UNIQUE constraint. Inserting a duplicate raises an error — catch it and return 200 (Stripe already got a 200, so don't retry).
- The webhook route at `apps/web/src/app/api/webhooks/stripe/route.ts` must verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`. Never expose the secret to the client.
- Local dev: use the Stripe CLI (`docker compose --profile stripe up -d stripe`) to forward events to `localhost:3000/api/webhooks/stripe`.

---

## Anti-generic UI rules (non-negotiable)

Per `skills/avant-garde-design-v4/references/12-anti-generic-checklist.md`. These are checked in PR review:

- ❌ **No bento grids.** Use asymmetry or vertical narrative.
- ❌ **No L/R hero split.** Use full-bleed editorial hero (see `docs/landing_page_unified.html`).
- ❌ **No mesh/aurora gradients.** Use high-contrast flat or radical color pairing.
- ❌ **No glassmorphism.** Use solid tactile surfaces.
- ❌ **No purple/indigo.** Use cream/stone/terracotta/gold.
- ❌ **No Inter/Roboto alone.** Pair Cormorant Garamond (display) + Inter (body).
- ❌ **No "Orchestrate / Empower / Unlock" copy.** Write like a human editor would.

If you find yourself reaching for any of these, stop and ask: "What does the brand actually need here?"

---

## Environment variable gotchas

- **`DATABASE_URL` vs `DATABASE_URL_UNPOOLED`**: pooled for app queries, direct for migrations. Both required. The `@maison/config` package validates this at startup.
- **`BETTER_AUTH_SECRET`**: min 32 chars. Generate with `openssl rand -base64 32`. Never commit.
- **`SANITY_WEBHOOK_SECRET`**: must match the secret configured in Sanity Cloud → Webhooks. If mismatched, ISR revalidation silently fails.
- **`SENTRY_DSN`**: optional. If unset, the app runs without error tracking. Don't add a hard requirement.
- **`NEXT_PUBLIC_*`**: only variables prefixed `NEXT_PUBLIC_` are exposed to the client. Never put secrets here.

---

## Testing quirks

- **Vitest, not Jest.** Config in each package's `vitest.config.ts`. Use `@testing-library/react` for component tests, not Enzyme.
- **Integration tests use testcontainers** (`packages/db/src/seed/index.integration.test.ts`). They spin up a real Postgres in Docker — slow but realistic.
- **E2E tests require a build first**: `pnpm build && pnpm test:e2e`. Playwright config at repo root `playwright.config.ts`.
- **Mobile viewport tests**: Playwright tests run in mobile + desktop viewports. Don't skip mobile — the mobile nav drawer has historically had bugs.
- **`@axe-core/playwright`** runs in E2E — accessibility regressions fail the build.

---

## SSH push (no openssh-client installed)

This environment does NOT have `openssh-client`. Use the included wrapper:

```bash
GIT_SSH_COMMAND="/home/z/my-project/maison/docs/ssh_git_wrapper_v3.py -i ~/.ssh/id_maison -o StrictHostKeyChecking=accept-new" git push origin main
```

The SSH key is at `docs/ssh-key.txt` (copy to `~/.ssh/id_maison`, `chmod 600`). The wrapper uses Paramiko. Full instructions: `docs/ssh-warpper_SKILL.md`.

**Always push to `main`** — do not create branches (per user instruction).

---

## Files to read before writing code

| File | Why |
|------|-----|
| `docs/PRD_unified.md` | What to build (features, pages, data models) |
| `docs/landing_page_unified.html` | How it should look (canonical design tokens, sections, copy) |
| `PROJECT-ARCHITECTURE.md` | How to build it (ADRs, layer model, schemas) |
| `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` | Stack-specific anti-patterns (read §9 + §13 before writing new code) |
| `skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md` | Concrete Stillwater reference (real file paths, working configs) |

---

## Things that look wrong but aren't

- **`proxy.ts` instead of `middleware.ts`** — Next.js 16 renamed it. Don't "fix" it.
- **No `tailwind.config.js`** — Tailwind v4 is CSS-first. Tokens live in `globals.css` `@theme`.
- **Money in cents (integer)** — not dollars. Don't change to `numeric`.
- **Fail-open rate limiting** — if Redis is down, allow requests. Don't change to fail-closed.
- **Self-hosted fonts in `packages/ui/src/fonts/`** — not Google Fonts. Privacy + performance.
- **`minimumReleaseAge: 1440` in `pnpm-workspace.yaml`** — supply-chain guardrail. Delays new packages 24h. Don't reduce it.
- **OpenTelemetry `overrides` in `pnpm-workspace.yaml`** — bypasses NPM registry desyncs. Don't remove.
