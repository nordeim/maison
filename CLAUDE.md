# CLAUDE.md

> Instructions for Claude Code when working in the Maison repository. Follow these before touching any file.

---

## Project Identity

**Maison** is a premium DTC e-commerce platform for curated Scandinavian home goods. The repo is a **Turborepo monorepo** (Next.js 16 + React 19 + Tailwind v4 + tRPC v11 + Drizzle ORM + Better Auth + Stripe). The codebase is fully scaffolded and Phase 3 complete — 13 tRPC routers, 24 Drizzle tables, full admin back-office, 30 E2E tests (22 smoke + 8 accessibility), and 37 production routes (25 static ○ + 12 dynamic ƒ). All application packages exist under `apps/` and `packages/` per the PRD §8.2 file hierarchy.

**Stack version pins** (do not deviate without ADR):

- Node.js ≥ 22.0.0
- pnpm 11.17.0 (via `packageManager` field)
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

1. **`docs/MAISON_PRD_v1.2.md`** — what to build (features, pages, data models, API surface) — v1.2 aligned with 3 coding skills
2. **`docs/MAISON_PAD_v1.2.md`** — how to build it (20 ADRs, layer model, schemas, security posture) — v1.2
3. **`docs/MAISON_Design_Guide.md`** — canonical design system reference (1,489 lines, 16 sections)
4. **`docs/landing_page_unified.html`** — how it should look (canonical design tokens: `--bg #faf8f5`, `--clay #a86b4a`, `--gold #c4a265`; Cormorant Garamond + Inter typography; 17 homepage sections)
5. **`docs/PRD_PAD_Validation_Against_Skills.md`** — 15 findings audit against 3 coding skills (Stillwater, tRPC+Drizzle, TypeScript patterns)
6. **`AGENTS.md`** — high-signal facts (read this before any commit)
7. **`~/.pi/agent/skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` §9 (Anti-Patterns) + §13 (Pitfalls)** — read before writing new code; documents 50+ gotchas
8. **`~/.pi/agent/skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md`** — concrete Stillwater reference (real file paths, working configs, 651 tests, 11 ADRs)

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
- **No `as unknown as` in production code** (Skill 2 §9.2, locked in by `packages/api/src/routers/no-unknown-cast.contract.test.ts` — added in v1.2.5 N1, extended to `.tsx` files in v1.2.6 V9-5). It is the most dangerous TS escape hatch — it bypasses the type checker entirely. The 2 documented exceptions are in `packages/db/src/index.ts:61,88` where Drizzle's `NeonHttpDatabase | NodePgDatabase` union is non-unifiable; they are listed in the contract test's `ALLOWED_FILES` set. Use a proper type union (e.g. `ResendClient = Resend | ResendStub` + `satisfies`), a typed row mapper, or the Drizzle query builder instead.
- **No PII in logs (Skill 2 §13.10, locked in v1.2.6 V9-1 + v1.2.7 V10-1/V10-2).** Never `console.log` user-supplied PII (name, email, message body). Use PII-redacted messages like `'[contact] Submission received (PII redacted)'`. The same Skill 2 §13.10 rule bans logging Stripe webhook payloads — log only event IDs + types, never request bodies. The `contact.submit` and `newsletter.subscribe` routers are the canonical examples (the v9 fix replaced their PII-leaking `console.log` calls). As of v1.2.7 (V10-1 + V10-2), `packages/payments/src/webhooks.ts` (was logging `order.email` on line 183) and the stub-mode email senders at `packages/email/src/send.ts` + `packages/auth/src/resend-client.ts` (were logging full `payload` including `to` + `react` body) are also PII-safe — the webhook now logs `(PII redacted)` and the stub senders log only the email subject.
- **No raw `JSON.stringify` inside `dangerouslySetInnerHTML` (Skill 2 §9.1 + §16.3, locked in v1.2.8 V11-2).** When rendering JSON-LD (or any JSON-shaped data) into a `<script>` tag via `dangerouslySetInnerHTML`, wrap the output with `escapeForScriptContext(JSON.stringify(...))`. The helper lives in `apps/web/src/lib/utils.ts` and replaces `<` with `\u003c` (plus `>`, `&`, `"`, `'` analogously) — without it, any product field containing the literal string `</script>` would terminate the script tag early and execute attacker-controlled content in the page context (stored XSS). The PDP JSON-LD script tag at `apps/web/src/app/(shop)/products/[slug]/page.tsx:107` is the canonical call site. Never "simplify" it back to bare `JSON.stringify()`.
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
- **Add `@source` directives** in `globals.css` after `@import 'tailwindcss';` so Tailwind v4 scans monorepo sibling packages. Maison has three (per v1.2.4 H2, Skill 2 §13.6 — "the #1 cause of Tailwind classes not applying in production"): `@source "../components/**/*.{ts,tsx}";`, `@source "../lib/**/*.{ts,tsx}";`, `@source "../../../../packages/ui/src/**/*.{ts,tsx}";`. Without these, classes used inside `apps/web/src/components/`, `apps/web/src/lib/`, or `packages/ui/src/` get tree-shaken out of the production CSS bundle.
- **Custom utilities use the `@utility <name> { ... }` directive** in `globals.css` (one per utility). NOT `@layer utilities { ... }` — that is the legacy Tailwind v3 syntax (per Skill 2, migrated in v1.2.4 H3). State variants like `.reveal.visible` go in plain CSS as a compound selector (sibling rule), because `@utility` does not support them.
- **`tooling/tailwind/base.ts` is intentionally minimal** — only `fontFamily` as a JS reference for non-CSS consumers (Storybook). Per v1.2.5 N8 (Skill 2 §9.5/§13.6), the duplicate `theme.extend` block (colors, spacing, fontSize, borderRadius, transitions, keyframes, animation) was removed because it was drifting from the CSS-first `@theme` source of truth. Do NOT re-add tokens here — declare them in `@theme` instead.
- **The `prettier-plugin-tailwindcss`** auto-sorts classes on format — don't fight it.

