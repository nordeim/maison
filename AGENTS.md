# AGENTS.md

> High-signal instructions for AI coding agents working in the Maison monorepo. Every line answers: "Would an agent likely miss this without help?" If not, it's not here.

---

## What this repo is

Maison is a **Turborepo monorepo** for a premium DTC e-commerce platform (Scandinavian home goods). The build target is Next.js 16 + React 19 + Tailwind v4 + tRPC v11 + Drizzle ORM + Better Auth + Stripe. The codebase is fully scaffolded and Phase 3 complete (Foundation → MVP → Growth → Optimisation) — 13 tRPC routers, 24 Drizzle tables, full admin back-office, 30 E2E tests (22 smoke + 8 accessibility), and 42 production routes (16 static ○ + 26 dynamic ƒ). See Project Status in `README.md` for deliverables by phase.

**Canonical visual reference:** `docs/landing_page_unified.html` — every CSS custom property and typography choice in that file is the source of truth for the design system.

**Architecture skills to read before touching code:**

- `~/.pi/agent/skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` — generic stack patterns, 50+ anti-patterns
- `~/.pi/agent/skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md` — concrete Stillwater reference (651 tests, 11 ADRs, battle-tested)

---

## Essential commands

| Task                            | Command                                       |
| ------------------------------- | --------------------------------------------- |
| Install dependencies            | `pnpm install`                                |
| Dev server (all apps)           | `pnpm dev`                                    |
| Dev server (web only)           | `pnpm --filter=@maison/web dev`               |
| Build all packages              | `pnpm build`                                  |
| Type-check everything           | `pnpm check-types`                            |
| Lint everything                 | `pnpm lint`                                   |
| Lint + auto-fix                 | `pnpm lint:fix`                               |
| Format check                    | `pnpm format:check`                           |
| Format write                    | `pnpm format`                                 |
| Unit/integration tests          | `pnpm test`                                   |
| E2E tests                       | `pnpm test:e2e` (requires `pnpm build` first) |
| Test coverage                   | `pnpm test:coverage`                          |
| Generate migrations             | `pnpm db:generate`                            |
| Apply migrations                | `pnpm db:migrate`                             |
| Push schema directly (dev only) | `pnpm db:push`                                |
| Seed database                   | `pnpm db:seed`                                |
| Drizzle Studio GUI              | `pnpm db:studio`                              |
| Reset database ⚠️               | `pnpm db:reset`                               |
| Start local Postgres + Redis    | `docker compose up -d postgres redis`         |
| One-shot DB setup               | `bash scripts/db-setup.sh`                    |
| Audit deps for CVEs             | `pnpm audit --audit-level=high`               |
| Bundle size analysis            | `pnpm bundle-size`                            |
| Lighthouse CI                   | `pnpm lighthouse`                             |

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

## next/image `fill` + CSS Grid (V13-1, locked in v1.3.0)

**Image `fill` renders `position: absolute` — always wrap in a `position: relative` div if placing in a CSS Grid.**

`next/image` with the `fill` prop renders the underlying `<img>` with `position: absolute` (so it can stretch to fill its nearest _positioned_ ancestor). An absolutely-positioned element is **removed from CSS Grid flow** — so `gridColumn` / `gridRow` set directly on the `<Image fill>` style **have no effect**, and the image will position itself relative to a distant ancestor (typically the section root) rather than its intended grid cell. On the live homepage this manifested as the entire "Our Philosophy" section (`apps/web/src/components/shop/sections/Philosophy.tsx`) rendering with all 3 images absent — they were stacking off-screen at 1280×577 px relative to a distant ancestor instead of inside their grid cells (V13-1, fixed in v1.3.0).

**Correct pattern** (carries grid placement on the wrapper, NOT the Image):

```tsx
<div style={{ position: 'relative', gridColumn: '1 / 2', gridRow: '1 / 3', overflow: 'hidden' }}>
  <Image src={...} alt={...} fill style={{ objectFit: 'cover' }} />
</div>
```

**Wrong pattern** (grid placement on the absolutely-positioned Image — silently ignored):

```tsx
<Image src={...} alt={...} fill style={{ gridColumn: '1 / 2', gridRow: '1 / 3', objectFit: 'cover' }} />
```

