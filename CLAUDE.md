# CLAUDE.md

> Instructions for Claude Code when working in the Maison repository. Follow these before touching any file.

---

## Project Identity

**Maison** is a premium DTC e-commerce platform for curated Scandinavian home goods. The repo is a **Turborepo monorepo** (target architecture: Next.js 16 + React 19 + Tailwind v4 + tRPC v11 + Drizzle ORM + Better Auth + Stripe). The current state is **documentation-complete, code-to-be-scaffolded** — the unified PRD (`docs/PRD_unified.md`), unified landing page mockup (`docs/landing_page_unified.html`), and this documentation suite are committed; the application packages are to be built per the PRD §8.2 file hierarchy.

**Stack version pins** (do not deviate without ADR):

- Node.js ≥ 22.0.0
- pnpm 11.9.0 (via `packageManager` field)
- Next.js 16.2.x
- React 19.2.x
- TypeScript 5.9.x (strict)
- Tailwind CSS v4.3.x (CSS-first `@theme`)
- tRPC v11.18.x
- Drizzle ORM 0.45.x
- Better Auth 1.6.23
- Stripe 22.3.x (Dahlia)
- PostgreSQL 17 (Neon in prod, Docker in dev)

---

## Before You Write Code

Read these in order:

1. **`docs/PRD_unified.md`** — what to build (features, pages, data models, API surface)
2. **`docs/landing_page_unified.html`** — how it should look (canonical design tokens: `--bg #faf8f5`, `--clay #a86b4a`, `--gold #c4a265`; Cormorant Garamond + Inter typography; 15 homepage sections)
3. **`PROJECT-ARCHITECTURE.md`** — how to build it (ADRs, layer model, DB schemas, security posture)
4. **`AGENTS.md`** — high-signal facts (read this before any commit)
5. **`skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` §9 (Anti-Patterns) + §13 (Pitfalls)** — read before writing new code; documents 50+ gotchas
6. **`skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md`** — concrete Stillwater reference (real file paths, working configs, 651 tests, 11 ADRs)

If you skip any of these, you will reproduce bugs that have already been solved.

---

## Meticulous Approach Framework

When asked to implement a feature, follow this discipline:

### 1. Understand before acting