### tRPC v11 (ADR-008 — 4 procedure tiers)

- **4 procedure tiers** (per ADR-008, aligned with Stillwater v3.0.0 §15.17):
  - `publicProcedure` — no auth required
  - `protectedProcedure` — any authenticated user
  - `staffProcedure` — staff, manager, or owner role (admin read)
  - `ownerProcedure` — owner role only (admin mutations, role management, store settings)
  - **NOTE**: `managerProcedure` was removed in v1.2.5 N5 (v8 remediation) as dead code — it was defined per ADR-008 but never wired into any router; admin mutations use `ownerProcedure`. If ADR-008 is later amended to require a manager tier, it can be re-added. The removal is locked in by `packages/api/src/trpc.test.ts` ("does NOT export managerProcedure" test).
- **Every procedure has a Zod v4 input parser** (ADR-018). Use `z.email()` (NOT `z.string().email()` — deprecated in Zod v4). Never accept untyped input. Locked in by `packages/api/src/routers/zod-email.contract.test.ts` (4 tests, added in v1.2.4 H1) — the contract test asserts that none of the 4 email-validating source files (`packages/api/src/routers/contact.ts`, `packages/api/src/routers/newsletter.ts`, `packages/api/src/routers/gift-cards.ts`, `packages/config/src/env.ts`) contain the legacy `z.string().email()` pattern.
- **Server-side caller for RSC** — import from `apps/web/src/lib/trpc/server.ts`. Use `api()` for auth-guarded routes (forces dynamic) or `apiPublic()` for public routes (allows static prerender).
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
- **RBAC roles (ADR-008):** `customer`, `staff`, `manager`, `owner`. Checked in tRPC middleware (`staffProcedure` / `ownerProcedure` — `managerProcedure` was removed in v1.2.5 N5 as dead code; admin mutations use `ownerProcedure`. Not `proxy.ts` which only checks cookie-existence via `getSessionCookie()`).
- **`customSession` plugin** enriches session with user role from `users` table.

### Stripe (ADR-009 — Payment Intents + ADR-014 — idempotency)

- **Stripe Payment Intents** (not Checkout Sessions — per ADR-009 flipped in `docs/REMEDIATION_PLAN_v4.md`). PCI SAQ-A scope (card data handled by Stripe Elements).
- **Stripe `apiVersion` pinned** to `'2026-06-24.dahlia'` in `packages/payments/src/client.ts` (per Skill 2 §9.9, locked in v1.2.5 N6). Do NOT remove the pin — letting the SDK default drift on upgrade can silently change wire formats or webhook payloads.
- **Webhook idempotency via dual-defense pattern** (ADR-014): `payment_events` table + `pg_advisory_xact_lock` (transaction-scoped). See `packages/payments/src/idempotency.ts`.
- **Webhook signature verification** in `apps/web/src/app/api/webhooks/stripe/route.ts` using `env.STRIPE_WEBHOOK_SECRET` (imported from `@maison/config` — per Skill 2 §13.5, locked in v1.2.5 N4). Same pattern for `apps/web/src/app/api/webhooks/sanity/route.ts` with `env.SANITY_WEBHOOK_SECRET`. The Payment Intents helper at `packages/payments/src/webhooks.ts` ALSO reads `env.NEXT_PUBLIC_APP_URL` from `@maison/config` (locked in v1.2.6 V9-2 — v8 N4 wired the secrets but missed this app URL access in the same file). All webhook routes + `webhooks.ts` now use the `env` module exclusively — do NOT reach for `process.env` directly.
- **Apple Pay / Google Pay** are available via Stripe Payment Intents + Stripe Elements (`paymentMethodTypes` configuration).
- **Stripe Tax** via `payment_intent_data.automatic_tax` or computed server-side.