All 13 production `next/image fill` usages in the codebase were audited post-V13-1 — the 12 non-Philosophy sites (`FeaturedCollection`, `CategoryGrid`, `Hero`, `InstagramGrid`, `JournalSection`, `HyggeEdit`, `ProductCard` ×2, `SearchModal`, `products/[slug]/page.tsx` ×2, `about/page.tsx` ×2) all have a `position: 'relative'` parent (or `position: 'absolute'` inside a `position: 'relative'` ancestor) plus `aspectRatio` + `overflow: 'hidden'`. If you add a new `Image fill`, follow the same wrapper-div pattern — and never put `gridColumn` / `gridRow` on the `<Image>` itself.

---

## Tailwind v4 (CSS-first, no config file)

- ❌ Do NOT create `tailwind.config.js` or `tailwind.config.ts`.
- ✅ Define tokens in `apps/web/src/app/globals.css` using `@theme { ... }`.
- ✅ Use `@tailwindcss/postcss` in `postcss.config.mjs` (NOT `autoprefixer` — Tailwind v4 handles it).
- ✅ Custom utilities use the `@utility <name> { ... }` directive in `globals.css` (one per utility). NOT `@layer utilities { ... }` — that is the legacy Tailwind v3 syntax (per Skill 2, migrated in v1.2.4 H3).
- ✅ Add `@source` directives in `globals.css` after `@import 'tailwindcss';` so Tailwind v4 scans monorepo sibling packages. Maison has three (per v1.2.4 H2, Skill 2 §13.6 — "the #1 cause of Tailwind classes not applying in production"): `@source "../components/**/*.{ts,tsx}";`, `@source "../lib/**/*.{ts,tsx}";`, `@source "../../../../packages/ui/src/**/*.{ts,tsx}";`. Without these, classes used inside `apps/web/src/components/`, `apps/web/src/lib/`, or `packages/ui/src/` get tree-shaken out of the production CSS bundle.
- ✅ `tooling/tailwind/base.ts` is intentionally minimal — only `fontFamily` as a JS reference for non-CSS consumers (Storybook). Per v1.2.5 N8 (Skill 2 §9.5/§13.6), the duplicate `theme.extend` block (colors, spacing, fontSize, borderRadius, transitions, keyframes, animation) was removed because it was drifting from the CSS-first `@theme` source of truth. Do NOT re-add tokens here — declare them in `@theme` instead.
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
- RBAC roles (ADR-008): `customer`, `staff`, `manager`, `owner`. Checked via tRPC middleware (`staffProcedure` / `ownerProcedure` — `managerProcedure` was removed in v1.2.5 as dead code; admin mutations use `ownerProcedure`), not in `proxy.ts` (proxy only checks "is authenticated" via `getSessionCookie()`).
- `BETTER_AUTH_URL` MUST be set in production. The config throws at module load if unset — this is intentional (fail fast, not fail silently).
- Email/password is the v1 auth method (hybrid — Magic Link + Google OAuth are Phase 2 per ADR-013).
- `customSession` plugin enriches session with user role from `users` table.

---

## tRPC v11 patterns (ADR-008 — 4 procedure tiers)

1. **4 procedure tiers** (per ADR-008, aligned with Stillwater v3.0.0 §15.17):
   - `publicProcedure` — no auth required
   - `protectedProcedure` — any authenticated user
   - `staffProcedure` — staff, manager, or owner role (admin read)
   - `ownerProcedure` — owner role only (admin mutations, role management, store settings)
   - **Note**: `managerProcedure` was removed in v1.2.5 (v8 remediation, N5) as dead code — it was defined per ADR-008 but never wired into any router; admin mutations use `ownerProcedure`. If ADR-008 is later amended to require a manager tier, it can be re-added. The removal is locked in by `packages/api/src/trpc.test.ts` ("does NOT export managerProcedure" test).

2. **Server-side caller for RSC.** Import from `apps/web/src/lib/trpc/server.ts`. Use `api()` for auth-guarded routes (session-aware, forces dynamic) or `apiPublic()` for public routes (session-free, allows static prerender). This calls the router directly (no HTTP round-trip) — perfect for Server Components.