- Restate the task in your own words. If ambiguous, ask one batched question (don't drip questions).
- Identify which PRD section this maps to. If it doesn't map, the feature may be out of scope — flag it.
- Check the existing codebase for patterns to follow (Don't invent novel patterns when a proven one exists).

### 2. Plan, then execute

- Write a TODO list before touching files. Each item should be a single, testable change.
- Identify the blast radius of each change. A schema change touches: migration → seed → tRPC router → RSC → Client Component → E2E test.
- Prefer editing existing files over creating new ones. Never create documentation files unless explicitly requested.

### 3. Verify, don't assume

- After every change, run the relevant verification: `pnpm check-types`, `pnpm test`, `pnpm lint`.
- For UI changes, open the page in a browser (or use Playwright snapshot) — don't claim it works based on code review alone.
- For DB changes, run the migration both up AND down. A migration that can't roll back is a production incident waiting to happen.

### 4. Leave the codebase better than you found it

- If you spot a bug in unrelated code while working, fix it (or file an issue). Don't leave landmines.
- If a test is flaky, investigate — don't disable it.
- If a comment is stale, update it.

---

## Code Style Rules (Enforced)

### TypeScript

- **Strict mode** — `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `erasableSyntaxOnly: true`.
- **No `any` in production code.** Use `unknown` + type guard, or define a proper type. `any` in tests is acceptable for mocks.
- **No `// @ts-ignore`** — use `// @ts-expect-error` with a reason, or fix the type.
- **Prefer `interface` for object shapes, `type` for unions/intersections/mapped types.**

### React 19

- **No `forwardRef`.** Pass `ref` as a normal prop. (React 19 made refs regular props.)
- **Use `use()` for async values**, not `useEffect` + `useState`. `use()` suspends; `useEffect` doesn't.
- **Server Components by default.** Only add `"use client"` when you need state, effects, or browser APIs. Keep Client Components small and leaf-level.
- **No default exports for components** — named exports only (except `page.tsx` / `route.ts` which Next.js requires to be default).

### Next.js 16

- **`proxy.ts`, not `middleware.ts`.** File lives at `apps/web/proxy.ts`. Supports async.
- **Async params:** `async function Page({ params }: { params: Promise<{ slug: string }> })` — you MUST `await params`.
- **Turbopack for dev** (`next dev --turbopack`). Webpack still used for `next build` unless `--turbopack` passed.
- **`generateMetadata` is async** — `export async function generateMetadata({ params }): Promise<Metadata>`.

### Tailwind v4 (CSS-first)

- **No `tailwind.config.js` or `tailwind.config.ts`.** Tokens live in `apps/web/src/app/globals.css` under `@theme { ... }`.
- **Use `@tailwindcss/postcss`** in `postcss.config.mjs`. Do NOT add `autoprefixer` (Tailwind v4 handles it).
- **Custom utilities** in `@layer utilities { ... }` within `globals.css`.
- **The `prettier-plugin-tailwindcss`** auto-sorts classes on format — don't fight it.

### tRPC v11

- **Every procedure has a Zod input parser.** Never accept untyped input.
- **Server-side caller for RSC** — import from `apps/web/src/lib/trpc/server.ts`. This calls the router directly (no HTTP round-trip).
- **Client-side via React Query** — `apps/web/src/lib/trpc/client.tsx` exports `trpc` and `TRPCProvider`.
- **Rate limiting middleware fails OPEN** — if Redis is down, allow the request. Log for review. Do NOT change to fail-closed.

### Drizzle ORM

- **One file per table** in `packages/db/src/schema/`. Re-export from `index.ts`.
- **Money in cents (integer), not dollars.** Column names end in `_cents`. Display logic divides by 100.
- **`DATABASE_URL_UNPOOLED` for migrations, `DATABASE_URL` for queries.** Never swap these. PgBouncer (pooled) breaks prepared statements in migration scripts.
- **`db:push` is dev-only.** Never run in production. Always use `db:migrate` for prod.

### Better Auth

- **Config in `packages/auth/src/config.ts`.** Web app imports via `@maison/auth`.
- **Sessions in PostgreSQL, not JWTs.** Enables revocation.
- **`BETTER_AUTH_URL` must be set in production** — config throws at module load if unset (intentional fail-fast).
- **RBAC roles:** `customer`, `staff`, `admin`. Checked in tRPC middleware (not `proxy.ts` — proxy only checks "is authenticated").

### Stripe

- **Payment Intents, not legacy Tokens.** Always.
- **Idempotency keys on every mutating call.** Client generates UUID, passes as `x-idempotency-key` header. Stored in `orders.stripe_idempotency_key` (UNIQUE).
- **Webhook signature verification** in `apps/web/src/app/api/webhooks/stripe/route.ts` using `STRIPE_WEBHOOK_SECRET`.
- **No card data touches our servers.** Stripe Elements collects card data client-side. PCI SAQ-A scope.

---

## Anti-Generic UI Checklist (Non-Negotiable)

Per `skills/avant-garde-design-v4/references/12-anti-generic-checklist.md`. PR review checks these:

- [ ] **No bento grids** — use asymmetry or vertical narrative instead
- [ ] **No L/R hero split** — use full-bleed editorial hero (see `docs/landing_page_unified.html`)
- [ ] **No mesh/aurora gradients** — use high-contrast flat or radical color pairing
- [ ] **No glassmorphism** — use solid tactile surfaces
- [ ] **No purple/indigo** — use cream/stone/terracotta/gold (our `--clay`, `--gold`, `--sage`)
- [ ] **No Inter/Roboto alone** — pair Cormorant Garamond (display) + Inter (body)
- [ ] **No "Orchestrate / Empower / Unlock" copy** — write like a human editor
- [ ] **No dark + neon glow** — use warm cream + charcoal + terracotta
- [ ] **No rounded-everything** — `--radius-sm: 2px` is deliberate. Sharp = editorial.

If you find yourself reaching for any of these, STOP. Ask: "What does the Maison brand actually need here?" The answer is never "make it look like a SaaS landing page."

---

## Pre-Commit Checklist (8-Gate CI)

Before claiming any work is done, verify ALL of these pass locally:

```bash
pnpm check-types          # 1. No TypeScript errors
pnpm lint                 # 2. No ESLint errors
pnpm test                 # 3. All unit/integration tests pass
pnpm test:e2e             # 4. All E2E tests pass (requires pnpm build first)
pnpm build                # 5. Production build succeeds
pnpm audit --audit-level=high   # 6. No high/critical CVEs
pnpm lighthouse           # 7. Lighthouse Performance ≥ 90, Accessibility ≥ 95
pnpm bundle-size          # 8. Initial JS < 200KB gzipped
```

If any gate fails, the PR is not ready. Do not "just push and let CI catch it" — that wastes a round-trip and pollutes the commit history.

---

## TDD Flow (For New Features)

```
RED     → Write a failing test that describes the desired behaviour
          (Vitest for unit, Playwright for E2E)
GREEN   → Write the minimum code to make the test pass
          (No extra abstractions, no "while I'm here" refactors)
REFACTOR → Clean up the code while keeping the test green
          (Extract functions, rename, simplify — but the test stays green)
```

For bug fixes: write a regression test FIRST that reproduces the bug, then fix the code. The test prevents the bug from returning.

---

## Git Workflow

- **Branch:** `main` is the production branch (per user instruction, do not create feature branches — commit directly to `main`).
- **Commit convention:** Conventional Commits:
  - `feat(scope): description` — new feature
  - `fix(scope): description` — bug fix
  - `docs(scope): description` — documentation only
  - `refactor(scope): description` — code change that neither fixes a bug nor adds a feature
  - `test(scope): description` — test only
  - `chore(scope): description` — build, deps, config
  - `scope` is the package or app: `web`, `db`, `api`, `auth`, `payments`, `ui`, `email`, `workers`, `docs`
- **Commit message body:** explain WHY, not WHAT. The diff shows what; the message shows why.

### SSH push (no openssh-client)

This environment lacks `openssh-client`. Use the included wrapper:

```bash
# One-time setup (already done in this environment)
cp docs/ssh-key.txt ~/.ssh/id_maison
chmod 600 ~/.ssh/id_maison
chmod +x docs/ssh_git_wrapper_v3.py

# Every push
GIT_SSH_COMMAND="/home/z/my-project/maison/docs/ssh_git_wrapper_v3.py -i ~/.ssh/id_maison -o StrictHostKeyChecking=accept-new" git push origin main
```

Full instructions: `docs/ssh-warpper_SKILL.md`.

---

## Common Mistakes To Avoid

| Mistake                                 | Correct Approach                                                             |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Creating `middleware.ts`                | Create `proxy.ts` (Next.js 16 rename)                                        |
| Adding `tailwind.config.js`             | Add tokens to `globals.css` `@theme` (Tailwind v4 CSS-first)                 |
| Using `forwardRef`                      | Pass `ref` as a normal prop (React 19)                                       |
| Forgetting `await params`               | Page params are `Promise<...>` — always await                                |
| Storing money as `numeric`              | Store as `integer` cents (`_cents` suffix)                                   |
| Using `DATABASE_URL` for migrations     | Use `DATABASE_URL_UNPOOLED` (PgBouncer breaks prepared statements)           |
| `db:push` in production                 | Always use `db:migrate` in prod; `db:push` is dev-only                       |
| Rate limiter failing closed             | Fail OPEN — allow requests if Redis is down, log for review                  |
| `any` type in production                | Use `unknown` + type guard, or define a proper type                          |
| Default export for components           | Named export (except `page.tsx` / `route.ts` which Next.js requires)         |
| `"use client"` at top of layout         | Keep layouts as Server Components; push `"use client"` to leaf components    |
| Google Fonts CDN                        | Self-host woff2 in `packages/ui/src/fonts/` (privacy + performance)          |
| Stripe Tokens (legacy)                  | Use Payment Intents (current standard, supports Apple Pay / Google Pay)      |
| Skipping webhook signature verification | Always verify with `STRIPE_WEBHOOK_SECRET` — never trust unverified webhooks |
| Generic SaaS copy ("Empower your…")     | Write like a human editor: "Objects of Quiet Beauty"                         |

---

## Debugging Triage Playbook

When something breaks, follow this order:

1. **Reproduce** — Write a test that reproduces the bug. If you can't reproduce it, you can't fix it.
2. **Isolate** — Use `git bisect` if the regression window is unclear. Disable features one by one.
3. **Root-cause** — Don't fix the symptom. If a tRPC procedure returns wrong data, check the Drizzle query, not the React component.
4. **Fix the cause** — One change, one commit. Don't bundle unrelated refactors.
5. **Regression test** — Add a test that fails without your fix and passes with it.
6. **Verify** — Run the full test suite + the 8-gate checklist.

---

## When You're Stuck

- **Stack-specific question:** Read the relevant skill file in `skills/`. The `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill has 50+ anti-patterns documented — your question is probably answered there.
- **"How did Stillwater solve this?":** Browse `https://github.com/nordeim/stillwater` — it's the production reference for this exact stack.
- **Design question:** Check `docs/landing_page_unified.html` first — it's the canonical visual reference.
- **Scope question:** Check `docs/PRD_unified.md` §2.2 (Non-Goals). If it's listed there, it's intentionally out of scope.

---

## Final Reminder

This codebase is for a **premium brand**. Every decision — code structure, copy, animation, color — should reinforce "considered living." If a change makes the site feel more like a generic SaaS app and less like an editorial commerce experience, it's the wrong change. When in doubt, choose restraint.