### Trigger.dev v4 (ADR-016)

- **Import from `@trigger.dev/sdk` root** (NOT `/v4` — subpath doesn't exist; NOT `/v3` — deprecated April 1, 2026).
- **`machine: "micro"`** (string literal, not object form).
- **`tasks.trigger('task-id', payload)`** API (NOT `TriggerClient.sendEvent()`).
- **Workers `package.json` MUST have `"type": "module"`.**

---

## Anti-Generic UI Checklist (Non-Negotiable)

Per `~/.pi/agent/skills/avant-garde-design-v4/references/12-anti-generic-checklist.md`. PR review checks these:

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

### Contract tests — the architectural invariants

The repo has **9 contract test files / 102 tests** in `apps/web/src/lib/__tests__/` (plus `packages/payments/src/webhooks.contract.test.ts`, `packages/api/src/routers/contact.contract.test.ts`, `packages/api/src/routers/zod-email.contract.test.ts`, `packages/api/src/routers/no-unknown-cast.contract.test.ts`, `packages/auth/src/rbac-aliases.contract.test.ts`, and `services/workers/trigger.config.test.ts`). Contract tests are RED-GREEN locked invariants — they fail loudly if anyone regresses the architecture. Current set:

- `proxy-contract.test.ts` — ADR-006/010 Layer-1 invariant (`proxy.ts` cookie-only)
- `rendering-strategy.contract.test.ts` — ADR-006/010 `api()`/`apiPublic()` split (○ Static vs ƒ Dynamic)
- `coverage-thresholds.contract.test.ts` — ADR-019 vitest coverage thresholds
- `design-tokens.contract.test.ts` — ADR-007 radius tokens resolve to concrete pixels
- `headings.contract.test.ts` — v1.2.2 F1/F3/F5: no `<em>{' word '}</em>` stray-space pattern; About H1 has space after comma; Hero H1 has space before "Quiet"
- `category-grid.contract.test.ts` — v1.2.2 F2: CategoryGrid `<img alt="">` (decorative) + `<a aria-label="Browse …">` (no triple-counted accessible name)
- `page-metadata.contract.test.ts` — v1.2.2 F4 + v1.2.3 G1: page-split pattern (see below)
- `pdp-thumbnail-alt.contract.test.ts` — v1.2.4 H4: PDP gallery thumbnail `<img>` has non-empty `alt` AND falls back to `img.altText` (was `alt=""`)
- `scroll-reveal-wiring.contract.test.ts` — v1.2.8 V11-1: asserts the `useScrollReveal` hook exists in `apps/web/src/hooks/useScrollReveal.ts`, the `ScrollRevealTrigger` Client Component exists in `apps/web/src/components/shop/ScrollRevealTrigger.tsx` with a `'use client'` directive, and the `(shop)` layout imports + renders it. Locks the wiring that prevents `/products` (and every PDP) from rendering as a blank screen — the `.reveal` utility sets `opacity: 0` and only the hook adds the `.visible` modifier that transitions to `opacity: 1` (3 tests)

Cross-package contract tests (not in `apps/web/`):

- `packages/api/src/routers/contact.contract.test.ts` — v1.2.3 G1: `contact.submit` calls `sendEmail` to `hello@maison-living.com`
- `packages/api/src/routers/zod-email.contract.test.ts` — v1.2.4 H1, ADR-018: no `z.string().email()` remains in the 4 email-validating source files (4 tests)
- `packages/api/src/routers/no-unknown-cast.contract.test.ts` — v1.2.5 N1, Skill 2 §9.2: no `as unknown as` casts in production code except documented exceptions in `ALLOWED_FILES` (`packages/db/src/index.ts` Drizzle union is the only exception) (1 test)
- `packages/auth/src/rbac-aliases.contract.test.ts` — v1.2.4 H6, ADR-008: the 4 deprecated RBAC aliases (`canReadAdmin`, `canWriteAdmin`, `ADMIN_ROLES`, `ADMIN_WRITE_ROLES`) are NOT exported (6 tests)
- `packages/payments/src/webhooks.contract.test.ts` — ADR-009 Payment Intents + ADR-014 idempotency
- `services/workers/trigger.config.test.ts` — ADR-016 Trigger.dev config

Total test counts (post-v1.2.8): @maison/web 9 files / 102 tests, @maison/api 6 files / 20 tests, @maison/auth 2 files / 35 tests, @maison/payments 3 files / 18 tests.

### Client Component pages that need metadata — the split pattern

If a page needs both (a) interactive client state AND (b) SEO metadata (title/description), you **cannot** put `'use client'` and `export const metadata` in the same file — Next.js 16 forbids it. Split into:

- `page.tsx` (Server Component) — exports `metadata` (or `generateMetadata`), renders the child
- `components/shop/<Feature>.tsx` (Client Component) — has `'use client'`, owns the form/state

Pattern is locked in for 4 pages (see `docs/REMEDIATION_PLAN_v5.md` F4 + PAD REMEDIATION_HISTORY v1.2.2):

| Route         | Server `page.tsx`                             | Client child                        |
| ------------- | --------------------------------------------- | ----------------------------------- |
| `/gift-cards` | `apps/web/src/app/(shop)/gift-cards/page.tsx` | `components/shop/GiftCardsForm.tsx` |
| `/trade`      | `apps/web/src/app/(shop)/trade/page.tsx`      | `components/shop/TradeForm.tsx`     |
| `/cart`       | `apps/web/src/app/(shop)/cart/page.tsx`       | `components/shop/CartView.tsx`      |
| `/checkout`   | `apps/web/src/app/(shop)/checkout/page.tsx`   | `components/shop/CheckoutFlow.tsx`  |

`page-metadata.contract.test.ts` enforces the invariant: each `page.tsx` lacks `'use client'` AND exports `metadata`, AND the Client child file exists. Don't "consolidate" the child back into the page — the page title (e.g., "Gift Cards — Maison") depends on the split.

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
GIT_SSH_COMMAND="/home/z/my-project/maison/skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py -i ~/.ssh/id_maison -o StrictHostKeyChecking=accept-new" git push origin main
```

Full instructions: `skills/how-to-git-push-using-ssh-wrapper/SKILL.md`.

---

## Common Mistakes To Avoid

| Mistake                                             | Correct Approach                                                                                                                                                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Creating `middleware.ts`                            | Create `proxy.ts` (Next.js 16 rename)                                                                                                                                                                                      |
| Adding `tailwind.config.js`                         | Add tokens to `globals.css` `@theme` (Tailwind v4 CSS-first)                                                                                                                                                               |
| Using `forwardRef`                                  | Pass `ref` as a normal prop (React 19)                                                                                                                                                                                     |
| Forgetting `await params`                           | Page params are `Promise<...>` — always await                                                                                                                                                                              |
| Storing money as `numeric`                          | Store as `integer` cents (`_cents` suffix)                                                                                                                                                                                 |
| Using `DATABASE_URL` for migrations                 | Use `DATABASE_URL_UNPOOLED` (PgBouncer breaks prepared statements)                                                                                                                                                         |
| `db:push` in production                             | Always use `db:migrate` in prod; `db:push` is dev-only                                                                                                                                                                     |
| Rate limiter failing closed                         | Fail OPEN — allow requests if Redis is down, log for review                                                                                                                                                                |
| `any` type in production                            | Use `unknown` + type guard, or define a proper type                                                                                                                                                                        |
| Default export for components                       | Named export (except `page.tsx` / `route.ts` which Next.js requires)                                                                                                                                                       |
| `"use client"` at top of layout                     | Keep layouts as Server Components; push `"use client"` to leaf components                                                                                                                                                  |
| Google Fonts CDN                                    | Self-host woff2 in `packages/ui/src/fonts/` (privacy + performance)                                                                                                                                                        |
| Stripe Tokens (legacy)                              | Use Payment Intents (current standard, supports Apple Pay / Google Pay)                                                                                                                                                    |
| Skipping webhook signature verification             | Always verify with `STRIPE_WEBHOOK_SECRET` — never trust unverified webhooks                                                                                                                                               |
| Using `next/image fill` directly as a CSS Grid item | Wrap in `<div style={{ position: 'relative', gridColumn, gridRow, overflow: 'hidden' }}>` that carries the grid placement — `fill` renders `position: absolute`, which is removed from Grid flow (V13-1, locked in v1.3.0) |
| Generic SaaS copy ("Empower your…")                 | Write like a human editor: "Objects of Quiet Beauty"                                                                                                                                                                       |

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

- **Stack-specific question:** Read the relevant skill file in `~/.pi/agent/skills/`. The `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill has 50+ anti-patterns documented — your question is probably answered there.
- **"How did Stillwater solve this?":** Browse `https://github.com/nordeim/stillwater` — it's the production reference for this exact stack.
- **Design question:** Check `docs/landing_page_unified.html` first — it's the canonical visual reference.
- **Scope question:** Check `docs/PRD_unified.md` §2.2 (Non-Goals). If it's listed there, it's intentionally out of scope.

---

## Final Reminder

This codebase is for a **premium brand**. Every decision — code structure, copy, animation, color — should reinforce "considered living." If a change makes the site feel more like a generic SaaS app and less like an editorial commerce experience, it's the wrong change. When in doubt, choose restraint.