3. **Client-side caller via React Query.** Import `trpc` from `apps/web/src/lib/trpc/client.tsx`. Wrap the app in `TRPCProvider`. Mutations use `useMutation` pattern.

4. **Input validation with Zod v4** (ADR-018). Every procedure has an `input` parser. Use `z.email()` (NOT `z.string().email()` — deprecated in v4). Never trust untyped input.

5. **Rate limiting middleware** in `packages/api/src/middleware/rateLimit.ts`. Uses Upstash Redis. **Fails open** if Redis is down — do not "fix" this to fail-closed (would block legitimate users during outages).

---

## Stripe (ADR-009 — Payment Intents + ADR-014 — idempotency)

- **Stripe Payment Intents** (not Checkout Sessions — per ADR-009 flipped in REMEDIATION_PLAN_v4). PCI SAQ-A scope (card data handled by Stripe Elements).
- **Stripe `apiVersion` pinned** to `'2026-06-24.dahlia'` in `packages/payments/src/client.ts` (per Skill 2 §9.9, locked in v1.2.5 N6). Do NOT remove the pin — letting the SDK default drift on upgrade can silently change wire formats or webhook payloads.
- **Webhook idempotency** via dual-defense pattern (ADR-014): `payment_events` table + `pg_advisory_xact_lock`. See `packages/payments/src/idempotency.ts` for `isUniqueViolation` + `hashStringToBigInt` helpers.
- **Webhook signature verification** in `apps/web/src/app/api/webhooks/stripe/route.ts` using `env.STRIPE_WEBHOOK_SECRET` (imported from `@maison/config` — per Skill 2 §13.5, locked in v1.2.5 N4). Same pattern for the Sanity webhook route with `env.SANITY_WEBHOOK_SECRET`. The Payment Intents helper at `packages/payments/src/webhooks.ts` ALSO reads `env.NEXT_PUBLIC_APP_URL` from `@maison/config` (locked in v1.2.6 V9-2 — v8 N4 wired the secrets but missed this app URL access in the same file). All webhook routes + `webhooks.ts` now use the `env` module exclusively — do NOT reach for `process.env` directly in any webhook code.
- **Apple Pay / Google Pay** are available via Stripe Payment Intents + Stripe Elements (paymentMethodTypes configuration).
- **Stripe Tax** via `payment_intent_data.automatic_tax` or computed server-side.
- Local dev: use the Stripe CLI (`docker compose --profile stripe up -d stripe`) to forward events to `localhost:3000/api/webhooks/stripe`.

---

## Trigger.dev v4 (ADR-016)

- **Import from `@trigger.dev/sdk` root** (NOT `/v4` — subpath doesn't exist; NOT `/v3` — deprecated April 1, 2026).
- Config in `services/workers/trigger.config.ts`.
- `machine: "micro"` (string literal, not object form).
- `tasks.trigger('task-id', payload)` API (NOT `TriggerClient.sendEvent()`).
- Workers `package.json` MUST have `"type": "module"`.

---

## Anti-generic UI rules (non-negotiable)

Per `~/.pi/agent/skills/avant-garde-design-v4/references/12-anti-generic-checklist.md`. These are checked in PR review:

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
- **No PII in logs (Skill 2 §13.10, locked in v1.2.6 V9-1 + v1.2.7 V10-1/V10-2).** Never `console.log` user-supplied PII (name, email, message body, etc.). The `contact.submit` and `newsletter.subscribe` routers previously logged this; they now emit PII-redacted messages like `'[contact] Submission received (PII redacted)'` and `'[newsletter] New subscriber from ${source} (PII redacted)'`. The same Skill 2 §13.10 rule bans logging Stripe webhook payloads — log only event IDs + types, never request bodies. As of v1.2.7, the Stripe webhook handler at `packages/payments/src/webhooks.ts` (was logging `order.email` on line 183) and the stub-mode email senders at `packages/email/src/send.ts` + `packages/auth/src/resend-client.ts` (were logging full `payload` including `to` + `react` body) are also PII-safe — the webhook now logs `(PII redacted)` and the stub senders log only the email subject. If you need a structured log for debugging, redact PII fields explicitly or use a placeholder tag.

---

## SSH push (no openssh-client installed)

This environment does NOT have `openssh-client`. Use the included wrapper:

```bash
GIT_SSH_COMMAND="/home/z/my-project/maison/skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py -i ~/.ssh/id_maison -o StrictHostKeyChecking=accept-new" git push origin main
```

The SSH key is at `docs/ssh-key.txt` (copy to `~/.ssh/id_maison`, `chmod 600`). The wrapper uses Paramiko. Full instructions: `docs/ssh-warpper_SKILL.md`.

**Always push to `main`** — do not create branches (per user instruction).

---

## Files to read before writing code

| File                                                                                  | Why                                                                  |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `docs/PRD_unified.md`                                                                 | What to build (features, pages, data models)                         |
| `docs/landing_page_unified.html`                                                      | How it should look (canonical design tokens, sections, copy)         |
| `PROJECT-ARCHITECTURE.md`                                                             | How to build it (ADRs, layer model, schemas)                         |
| `~/.pi/agent/skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` | Stack-specific anti-patterns (read §9 + §13 before writing new code) |
| `~/.pi/agent/skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md`         | Concrete Stillwater reference (real file paths, working configs)     |

---

## Things that look wrong but aren't

- **`proxy.ts` instead of `middleware.ts`** — Next.js 16 renamed it. Don't "fix" it.
- **No `tailwind.config.js`** — Tailwind v4 is CSS-first. Tokens live in `globals.css` `@theme`.
- **Money in cents (integer)** — not dollars. Don't change to `numeric`.
- **Fail-open rate limiting** — if Redis is down, allow requests. Don't change to fail-closed.
- **Self-hosted fonts in `packages/ui/src/fonts/`** — not Google Fonts. Privacy + performance.
- **`minimumReleaseAge: 1440` in `pnpm-workspace.yaml`** — supply-chain guardrail. Delays new packages 24h. Don't reduce it.
- **`overrides` in `pnpm-workspace.yaml`** — pins OpenTelemetry, `ws` (GHSA-96hv DoS CVE), and `tmp` (GHSA-pxg6 path traversal CVE) to fixed versions. Also `allowBuilds` grants postinstall to critical native binaries (esbuild, sharp, @sentry/cli, ssh2). Don't remove or reduce any of these.
- **OpenTelemetry `overrides` in `pnpm-workspace.yaml`** — bypasses NPM registry desyncs. Don't remove.
- **`ScrollRevealTrigger.tsx` mounting `useScrollReveal()` from `(shop)/layout.tsx`** — The `.reveal` utility in `apps/web/src/app/globals.css` sets `opacity: 0` and only transitions to `opacity: 1` when the `.visible` modifier is added by the `useScrollReveal()` hook in `apps/web/src/hooks/useScrollReveal.ts`. The hook was defined but never called — V11-1 (v1.2.8) wired it via a thin Client Component (`'use client'`; body: `useScrollReveal(); return null;`) mounted once in the shop layout. Without this trigger, every `ProductCard` (which renders `className="product-card reveal"`) stays at `opacity: 0` and `/products` (plus every PDP and any other surface rendering `ProductCard`) shows up as a blank screen. Don't "consolidate" the trigger into `ProductCard.tsx` — that would re-run the IntersectionObserver setup once per card and miss cards loaded after initial mount (paginated PLPs, search results). V12-1 (v1.2.9) added a `requestAnimationFrame` fallback inside the hook: after the first paint it queries `.reveal:not(.visible)` and manually adds `visible` to any element whose `getBoundingClientRect()` is already inside the viewport — `IntersectionObserver` does not reliably fire `isIntersecting` for elements already in the viewport when the observer is constructed inside a post-hydration `useEffect`, so without this fallback the first ~4 product cards in the initial viewport stayed at `opacity: 0` despite the V11-1 wiring. Don't strip the rAF fallback as redundant with the observer — it covers a real first-paint timing gap. V14-1 (v1.3.1) added `usePathname()` + `useSearchParams()` from `next/navigation` as `useEffect` dependencies (`[pathname, searchParams]`, was `[]`): on client-side `<Link>` navigation between collection filter URLs (e.g. `/products?collection=furniture` → `/products?collection=lighting`), the layout + trigger stay mounted so the old `[]`-deps effect never re-ran — the new `ProductCard` instances rendered at `opacity: 0` and the `IntersectionObserver` was never re-constructed to observe them, leaving the grid blank until a manual page reload. With `pathname` + `searchParams` in the deps array, the effect re-runs on every route/query change, tears down the old observer (cleanup return), constructs a new one, and observes every `.reveal` element currently in the DOM. Don't strip the `pathname` / `searchParams` deps back to `[]` "because the effect has no external inputs" — the route/query string IS the input that signals new `.reveal` elements have rendered. V15-1 (v1.3.2) wrapped `<ScrollRevealTrigger />` in `<Suspense fallback={null}>` inside `apps/web/src/app/(shop)/layout.tsx`: the V14-1 `useSearchParams()` addition opts the consuming Client Component out of static prerendering, and Next.js requires any component using `useSearchParams()` to be wrapped in a `<Suspense>` boundary — without it the production build (`next build`) failed with `"useSearchParams() should be wrapped in a suspense boundary at page /cart"` and the live site returned HTTP 502 (dev still worked because Next.js auto-suspends statically-prerendered pages in dev mode, so the defect was only caught at deploy time). Don't strip the `<Suspense>` wrapper as redundant — it is the standard Next.js pattern for `useSearchParams()` in statically-prerendered pages, and `fallback={null}` is correct because the trigger renders nothing visible (only the `IntersectionObserver` side-effect matters). Locked by `apps/web/src/lib/__tests__/scroll-reveal-wiring.contract.test.ts` (5 tests: 3 V11-1 wiring + 2 V14-1 route-change re-trigger — the rAF fallback is additive and does not change the contract surface; the V11-1 layout-mounting test was tightened in V15-1 to also assert the `<Suspense>` boundary is present, no new tests added, total unchanged). The same `<Suspense>` wrapping pattern was extended to `<SortSelect>` in v10 (LOW-2) — locked by `apps/web/src/lib/__tests__/sortselect-suspense.contract.test.ts` (3 tests).
- **`escapeForScriptContext(JSON.stringify(jsonLd))` in the PDP JSON-LD script tag** — `apps/web/src/app/(shop)/products/[slug]/page.tsx:107` renders JSON-LD via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ... }} />`. The wrapper is not paranoia: if any product field (name, description, etc.) ever contains the literal string `</script>`, the browser would terminate the script tag early and run attacker-controlled content in the page context — a stored XSS vector. The `escapeForScriptContext()` helper in `apps/web/src/lib/utils.ts` replaces `<` with `\u003c` (and `>`, `&`, `"`, `'` analogously) so the output is unparseable as HTML but still valid JSON. Per Skill 2 §9.1 + §16.3 — added in V11-2 (v1.2.8). Don't "simplify" it back to bare `JSON.stringify()`.
- **`DYNAMIC_SERVER_USAGE` warnings for `/account/*` + `/admin/*`** — These routes are `ƒ (Dynamic)` by design: the `(account)` and `(admin)` layouts call `auth.api.getSession({ headers: await headers() })` (Layer 2 security boundary), which makes `next/headers` hit the static pre-render probe. Next.js catches the probe, marks the route dynamic, and emits a warning. The build still completes (exit 0, 42/42). Do NOT add `export const dynamic = 'force-dynamic'` to silence them — that is **incompatible with `cacheComponents: true`** and will break the build when that feature is enabled in a later phase (Stillwater SKILL §6.10 Gotcha 7). Public shop routes (`/`, `/collections`) use `apiPublic()` and render as `○ Static`. `/products` and `/search` also use `apiPublic()` but additionally `await searchParams` in the page body, which opts them into `ƒ (Dynamic)` rendering — this is intentional for query-driven pages (sort, collection filter, search query) and is the standard Next.js 16 pattern for URL-state-driven pages. That is the only split that matters. See `apps/web/src/lib/__tests__/rendering-strategy.contract.test.ts` for the regression test that locks this invariant. Additional contract tests: `proxy-contract.test.ts` (ADR-006/010 Layer-1 invariant), `coverage-thresholds.contract.test.ts` (ADR-019), `design-tokens.contract.test.ts` (ADR-007 radius tokens), `webhooks.contract.test.ts` (ADR-009 Payment Intents), `services/workers/trigger.config.test.ts` (ADR-016 Trigger.dev config), `headings.contract.test.ts` (v1.2.2 F1/F3/F5 — stray-space-in-em + H1 whitespace), `category-grid.contract.test.ts` (v1.2.2 F2 — CategoryGrid accessible name + img alt + anchor aria-label), `page-metadata.contract.test.ts` (v1.2.2 F4 + v1.2.3 G1 — page-split pattern enforces no `'use client'` + `metadata` export for `/gift-cards`, `/trade`, `/cart`, `/checkout`, `/contact`; now 15 tests, was 12), `pdp-thumbnail-alt.contract.test.ts` (v1.2.4 H4 — asserts PDP thumbnail `alt` is non-empty AND falls back to `img.altText`; 2 tests), `scroll-reveal-wiring.contract.test.ts` (v1.2.8 V11-1 + v1.3.1 V14-1 + v1.3.2 V15-1 — asserts `useScrollReveal` hook exists + `ScrollRevealTrigger` Client Component exists with `'use client'` directive + `(shop)` layout imports + renders it; V14-1 also asserts `usePathname` is imported from `next/navigation` and the `useEffect` deps array includes `pathname`; V15-1 also asserts the `(shop)` layout wraps `<ScrollRevealTrigger />` in a `<Suspense>` boundary; now 5 tests, was 3). Total @maison/web contract tests: 13 files, 192 tests (v10 added `sortselect-suspense.contract.test.ts` 3 tests, `deps-hygiene.contract.test.ts` 37 tests, `tsconfig-include.contract.test.ts` 9 tests, `lint-scripts.contract.test.ts` 33 tests, `ui-vitest-config.contract.test.ts` 6 tests — total +88 tests). Additional @maison/api contract tests: `packages/api/src/routers/contact.contract.test.ts` (v1.2.3 G1 — asserts `contact.submit` calls `sendEmail` to `hello@maison-living.com`; 3 tests), `packages/api/src/routers/zod-email.contract.test.ts` (v1.2.4 H1, ADR-018 — asserts no `z.string().email()` remains in the 4 email-validating source files; 4 tests), `packages/api/src/routers/no-unknown-cast.contract.test.ts` (v1.2.5 N1, Skill 2 §9.2 — asserts no `as unknown as` casts in production code except documented exceptions in `ALLOWED_FILES`; 1 test). Total @maison/api tests: 6 files, 20 tests. Additional @maison/auth contract test: `packages/auth/src/rbac-aliases.contract.test.ts` (v1.2.4 H6, ADR-008 — asserts the 4 deprecated RBAC aliases `canReadAdmin` / `canWriteAdmin` / `ADMIN_ROLES` / `ADMIN_WRITE_ROLES` are NOT exported; 6 tests). Total @maison/auth tests: 2 files, 35 tests (v1.2.5 N2 deleted `packages/auth/src/types.test.ts` — 10 tests that only exercised the removed `isAdmin` / `isStaffOrAdmin` helpers). @maison/payments tests: 3 files, 18 tests (unchanged in v1.2.4 — H5 removed a type cast only, no behavior change; v1.2.5 N6 only pinned `apiVersion`, no behavior change).
- **Server Component wrapper + Client Component child page split (`/gift-cards`, `/trade`, `/cart`, `/checkout`, `/contact`)** — These 5 pages look "wrong": the `page.tsx` is a thin Server Component that does nothing but export `metadata` and render a single Client Component child (`GiftCardsForm`, `TradeForm`, `CartView`, `CheckoutFlow`, `ContactForm` in `apps/web/src/components/shop/`). This is **intentional and required** — Next.js 16 forbids `metadata` export from Client Components, so a Client-Component-only page silently falls back to the homepage's default title. The split pattern lets the Server Component own the page title (e.g., "Gift Cards — Maison", "Trade Program — Maison", "Shopping Bag — Maison", "Checkout — Maison", "Contact — Maison") while the Client Component owns the interactive form/state. Don't "consolidate" the child back into the page. Enforced by `apps/web/src/lib/__tests__/page-metadata.contract.test.ts` (v1.2.2 F4 + v1.2.3 G1). See `docs/REMEDIATION_PLAN_v5.md`, `docs/REMEDIATION_PLAN_v6.md`, and PAD REMEDIATION_HISTORY v1.2.2/v1.2.3.
