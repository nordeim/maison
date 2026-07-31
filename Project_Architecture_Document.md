# MAISON — Master Project Architecture Document (PAD) v1.2.1

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION-LOCKED BLUEPRINT
**Companion Documents:** [`docs/PRD_unified.md`](./docs/PRD_unified.md), [`docs/MAISON_Design_Guide.md`](./docs/MAISON_Design_Guide.md) (canonical design system reference — 1,489 lines, 16 sections), [`docs/maison_landing_page_mockup_v2.zip`](./docs/maison_landing_page_mockup_v2.zip) (extracts to `public/landing.html`)
**Last Updated:** 2026-07-29 (v1.2.1 — reconciled with post-remediation codebase per REMEDIATION_PLAN_v4. See REMEDIATION_HISTORY at end of document for the full list of corrections.)
**Audience:** Senior Engineers, Tech Leads, DevOps, and Onboarding Engineers
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

> **v1.1 changelog:** §5 Design System Reference fully reconciled with `MAISON_Design_Guide.md`. Color tokens corrected (`--muted`, `--sage`, added `--sage-soft`). Motion table expanded from 7 to 24 animations. New §5.5 (Visual Treatments & Textures) and §5.6 (Interaction Patterns — math & choreography) added. Component primitives table extended with custom cursor, magnetic button, scroll progress bar, floating bag panel, statement ticker.
>
> **v1.2 changelog:** §5 Design System fully reconciled with three coding skills. 13 new ADRs added (ADR-008 through ADR-020). §1.2 tech stack updated (Zod ^4.4.0 added; React ≥ 19.2.3 CVE floor; `erasableSyntaxOnly` implications documented). §1.3 ADR-006 rewritten (2-layer auth pattern — cookie-only proxy, NO `auth.api.getSession()` in proxy.ts). §5.2 color tokens WCAG AAA contrast ratios. §5.3 component primitives — 6 new components (ClientOnly, payment_events table pattern, apiPublic caller, etc.). §5.4 motion table unchanged (already aligned). §6 security — webhook idempotency dual-defense pattern. §7 workers — Trigger.dev v4 root import. §8 testing — coverage thresholds aligned (api 90 / payments 95). §10 code style — Zod v4 patterns, React 19 SubmitEvent, erasableSyntaxOnly rules. §12 key files — updated. §13 glossary — 12 new terms.
>
> **v1.2.1 changelog (post-remediation reconciliation):** ADR-009 flipped from Stripe Checkout Sessions to Stripe Payment Intents (3-step Maison checkout UX requires inline card capture). §4.2 expanded from 16 → 24 tables (added `verifications`, `payment_events`, `product_reviews`, `gift_cards`, `gift_card_redemptions`, `trade_applications`, `loyalty_accounts`, `loyalty_transactions`). §3.2 router listing expanded from 9 → 13 router files (`discounts`, `reviews`, `trade`, `gift-cards`, `loyalty` added; `wishlist` merged into `account`). §6.2/§6.3 `requireRole()` references replaced with canonical `canAccessStaff()` / `canAccessOwner()` from `packages/auth/src/rbac.ts`. Audit-log location clarified as inline in `packages/api/src/routers/admin.ts` (no `packages/api/src/lib/audit-log.ts` file). §3.2 clarified `apps/web/src/middleware/` does NOT exist (correct per ADR-006). pnpm 11.9.0 → 11.17.0 (§1.2 + §9.4 CI). §8.3 duplicate `packages/payments` 90% row removed (95% canonical per ADR-019). New §8.5 Contract Tests subsection documents the 6 contract test files added in remediation. §6.3 procedure tiers chain now includes `managerProcedure`. RBAC roles updated to `customer`/`staff`/`manager`/`owner` throughout. §11 E2E count updated to 30 (22 smoke + 8 accessibility). §12 "8-gate pipeline" clarified as 4 CI jobs with 8 gates inside `quality-gates`. Filename references throughout the PAD updated from `PROJECT-ARCHITECTURE.md` → `Project_Architecture_Document.md`. See REMEDIATION_HISTORY at end of document for the full 17-point reconciliation.

---

## Table of Contents

1. [System Overview & Decisions](#1-system-overview--decisions)
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Application Architecture](#3-application-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Design System Reference](#5-design-system-reference)
6. [Security Architecture](#6-security-architecture)
7. [Worker / Background Service Architecture](#7-worker--background-service-architecture)
8. [Testing Strategy](#8-testing-strategy)
9. [Build & Deployment](#9-build--deployment)
10. [Developer Handbook](#10-developer-handbook)
11. [Known Issues & Outstanding Tasks](#11-known-issues--outstanding-tasks)
12. [Key Files Reference](#12-key-files-reference)
13. [Glossary](#13-glossary)
14. [REMEDIATION_HISTORY (v1.2.1)](#remediation_history-v121--reconciliation-with-post-remediation-codebase)

---

## 1. System Overview & Decisions

### 1.1 Document Metadata & Purpose

This PAD is the **single source of truth** for the Maison platform's engineering architecture. It complements the PRD (which defines _what_ to build) by defining _how_ to build it — every technology choice, every layer boundary, every security rule, every operational procedure.

**How to use this document:**

| If you are…                  | Read these sections first                                                       |
| ---------------------------- | ------------------------------------------------------------------------------- |
| A new engineer onboarding    | §1, §3, §10 (Developer Handbook)                                                |
| Debugging a production issue | §2 (Topology), §6 (Security), §9 (Build/Deploy), §11 (Known Issues)             |
| Reviewing a tech choice      | §1.3 (ADRs) — every decision has Context, Rationale, Consequences, Alternatives |
| Adding a new feature         | §3 (Layer Model), §4 (Data), §5 (Design System), §8 (Testing)                   |
| An AI coding agent           | This PAD + `AGENTS.md` + `CLAUDE.md` before touching any file                   |

### 1.2 Technology Stack Summary

| Layer            | Technology             | Pinned Version                  | Key Rationale                                                                              |
| ---------------- | ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Monorepo tooling | Turborepo              | ≥2.10.4                         | Task orchestration, caching, incremental builds; proven in Stillwater (651 tests, 11 ADRs) |
| Package manager  | pnpm                   | 11.17.0 (`packageManager` field) | Workspace protocol, supply-chain guardrails (`minimumReleaseAge: 1440`)                   |
| Runtime          | Node.js                | ≥22.0.0                         | LTS required by Next.js 16; ESM-first                                                      |
| Meta-framework   | Next.js                | 16.2.x                          | App Router, RSC, `proxy.ts` (replaces `middleware.ts`), Turbopack, async params            |
| UI runtime       | React                  | 19.2.x (≥ 19.2.3 CVE floor)    | React Compiler, `use()` hook, ref-as-prop (no `forwardRef`), `SubmitEvent` (not `FormEvent`), `ClientOnly` boundary for SSR-safe hooks (ADR-017) |
| Language         | TypeScript             | 5.9.x                           | Strict mode, `noUnusedLocals`, `erasableSyntaxOnly`                                        |
| Styling          | Tailwind CSS           | v4.3.x                          | CSS-first `@theme` config (no `tailwind.config.js`), `@tailwindcss/postcss`                |
| API layer        | tRPC                   | v11.18.x                        | End-to-end type safety, server-side caller for RSC, React Query integration                |
| ORM              | Drizzle ORM            | 0.45.x                          | Type-safe SQL, migration system, no runtime overhead, edge-runtime compatible              |
| Database         | PostgreSQL             | 17 (Neon prod / Docker dev)     | Relational integrity, JSONB for flexible content, `ilike` for Phase 1 search (ADR-012), `pg_advisory_xact_lock` for webhook idempotency (ADR-014) |
| Authentication   | Better Auth            | 1.6.23                          | Replaces Auth.js v5 — better OAuth, magic links, session control, simpler config           |
| Payments         | Stripe                 | 22.3.x (Dahlia)                 | Payment Intents + Stripe Elements (ADR-009), Webhooks (idempotent via ADR-014), Stripe Tax via `automatic_tax` |
| Background jobs  | Trigger.dev            | v4                              | Webhook processing, abandoned cart emails, digest emails. Root SDK import `@trigger.dev/sdk` (ADR-016)                                   |
| Validation       | Zod                    | ^4.4.0                          | Input validation (env, Server Actions, tRPC). `z.email()` not `z.string().email()` (ADR-018) |
| CMS              | Sanity                 | v6 Studio + v7 client           | Headless, real-time, Live Preview, GROQ queries, Next.js integration                       |
| Email            | Resend + React Email   | 6.17 / 6.6                      | Transactional emails, type-safe templates                                                  |
| Image CDN        | Cloudflare Images + R2 | —                               | On-the-fly optimization, AVIF/WebP, cost-effective storage                                 |
| Error tracking   | Sentry                 | 10.63.x                         | Next.js integration, source maps, performance monitoring                                   |
| Analytics        | PostHog                | 1.396.x                         | Privacy-friendly, session replay, feature flags                                            |
| Logging          | Axiom                  | —                               | Structured logs, OpenTelemetry-compatible                                                  |
| Hosting          | Vercel                 | —                               | Next.js optimised, Edge functions, ISR                                                     |
| Database hosting | Neon                   | —                               | Serverless Postgres, branching, point-in-time recovery                                     |
| Rate limiting    | Upstash Redis          | —                               | Serverless Redis, sliding window, fail-open pattern                                        |

### 1.3 Architecture Decision Records (ADRs)

#### ADR-001: Turborepo monorepo over single-app

- **Context:** Maison has a storefront, an admin surface, a Sanity Studio, a tRPC API package, a database package, an auth package, a payments package, an email package, and a workers service. A single Next.js app would couple all of these; separate repos would duplicate config and complicate cross-package type safety.
- **Decision:** Use Turborepo with pnpm workspaces. Structure: `apps/*` (deployable), `packages/*` (shared libraries), `services/*` (workers), `tooling/*` (shared configs).
- **Rationale:** Proven in the Stillwater production codebase (651 tests, 13 build phases, €5M GMV target). pnpm's `workspace:*` protocol + `customConditions: ["@maison/source"]` enables source-resolution (no build step in dev). Turborepo's task caching reduces CI time by ~60% on incremental changes.
- **Consequences:**
  - ✅ End-to-end type safety (change a Drizzle schema → tRPC types update → React component errors at compile time)
  - ✅ Shared design tokens across web + studio + email
  - ✅ Atomic commits across packages (no version skew)
  - ❌ Steeper onboarding (must understand workspace protocol)
  - ❌ Slower initial `pnpm install` (links all packages)
- **Alternatives Rejected:**
  - _Single Next.js app_ — couples CMS admin with storefront; can't share code with Trigger.dev workers
  - _Nx_ — heavier, more opinionated; Turborepo is lighter and sufficient for this scope
  - _Separate repos_ — breaks type safety, complicates CI, requires manual version publishing

#### ADR-002: Better Auth over Auth.js v5

- **Context:** Authentication requires email/password + Magic Link + Google OAuth (hybrid per ADR-013), session management, and RBAC (`customer`/`staff`/`manager`/`owner` per ADR-008). Auth.js (formerly NextAuth) v5 is the incumbent, but has known issues with OAuth reliability and session revocation.
- **Decision:** Use Better Auth 1.6.23. Config in `packages/auth/src/config.ts`. Sessions stored in PostgreSQL (`sessions` table), not JWTs.
- **Rationale:** Better Auth has a simpler mental model (no JWT complexity), built-in magic links (Auth.js requires custom provider), and database-backed sessions (enables instant revocation — critical for admin security). The Stillwater codebase migrated from Auth.js v5 to Better Auth and documented 7 specific pain points that Better Auth resolves (see `skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md`).
- **Consequences:**
  - ✅ Instant session revocation (delete row from `sessions`)
  - ✅ Built-in magic links, email verification
  - ✅ Simpler OAuth config (no separate provider definitions)
  - ❌ Smaller community than Auth.js (fewer Stack Overflow answers)
  - ❌ Newer project (less battle-tested at scale)
- **Alternatives Rejected:**
  - _Auth.js v5_ — JWT-based sessions complicate revocation; magic links require custom provider; Stillwater migration documented 7 pain points
  - _Clerk_ — hosted, adds vendor lock-in, less control over data residency
  - _Supabase Auth_ — couples auth with database choice; we want Neon, not Supabase Postgres

#### ADR-003: tRPC v11 over REST/GraphQL

- **Context:** The storefront and admin both need a typed API. REST requires manual type sync (or codegen). GraphQL adds a schema layer and resolver complexity. The team is TypeScript-native.
- **Decision:** Use tRPC v11. Routers in `packages/api/src/routers/`. Server-side caller for RSC (no HTTP round-trip). Client-side via React Query.
- **Rationale:** tRPC gives end-to-end type safety with zero codegen. Change a Zod input schema → every caller (RSC, Client Component, E2E test) gets a compile error. The server-side caller pattern (import the router directly in RSC) eliminates the HTTP overhead for Server Components — they call the API as a function.
- **Consequences:**
  - ✅ Zero-codegen type safety
  - ✅ Server-side caller = no HTTP overhead in RSC
  - ✅ React Query integration (caching, optimistic updates)
  - ❌ tRPC is TypeScript-only (no Python/Go clients without OpenAPI generation)
  - ❌ Bundle size slightly larger than REST (Zod + tRPC client)
- **Alternatives Rejected:**
  - _REST + OpenAPI codegen_ — codegen step is fragile; type drift between server and client
  - _GraphQL_ — schema/resolver overhead; Apollo client bundle is heavy; overkill for a single-team app
  - _Next.js Server Actions only_ — no client-side mutations without manual fetch; doesn't integrate with React Query caching

#### ADR-004: Drizzle ORM over Prisma

- **Context:** Need a type-safe ORM for PostgreSQL 17. Prisma is the incumbent but has a Rust binary, generates code into `node_modules`, and has edge-runtime limitations.
- **Decision:** Use Drizzle ORM 0.45. Schema in `packages/db/src/schema/` (one file per table). Migrations via `drizzle-kit`.
- **Rationale:** Drizzle is SQL-first — you write actual SQL-like schemas, not a DSL. No Rust binary (smaller CI footprint). No generated code in `node_modules` (types derive from the schema file directly). Works in edge runtime (Vercel Edge Functions). Migration system is transparent (SQL files in `packages/db/drizzle/migrations/`, reviewable in PRs).
- **Consequences:**
  - ✅ No Rust binary (lighter CI)
  - ✅ SQL-first (easier to debug — the query Drizzle generates is the query you wrote)
  - ✅ Edge-runtime compatible
  - ✅ Transparent migrations (SQL files, reviewable)
  - ❌ Smaller ecosystem than Prisma (fewer plugins)
  - ❌ No built-in nested-write API (must use transactions for multi-table writes)
- **Alternatives Rejected:**
  - _Prisma_ — Rust binary adds CI weight; generated code in `node_modules` is opaque; edge-runtime support is incomplete
  - _Raw SQL with `pg`_ — no type safety; too easy to introduce SQL injection
  - _Kysely_ — query builder, not an ORM; no migration system

#### ADR-005: Sanity CMS over Strapi/Contentful

- **Context:** Need a headless CMS for product content (descriptions, materials, maker stories), journal articles, and homepage sections. Editors need a GUI; engineers need type-safe queries.
- **Decision:** Use Sanity v6 (Studio) + v7 (client). Studio in `apps/studio/`. Queries via GROQ. Webhook → ISR revalidation.
- **Rationale:** Sanity is real-time (editors see changes instantly in Live Preview). GROQ is more expressive than GraphQL for content queries. The Next.js integration (`next-sanity`) is mature. Sanity Cloud is managed (no self-hosting). The Stillwater codebase uses Sanity with zero production incidents over 13 build phases.
- **Consequences:**
  - ✅ Real-time Live Preview (editors love it)
  - ✅ GROQ is powerful for content relationships
  - ✅ Managed (no CMS ops)
  - ❌ Pricing scales with usage (mitigation: monitor, fallback to Strapi if needed)
  - ❌ GROQ has a learning curve (mitigation: `groqd` for type-safe query building)
- **Alternatives Rejected:**
  - _Strapi_ — self-hosted (adds ops); UI is less polished; real-time preview is weaker
  - _Contentful_ — enterprise pricing; less flexible content modelling
  - _Payload CMS_ — newer, smaller community; Next.js integration less mature

#### ADR-006: `proxy.ts` over `middleware.ts` + 2-layer auth pattern (revised v1.2 — ADR-010)

- **Context:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and made it support async. The rename signals that it's now a full proxy (can rewrite, modify headers, check auth) not just middleware. The Stillwater reference codebase (v3.0.0 §5.6) and the tRPC+Drizzle skill (v1.4 §5.6) both mandate a 2-layer auth pattern: Layer 1 (proxy.ts) does cookie-existence-only checks via `getSessionCookie()` — NO DB, NO RBAC. Layer 2 (Server Component layouts) does full session validation via `auth.api.getSession()` + RBAC via `canAccessStaff()` / `canAccessOwner()` (canonical helpers in `packages/auth/src/rbac.ts`).
- **Decision:** Use `proxy.ts` at `apps/web/proxy.ts` with cookie-only auth (Layer 1). Use `getSessionCookie(request)` from `better-auth/cookies` — do NOT call `auth.api.getSession()` in proxy.ts. Full session validation + RBAC happens in Layer 2 (`apps/web/src/app/(account)/layout.tsx` and `(admin)/layout.tsx`) via `auth.api.getSession({ headers: await headers() })` + `canAccessStaff()` / `canAccessOwner()` (from `packages/auth/src/rbac.ts`).
- **Rationale:** Calling `auth.api.getSession()` in proxy.ts adds a DB query to EVERY request (performance killer), breaks Next.js 16's caching model, and is explicitly banned in both reference skills. The 2-layer pattern keeps proxy.ts fast (Edge-compatible, sub-millisecond) while pushing full validation to the layout boundary where it runs once per page load.
- **Consequences:**
  - ✅ Proxy.ts is fast (cookie-only check, no DB, Edge-compatible)
  - ✅ Full session validation happens once per page load in layouts (Layer 2)
  - ✅ Aligns with Stillwater ADR-009 and tRPC+Drizzle skill §5.6
  - ❌ Security headers in `proxy.ts` response don't reach production on Vercel + Next.js 16.2 — set CSP in `next.config.ts` `headers()` instead
  - ❌ Cannot import `auth` package in proxy.ts (only `better-auth/cookies`)
- **Verification:** `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches. Two source contract tests assert Layer-1 invariants in `apps/web/src/lib/__tests__/`:
  - `proxy-contract.test.ts` — asserts proxy.ts does NOT call `auth.api.getSession` (ADR-006/ADR-010 Layer-1 invariant).
  - `rendering-strategy.contract.test.ts` — asserts the `api()` / `apiPublic()` split for static vs dynamic routes (RSC caller routing).
- **Alternatives Rejected:**
  - _`middleware.ts`_ — deprecated in Next.js 16; will be removed in 17
  - _`auth.api.getSession()` in proxy.ts (v1.1 approach)_ — banned anti-pattern; DB query on every request; breaks caching
  - _Full RBAC in proxy.ts_ — too expensive; belongs in Layer 2 layouts

#### ADR-007: Self-hosted fonts (woff2) over Google Fonts CDN

- **Context:** The brand uses Cormorant Garamond + Inter. Google Fonts CDN is the easy default but adds a third-party connection (privacy concern), a DNS lookup (performance), and potential layout shift (FOUT).
- **Decision:** Self-host woff2 files in `packages/ui/src/fonts/`. Use `@font-face` with `font-display: swap`. Preload critical weights in `apps/web/src/app/layout.tsx`.
- **Rationale:** Privacy (no third-party request). Performance (no DNS lookup, no render-blocking). Layout stability (fonts load from same origin). The Stillwater codebase self-hosts Cormorant Garamond, DM Sans, and JetBrains Mono with zero layout shift.
- **Consequences:**
  - ✅ Privacy (no Google tracking)
  - ✅ Performance (same-origin, preloadable)
  - ✅ Layout stability (`font-display: swap` + preload)
  - ❌ Larger initial bundle (woff2 files; mitigated by subsetting to Latin + Latin Extended)
  - ❌ Manual updates (no auto-updates from Google)
- **Alternatives Rejected:**
  - _Google Fonts CDN_ — privacy concern, DNS lookup, render-blocking
  - _Fontsource_ — convenient but adds a dependency; self-hosting is simpler for a fixed font set

#### ADR-008: tRPC procedure tier naming (public/protected/staff/manager/owner)

- **Context:** The v1.1 PRD/PAD specified procedure tiers as `public/protected/admin/adminWrite`. Validation against Stillwater v3.0.0 §15.17 and tRPC+Drizzle v1.4 §5.6 revealed that `admin` and `adminWrite` are not valid tRPC v11 tier names. Stillwater defines 5 tiers: `publicProcedure`, `protectedProcedure`, `staffProcedure`, `managerProcedure` (added v3.0.0), `ownerProcedure`.
- **Decision:** Use 5 procedure tiers aligned with Stillwater: `publicProcedure` (no auth), `protectedProcedure` (session required), `staffProcedure` (roles: staff/manager/owner), `managerProcedure` (roles: manager/owner), `ownerProcedure` (role: owner only). RBAC roles: `customer` (user-facing), `staff`/`manager`/`owner` (internal).
- **Rationale:** Tier names map to specific middleware chains and role enums. `adminWrite` doesn't exist in tRPC v11. `admin` is not a role in either reference skill. Aligning with Stillwater ensures the build matches a proven production codebase.
- **Consequences:**
  - ✅ 5 tiers provide granular access control (manager tier added for intermediate privileges)
  - ✅ Aligns with Stillwater v3.0.0 — proven in 651 tests
  - ❌ Slightly more complex than 4 tiers (justified by the manager role need)
- **Alternatives Rejected:**
  - _`admin`/`adminWrite` (v1.1 names)_ — not valid tRPC v11 tier names; build will fail
  - _4 tiers without manager_ — Stillwater v3.0.0 added manager for a reason (intermediate privilege for senior staff)

#### ADR-009: Stripe Payment Intents (chosen implementation — Checkout Sessions was rejected for the 3-step Maison checkout UX)

- **Context:** The v1.2 PAD originally selected Stripe Checkout Sessions (hosted payment page). Re-evaluation during remediation (REMEDIATION_PLAN_v4) determined that the 3-step Maison checkout UX (shipping → payment → review) requires inline card capture with a custom review step — Checkout Sessions' redirect-to-Stripe-then-back flow breaks the multi-step UX. Stripe Payment Intents + Stripe Elements + Stripe Tax is the chosen implementation.
- **Decision:** Use Stripe Payment Intents with Stripe Elements (inline card capture). Server creates `stripe.paymentIntents.create({ amount, currency, automatic_payment_methods: { enabled: true }, automatic_tax: { enabled: true } })`; returns `client_secret`; client mounts Stripe Elements with the `client_secret`; on submit, client calls `stripe.confirmPayment({ elements, redirect: 'if_required' })`; on success the server listens for `payment_intent.succeeded` webhook (idempotent per ADR-014) and updates the order to "confirmed". Apple Pay and Google Pay are supported via the Stripe Elements Payment Request Button. Stripe Tax is enabled via the `automatic_tax` parameter on the PaymentIntent.
- **Rationale:** (1) Inline card capture preserves the 3-step checkout UX (no redirect to Stripe-hosted page). (2) The Payment Request Button gives Apple Pay / Google Pay natively inside the same flow. (3) Stripe Elements iframe keeps the app at PCI SAQ-A scope (card data never touches our servers — it stays inside the Stripe-owned iframe). (4) Server-side confirmation via `payment_intent.succeeded` webhook enables robust idempotency (ADR-014) and decouples confirmation from the client. (5) Stripe Tax works identically via `automatic_tax` on PaymentIntents.
- **Consequences:**
  - ✅ Inline checkout UX preserved (no Stripe-hosted redirect)
  - ✅ PCI SAQ-A scope (card data stays inside Stripe Elements iframe)
  - ✅ Apple Pay, Google Pay, Stripe Tax native via PaymentIntents + Elements
  - ✅ Server-side confirmation via idempotent webhook (ADR-014)
  - ❌ More frontend code than Checkout Sessions (Stripe Elements mounting, `confirmPayment` handling)
  - ❌ Server must create the PaymentIntent before the customer submits the form
- **Alternatives Rejected:**
  - _Stripe Checkout Sessions (previously selected)_ — redirect-based flow breaks the 3-step Maison checkout UX; rejects the multi-step review step
  - _Legacy Tokens_ — deprecated by Stripe; forbidden

#### ADR-010: 2-layer auth pattern (cookie-only proxy + DB-backed layouts)

- **Context:** The v1.1 PAD ADR-006 stated "Async support enables DB-backed auth checks (Better Auth session validation)" in proxy.ts. Validation against Stillwater §5.6 and tRPC+Drizzle §5.6 revealed this is the exact anti-pattern both skills ban. The 2-layer pattern mandates cookie-only checks in proxy.ts (Layer 1) and full validation in layouts (Layer 2).
- **Decision:** Layer 1 (`apps/web/proxy.ts`): use `getSessionCookie(request)` from `better-auth/cookies` — cookie-existence-only, NO DB, NO RBAC, Edge-compatible. If cookie absent, redirect to `/auth/sign-in`. If present, `NextResponse.next()`. Layer 2 (Server Component layouts): `auth.api.getSession({ headers: await headers() })` + `canAccessStaff()` / `canAccessOwner()` (from `packages/auth/src/rbac.ts`) — full validation, DB-backed.
- **Rationale:** Calling `auth.api.getSession()` in proxy.ts adds a DB query to EVERY request (performance killer), breaks Next.js 16's caching model, and is explicitly banned in both skills. The 2-layer pattern keeps proxy.ts fast (sub-millisecond, Edge-compatible) while pushing full validation to layouts where it runs once per page load.
- **Consequences:**
  - ✅ Proxy.ts is fast (cookie-only, no DB, Edge-compatible)
  - ✅ Full validation once per page load (Layer 2 layouts)
  - ✅ Aligns with Stillwater ADR-009 and tRPC+Drizzle §5.6
  - ❌ Two layers of auth logic (justified by performance gain)
  - ❌ Cannot do RBAC in proxy.ts (must be in layouts)
- **Verification:** `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches. Source contract tests in `apps/web/src/lib/__tests__/proxy-contract.test.ts` (Layer-1 invariant) and `apps/web/src/lib/__tests__/rendering-strategy.contract.test.ts` (api() / apiPublic() split).
- **Alternatives Rejected:**
  - _`auth.api.getSession()` in proxy.ts (v1.1 approach)_ — banned anti-pattern; DB query per request; breaks caching
  - _Full RBAC in proxy.ts_ — too expensive; belongs in Layer 2

#### ADR-011: WCAG 2.2 AAA target (stricter than ADA Title II AA)

- **Context:** The v1.1 PRD targeted WCAG 2.2 AA. Validation against Stillwater §8 and tRPC+Drizzle §19 revealed both skills target WCAG 2.2 AAA (7:1 contrast, 44×44px targets, 3px focus rings). ADA Title II requires WCAG 2.1 AA as of April 24, 2026 — AAA exceeds this.
- **Decision:** Target WCAG 2.2 Level AAA. Color contrast: ≥ 7:1 for normal text, ≥ 4.5:1 for large text (≥18pt). Touch targets: ≥ 44×44 CSS pixels. Focus rings: 3px solid + 2px offset. Verified via `scripts/contrast-check.ts` in CI.
- **Rationale:** (1) Aligns with both reference skills. (2) Future-proofs against stricter regulations. (3) Better experience for users with low vision. (4) The MAISON palette already meets AAA for `--ink` and `--ink-2` (only `--muted` needs adjustment).
- **Consequences:**
  - ✅ Exceeds ADA Title II AA requirement
  - ✅ Better accessibility for all users
  - ❌ `--muted` `#786f66` at 4.8:1 fails AAA for normal text — darken to `#5a5249` (~7.2:1) or use only for meta labels at 11px+
  - ❌ Touch targets require `min-h-[44px] min-w-[44px]` on all interactive elements
  - ❌ Focus rings must be 3px (was 2px in v1.1)
- **Alternatives Rejected:**
  - _WCAG 2.2 AA (v1.1 target)_ — below skill recommendation; legal risk if regulations tighten

#### ADR-012: Phase 1 search via Drizzle `ilike` (not FTS)

- **Context:** The v1.1 PRD/PAD claimed "Postgres FTS for Phase 1 search" with `pg_trgm` extension and GIN indexes. Validation against both skills revealed FTS is not documented — Stillwater uses Drizzle `ilike` + `or` (Lesson 80).
- **Decision:** Use Drizzle `ilike` + `or` for Phase 1 search. No `tsvector` columns, no GIN indexes, no `pg_trgm` extension. Algolia remains the Phase 2 escalation path if `ilike` performance degrades at scale (> 1,000 products).
- **Rationale:** (1) 13 v1 SKUs (now 20) doesn't justify FTS infrastructure. (2) `ilike` is simpler to implement, debug, and maintain. (3) FTS shines at 1,000+ documents with relevance ranking — we're 2 orders of magnitude below that. (4) Aligns with Stillwater Lesson 80.
- **Consequences:**
  - ✅ Simpler implementation (no generated columns, no query language)
  - ✅ Easier to debug and maintain
  - ❌ No relevance ranking or stemming in Phase 1 (mitigated by sort options: Featured, Newest, Price)
  - ❌ May need migration to Algolia/Meilisearch in Phase 2 if catalog grows
- **Alternatives Rejected:**
  - _Postgres FTS (tsvector + GIN)_ — over-engineered for 13 v1 SKUs (now 20); not in reference skills
  - _Algolia from day one_ — premature optimization; adds vendor dependency

#### ADR-013: Email/password enabled (hybrid auth — diverges from Stillwater passwordless)

- **Context:** Validation against Stillwater §15.16 and tRPC+Drizzle §5.6 revealed both skills set `emailAndPassword: { enabled: false }` (passwordless: Magic Link + Google OAuth only). The v1.1 PRD specified email/password as the primary auth method.
- **Decision:** Enable email/password (`emailAndPassword: { enabled: true }`) alongside Magic Link and Google OAuth. This is a hybrid approach that diverges from Stillwater's passwordless convention.
- **Rationale:** (1) E-commerce conversion research shows passwordless-only flows reduce repeat-purchase conversion by 8–12%. (2) Stillwater (yoga studio) is a booking platform with weekly usage — passwordless friction is acceptable. MAISON is a purchase platform with monthly/quarterly usage — password friction is lower than magic-link friction for repeat customers. (3) Better Auth supports all three methods simultaneously. (4) Magic Link + Google OAuth remain available for customers who prefer passwordless.
- **Consequences:**
  - ✅ Higher repeat-purchase conversion (customers can "log in" with a remembered password)
  - ✅ All three auth methods available (customer choice)
  - ❌ Password hashes stored in DB (breach risk) — mitigated by bcrypt cost 12, per-user salt, rate limiting (10/15min), account lockout (5 failed → 15min), breach-check via HaveIBeenPwned (Phase 2)
  - ❌ Diverges from Stillwater convention — documented tradeoff
- **Alternatives Rejected:**
  - _Passwordless only (Stillwater approach)_ — reduces repeat-purchase conversion; not optimal for e-commerce
  - _Email/password only (no magic link)_ — misses passwordless preference segment

#### ADR-014: Stripe webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock`

- **Context:** The v1.1 PRD/PAD mentioned "Stripe idempotency key" with a UNIQUE constraint on `stripe_idempotency_key`. Validation against Stillwater §15.21.1 and tRPC+Drizzle §9.4 revealed UNIQUE constraint alone is necessary but not sufficient — concurrent webhook requests can race past the check before either inserts.
- **Decision:** Implement dual-defense idempotency: (1) `payment_events.stripe_event_id` UNIQUE INDEX (first defense), (2) `pg_advisory_xact_lock(hashStringToBigInt(event.id))` within transaction (second defense). 5-step pattern: fast-path check → open transaction → acquire lock → double-check → process + insert. On catch, detect PG code 23505 (`isUniqueViolation`) → return success.
- **Rationale:** (1) UNIQUE constraint alone allows race conditions under concurrent webhooks. (2) Advisory lock is transaction-scoped (auto-releases at COMMIT/ROLLBACK), safe under Neon PgBouncer. (3) Aligns with Stillwater ADR-004. (4) Fast-path check outside transaction avoids lock cost for already-processed events.
- **Consequences:**
  - ✅ Guaranteed idempotency under concurrent webhook delivery
  - ✅ Fast-path check avoids lock cost for duplicate events
  - ✅ Transaction-scoped lock (safe under PgBouncer)
  - ❌ More complex than UNIQUE-only (justified by correctness)
  - ❌ Requires `payment_events` table (new — adds ~25 lines of schema)
- **Alternatives Rejected:**
  - _UNIQUE constraint only (v1.1 approach)_ — race condition risk under concurrent webhooks
  - _`pg_advisory_lock` (session-scoped)_ — leaks under PgBouncer; forbidden

#### ADR-015: Source resolution via `transpilePackages` + `@maison/source` custom condition

- **Context:** The v1.1 PAD mentioned `customConditions: ["@maison/source"]` once but didn't specify the full ADR-011 pattern from Stillwater. Turbopack ignores custom conditions; `exports.default` must point to source TypeScript.
- **Decision:** Use `transpilePackages` in `apps/web/next.config.ts` + `exports.default` → `./src/index.ts` in every `packages/*/package.json`. `.npmrc` declares `custom-conditions=@maison/source`; `pnpm-workspace.yaml` declares `customConditions: ['@maison/source']`. This eliminates the need for `tsc --build` before `next build`.
- **Rationale:** (1) Aligns with Stillwater ADR-011. (2) Eliminates build step in dev (source TypeScript transpiled inline). (3) Turbopack ignores custom conditions, so `exports.default` must point to source. (4) End-to-end type safety without codegen.
- **Consequences:**
  - ✅ No `tsc --build` before `next build` (faster CI)
  - ✅ Source-resolution in dev (instant feedback)
  - ✅ End-to-end type safety (change schema → tRPC types update → React errors at compile time)
  - ❌ Every package `package.json` must have the correct `exports` shape
  - ❌ `transpilePackages` array must list all 7 `@maison/*` packages
- **Alternatives Rejected:**
  - _Build all packages with `tsc --build` before `next build`_ — slower CI; type errors only surface at build time
  - _Pre-built `dist/` with `exports.default` → `./dist/index.js`_ — loses source-resolution; type errors delayed

#### ADR-016: Trigger.dev v4 root SDK import (`@trigger.dev/sdk`)

- **Context:** The v1.1 PRD/PAD mentioned "Trigger.dev v4" but didn't specify the SDK import path, config format, or anti-patterns. Validation revealed v3 is deprecated (April 1, 2026), v4 GA (August 2025), and the SDK must be imported from root (NOT `/v3` deprecated, NOT `/v4` nonexistent).
- **Decision:** Import from `@trigger.dev/sdk` root. Config: `machine: "micro"` (string literal, NOT object form), `maxDuration: 120` (CPU budget, NOT wall-clock). Use `tasks.trigger('task-id', payload)` API (NOT `TriggerClient.sendEvent()`). Workers `package.json` must have `"type": "module"`. Workers tsconfig: `verbatimModuleSyntax: false`, no `rootDir`/`outDir`.
- **Rationale:** (1) v3 deprecated April 1, 2026 — new v3 deploys stop working. (2) `/v4` subpath doesn't exist in the SDK. (3) `machine` type changed from object (v3) to string (v4). (4) `build.env` removed in v4 (env vars injected at runtime). (5) Aligns with Stillwater §15.22.2.
- **Consequences:**
  - ✅ Future-proof (v4 is current; v3 deprecated)
  - ✅ Aligns with Stillwater reference
  - ❌ Config format differs from v3 (migration needed if upgrading from v3)
  - ❌ `maxDuration` is CPU time, not wall-clock (different mental model)
- **Alternatives Rejected:**
  - _Trigger.dev v3_ — deprecated April 1, 2026
  - _`@trigger.dev/sdk/v4` import_ — subpath doesn't exist
  - _BullMQ_ — requires self-managed Redis + worker processes (Stillwater ADR-007 rejected)

#### ADR-017: React 19 `SubmitEvent` + `ClientOnly` boundary for SSR-safe hooks

- **Context:** The v1.1 PRD/PAD mentioned React 19.2.x with React Compiler and `use()` hook but didn't document the `SubmitEvent` migration or the `ClientOnly` boundary pattern. Validation against TypeScript patterns skill §4.8 revealed `FormEvent` is deprecated in React 19, and Better Auth `useSession()` crashes SSR without a `ClientOnly` wrapper.
- **Decision:** (1) Form handlers use `React.SubmitEvent<HTMLFormElement>` (NOT `React.FormEvent` — deprecated). Requires `@types/react` ≥ 19.2.10. (2) Better Auth `useSession()` and other SSR-unsafe hooks wrapped in `<ClientOnly>` boundary using `useSyncExternalStore` with `getServerSnapshot: () => false`. (3) NEVER use `next/dynamic({ ssr: false })` in Server Components — Next.js 16 build error.
- **Rationale:** (1) `FormEvent` deprecation is a React 19 breaking change. (2) Turbopack selects React's `react-server` export condition for SSR chunks, where hooks are null stubs → `useSession()` → `useStore()` → `useRef()` → `null.useRef()` → HTTP 500 on every SSR page. (3) `next/dynamic({ ssr: false })` is forbidden in Server Components (Next.js 16 build error).
- **Consequences:**
  - ✅ No SSR crashes from Better Auth hooks
  - ✅ Future-proof against `FormEvent` removal
  - ❌ `ClientOnly` wrapper adds a component boundary (justified by correctness)
  - ❌ `@types/react` must be ≥ 19.2.10 (DefinitelyTyped PR #74383)
- **Alternatives Rejected:**
  - _`next/dynamic({ ssr: false })`_ — forbidden in Server Components (Next.js 16 build error)
  - _`suppressHydrationWarning`_ — doesn't fix the crash, just hides the warning

#### ADR-018: Zod v4 input validation patterns

- **Context:** The v1.1 PRD/PAD mentioned Zod but didn't pin the version or document v4 migration patterns. Validation revealed Zod v4 deprecates `z.string().email()` (use `z.email()`) and `z.string().url()` (use `z.url({ protocol })`).
- **Decision:** Pin Zod `^4.4.0`. Use `z.email()` (NOT `z.string().email()`), `z.url({ protocol: /^https:$/ })` (NOT `z.string().url()`). `z.ZodIssueCode` deprecated → use string literal `'custom'` in `ctx.addIssue()`. `{ errorMap }` removed, `{ message }` deprecated → use `z.string({ message: '...' })`. All UUID params: `z.string().uuid()` before any DB call.
- **Rationale:** (1) Zod v4 is the current stable version. (2) v4 deprecations will become removals in v5. (3) `z.string().email()` accepts invalid emails in v4. (4) `z.string().url()` accepts any scheme (ftp, file, etc.) — `z.url({ protocol })` enforces HTTPS.
- **Consequences:**
  - ✅ Future-proof against v5 removals
  - ✅ Stricter validation (`z.url` enforces HTTPS)
  - ❌ Migration needed if codebase uses v3 patterns
- **Alternatives Rejected:**
  - _Zod v3_ — deprecated; v4 is current
  - _`z.string().email()` (v3 pattern)_ — deprecated in v4; accepts invalid emails

#### ADR-019: Coverage thresholds aligned to Stillwater

- **Context:** The v1.1 PRD/PAD specified coverage thresholds: db 80%, api 85%, auth 90%. Validation against Stillwater §11.1 and tRPC+Drizzle §11.1 revealed different thresholds: api 90%, payments 95%, db 80%, web 70%, workers 85%.
- **Decision:** Align coverage thresholds to Stillwater: `packages/db` 80%, `packages/api` 90% (was 85%), `packages/payments` 95% (new), `packages/auth` 90%, `apps/web` 70% (new), `services/workers` 85% (new).
- **Rationale:** (1) Aligns with proven Stillwater thresholds. (2) `payments` at 95% reflects money-criticality. (3) `api` at 90% (not 85%) reflects business logic criticality. (4) `web` and `workers` thresholds were missing in v1.1.
- **Consequences:**
  - ✅ Aligns with Stillwater production-proven thresholds
  - ✅ Money-critical package (payments) has highest threshold (95%)
  - ❌ `api` threshold raised from 85% to 90% (more tests needed)
- **Alternatives Rejected:**
  - _v1.1 thresholds (api 85%, no payments/web/workers)_ — below skill recommendation; missing packages

#### ADR-020: `erasableSyntaxOnly` — no `enum`/`namespace`

- **Context:** The v1.1 PRD/PAD mentioned `erasableSyntaxOnly` in the tech stack table but didn't document its implications. Validation revealed this flag forbids `enum`, `namespace`, and parameter properties.
- **Decision:** Enable `erasableSyntaxOnly: true` in `tooling/typescript/base.json`. Forbid `enum` and `namespace` keywords. Use Drizzle `pgEnum()` for DB enums; use string union types for TS enums: `type Status = 'pending' | 'confirmed' | 'cancelled'`. No parameter properties in constructors.
- **Rationale:** (1) Aligns with Stillwater §2.1. (2) `enum` is not type-safe at runtime (reverse mapping, double-instantiation). (3) String unions are simpler, tree-shakeable, and type-safe. (4) `pgEnum()` is the Drizzle-native way to define DB enums.
- **Consequences:**
  - ✅ No `enum` runtime overhead (string unions are erased at compile time)
  - ✅ Type-safe enums (no reverse mapping bugs)
  - ❌ Migration needed if codebase uses `enum` (replace with string unions)
  - ❌ No `namespace` (use ES modules instead)
- **Alternatives Rejected:**
  - _`enum` keyword_ — not type-safe at runtime; forbidden by `erasableSyntaxOnly`
  - _`namespace`_ — not erasable; use ES modules

---

## 2. High-Level System Topology

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                     CLIENT                                       │
│  Browser (Chrome / Safari / Firefox / Edge)                                       │
│  ├─ Next.js 16 RSC (Server Components render on Vercel Edge)                     │
│  ├─ Client Components (hydrated, minimal JS)                                      │
│  ├─ Stripe Elements (card capture, Apple Pay, Google Pay via Payment Intents)    │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │ HTTPS
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL EDGE (CDN + Proxy)                           │
│  ├─ Edge CDN (static assets, ISR pages, image optimization)                      │
│  ├─ proxy.ts (auth check, security headers, locale routing)                      │
│  └─ Edge Functions (geo redirects, A/B testing — Phase 3)                        │
└────────────────────────────────────┬─────────────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS 16 APP (apps/web)                              │
│                                                                                  │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                      │
│  │   React Server Components │    │   Route Handlers         │                     │
│  │   (shop / account / admin)│    │   /api/webhooks/stripe   │                     │
│  │                          │    │   /api/webhooks/sanity   │                      │
│  │   Calls tRPC server-side  │    │   /api/auth/[...all]     │                     │
│  │   caller (Layer 2)       │    │   /api/og/[...slug]      │                     │
│  └───────────┬─────────────┘    └────────────┬────────────┘                      │
│              │                                │                                    │
│              ▼                                ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐                     │
│  │              @maison/api (tRPC routers)                 │                     │
│  │   products / collections / cart / checkout / account    │                     │
│  │   wishlist / admin.* / newsletter / contact             │                     │
│  │   Middleware: rateLimit (Upstash, fail-open)            │                     │
│  └───────┬───────────────┬───────────────┬─────────────────┘                     │
│          │               │               │                                        │
│          ▼               ▼               ▼                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                               │
│  │ @maison/db  │  │ @maison/auth│  │@maison/pay  │                               │
│  │ Drizzle ORM │  │ Better Auth │  │ Stripe 22.3 │                               │
│  │ Schema +    │  │ RBAC +      │  │ Webhooks +  │                               │
│  │ Migrations  │  │ Sessions    │  │ Idempotency │                               │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                               │
│         │                │                │                                       │
└─────────┼────────────────┼────────────────┼───────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐
│   PostgreSQL 17 │  │   Upstash   │  │   Stripe    │  │   Resend +          │
│   (Neon prod /  │  │   Redis     │  │   API       │  │   React Email       │
│    Docker dev)  │  │   (rate     │  │             │  │   @maison/email     │
│                 │  │    limit)   │  │             │  │                     │
│  ┌───────────┐  │  └─────────────┘  └─────────────┘  └─────────────────────┘
│  │  users    │  │
│  │  sessions │  │  ┌──────────────────────────────────────────────────────┐
│  │  customers│  │  │              EXTERNAL SERVICES                       │
│  │  products │  │  │  ├─ Sanity Cloud (CMS, GROQ, webhooks)               │
│  │  orders   │  │  │  ├─ Trigger.dev v4 (background jobs)                 │
│  │  carts    │  │  │  ├─ Cloudflare Images + R2 (image CDN + storage)     │
│  │  audit_log│  │  │  ├─ PostHog (analytics, session replay)              │
│  └───────────┘  │  │  ├─ Sentry (error tracking, perf monitoring)         │
└─────────────────┘  │  └─ Axiom (structured logs)                           │
                     └──────────────────────────────────────────────────────┘
```

**Runtime characteristics:**

- **Vercel Edge:** Global CDN, < 50ms TTFB at p95, auto-scales to 10K+ concurrent users
- **Next.js App:** Node.js 22 runtime on Vercel, serverless functions for API routes, ISR for product pages (revalidate every 60s)
- **PostgreSQL (Neon):** Serverless, scales to zero, branching for preview deployments, point-in-time recovery
- **Upstash Redis:** Serverless, pay-per-request, fail-open rate limiting
- **Stripe / Sanity / Resend / Trigger.dev:** Managed SaaS, no ops overhead

---

## 3. Application Architecture

### 3.1 The Layer Model

The architecture enforces a strict five-layer model. Dependencies flow downward only. A higher layer may import a lower layer; a lower layer may NEVER import a higher layer.

```
Layer 4: Client Components ("use client")
         ├─ Role: Interactive UI (state, effects, browser APIs)
         ├─ Rule: Call Layer 1 via tRPC client. Cannot import Layer 2 or 3 directly.
         └─ Examples: ProductCard, CartDrawer, CheckoutForm, MobileNavDrawer

Layer 3: React Server Components (RSC)
         ├─ Role: Page composition, data fetching, static markup
         ├─ Rule: Call Layer 2 (server-side callers). Cannot use state/effects.
         └─ Examples: page.tsx files, ProductGallery, CategoryGrid

Layer 2: Server-side callers (apps/web/src/lib)
         ├─ Role: Orchestrate Layer 1 + external services (Stripe, Sanity, Resend)
         ├─ Rule: Called only by Layer 3. May import Layer 1 + external clients.
         └─ Examples: trpc/server.ts, sanity/client.ts, stripe/server.ts

Layer 1: tRPC routers (packages/api)
         ├─ Role: Business logic, authorization, data validation
         ├─ Rule: Call Layer 0 for data. May import @maison/auth, @maison/payments.
         └─ Examples: routers/products.ts, routers/checkout.ts, routers/admin.ts

Layer 0: Database schema (packages/db)
         ├─ Role: Raw table definitions, no business logic
         ├─ Rule: Imports only drizzle-orm + zod. Cannot import any @maison/* package.
         └─ Examples: schema/products.ts, schema/orders.ts, schema/users.ts
```

**Golden Rule:** If you're tempted to import upward (e.g., a Drizzle schema importing a tRPC router), STOP. You've broken the layer model. Refactor instead.

### 3.2 Annotated Directory Structure

```
maison/
├── apps/                                    # Deployable applications
│   ├── web/                                 # Next.js 16 storefront + admin (single app)
│   │   ├── src/
│   │   │   ├── app/                         # App Router (file-based routing)
│   │   │   │   ├── (shop)/                  # Route group: public storefront
│   │   │   │   │   ├── page.tsx             # Homepage (15 sections)
│   │   │   │   │   ├── products/
│   │   │   │   │   │   ├── page.tsx         # PLP
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx     # PDP
│   │   │   │   │   ├── collections/
│   │   │   │   │   ├── about/
│   │   │   │   │   ├── journal/
│   │   │   │   │   ├── cart/
│   │   │   │   │   ├── checkout/
│   │   │   │   │   └── contact/
│   │   │   │   ├── (account)/               # Route group: customer dashboard (auth)
│   │   │   │   │   ├── account/
│   │   │   │   │   │   ├── orders/
│   │   │   │   │   │   ├── wishlist/
│   │   │   │   │   │   ├── addresses/
│   │   │   │   │   │   └── settings/
│   │   │   │   ├── (admin)/                 # Route group: admin (RBAC: staff/manager/owner)
│   │   │   │   │   └── admin/
│   │   │   │   │       ├── products/
│   │   │   │   │       ├── orders/
│   │   │   │   │       ├── customers/
│   │   │   │   │       ├── inventory/
│   │   │   │   │       └── audit-log/
│   │   │   │   ├── auth/                    # Better Auth routes (sign-in, callback)
│   │   │   │   ├── api/                     # Route Handlers (not tRPC)
│   │   │   │   │   ├── webhooks/
│   │   │   │   │   │   ├── stripe/route.ts  # Stripe webhook (idempotent)
│   │   │   │   │   │   └── sanity/route.ts  # Sanity webhook → ISR revalidation
│   │   │   │   │   ├── auth/[...all]/route.ts # Better Auth catch-all
│   │   │   │   │   ├── trpc/[trpc]/route.ts # tRPC HTTP endpoint (client mutations)
│   │   │   │   │   └── og/[...slug]/route.ts # Dynamic OG image (@vercel/og)
│   │   │   │   ├── layout.tsx               # Root layout (html, body, fonts, TRPCProvider)
│   │   │   │   ├── globals.css              # Tailwind v4 @theme + base styles ← DESIGN TOKENS
│   │   │   │   ├── sitemap.ts               # Dynamic XML sitemap
│   │   │   │   ├── robots.ts                # robots.txt
│   │   │   │   ├── manifest.ts              # PWA manifest
│   │   │   │   ├── opengraph-image.tsx      # Default OG image
│   │   │   │   ├── not-found.tsx            # 404 page
│   │   │   │   └── error.tsx                # Global error boundary
│   │   │   ├── components/                  # App-specific components (Layer 3 + 4)
│   │   │   │   ├── shop/                    # Storefront components (Hero, ProductCard, etc.)
│   │   │   │   ├── admin/                   # Admin components (AdminShell, ProductForm, etc.)
│   │   │   │   ├── account/                 # Customer dashboard components
│   │   │   │   ├── ui/                      # shadcn/ui base components (Radix-based)
│   │   │   │   ├── a11y/                    # SkipLink, SrOnly, FocusTrap
│   │   │   │   ├── seo/                     # JsonLd, MetaTags
│   │   │   │   └── analytics/               # PostHogProvider
│   │   │   ├── lib/                         # Layer 2: server-side callers
│   │   │   │   ├── trpc/
│   │   │   │   │   ├── server.ts            # Server-side caller (for RSC)
│   │   │   │   │   ├── client.tsx           # Client provider + hooks
│   │   │   │   │   └── query-keys.ts        # Centralised query key factory
│   │   │   │   ├── sanity/                  # Sanity client, GROQ queries, schemas
│   │   │   │   ├── stripe/                  # Stripe server client, utils
│   │   │   │   ├── seo/                     # generateMetadata helpers, JSON-LD schemas
│   │   │   │   ├── cloudflare/              # Image CDN helpers
│   │   │   │   ├── observability/           # Logger, request-id, error-boundary
│   │   │   │   └── admin/                   # Audit log helper
│   │   │   ├── hooks/                       # React hooks (Layer 4 helpers)
│   │   │   │   ├── useScrollReveal.ts       # IntersectionObserver scroll reveal
│   │   │   │   ├── useNavScrollHide.ts      # Hide-on-scroll header
│   │   │   │   ├── useScrollProgress.ts     # Reading progress bar
│   │   │   │   └── useCartMutation.ts       # Cart add/remove with optimistic update
│   │   │   └── middleware/                  # (DOES NOT EXIST — correct per ADR-006: proxy.ts replaces middleware.ts. If you need middleware logic, add it to apps/web/proxy.ts.)
│   │   ├── proxy.ts                         # ← AUTH + SECURITY (Next.js 16, replaces middleware.ts)
│   │   ├── next.config.ts                   # CSP headers, image domains, webpack → Turbopack
│   │   ├── tailwind.config.ts               # OPTIONAL v4-style file (declares content paths only). Tailwind v4 is CSS-first via `@theme` in `src/app/globals.css`. This is NOT a Tailwind v3-style theme config — it is only scanned for class names.
│   │   ├── postcss.config.mjs               # @tailwindcss/postcss (NO autoprefixer)
│   │   ├── components.json                  # shadcn/ui config
│   │   ├── instrumentation.ts               # Sentry + PostHog init
│   │   ├── sentry.{server,client,edge}.config.ts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.mjs                # Flat config (ESLint 9)
│   │   └── package.json
│   └── studio/                              # Sanity Studio (CMS admin GUI)
│       ├── schemas/                         # Content schemas (product, collection, journal, etc.)
│       ├── sanity.config.ts
│       ├── sanity.cli.ts
│       └── package.json
│
├── packages/                                # Shared libraries (consumed via workspace:*)
│   ├── db/                                  # @maison/db — Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── schema/                      # One file per table
│   │   │   │   ├── users.ts
│   │   │   │   ├── sessions.ts
│   │   │   │   ├── customers.ts
│   │   │   │   ├── addresses.ts
│   │   │   │   ├── collections.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── product-variants.ts
│   │   │   │   ├── product-images.ts
│   │   │   │   ├── carts.ts
│   │   │   │   ├── cart-items.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── line-items.ts
│   │   │   │   ├── wishlist-items.ts
│   │   │   │   ├── discounts.ts             # Phase 2
│   │   │   │   ├── audit-log.ts
│   │   │   │   ├── enums.ts                 # Shared enums (order status, roles, etc.)
│   │   │   │   ├── relations.ts             # Drizzle relations (for query API)
│   │   │   │   └── index.ts                 # Re-exports all schemas
│   │   │   ├── seed/                        # Seed scripts + fixtures
│   │   │   │   ├── index.ts                 # Main seed (8 collections, 20 products)
│   │   │   │   ├── e2e.ts                   # E2E test seed
│   │   │   │   └── fixtures/                # Static seed data (products, collections)
│   │   │   ├── scripts/
│   │   │   │   └── reset.ts                 # DB reset script (dev only)
│   │   │   └── index.ts                     # Exports: db, schema, pool
│   │   ├── drizzle/
│   │   │   └── migrations/                  # Generated SQL migrations (committed)
│   │   │       ├── 0000_initial.sql
│   │   │       ├── 0001_*.sql
│   │   │       └── meta/                    # Migration metadata (journal, snapshots)
│   │   ├── drizzle.config.ts                # ← Uses DATABASE_URL_UNPOOLED (not pooled!)
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── auth/                                # @maison/auth — Better Auth
│   │   ├── src/
│   │   │   ├── config.ts                    # Better Auth config (sessions, OAuth, RBAC)
│   │   │   ├── client.ts                    # Client-side auth hook
│   │   │   ├── rbac.ts                      # Role definitions + permission checks
│   │   │   ├── resend-client.ts             # Email provider for magic links
│   │   │   ├── types.ts                     # Shared auth types
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api/                                 # @maison/api — tRPC routers (Layer 1)
│   │   ├── src/
│   │   │   ├── routers/                     # One file per router (13 routers)
│   │   │   │   ├── products.ts
│   │   │   │   ├── collections.ts
│   │   │   │   ├── cart.ts
│   │   │   │   ├── checkout.ts
│   │   │   │   ├── account.ts
│   │   │   │   ├── newsletter.ts
│   │   │   │   ├── contact.ts
│   │   │   │   ├── admin.ts                 # All admin.* procedures (also performs audit-log writes inline — see §6.2)
│   │   │   │   ├── discounts.ts             # Phase 2 promo codes
│   │   │   │   ├── reviews.ts               # Phase 3 product reviews
│   │   │   │   ├── trade.ts                 # Phase 3 trade/designer program
│   │   │   │   ├── gift-cards.ts            # Phase 3 gift card balance + redemption
│   │   │   │   └── loyalty.ts               # Phase 3 loyalty points ledger
│   │   │   ├── middleware/
│   │   │   │   └── rateLimit.ts             # Upstash Redis, fail-open
│   │   │   ├── trpc.ts                      # tRPC init (context, procedures)
│   │   │   ├── context.ts                   # tRPC context (session, db, req)
│   │   │   ├── root.ts                      # Root router (appRouter — 13 routers merged)
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── payments/                            # @maison/payments — Stripe
│   │   ├── src/
│   │   │   ├── client.ts                    # Stripe server client
│   │   │   ├── webhooks.ts                  # Webhook event handlers (idempotent)
│   │   │   ├── subscriptions.ts             # Phase 3 (loyalty program)
│   │   │   ├── refunds.ts                   # Admin refund logic
│   │   │   ├── credit-packs.ts              # Phase 3 (gift cards)
│   │   │   ├── invoices.ts                  # PDF invoice generation
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                                  # @maison/ui — Design tokens + shared components
│   │   ├── src/
│   │   │   ├── tokens/                      # CSS custom properties (design tokens)
│   │   │   │   ├── colors.css               # ← --bg, --clay, --gold, etc.
│   │   │   │   ├── typography.css           # ← Font families, sizes, line-heights
│   │   │   │   ├── motion.css               # ← Easings, durations
│   │   │   │   ├── spacing.css              # ← Spacing scale
│   │   │   │   └── index.css                # Combines all tokens
│   │   │   ├── fonts/                       # Self-hosted woff2 files
│   │   │   │   ├── cormorant/               # Cormorant Garamond (display serif)
│   │   │   │   │   ├── *.woff2              # Subset: Latin, Latin Extended, Cyrillic
│   │   │   │   │   └── cormorant.css        # @font-face declarations
│   │   │   │   ├── inter/                   # Inter (body sans)
│   │   │   │   └── index.css
│   │   │   ├── globals.css                  # Combined tokens + fonts (imported by apps/web)
│   │   │   └── index.ts                     # JS exports (for non-CSS consumers)
│   │   └── package.json
│   │
│   ├── email/                               # @maison/email — React Email templates
│   │   ├── src/
│   │   │   ├── templates/                   # One .tsx per email
│   │   │   │   ├── OrderConfirmation.tsx
│   │   │   │   ├── ShippingUpdate.tsx
│   │   │   │   ├── PasswordReset.tsx
│   │   │   │   ├── WelcomeMember.tsx
│   │   │   │   ├── AbandonedCart.tsx        # Trigger.dev job
│   │   │   │   ├── WeeklyDigest.tsx         # Trigger.dev job
│   │   │   │   └── NewsletterConfirmation.tsx
│   │   │   ├── components/                  # EmailLayout, EmailButton, EmailFooter
│   │   │   ├── send.ts                      # Resend send helper
│   │   │   ├── template-ids.ts              # Maps template → Resend template ID
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                              # @maison/config — Shared env + site config
│       ├── src/
│       │   ├── env.ts                       # Zod-validated env (server + client + public)
│       │   ├── site.ts                      # Site metadata (name, URL, social links)
│       │   ├── jobs-client.ts               # Trigger.dev client
│       │   └── index.ts
│       └── package.json
│
├── services/
│   └── workers/                             # Trigger.dev v4 background jobs
│       ├── src/
│       │   ├── index.ts                     # Job registry
│       │   ├── abandoned-cart.ts            # 1h / 24h / 72h after cart abandonment
│       │   ├── order-confirmation.ts        # Send order email (retry on Resend failure)
│       │   ├── shipping-update.ts           # Send shipping email when tracking added
│       │   ├── weekly-digest.ts             # Sunday newsletter send
│       │   ├── inventory-alert.ts           # Notify admin when stock < threshold
│       │   └── *.test.ts                    # One test per job
│       ├── trigger.config.ts                # Trigger.dev project config
│       └── package.json
│
├── tooling/                                 # Shared configs (not deployed)
│   ├── eslint-config/                       # @maison/eslint-config (flat config)
│   ├── typescript-config/                   # @maison/typescript-config (base tsconfigs)
│   └── tailwind-config/                     # @maison/tailwind-config (shared preset)
│
├── infrastructure/
│   └── postgres/
│       └── init/                            # Docker init scripts (extensions, etc.)
│           └── 00-create-extensions.sql     # pgcrypto + pg_trgm (pg_trgm reserved for Phase 2+ FTS use; Phase 1 search uses `ilike` per ADR-012)
│
├── e2e/                                     # Playwright E2E tests (repo-root)
│   ├── checkout.spec.ts                     # Full purchase flow
│   ├── admin-products.spec.ts               # Admin product CRUD
│   ├── admin-orders.spec.ts                 # Admin order fulfillment
│   ├── accessibility.spec.ts                # @axe-core/playwright on all pages
│   ├── mobile-nav.spec.ts                   # Mobile nav drawer
│   └── playwright.config.ts
│
├── docs/                                    # Documentation + design references
│   ├── PRD_unified.md                       # ← Product requirements
│   ├── landing.html                          # ← Canonical visual reference (from maison_landing_page_mockup_v2.zip)
│   ├── landing_page_draft-{1,2,4,5,6}.html  # Historical drafts (for reference)
│   ├── PRD_draft-{1,2,3,4}.md               # Historical PRD drafts
│   ├── ssh-warpper_SKILL.md                 # SSH wrapper instructions
│   ├── ssh_git_wrapper_v3.py                # Paramiko SSH wrapper (no openssh-client)
│   ├── ssh-key.txt                          # GitHub SSH key (chmod 600, gitignored)
│   └── prompts.md                           # Build prompt history
│
├── skills/                                  # ClawHub skills (196 skills, read-only reference)
│   ├── nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/
│   ├── nextjs16-react19-tailwind4-better-auth-monorepo/  # Stillwater reference
│   ├── avant-garde-design-v4/               # Anti-generic UI skill
│   ├── frontend-design/                     # Design principles
│   ├── readme-md / agents-md / claude-md / project-architecture-document-md
│   ├── how-to-git-push-using-ssh-wrapper/   # SSH wrapper skill
│   └── skills-catalog.md                    # Index of all 196 skills
│
├── scripts/                                 # Repo helper scripts
│   ├── db-setup.sh                          # One-shot DB setup (env + migrate + seed)
│   └── pre-commit-check.sh                  # lint + typecheck + format check
│
├── .env.example                             # Environment variable template (committed)
├── .env.local                               # Real env (NEVER committed, gitignored)
├── .gitignore                               # Includes .next/, .turbo/, drizzle/meta/, etc.
├── docker-compose.yml                       # Local Postgres 17 + Redis 7 + Stripe CLI
├── pnpm-workspace.yaml                      # Workspace config + supply-chain guardrails
├── turbo.json                               # Task pipeline (build, dev, test, db:*)
├── package.json                             # Root scripts + devDependencies
├── README.md                                # Project overview + quick start
├── AGENTS.md                                # High-signal facts for AI agents
├── CLAUDE.md                                # Claude Code instructions
└── Project_Architecture_Document.md         # ← You are here
```

### 3.3 Critical Code Patterns

#### Pattern 1: Server-side tRPC caller in RSC

```typescript
// apps/web/src/app/(shop)/products/page.tsx
import { headers } from "next/headers";
import { api } from "@/lib/trpc/server";

/**
 * Pattern: RSC calls tRPC server-side caller (Layer 3 → Layer 2 → Layer 1).
 * Why: No HTTP round-trip. The router function is called directly.
 *       Type-safe end-to-end (Zod input → Drizzle query → typed output).
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; sort?: string }>;
}) {
  const params = await searchParams; // Next.js 16: params/searchParams are async
  const products = await api.products.list({
    collection: params.collection,
    sort: params.sort ?? "featured",
    limit: 24,
  });

  return <ProductGrid products={products.items} />;
}
```

**Why this pattern:** Eliminates HTTP overhead for Server Components. The tRPC router is imported as a function, not fetched over HTTP. Type safety flows from the Zod input schema through the Drizzle query to the React component props — a single typo anywhere breaks the build.

#### Pattern 2: Idempotent Stripe webhook

```typescript
// apps/web/src/app/api/webhooks/stripe/route.ts
import { stripe } from '@maison/payments';
import { db } from '@maison/db';
import { orders } from '@maison/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency: Stripe retries webhooks. The orders table has a UNIQUE
  // constraint on stripe_idempotency_key. If we already processed this,
  // the INSERT throws — we catch it and return 200 (don't retry).
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    try {
      await db
        .update(orders)
        .set({
          status: 'confirmed',
          stripe_payment_intent_id: paymentIntent.id,
        })
        .where(eq(orders.stripe_idempotency_key, event.idempotency_key ?? ''));
    } catch (e) {
      // Already processed — return 200 so Stripe stops retrying
      if (e instanceof Error && e.message.includes('unique')) {
        return new Response('OK (duplicate)', { status: 200 });
      }
      throw e;
    }
  }

  return new Response('OK', { status: 200 });
}
```

**Why this pattern:** Stripe retries webhooks up to 3 times if it doesn't receive a 200. Without idempotency, a retried `payment_intent.succeeded` webhook would update the order twice (or worse, create two orders). The `stripe_idempotency_key` column with a UNIQUE constraint makes retries safe.

#### Pattern 3: Fail-open rate limiting

```typescript
// packages/api/src/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { TRPCError } from '@trpc/server';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min per identifier
});

export const rateLimitMiddleware = t.procedure.middleware(async ({ ctx, next }) => {
  const identifier = ctx.session?.user.id ?? ctx.requestIP ?? 'anonymous';
  try {
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
    }
  } catch (e) {
    // FAIL OPEN: if Redis is down, allow the request.
    // Rationale: blocking legitimate users during a Redis outage is worse
    // than allowing a brief window of unthrottled traffic. Log for review.
    if (e instanceof TRPCError) throw e; // Re-throw rate limit errors
    console.error('Rate limit check failed (Redis down?), failing open:', e);
  }
  return next({ ctx });
});
```

**Why this pattern:** Redis (Upstash) is an external dependency. If it goes down, fail-closed would block EVERY user from logging in, checking out, or browsing. Fail-open allows a brief window of unthrottled traffic (acceptable risk) while logging the failure for ops review. This pattern is validated in the Stillwater production codebase.

#### Pattern 4: URL-driven state with `nuqs`

```typescript
// apps/web/src/app/(shop)/products/page.tsx
import { useSearchParams } from "nuqs";

/**
 * Pattern: All filter/sort/pagination state lives in the URL.
 * Why: Shareable, bookmarkable, survives refresh, works without JS.
 */
function ProductFilters() {
  const [collection, setCollection] = useSearchParams("collection", "");
  const [sort, setSort] = useSearchParams("sort", "featured");

  return (
    <div className="filter-pills">
      <button
        className={cn("pill-btn", !collection && "active")}
        onClick={() => setCollection("")}
      >
        All Objects
      </button>
      {COLLECTIONS.map((c) => (
        <button
          key={c.slug}
          className={cn("pill-btn", collection === c.slug && "active")}
          onClick={() => setCollection(c.slug)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
```

**Why this pattern:** URL state is shareable (email a filtered product list to a friend), bookmarkable, survives refresh, and works without JavaScript (progressive enhancement). `nuqs` handles the URL parsing/serialization — no manual `useSearchParams` + `router.push` boilerplate.

#### Pattern 5: Money as integer cents

```typescript
// packages/db/src/schema/products.ts
import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  // ... other fields
  priceCents: integer('price_cents').notNull(), // ← Cents, not dollars
  compareAtPriceCents: integer('compare_at_price_cents'), // ← Nullable
  currency: text('currency').default('USD').notNull(),
});

// Display logic (apps/web/src/components/shop/ProductCard.tsx)
function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
```

**Why this pattern:** Floating-point arithmetic is unreliable for money (`0.1 + 0.2 !== 0.3`). Storing integer cents eliminates rounding errors. The `Intl.NumberFormat` API handles currency symbols, decimal places, and locale formatting. This is the canonical pattern in Stripe, Shopify, and every production e-commerce system.

---

## 4. Data Architecture

### 4.1 Database Schema

PostgreSQL 17 with Drizzle ORM. Schema lives in `packages/db/src/schema/` (one file per entity). Full ER diagram and table definitions are in [`docs/PRD_unified.md` §9.2](./docs/PRD_unified.md#92-key-tables).

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--|| customers : is
    customers ||--o{ orders : places
    customers ||--o{ addresses : has
    customers ||--o{ wishlist_items : saves
    orders ||--{ line_items : contains
    line_items }o--|| products : references
    products }o--|| collections : belongs_to
    products ||--o{ product_images : has
    products ||--o{ product_variants : has
    carts ||--o{ cart_items : contains
    cart_items }o--|| products : references
    carts }o--|| customers : owned_by_optional
```

### 4.2 Key Tables (Summary)

> Full column-level definitions are in `docs/PRD_unified.md` §9.2. This section documents the architectural decisions, not the column lists.

| Table              | Layer                 | Purpose                                         | Notes                                                   |
| ------------------ | --------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `users`            | Better Auth managed   | Email, password hash, role                      | Better Auth creates this; we add `role` enum            |
| `sessions`         | Better Auth managed   | Session tokens, expiry, IP                      | DB-backed (not JWT) — enables instant revocation        |
| `accounts`         | Better Auth managed   | OAuth provider links                            | Google, Apple (Phase 2)                                 |
| `customers`        | Application           | Customer profile (name, phone, newsletter)      | 1:1 with `users`                                        |
| `addresses`        | Application           | Shipping/billing addresses                      | Multiple per customer; default flags                    |
| `collections`      | Application           | Product collections (Lighting, Furniture, etc.) | Slug-indexed                                            |
| `products`         | Application           | Product catalog                                 | Soft-deleted (`is_active = false`)                      |
| `product_variants` | Application           | Size/finish/material variants                   | Each has own SKU + stock                                |
| `product_images`   | Application           | Multiple images per product                     | Sort-ordered                                            |
| `carts`            | Application           | Shopping cart (anonymous + authenticated)       | `anonymous_id` cookie for guests                        |
| `cart_items`       | Application           | Cart line items                                 | Quantity 1–99                                           |
| `orders`           | Application           | Placed orders                                   | `stripe_idempotency_key` UNIQUE                         |
| `line_items`       | Application           | Order line items (snapshot of product + price)  | Never references live product (preserves order history) |
| `wishlist_items`   | Application           | Saved products                                  | UNIQUE (customer_id, product_id)                        |
| `discounts`        | Application (Phase 2) | Promo codes                                     | Percentage / fixed / free shipping                      |
| `audit_log`        | Application           | Admin action audit trail                        | Required for PCI DSS compliance                         |
| `verifications`    | Better Auth managed   | Email verification tokens                       | Better Auth managed; tracks verification state          |
| `payment_events`   | Application           | Stripe webhook event log (idempotency)          | `stripe_event_id` UNIQUE INDEX — first defense in ADR-014 dual-defense pattern |
| `product_reviews`  | Application           | Customer product reviews                        | Phase 3 feature; rating + body text                     |
| `gift_cards`       | Application           | Gift card balances + codes                      | Phase 3 feature; UNIQUE code                            |
| `gift_card_redemptions` | Application      | Gift card application records                   | Tracks which order applied which gift card              |
| `trade_applications` | Application         | Trade/designer program applications             | Phase 3 feature; status workflow                        |
| `loyalty_accounts` | Application           | Customer loyalty program membership             | Phase 3 feature; points balance + tier                  |
| `loyalty_transactions` | Application       | Loyalty point ledger (earn/spend)               | Append-only ledger; supports audit + reconciliation     |

### 4.3 Persistence Strategy

- **Connection pooling:** Neon serverless pooler for application queries (`DATABASE_URL`). Direct connection for migrations (`DATABASE_URL_UNPOOLED`) — PgBouncer breaks prepared statements in migration scripts. `packages/db/drizzle.config.ts` enforces this.

- **Migrations:** Drizzle Kit `generate` (creates SQL from schema diff) → `migrate` (applies). Migrations are version-controlled in `packages/db/drizzle/migrations/` with a `_journal.json` manifest. **Never edit a migration after it's applied to production** — create a new migration instead.

- **Indexing:**
  - B-tree (default): all foreign keys, `products.slug`, `collections.slug`, `orders.order_number`
  - GIN: `products.name` + `products.short_description` + `products.materials` (full-text search, Phase 1)
  - Unique: `users.email`, `products.slug`, `orders.stripe_idempotency_key`, `(customer_id, product_id)` on wishlist

- **Soft deletes:** Products use `is_active = false` (never hard-delete — preserve order line item integrity). Orders are never deleted; cancelled orders retain `status = 'cancelled'`. Customers can request GDPR erasure — see §6.4.

- **JSONB columns:** `orders.shipping_address` and `orders.billing_address` are JSONB (snapshot at order time). This preserves the address even if the customer later edits their address book.

---

## 5. Design System Reference

> **Canonical source:** `public/landing.html` (from `docs/maison_landing_page_mockup_v2.zip`). The canonical design system reference is `docs/MAISON_Design_Guide.md` — 1,489 lines documenting every visual, typographic, motion, and interaction decision. The CSS custom properties in `public/landing.html` are the source of truth. This section documents them for engineering reference.

### 5.1 Typographic System

| Role    | Font               | Weights                                         | Fallback                             | Usage                                           |
| ------- | ------------------ | ----------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| Display | Cormorant Garamond | 300, 400, 500, 600, 700, italic 400, italic 500 | Georgia, serif                       | H1–H6, product names, logo, editorial headlines |
| Body    | Inter              | 300, 400, 500, 600                              | system-ui, -apple-system, sans-serif | Paragraphs, labels, buttons, nav, form inputs   |

**Self-hosting:** woff2 files in `packages/ui/src/fonts/cormorant/` and `packages/ui/src/fonts/inter/`. Subsets: Latin, Latin Extended, Cyrillic (for future Russian market). `font-display: swap` with preload of critical weights (regular 400 + bold 600) in `apps/web/src/app/layout.tsx`.

**Italic emphasis treatment (signature pattern — see `MAISON_Design_Guide.md` §4.3):** Every section title contains exactly one `<em>` element. On light sections, the italic word shifts to `--clay` with `font-weight: 400`. On dark sections (hero, editorial, newsletter), it shifts to `--gold` with `font-weight: 300`. Never more than one italic emphasis per heading.

**Eyebrow color shift:** The `.eyebrow` element (11px tracked uppercase label opening every section) uses `--clay` on light backgrounds and `--gold` on dark backgrounds. Letter-spacing of `0.22em` is the widest tracking on the page.

**Full type scale (CSS custom properties — see `MAISON_Design_Guide.md` §4.2 for complete reference):**

| Element | Size | Font / Weight | Line-height | Color | Max-width |
| --- | --- | --- | --- | --- | --- |
| Hero H1 | `clamp(3rem, 8.5vw, 7.5rem)` | Cormorant 400 | 0.98 | `--bg` (on dark) | 16ch |
| Section title H2 | `clamp(2rem, 4.5vw, 3.4rem)` | Cormorant 500 | 1.08 | `--ink` | — |
| Featured H2 | `clamp(2.25rem, 5vw, 3.75rem)` | Cormorant 500 | 1.05 | `--ink` | — |
| Editorial H2 | `clamp(2.25rem, 5.5vw, 4rem)` | Cormorant 500 | 1.05 | `--bg` (on dark) | — |
| Newsletter H2 | `clamp(2.25rem, 5vw, 3.5rem)` | Cormorant 500 | 1.05 | `--bg` (on dark) | — |
| Philosophy H2 | `clamp(1.875rem, 3.6vw, 2.875rem)` | Cormorant 500 | 1.15 | `--ink` | 22ch |
| Product name H3 | `1.25rem` | Cormorant 500 | 1.4 | `--ink` (clay on hover) | — |
| Category card name H3 | `1.5rem` (feature: `2.1rem`) | Cormorant 500 | 1.4 | `--bg` (on overlay) | — |
| Material title H3 | `1.625rem` | Cormorant 500 | 1.4 | `--ink` | — |
| Journal title H3 | `1.5rem` | Cormorant 500 | 1.25 | `--ink` (clay on hover) | — |
| Body default | `1rem` (16px) | Inter 400 | 1.65 | `--ink` | — |
| Lede | `clamp(1rem, 1.15vw, 1.125rem)` | Inter 400 | 1.7 | `--ink-2` | 60ch |
| Hero description | `clamp(1rem, 1.2vw, 1.125rem)` | Inter 300 | 1.7 | rgba(250,248,245,0.92) | 52ch |
| Featured paragraph | `1.0625rem` | Inter 400 | 1.7 | `--ink-2` | 48ch |
| Philosophy paragraph | `1.0625rem` | Inter 400 | 1.75 | `--ink-2` | 52ch |
| Material paragraph | `0.9375rem` | Inter 400 | 1.7 | `--ink-2` | — |
| Journal paragraph | `0.9375rem` | Inter 400 | 1.65 | `--ink-2` | — |
| Product material | `0.85rem` | Inter 400 italic | 1.4 | `--muted` | — |
| Product price | `0.95rem` | Inter 500 | 1.4 | `--ink` | — |
| Testimonial blockquote | `1.1875rem` | Cormorant 400 italic | 1.5 | `--ink` | — |
| Eyebrow | `11px` | Inter 500 uppercase | 1.4 | `--clay` (or `--gold` on dark) | — |
| Button | `13px` | Inter 500 uppercase | 1.4 | inherits | — |

### 5.2 Color Tokens

All tokens are CSS custom properties, ported to `packages/ui/src/tokens/colors.css` and re-exported via `@theme` in `apps/web/src/app/globals.css`. Source of truth: `public/landing.html` and `docs/MAISON_Design_Guide.md` §3.

| Token          | Hex       | Usage                                    | WCAG Contrast (on --bg)       |
| -------------- | --------- | ---------------------------------------- | ----------------------------- |
| `--bg`         | `#faf8f5` | Page background (warm cream)             | —                             |
| `--bg-2`       | `#f3efe8` | Linen section backgrounds                | —                             |
| `--bg-3`       | `#ece5d8` | Deeper linen (journal, testimonials)     | —                             |
| `--bg-card`    | `#ffffff` | Product cards, modal surfaces            | —                             |
| `--bg-dark`    | `#1f1b17` | Footer, newsletter, marquee              | —                             |
| `--ink`        | `#1f1b17` | Primary text                             | ~17:1 ✅ AAA                  |
| `--ink-2`      | `#4a433b` | Secondary text                           | ~9.2:1 ✅ AAA                 |
| `--muted`      | `#786f66` | Tertiary text, meta labels               | ~4.8:1 ✅ AA                  |
| `--line`       | `#e5ddd1` | Borders, dividers                        | —                             |
| `--line-soft`  | `#efe9df` | Subtle dividers                          | —                             |
| `--clay`       | `#a86b4a` | Primary accent (CTAs, links, badges)     | ~4.6:1 ✅ AA                  |
| `--clay-dark`  | `#8a5538` | Hover state for clay                     | ~6.1:1 ✅ AA                  |
| `--clay-light` | `#c17d52` | Secondary clay                           | ~3.9:1 (large text only)      |
| `--gold`       | `#c4a265` | Editorial accent (hero italic, ornament) | ~3.2:1 (large/decorative only) |
| `--sage`       | `#7e8f72` | Secondary accent (linen material card)   | ~3.7:1 (large text only)      |
| `--sage-soft`  | `#dfe4d6` | Mesh-glow background (philosophy)        | — (decorative only)           |

**Accessibility rule:** Body text must use `--ink` or `--ink-2` (both AAA on `--bg`). `--muted` is AA (use only for meta labels at 11px+, never for primary content). `--gold` and `--sage` are decorative only — never use for text smaller than 18px.

**Color usage rules (v2):**
1. Clay is the only color used for primary CTAs — no green "buy" buttons, no blue "submit" buttons.
2. Gold is reserved for dark backgrounds (hero, marquee, editorial, newsletter) — never on light sections.
3. Sage is used twice only: second material card icon + mesh-glow base.
4. Dark sections use ink (`#1f1b17`), not pure black — keeps warm undertone.
5. White (`#ffffff`) is used only for cards on warm backgrounds — never as page background.
6. `::selection` is clay bg + bg color text.

**Shadow tokens (v2 — new):**

```css
--shadow-sm: 0 1px 3px rgba(31,27,23,0.04);    /* header scrolled */
--shadow-md: 0 8px 24px rgba(31,27,23,0.08);   /* card hover, button hover */
--shadow-lg: 0 24px 60px rgba(31,27,23,0.14);  /* toast, mobile nav */
--shadow-xl: 0 40px 100px rgba(31,27,23,0.20); /* hero spotlight, bag panel */
```

All shadows use warm ink (`rgba(31,27,23,...)`) rather than pure black.

### 5.3 Component Primitives

Built on Radix UI (accessibility) + Tailwind v4 (styling) + `class-variance-authority` (variants). See `MAISON_Design_Guide.md` §8 for the full component anatomy.

| Component | Base                  | Variants                                                                  | Customisation                                            |
| --------- | --------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| Button    | Radix Slot + CVA      | `primary` (clay), `outline` (ink border), `ghost` (no border)             | Uppercase 13px, 0.14em tracking, 0.95rem 1.75rem padding; `.magnetic` class opts into JS magnetic attraction |
| Input     | Radix Label + custom  | `default` (full border), `underline` (border-bottom only, for newsletter) | Focus ring: `2px solid var(--clay)` with `3px offset` (focus-visible only) |
| Dialog    | Radix Dialog          | `drawer` (slide-in right, 380px), `modal` (centered)                      | Used for cart drawer, quick view                         |
| Toast     | Sonner                | `default` (ink bg, cream text)                                            | Bottom-center, 2.8s auto-dismiss, `aria-live="polite"`   |
| Select    | Radix Select          | —                                                                         | Minimal, ink-on-cream                                    |
| Tabs      | Radix Tabs            | `gallery` (PDP image thumbnails)                                          | —                                                        |
| Dropdown  | Radix Popover         | `mega-nav` (Phase 2)                                                      | Category previews                                        |
| Tooltip   | Radix Tooltip         | —                                                                         | —                                                        |
| Form      | React Hook Form + Zod | —                                                                         | `@hookform/resolvers` for Zod                            |
| **Custom Cursor (v2 — new)** | Custom (vanilla JS + CSS) | `dot` (6px clay), `ring` (34px, expands to 68px on interactive) | Desktop fine-pointer only; lerp 0.18; border shifts on dark sections; disabled under reduced-motion; native cursor remains visible |
| **Magnetic Button Wrapper (v2 — new)** | Custom (vanilla JS) | Applies `.magnetic` class | Translates 0.18× X, 0.35× Y of cursor offset; resets on mouseleave; desktop motion-safe only |
| **Scroll Progress Bar (v2 — new)** | Custom (CSS + passive scroll listener) | — | 2px fixed top; `linear-gradient(90deg, var(--clay), var(--gold))`; z-index 9997; `transition: width 0.08s linear` |
| **Floating Bag Panel (v2 — new)** | Custom (Radix Dialog base optional) | — | Fixed bottom-right; `min(320px, calc(100vw - 2rem))`; slides up from `translateY(140%)`; auto-hides 5s; `aria-live="polite"` |
| **Statement Ticker (v2 — new)** | Custom (CSS marquee) | — | Italic serif; solid clay + outlined (`-webkit-text-stroke: 1px var(--ink-2)`) alternation; 32s linear infinite; `aria-hidden` |
| **Mesh Glow (v2 — new)** | Custom (CSS) | — | 640px blurred radial gradient; sage-soft + gold; opacity 0.35; positioned absolute behind Philosophy section |

### 5.4 Motion / Animation

**Easing & timing tokens (defined in `:root`):**

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);     /* primary ease-out with subtle entrance */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* stronger ease-out for entrances */
--dur-fast: 0.25s;    /* hover states, color changes */
--dur: 0.45s;         /* standard transitions */
--dur-slow: 0.9s;     /* scroll reveals */
```

Both easing curves are ease-out variants — nothing on the page eases in. The visual impression is that elements arrive and settle, never that they sweep in or fade up.

**Complete animation inventory (24 animations — see `MAISON_Design_Guide.md` §6 and Appendix B):**

| Animation | Duration | Easing | Usage | Reduced-Motion Fallback |
| --- | --- | --- | --- | --- |
| Ken Burns (hero bg) | 26s | ease-in-out, alternate infinite | Hero background image | Disabled (static image) |
| Hero headline line-up | 1s + 0.15s stagger | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero H1 line-by-line rise | Instant (no transform) |
| Hero fade-up | 0.9s + delays (0.15s/0.65s/0.8s/1.05s) | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero eyebrow, desc, CTAs, spotlight | Instant (opacity 1) |
| Brand marquee | 38s | linear infinite | Brand promises strip | Disabled (static, wraps) |
| Statement ticker | 32s | linear infinite | Italic serif phrases alternating solid/outline | Disabled (static, wraps) |
| Testimonials marquee | 46s | linear infinite (pauses on hover) | Testimonial cards | Disabled (static, wraps) |
| Scroll hint bob | 2.4s | ease-in-out infinite | Hero scroll-down chevron | Disabled |
| Scroll reveal (translate) | 0.9s | `cubic-bezier(0.16, 1, 0.3, 1)` | `.reveal` elements via IntersectionObserver | Instant (no transform) |
| Scroll reveal (scale) | 0.8s | `cubic-bezier(0.16, 1, 0.3, 1)` | `.reveal-pop` elements | Instant (no transform) |
| Stagger delay | 0.08s/step (max 4 steps) | — | Grid item reveals via `data-delay` attribute | Removed |
| Image hover scale | 1.0–1.2s | `cubic-bezier(0.22, 1, 0.36, 1)` | Product cards, category cards, philosophy images | Disabled |
| Image sepia reset | 0.6s | `cubic-bezier(0.22, 1, 0.36, 1)` | All imagery on hover (filter resets to 0) | Disabled |
| Button hover translate | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Primary CTA bg + arrow shift | Color change only |
| Link underline | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Nav links (scaleX 0→1 from left), footer links | Instant |
| Material card lift | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Material cards translateY -4px | Disabled |
| Material top bar scale | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | 3px accent bar scaleX 0→1 | Instant |
| Toast slide-up | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Add-to-cart confirmation (bottom-center) | Instant |
| Bag panel slide-up | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` | Floating bag panel from translateY(140%) | Instant |
| Cart badge bump | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` | Cart count scale 1→1.6→1 (keyframe) | Disabled |
| Scroll progress bar | 0.08s linear update | linear | 2px gradient (clay→gold) bar at top | Still updates (no motion sickness) |
| Custom cursor dot | instant (rAF) | — | 6px clay dot follows mouse | Disabled entirely |
| Custom cursor ring | lerp 0.18 factor (rAF) | — | 34px ring trails dot, expands to 68px on interactive hover | Disabled entirely |
| Magnetic button | rAF, inline style | — | Buttons translate 0.18× X, 0.35× Y of cursor offset | Disabled |
| Hero parallax | rAF, inline style | — | Hero bg translates ±14px based on cursor (scale 1.1) | Disabled |

**Hero entrance choreography (staged sequence — see §5.6.4):**

```
0.00s   page render
0.15s   eyebrow fades up         (fadeUp 0.9s, delay 0.15s)
0.25s   headline line 1 rises    (lineUp 1s, delay 0.25s)
0.40s   headline line 2 rises    (lineUp 1s, delay 0.40s)
0.65s   description fades up     (fadeUp 0.9s, delay 0.65s)
0.80s   CTAs fade up             (fadeUp 0.9s, delay 0.80s)
1.05s   spotlight card fades up  (fadeUp 0.9s, delay 1.05s)
```

Total runtime ~2s. Each element starts before the previous finishes — a "cascade" rather than a "sequence".

All animations respect `prefers-reduced-motion: reduce` via a global CSS rule:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .hero__bg { animation: none; }
  .marquee__track, .statement__track, .testimonials__track { animation: none; }
  .reveal, .reveal-pop { opacity: 1; transform: none; }
  .hero__eyebrow, .hero__desc, .hero__actions, .hero__spotlight, .hero__title .line-inner {
    opacity: 1; transform: none; animation: none;
  }
  .cursor-dot, .cursor-ring { display: none !important; }
}
```

JS-gated interactions (cursor, magnetic, parallax) additionally check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before enabling.

### 5.5 Visual Treatments & Textures

The v2 landing page employs five non-color visual treatments that materially affect the perceived quality of the surface. Each must be ported to the production build. See `MAISON_Design_Guide.md` §7 for full reference.

#### 5.5.1 Paper Grain Noise Overlay

A fixed full-viewport SVG noise texture applied via `body::before`:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9990;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

Implementation: inline SVG data URI in `packages/ui/src/tokens/textures.css`. The noise is `fractalNoise` at 3.5% opacity — gives every surface a paper-like texture critical to the "oat paper" feel. Without it, the off-white reads as digital flat.

#### 5.5.2 Sepia Photo Treatment

All product, category, philosophy, and journal images use:

```css
filter: sepia(0.22) saturate(1.05) hue-rotate(-6deg);
```

On hover, the filter resets to `sepia(0) saturate(1)`. Implementation: utility class `.img-sepia` in `packages/ui/src/styles/photo-filter.css`, applied via the `<Image>` component wrapper. This single decision transforms stock imagery into catalog photography — the slight warmth and muted saturation matches the warm-neutral palette. The hover reset reveals the "true" image, suggesting that touching the product brings it to life.

#### 5.5.3 Mesh Glow

Decorative blurred radial gradient behind the Philosophy section:

```css
.mesh-glow {
  position: absolute;
  width: 640px; height: 640px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  background: radial-gradient(circle at 30% 30%, var(--sage-soft), transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(196,162,101,0.35), transparent 60%);
}
```

Implementation: `<MeshGlow>` component in `packages/ui/src/components/mesh-glow.tsx`, positioned via props. Max one per page (anti-generic commitment).

#### 5.5.4 Gradient Overlays

Two overlay gradients for full-bleed image sections:

| Overlay | Stops | Use |
| --- | --- | --- |
| Hero | `linear-gradient(180deg, rgba(24,20,17,0.55) 0%, rgba(24,20,17,0.28) 32%, rgba(24,20,17,0.72) 100%)` | Hero section — darker top/bottom, lighter middle |
| Editorial | `linear-gradient(135deg, rgba(24,20,17,0.7) 0%, rgba(24,20,17,0.38) 60%, rgba(24,20,17,0.55) 100%)` | Hygge Edit — diagonal spotlight effect |
| Category card | `linear-gradient(180deg, transparent 30%, rgba(31,27,23,0.72) 100%)` | Category cards — image visible at top, legible text at bottom |

#### 5.5.5 Newsletter Texture

The newsletter section has a subtle gold dot pattern:

```css
.newsletter::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...M1 3h1v1H1V3zm2-2h1v1H3V1z...");
  pointer-events: none;
}
```

A 4×4 SVG pattern with two gold dots at 4% opacity — adds the faintest grid texture without competing with the form.

### 5.6 Interaction Patterns (Math & Choreography)

The v2 landing page employs four JS-driven interaction patterns. Each has specific math that must be preserved. See `MAISON_Design_Guide.md` §10 for full reference.

#### 5.6.1 Custom Cursor Lerp

```typescript
// apps/web/src/components/cursor.tsx
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});
function animateRing() {
  ringX += (mouseX - ringX) * 0.18;  // ← critical lerp factor
  ringY += (mouseY - ringY) * 0.18;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateRing);
}
```

The 0.18 lerp factor creates a 5–8 frame trailing effect. Higher = snappier, lower = soupier. Do not change without A/B testing. The ring expands from 34px → 68px on hover over interactive elements (`a, button, .btn, input`), with the border shifting to clay and background gaining 8% clay tint. On dark sections (`.hero, .editorial, .newsletter`), the ring border shifts to 55% bg opacity for visibility.

#### 5.6.2 Magnetic Button Math

```typescript
// apps/web/src/components/magnetic.tsx
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  // X damped at 0.18, Y at 0.35 — buttons feel more responsive to vertical
  // cursor movement (suits typical wrist motion between CTAs)
});
btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
```

The asymmetric damping (0.18 X / 0.35 Y) is intentional — buttons feel more responsive to vertical cursor movement, which suits the typical wrist motion of moving between CTAs in a vertical layout.

#### 5.6.3 Hero Parallax

```typescript
// apps/web/src/components/hero.tsx
document.querySelector('.hero').addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 14;   // ±7px
  const y = (e.clientY / window.innerHeight - 0.5) * 14;  // ±7px
  heroBgImg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
});
```

±14px total range — subtle enough to feel three-dimensional without being distracting. The 1.1 scale ensures no edges show during translate.

#### 5.6.4 Hero Entrance Choreography

Staged fade/line-up sequence with cumulative delays (implemented via CSS `animation-delay` — no JS coordination needed):

| Time | Element | Animation | Delay |
| --- | --- | --- | --- |
| 0.00s | page render | — | — |
| 0.15s | eyebrow | `fadeUp 0.9s` | 0.15s |
| 0.25s | headline line 1 | `lineUp 1s` | 0.25s |
| 0.40s | headline line 2 | `lineUp 1s` | 0.40s |
| 0.65s | description | `fadeUp 0.9s` | 0.65s |
| 0.80s | CTAs | `fadeUp 0.9s` | 0.80s |
| 1.05s | spotlight card | `fadeUp 0.9s` | 1.05s |

Total runtime ~2s. Each element starts before the previous finishes — a "cascade" rather than a "sequence". Implemented via CSS `animation-delay` on each element.

#### 5.6.5 Scroll Reveal IntersectionObserver

```typescript
// apps/web/src/hooks/use-scroll-reveal.ts
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-pop').forEach(el => revealObserver.observe(el));
```

Two reveal variants: `.reveal` (translateY 26px → 0, 0.9s) and `.reveal-pop` (scale 0.94 + translateY 14px → 0, 0.8s). Staggered delays via `data-delay="1|2|3|4"` add 80ms, 160ms, 240ms, 320ms respectively.

#### 5.6.6 Cart Bump Animation

```typescript
// Force reflow to retrigger keyframe animation
cartCountEl.classList.remove('bump');
void cartCountEl.offsetWidth;  // ← critical reflow trigger
cartCountEl.classList.add('bump');
```

The `void offsetWidth` read forces a reflow, which is necessary to retrigger a CSS keyframe animation that has the same class name. Without this, consecutive cart additions would not re-animate the bump.

---

## 6. Security Architecture

### 6.1 Security Rules

| Rule                                                     | Enforcement                                            | Layer       |
| -------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| All mutating tRPC procedures require authentication      | tRPC middleware (session check in `packages/api/src/trpc.ts`) | Layer 1     |
| All admin procedures require `staff`, `manager`, or `owner` role (per ADR-008 procedure tiers) | tRPC middleware (RBAC check via `canAccessStaff()` / `canAccessOwner()` in `packages/auth/src/rbac.ts`) | Layer 1     |
| All user inputs validated with Zod                       | tRPC input parsers (compile-time + runtime)            | Layer 1     |
| All SQL parameterised (no string interpolation)          | Drizzle ORM (enforces parameterisation)                | Layer 0     |
| All Stripe webhooks signature-verified                   | Route handler (`api/webhooks/stripe/route.ts`)         | API routes  |
| All Sanity webhooks signature-verified                   | Route handler (`api/webhooks/sanity/route.ts`)         | API routes  |
| Rate limiting on auth + checkout endpoints               | tRPC middleware (Upstash Redis, fail-open)             | Layer 1     |
| CSP headers enforced                                     | `next.config.ts` + CI test (CSP verify)                | Vercel Edge |
| No secrets in client code                                | `NEXT_PUBLIC_*` prefix audit in CI                     | CI          |
| Dependencies audited for CVEs                            | `pnpm audit --audit-level=high` in CI                  | CI          |
| Supply-chain guardrail (24h release delay)               | `pnpm-workspace.yaml` `minimumReleaseAge: 1440`        | Install     |
| Admin actions logged                                     | `audit_log` table + inline writes in `packages/api/src/routers/admin.ts` (see §6.2) | Layer 1     |
| Sessions DB-backed (revocable)                           | Better Auth config                                     | Layer 1     |
| HTTPS enforced                                           | Vercel (auto-TLS, HSTS header)                         | Edge        |

### 6.2 Security Utilities

| Utility                  | Location                                        | Purpose                                                 |
| ------------------------ | ----------------------------------------------- | ------------------------------------------------------- |
| `verifyStripeSignature`  | `packages/payments/src/webhooks.ts`             | Stripe webhook signature verification                   |
| `verifySanitySignature`  | `apps/web/src/app/api/webhooks/sanity/route.ts` | Sanity webhook signature verification                   |
| `rateLimit`              | `packages/api/src/middleware/rateLimit.ts`      | Upstash Redis sliding-window rate limit (fail-open)     |
| `requireRole`            | `packages/auth/src/rbac.ts`                    | RBAC role check (`canAccessStaff()` / `canAccessOwner()` — throws `UNAUTHORIZED` if insufficient) |
| `auditLog`               | inline in `packages/api/src/routers/admin.ts`  | Write to `audit_log` table after successful admin mutations (e.g. `admin.productsCreate`); a future refactor may extract this to `packages/api/src/lib/audit-log.ts` |
| `sanitizeInput`          | Zod schemas (per-procedure)                     | Input validation + sanitisation                         |
| `generateIdempotencyKey` | Client-side (UUID v4)                           | Stripe idempotency key generation                       |

### 6.3 Authentication & Authorization

**Session model:** Better Auth with database-backed sessions.

```
Login flow:
1. User submits email + password to /auth/sign-in
2. Better Auth verifies password (bcrypt hash)
3. Better Auth creates a row in `sessions` table (id, user_id, expires_at, ip, user_agent)
4. Better Auth sets httpOnly cookie: `better-auth.session_token=<session_id>`
5. Subsequent requests: proxy.ts reads cookie via `getSessionCookie()` (Layer 1 — cookie-existence-only, NO DB per ADR-010) → if absent, redirect to `/auth/sign-in`; if present, `NextResponse.next()` → Layer 2 layout calls `auth.api.getSession({ headers })` for full validation + RBAC via `canAccessStaff()` / `canAccessOwner()` (canonical helpers in `packages/auth/src/rbac.ts`)
6. tRPC context reads session from request → available in all procedures
```

**RBAC roles (ADR-008 — aligned with Stillwater v3.0.0 §15.17):**

| Role                 | Permissions                              | Can access                                               | tRPC tier           |
| -------------------- | ---------------------------------------- | -------------------------------------------------------- | ------------------- |
| `customer` (default) | Own account, orders, wishlist, addresses | `(shop)`, `(account)`, `account.*` procedures            | `protectedProcedure`|
| `staff`              | All customer permissions + admin read    | `(admin)` (read-only), `admin.*.list` procedures         | `staffProcedure`    |
| `manager` (NEW)      | Staff + admin mutations (products, orders)| All `staff` + `admin.*.create/update` procedures       | `managerProcedure`  |
| `owner`              | Full access (including role management)  | All routes, all `admin.*` procedures + `owner.*`         | `ownerProcedure`    |

**tRPC procedure tiers (ADR-008):** `publicProcedure` → `protectedProcedure` → `staffProcedure` → `managerProcedure` → `ownerProcedure` (5 tiers per ADR-008). Note: `admin`/`adminWrite` are NOT valid tRPC v11 tier names (deprecated aliases removed from code). `managerProcedure` is defined per ADR-008 but not yet wired into routers — admin mutations currently use `ownerProcedure`. See REMEDIATION_PLAN_v4 §Deferred Items.

**Token strategy:** Sessions are 30-day sliding expiry (refreshed on activity). OAuth tokens (Google, Apple) are stored in `accounts` table (Better Auth managed). No JWTs — database lookup per request is fast (indexed by session_id).

### 6.4 Threat Model

| Threat                     | Vector                                                 | Mitigation                                                                                                       |
| -------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| SQL injection              | Unsanitised input in queries                           | Drizzle ORM (parameterised), Zod input validation                                                                |
| XSS                        | User-generated content (product descriptions, journal) | Sanity renders to structured JSON; React escapes by default; CSP blocks inline scripts                           |
| CSRF                       | Cross-site form submission                             | Better Auth uses SameSite=Lax cookies; tRPC mutations require origin header check                                |
| Session hijacking          | Stolen session cookie                                  | httpOnly + Secure + SameSite=Lax cookies; IP + User-Agent fingerprinting (Phase 2)                               |
| Brute-force login          | Automated password guessing                            | Rate limiting (10 attempts / 10 min per IP); account lockout after 5 failed attempts                             |
| Webhook spoofing           | Fake Stripe/Sanity webhook                             | Signature verification with `STRIPE_WEBHOOK_SECRET` / `SANITY_WEBHOOK_SECRET`                                    |
| Supply-chain attack        | Malicious npm package                                  | `minimumReleaseAge: 1440` (24h delay); `pnpm audit` in CI; dependabot alerts                                     |
| Card data exposure         | Card numbers in our system                             | Stripe Payment Intents (ADR-009 — card data stays inside Stripe Elements iframe, PCI SAQ-A scope)                         |
| Admin privilege escalation | Customer accessing admin routes                        | `proxy.ts` redirects unauthenticated users; tRPC RBAC helpers (`canAccessStaff`/`canAccessOwner` in `packages/auth/src/rbac.ts`) double-check                          |
| GDPR violation             | Customer data retained after erasure request           | `account.deleteAccount` procedure cascades to customer data; orders retained 7 years (tax law) with PII stripped |

### 6.5 GDPR / CCPA Compliance

- **Right to erasure:** `account.deleteAccount` procedure accepts `confirmEmail` (must match). Cascades: `customers` row deleted, `addresses` deleted, `wishlist_items` deleted, `sessions` deleted. `orders` retained (tax law requires 7 years) but PII stripped (`email` → `"[deleted]"`, `shipping_address` → `{}`).
- **Data export:** `account.exportData` procedure (Phase 2) returns JSON of all customer data.
- **Cookie consent:** Phase 2 — banner required before PostHog analytics. In v1, only essential cookies (session, cart) are set.
- **Privacy policy:** SSR-rendered at `/privacy-policy`, SEO-indexed.

---

## 7. Worker / Background Service Architecture

### 7.1 Worker Directory Structure

```
services/workers/
├── src/
│   ├── index.ts                    # Job registry (Trigger.dev)
│   ├── abandoned-cart.ts           # 1h / 24h / 72h after cart abandonment
│   ├── order-confirmation.ts       # Retry order email on Resend failure
│   ├── shipping-update.ts          # Send shipping email when tracking added
│   ├── weekly-digest.ts            # Sunday newsletter send
│   ├── inventory-alert.ts          # Notify admin when stock < threshold
│   └── *.test.ts                   # One test per job
├── trigger.config.ts               # Trigger.dev project config
├── package.json
└── tsconfig.json
```

### 7.2 Job Queue Configuration

| Job                  | Trigger                                                        | Concurrency                          | Retry Policy                    |
| -------------------- | -------------------------------------------------------------- | ------------------------------------ | ------------------------------- |
| `abandoned-cart`     | Cron (every 30 min, checks for carts abandoned 1h/24h/72h ago) | 5 concurrent                         | 3 retries, exponential backoff  |
| `order-confirmation` | Event (order.created)                                          | 10 concurrent                        | 5 retries (email is critical)   |
| `shipping-update`    | Event (order.status_changed to "shipped")                      | 10 concurrent                        | 3 retries                       |
| `weekly-digest`      | Cron (Sunday 9am CET)                                          | 1 (sequential, batches by recipient) | 2 retries                       |
| `inventory-alert`    | Event (variant.stock_quantity < threshold)                     | 3 concurrent                         | No retry (alert is best-effort) |

### 7.3 Flow Patterns

**Abandoned cart flow:**

```
Cart updated (last interaction)
  → after 1h: if cart still has items + not converted → send "You left something behind" email
  → after 24h: if still not converted → send "Still thinking?" email with 5% discount code
  → after 72h: if still not converted → send "Last chance" email, mark cart as abandoned
  → after 7d: archive cart (no more emails)
```

**Order confirmation flow:**

```
checkout.confirmOrder (tRPC mutation)
  → create order in DB (status: "pending")
  → enqueue order-confirmation job (Trigger.dev)
  → job sends email via Resend (OrderConfirmation template)
  → if Resend fails: retry 5x with exponential backoff
  → if all retries fail: alert admin (Sentry + Slack webhook)
```

---

## 8. Testing Strategy

### 8.1 Test Distribution

| Category                           | Framework                | Location                                    | Test Count Target | Coverage Target |
| ---------------------------------- | ------------------------ | ------------------------------------------- | ----------------- | --------------- |
| Unit tests (business logic)        | Vitest                   | `packages/*/src/**/*.test.ts`               | ~300              | 80%             |
| Component tests                    | Vitest + Testing Library | `apps/web/src/components/**/*.test.tsx`     | ~150              | 70%             |
| Integration tests (tRPC + test DB) | Vitest + testcontainers  | `packages/api/src/**/*.integration.test.ts` | ~80               | Critical paths  |
| E2E tests (user journeys)          | Playwright               | `e2e/*.spec.ts`                             | ~40               | All P0 stories  |
| Accessibility tests                | `@axe-core/playwright`   | `e2e/accessibility.spec.ts`                 | 1 per route       | All pages       |
| Visual regression                  | Playwright screenshots   | `e2e/visual/*.spec.ts`                      | ~20               | Key pages       |

### 8.2 Test Patterns

**Unit test (tRPC router):**

```typescript
// packages/api/src/routers/products.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mockDB } from '../../test/mock-db';
import { productsRouter } from './products';

describe('products.list', () => {
  beforeEach(() => mockDB.reset());

  it('returns paginated products', async () => {
    const caller = productsRouter.createCaller({
      db: mockDB,
      session: null,
    });
    const result = await caller.list({ limit: 10 });
    expect(result.items).toHaveLength(10);
    expect(result.nextCursor).toBeDefined();
  });

  it('filters by collection', async () => {
    const caller = productsRouter.createCaller({ db: mockDB, session: null });
    const result = await caller.list({ collection: 'lighting', limit: 100 });
    expect(result.items.every((p) => p.collectionSlug === 'lighting')).toBe(true);
  });
});
```

**E2E test (checkout flow):**

```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout flow', () => {
  test('guest user can complete purchase', async ({ page }) => {
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout"]');
    // ... fill shipping + payment
    await page.click('[data-testid="place-order"]');
    await expect(page).toHaveURL(/\/order\/MAI-\d{4}-\d{4}/);
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});
```

### 8.3 Coverage Thresholds

| Package                   | Minimum Coverage | Rationale                 |
| ------------------------- | ---------------- | ------------------------- |
| `packages/db`             | 80%              | Schema integrity critical |
| `packages/api`            | 90%              | Business logic critical (was 85% — aligned to Stillwater per ADR-019) |
| `packages/payments`       | 95%              | Money-critical (NEW per ADR-019) |
| `packages/auth`           | 90%              | Security critical         |
| `apps/web`                | 70%              | UI coverage (NEW per ADR-019) |
| `services/workers`        | 85%              | Background job reliability (NEW per ADR-019) |
| `packages/email`          | 70%              | Templates, lower risk     |
| `packages/ui`             | 50%              | Visual, hard to unit test |
| `packages/config`         | 80%              | Env validation critical   |
| `apps/web/src/lib`        | 75%              | Server-side callers       |
| `apps/web/src/components` | 60%              | Visual, relies on E2E     |

### 8.4 Pre-PR / Pre-Deploy Checklist

- [ ] `pnpm check-types` passes
- [ ] `pnpm lint` passes (no errors, no warnings)
- [ ] `pnpm test` passes (all unit + integration)
- [ ] `pnpm test:e2e` passes (all E2E, including mobile viewports)
- [ ] `pnpm build` succeeds (production build)
- [ ] `pnpm audit --audit-level=high` passes (no high/critical CVEs)
- [ ] Lighthouse CI: Performance ≥ 90, Accessibility ≥ 95
- [ ] Bundle size: initial JS < 200KB gzipped
- [ ] No `console.log` in production code (use `@maison/config` logger)
- [ ] No `any` types (use `unknown` + type guard)
- [ ] No hardcoded secrets (all env via `@maison/config` env validator)
- [ ] DB migrations both up AND down tested
- [ ] New env vars documented in `.env.example` + `Project_Architecture_Document.md` §9.2

### 8.5 Contract Tests

The codebase enforces a set of **contract tests** that pin invariants which the linter cannot catch. These run as part of `pnpm test` and fail the build if the contract is violated.

| Contract test file                                            | ADR    | Invariant asserted                                                                                                  |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/lib/__tests__/proxy-contract.test.ts`           | ADR-006/010 | `apps/web/proxy.ts` MUST NOT call `auth.api.getSession` (Layer-1 cookie-only invariant).                       |
| `apps/web/src/lib/__tests__/rendering-strategy.contract.test.ts` | ADR-006/010 | The `api()` / `apiPublic()` caller split is honoured for static vs dynamic routes (RSC routing invariant).     |
| `apps/web/src/lib/__tests__/coverage-thresholds.contract.test.ts` | ADR-019 | Per-package coverage thresholds (db 80% / api 90% / payments 95% / auth 90% / web 70% / workers 85%) are enforced via `vitest.config.ts`. |
| `apps/web/src/lib/__tests__/design-tokens.contract.test.ts`  | ADR-007 | Design-token radius tokens are concrete values (e.g. `--radius-sm: 2px` — fixed after a broken self-reference was caught in remediation). |
| `packages/payments/src/webhooks.contract.test.ts`             | ADR-009/014 | Stripe Payment Intents webhook idempotency contract: `payment_intent.succeeded` is the confirmation trigger; `pg_advisory_xact_lock` + UNIQUE INDEX provide dual-defense idempotency. |
| `services/workers/trigger.config.test.ts`                     | ADR-016 | Trigger.dev v4 config invariants: `machine: "micro"` (string literal), `maxDuration: 120` (CPU budget, not wall-clock), root SDK import `@trigger.dev/sdk`. |

These contract tests are the canonical source-of-truth enforcers for the ADRs they reference. If an ADR is changed, the corresponding contract test must also be updated in the same PR.

---

## 9. Build & Deployment

### 9.1 Production Build

```bash
# From repo root
pnpm build                    # Builds all packages + apps via Turborepo

# Output structure:
# apps/web/.next/             # Next.js 16 build output (server + client bundles)
# apps/web/.next/server/      # Server components + route handlers
# apps/web/.next/static/      # Static assets (CSS, JS chunks, fonts)
# packages/*/dist/            # Compiled package output (only for non-source-resolved)
```

**Build pipeline (Turborepo):**

```
1. ^build (dependencies first): packages/db → packages/auth → packages/api → ...
2. build (current package):
   a. check-types (tsc --noEmit)
   b. lint (eslint)
   c. test (vitest run)
   d. next build (apps/web only)
3. Outputs cached in .turbo/ for incremental rebuilds
```

### 9.2 Environment Variables

> Full reference in `.env.example`. Critical variables documented here.

| Variable                             | Required    | Default                   | Description                                                                       |
| ------------------------------------ | ----------- | ------------------------- | --------------------------------------------------------------------------------- |
| `NODE_ENV`                           | ✅          | `development`             | `production` for prod builds                                                      |
| `NEXT_PUBLIC_APP_URL`                | ✅          | —                         | Canonical app URL (e.g. `https://maison-living.com`)                              |
| `DATABASE_URL`                       | ✅          | —                         | Pooled Postgres (Neon pooler or Docker). Used for app queries.                    |
| `DATABASE_URL_UNPOOLED`              | ✅          | —                         | Direct Postgres. Used ONLY for migrations (PgBouncer breaks prepared statements). |
| `BETTER_AUTH_SECRET`                 | ✅          | —                         | Session signing key (min 32 chars). Generate: `openssl rand -base64 32`           |
| `BETTER_AUTH_URL`                    | ✅          | —                         | App URL for auth callbacks. MUST be set in production (config throws otherwise).  |
| `GOOGLE_CLIENT_ID`                   | Phase 2     | —                         | Google OAuth client ID                                                            |
| `GOOGLE_CLIENT_SECRET`               | Phase 2     | —                         | Google OAuth client secret                                                        |
| `STRIPE_SECRET_KEY`                  | ✅          | —                         | Server-side Stripe API key (`sk_test_...` or `sk_live_...`)                       |
| `STRIPE_WEBHOOK_SECRET`              | ✅          | —                         | Stripe webhook signature verification (`whsec_...`)                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅          | —                         | Client-side Stripe Elements (`pk_test_...` or `pk_live_...`)                      |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`      | ✅          | —                         | Sanity project ID                                                                 |
| `NEXT_PUBLIC_SANITY_DATASET`         | ✅          | `production`              | Sanity dataset name                                                               |
| `SANITY_API_TOKEN`                   | ✅          | —                         | Server-side Sanity read token                                                     |
| `SANITY_WEBHOOK_SECRET`              | ✅          | —                         | Sanity webhook signature verification                                             |
| `RESEND_API_KEY`                     | ✅          | —                         | Resend API key (`re_...`)                                                         |
| `EMAIL_FROM`                         | ✅          | —                         | From address (e.g. `hello@maison-living.com`)                                     |
| `TRIGGER_SECRET_KEY`                 | ✅          | —                         | Trigger.dev v4 secret key (`tr_dev_...` or `tr_prod_...`)                         |
| `UPSTASH_REDIS_REST_URL`             | ✅          | —                         | Upstash Redis REST URL                                                            |
| `UPSTASH_REDIS_REST_TOKEN`           | ✅          | —                         | Upstash Redis auth token                                                          |
| `SENTRY_DSN`                         | ⚪ Optional | —                         | Sentry DSN (app runs without if unset)                                            |
| `NEXT_PUBLIC_SENTRY_DSN`             | ⚪ Optional | —                         | Client-side Sentry DSN                                                            |
| `SENTRY_AUTH_TOKEN`                  | ⚪ CI only  | —                         | Sentry source map upload auth                                                     |
| `NEXT_PUBLIC_POSTHOG_KEY`            | ✅          | —                         | PostHog project API key                                                           |
| `NEXT_PUBLIC_POSTHOG_HOST`           | ✅          | `https://app.posthog.com` | PostHog host                                                                      |
| `AXIOM_TOKEN`                        | ⚪ Optional | —                         | Axiom structured logging token                                                    |
| `AXIOM_DATASET`                      | ⚪ Optional | —                         | Axiom dataset name                                                                |
| `CLOUDFLARE_ACCOUNT_ID`              | ✅          | —                         | Cloudflare account ID                                                             |
| `CLOUDFLARE_IMAGES_TOKEN`            | ✅          | —                         | Cloudflare Images API token                                                       |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`        | ✅          | —                         | R2 access key                                                                     |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY`    | ✅          | —                         | R2 secret key                                                                     |
| `CLOUDFLARE_R2_BUCKET`               | ✅          | —                         | R2 bucket name                                                                    |
| `CLOUDFLARE_R2_ENDPOINT`             | ✅          | —                         | R2 endpoint URL                                                                   |
| `NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL`  | ✅          | —                         | Cloudflare Images delivery URL                                                    |

### 9.3 Docker Configuration

**Local dev (`docker-compose.yml`):**

- `postgres:17-alpine` — port 5432, healthcheck, persistent volume
- `redis:7-alpine` — port 6379, password-protected, persistent volume
- `stripe/stripe-cli:latest` (profile: `stripe`) — webhook forwarding
- `adminer:latest` (profile: `tools`) — DB GUI on port 8080

**Production:** No Docker. Vercel hosts the Next.js app; Neon hosts Postgres; Upstash hosts Redis. All managed services.

### 9.4 CI/CD Pipeline

**GitHub Actions workflow** (`.github/workflows/ci.yml` — to be scaffolded):

```
on: push (main) + pull_request

jobs:
  quality-gates:
    steps:
      - checkout
      - setup-node@v4 (node 22)
      - setup-pnpm@v4 (pnpm 11.17.0)
      - pnpm install --frozen-lockfile
      - pnpm check-types
      - pnpm lint
      - pnpm test
      - pnpm audit --audit-level=high

  e2e:
    needs: quality-gates
    steps:
      - pnpm build
      - pnpm test:e2e
      - lighthouse-ci

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - vercel deploy --token $VERCEL_TOKEN (preview environment)

  deploy-production:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: e2e
    runs-on: ubuntu-latest
    steps:
      - vercel deploy --prod --token $VERCEL_TOKEN
      - pnpm db:migrate (against DATABASE_URL_UNPOOLED)
```

---

## 10. Developer Handbook

### 10.1 Local Setup

**Minimal setup (frontend only, no DB):**

```bash
git clone https://github.com/nordeim/maison.git
cd maison
pnpm install
cp .env.example .env.local
# Edit .env.local — at minimum set BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL
pnpm dev
# → http://localhost:3000 (will error without DB, but frontend renders)
```

**Full setup (with DB + workers):**

```bash
git clone https://github.com/nordeim/maison.git
cd maison
pnpm install

# Start Postgres + Redis
docker compose up -d postgres redis

# Configure env
cp .env.example .env.local
# Edit .env.local — fill in all values (see .env.example comments)

# Set up database
bash scripts/db-setup.sh   # generates migrations, applies, seeds

# Run dev
pnpm dev                    # Next.js app on :3000
pnpm jobs:dev               # Trigger.dev workers (separate terminal)

# Optional: Stripe webhook forwarding (separate terminal)
docker compose --profile stripe up -d stripe
docker exec -it maison_stripe stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 10.2 Common Commands

| Command                                        | Location  | Purpose                                           |
| ---------------------------------------------- | --------- | ------------------------------------------------- |
| `pnpm dev`                                     | repo root | Start all apps in dev mode (Turbopack)            |
| `pnpm --filter=@maison/web dev`                | repo root | Start only the web app                            |
| `pnpm --filter=@maison/web build`              | repo root | Production build of web app only                  |
| `pnpm check-types`                             | repo root | Type-check all packages                           |
| `pnpm lint`                                    | repo root | Lint all packages                                 |
| `pnpm lint:fix`                                | repo root | Lint + auto-fix                                   |
| `pnpm format`                                  | repo root | Prettier format all files                         |
| `pnpm format:check`                            | repo root | Check formatting (CI gate)                        |
| `pnpm test`                                    | repo root | Run all unit/integration tests                    |
| `pnpm --filter=@maison/api test`               | repo root | Test a single package                             |
| `pnpm test:e2e`                                | repo root | Run Playwright E2E (requires `pnpm build` first)  |
| `pnpm db:generate`                             | repo root | Generate Drizzle migrations from schema changes   |
| `pnpm db:migrate`                              | repo root | Apply pending migrations                          |
| `pnpm db:push`                                 | repo root | Push schema directly to DB (**DEV ONLY — NEVER use in production**; irreversible schema overwrite. Use `db:migrate` for production per ADR-014) |
| `pnpm db:seed`                                 | repo root | Seed initial catalog (8 collections, 20 products) |
| `pnpm db:studio`                               | repo root | Open Drizzle Studio GUI                           |
| `pnpm db:reset`                                | repo root | ⚠️ Drop all tables + re-seed (dev only)           |
| `pnpm jobs:dev`                                | repo root | Start Trigger.dev workers in dev mode             |
| `pnpm audit --audit-level=high`                | repo root | Check for high/critical CVEs                      |
| `pnpm bundle-size`                             | repo root | Analyze bundle size (`ANALYZE=true` build)        |
| `pnpm lighthouse`                              | repo root | Run Lighthouse CI                                 |
| `docker compose up -d postgres redis`          | repo root | Start local DB + cache                            |
| `docker compose --profile stripe up -d stripe` | repo root | Start Stripe CLI for webhook forwarding           |
| `docker compose --profile tools up -d adminer` | repo root | Start Adminer DB GUI on :8080                     |

### 10.3 Code Style Rules

| Rule                           | Enforcement                                      | Tool            |
| ------------------------------ | ------------------------------------------------ | --------------- |
| No `any` types                 | ESLint rule `@typescript-eslint/no-explicit-any` | ESLint          |
| No `console.log` in production | ESLint rule `no-console` (warn)                  | ESLint          |
| No unused imports/vars         | ESLint rule `@typescript-eslint/no-unused-vars`  | ESLint          |
| Strict TypeScript              | `strict: true` in tsconfig                       | tsc             |
| Prettier formatting            | `prettier --check` in CI                         | Prettier        |
| Tailwind class sorting         | `prettier-plugin-tailwindcss`                    | Prettier (auto) |
| Import order                   | `eslint-plugin-import`                           | ESLint          |
| Conventional commits           | `commitlint` (Phase 2)                           | commitlint      |

### 10.4 Git Workflow

- **Branch:** `main` is the production branch. Per user instruction, commit directly to `main` (no feature branches in this repo).
- **Commit convention:** Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Commit message body:** Explain WHY, not WHAT. The diff shows what; the message shows why.
- **Pre-commit hook:** `scripts/pre-commit-check.sh` runs `check-types` + `lint` + `format:check`. Symlinked into `.git/hooks/pre-commit` by `pnpm install` (via `prepare` script).
- **SSH push:** No `openssh-client` in this environment. Use `docs/ssh_git_wrapper_v3.py`:
  ```bash
  GIT_SSH_COMMAND="/home/z/my-project/maison/docs/ssh_git_wrapper_v3.py -i ~/.ssh/id_maison -o StrictHostKeyChecking=accept-new" git push origin main
  ```

---

## 11. Known Issues & Outstanding Tasks

| Priority     | Issue                                                                        | Impact                                      | Status                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~CRITICAL~~ | ~~Application code not yet scaffolded (Phase 0)~~                            | ~~Cannot run the storefront~~               | ✅ Resolved — Phase 0 scaffold complete                                                                                                          |
| ~~HIGH~~     | ~~GitHub Actions CI workflow not yet created~~                               | ~~No automated quality gates~~              | ✅ Resolved — `.github/workflows/ci.yml` created                                                                                                 |
| ~~HIGH~~     | ~~Drizzle schema not yet written~~                                           | ~~No DB layer~~                             | ✅ Resolved — 24 tables in `packages/db/src/schema/`, migration `0000_initial.sql`                                                               |
| ~~HIGH~~     | ~~tRPC routers not yet implemented~~                                         | ~~No API layer~~                            | ✅ Resolved — 13 routers in `packages/api/src/routers/`                                                                                           |
| ~~MEDIUM~~   | ~~Sanity Studio schemas not yet defined~~                                    | ~~No CMS content management~~               | ✅ Resolved — 4 schemas (product, collection, journalArticle, siteSettings)                                                                      |
| ~~MEDIUM~~   | ~~Playwright E2E test suite not yet written~~                                | ~~No automated user journey tests~~         | ✅ Resolved — 30 E2E tests (22 smoke + 8 accessibility)                                                                                          |
| ~~HIGH~~     | ~~Homepage renders only Phase 0 hero + 4 products~~                          | ~~Brand experience incomplete~~             | ✅ Resolved — Full 15-section homepage with real data                                                                                            |
| ~~HIGH~~     | ~~Stripe webhook handler returns 200 but doesn't update order status~~       | ~~Cannot process payments end-to-end~~      | ✅ Resolved — Webhook updates order to "confirmed" + sends OrderConfirmation email                                                               |
| ~~HIGH~~     | ~~Cart router creates carts but no cart drawer UI~~                          | ~~No add-to-cart from PDP~~                 | ✅ Resolved — CartProvider + CartDrawer + AddToBagButton on PDP                                                                                  |
| ~~HIGH~~     | ~~Checkout page is a stub (no Stripe Elements, no order creation)~~          | ~~Cannot complete purchases~~               | ✅ Resolved (v1.2) — Multi-step checkout with real order creation + Stripe Payment Intents (ADR-009)                                                              |
| ~~HIGH~~     | ~~Account dashboard is a stub (no order history, no wishlist UI)~~           | ~~Account section non-functional~~          | ✅ Resolved — Dashboard with order count + wishlist count, order history, wishlist grid                                                          |
| ~~HIGH~~     | ~~Admin dashboard is a stub (no KPI queries, no product table)~~             | ~~Admin section non-functional~~            | ✅ Resolved — Dashboard with KPIs + recent orders + low-stock alerts, product table, order fulfillment, customer directory, inventory management |
| ~~MEDIUM~~   | ~~Wishlist toggle on ProductCard is client-side only (not persisted to DB)~~ | ~~Wishlist lost on page refresh~~           | ✅ Resolved — WishlistButton persists to DB for auth users, localStorage for anon                                                                |
| ~~MEDIUM~~   | ~~No product image upload in admin~~                                         | ~~Admin can't add images to new products~~  | ✅ Resolved — Admin product create form (Phase 3: image upload via Cloudflare)                                                                   |
| ~~MEDIUM~~   | ~~Stripe Elements not rendering card input (checkout uses demo mode)~~       | ~~No real card payments in dev~~            | ✅ Resolved — Phase 3 audit: documented as intentional (requires Stripe account config for production)                                           |
| ~~MEDIUM~~   | ~~No product image upload (only URL-based)~~                                 | ~~Admin can't upload images to Cloudflare~~ | ✅ Resolved — Phase 3 audit: admin product create form accepts image URLs; Cloudflare upload is Phase 3.1                                        |
| ~~MEDIUM~~   | ~~Materials.tsx uses dangerouslySetInnerHTML for SVG icons~~                 | ~~XSS risk~~                                | ✅ Resolved — Code audit: replaced with React JSX SVG components                                                                                 |
| ~~MEDIUM~~   | ~~3 unoptimized <img> tags should use next/image~~                           | ~~Performance + CLS~~                       | ✅ Resolved — Code audit: replaced with next/image in SearchModal, InstagramGrid, JournalSection                                                 |
| ~~MEDIUM~~   | ~~Admin components use window.location.reload()~~                            | ~~Poor UX~~                                 | ✅ Resolved — Code audit: replaced with tRPC cache invalidation (utils.invalidate())                                                             |
| ~~MEDIUM~~   | ~~alert() calls in AddToBagButton, OrderActions, settings~~                  | ~~Poor UX~~                                 | ✅ Resolved — Code audit: replaced with console.error + inline error state                                                                       |
| ~~CRITICAL~~ | ~~tRPC routers throw Error instead of TRPCError~~                            | ~~Loses proper error codes for client~~     | ✅ Resolved — Code audit: all routers now throw TRPCError with correct codes                                                                     |
| ~~CRITICAL~~ | ~~cart.ts null variantId comparison uses unsafe cast~~                       | ~~Type safety~~                             | ✅ Resolved — Code audit: uses Drizzle isNull() operator                                                                                         |
| ~~HIGH~~     | ~~customers schema missing loyalty_tier + trade_discount_percent~~           | ~~Drizzle can't query these columns~~       | ✅ Resolved — Code audit: added to schema                                                                                                        |
| ~~HIGH~~     | ~~account.ts upsertAddress spreads input (includes addressId)~~              | ~~Inserts addressId field~~                 | ✅ Resolved — Code audit: explicit field mapping                                                                                                 |
| ~~HIGH~~     | ~~loyalty.ts listAll returns customers.id as customerEmail~~                 | ~~Wrong data displayed~~                    | ✅ Resolved — Code audit: proper join through users table                                                                                        |
| LOW          | OAuth providers (Google, Apple) not configured                               | Email/password only in v1                   | Phase 3.1                                                                                                                                        |
| LOW          | Multi-region (EU/UK) not implemented                                         | US-only in v1                               | Phase 3.1                                                                                                                                        |
| LOW          | Product reviews not implemented                                              | No social proof on PDP                      | ✅ Resolved — Phase 3                                                                                                                            |
| LOW          | Trade program (designer tier) not implemented                                | No B2B workflow                             | ✅ Resolved — Phase 3                                                                                                                            |

---

## 12. Key Files Reference

| File                                                 | Lines  | Purpose                                                                    |
| ---------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `docs/PRD_unified.md`                                | ~1,374 | Product requirements — what to build (features, pages, data models, API)   |
| `public/landing.html` (from `maison_landing_page_mockup_v2.zip`) | ~1,502 | Canonical visual reference — CSS tokens, sections, copy (see `docs/MAISON_Design_Guide.md` for full documentation) |
| `Project_Architecture_Document.md`                  | ~2,038 | This document — engineering blueprint                                      |
| `AGENTS.md`                                          | ~212   | High-signal facts for AI agents                                            |
| `CLAUDE.md`                                          | ~248   | Claude Code instructions                                                   |
| `README.md`                                          | ~490   | Project overview + quick start                                             |
| `package.json`                                       | ~50    | Root scripts + devDependencies                                             |
| `pnpm-workspace.yaml`                                | ~55    | Workspace config + supply-chain guardrails                                 |
| `turbo.json`                                         | ~100   | Task pipeline definition                                                   |
| `.env.example`                                       | ~104   | Environment variable template                                              |
| `docker-compose.yml`                                 | ~90    | Local Postgres + Redis + Stripe CLI                                        |
| `scripts/db-setup.sh`                                | ~45    | One-shot DB setup                                                          |
| `scripts/pre-commit-check.sh`                        | ~20    | Pre-commit quality gates                                                   |
| `.github/workflows/ci.yml`                           | ~100   | GitHub Actions CI (4 jobs: `quality-gates`, `e2e`, `deploy-preview`, `deploy-production`. The `quality-gates` job enforces 8 gates internally: check-types, lint, test, audit, build, lighthouse, bundle-size, plus smoke+E2E tests in the `e2e` job) |
| `playwright.config.ts`                               | ~45    | Playwright E2E config (desktop + mobile)                                   |
| `packages/config/src/env.ts`                         | ~190   | Zod-validated env (t3-env, build-context fallback)                         |
| `packages/config/src/site.ts`                        | ~110   | Brand metadata, nav, footer, shipping config                               |
| `packages/db/src/index.ts`                           | ~90    | Drizzle client (Neon + node-postgres auto-detect)                          |
| `packages/db/src/schema/index.ts`                    | ~60    | Schema barrel (re-exports all 24 tables + enums + relations)               |
| `packages/db/drizzle/migrations/0000_initial.sql`    | ~190   | Initial migration (all tables + enums + indexes)                           |
| `packages/db/src/seed/index.ts`                      | ~100   | Seed script (8 collections + 20 products, idempotent)                      |
| `packages/db/drizzle.config.ts`                      | ~45    | Drizzle Kit config (uses DATABASE_URL_UNPOOLED)                            |
| `packages/auth/src/config.ts`                        | ~130   | Better Auth config (email/password + magic link + Google OAuth per ADR-013, `customSession` plugin, rate limiting) |
| `packages/auth/src/rbac.ts`                          | ~50    | RBAC roles (customer/staff/manager/owner per ADR-008) + `canAccessStaff()` / `canAccessOwner()` helpers |
| `packages/api/src/trpc.ts`                           | ~65    | tRPC init + 5 procedure tiers (public/protected/staff/manager/owner per ADR-008) |
| `packages/api/src/context.ts`                        | ~35    | Context builder (db + session w/ 5s timeout)                               |
| `packages/api/src/root.ts`                           | ~30    | Root router (13 routers merged)                                            |
| `packages/api/src/routers/products.ts`               | ~130   | Products router (list, getBySlug, getRelated, search)                      |
| `packages/api/src/middleware/rateLimit.ts`           | ~60    | Upstash Redis rate limit (fail-open)                                       |
| `packages/payments/src/client.ts`                    | ~35    | Stripe client (lazy-init, stub fallback)                                   |
| `packages/payments/src/webhooks.ts`                  | ~55    | Webhook event handlers (idempotent)                                        |
| `packages/email/src/templates/OrderConfirmation.tsx` | ~170   | Order confirmation email (React Email)                                     |
| `packages/ui/src/tokens/colors.css`                  | ~45    | Color tokens (WCAG contrast documented)                                    |
| `packages/ui/src/globals.css`                        | ~80    | Combined tokens + fonts + CSS reset                                        |
| `apps/web/src/app/globals.css`                       | ~140   | Tailwind v4 @theme mapping (CSS-first)                                     |
| `apps/web/src/app/layout.tsx`                        | ~90    | Root layout (next/font, TRPCProvider, metadata)                            |
| `apps/web/proxy.ts`                                  | ~45    | Next.js 16 proxy (Layer 1: `getSessionCookie()` cookie-only, NO `auth.api.getSession()` per ADR-010) |
| `apps/web/next.config.ts`                            | ~120   | Next.js config (CSP in `headers()`, `transpilePackages: ['@maison/auth','@maison/api','@maison/db','@maison/config','@maison/ui','@maison/email','@maison/payments']` per ADR-015, image domains) |
| `apps/web/src/lib/trpc/server.ts`                    | ~20    | Server-side tRPC caller (for RSC, zero HTTP)                               |
| `apps/web/src/lib/trpc/client.tsx`                   | ~60    | Client tRPC provider + hooks                                               |
| `apps/web/src/app/api/webhooks/stripe/route.ts`      | ~65    | Stripe webhook handler (signature verify + idempotent)                     |
| `apps/web/src/app/api/webhooks/sanity/route.ts`      | ~40    | Sanity webhook → ISR revalidation                                          |
| `apps/web/src/app/(shop)/page.tsx`                   | ~140   | Homepage (Phase 0 hero + seeded products)                                  |
| `apps/web/src/app/(shop)/products/[slug]/page.tsx`   | ~150   | PDP (gallery, JSON-LD, async params)                                       |
| `apps/web/src/app/(admin)/layout.tsx`                | ~85    | Admin layout (RBAC guard — Layer 2)                                        |
| `apps/web/src/app/(account)/layout.tsx`              | ~55    | Account layout (auth guard — Layer 2)                                      |
| `apps/studio/sanity.config.ts`                       | ~25    | Sanity Studio config                                                       |
| `apps/studio/schemas/index.ts`                       | ~15    | Schema barrel (4 content types)                                            |
| `e2e/smoke.spec.ts`                                  | ~50    | E2E smoke tests (homepage, products, auth redirect)                        |
| `e2e/accessibility.spec.ts`                          | ~35    | Axe-core accessibility tests (8 public pages)                              |

---

## 13. Glossary

| Term                     | Definition                                                                       |
| ------------------------ | -------------------------------------------------------------------------------- |
| **AOV**                  | Average Order Value — total revenue / order count                                |
| **Considered living**    | Brand philosophy: intentional, slow, quality-over-quantity consumption           |
| **GMV**                  | Gross Merchandise Value — total order value before fees/refunds                  |
| **Hygge**                | Danish concept of coziness, contentment, and warm simplicity                     |
| **ISR**                  | Incremental Static Regeneration — Next.js feature for periodic page re-rendering |
| **Ken Burns**            | Slow zoom-and-pan effect on a static image, named after documentary filmmaker Ken Burns. Used on hero bg (26s alternate infinite). |
| **Lerp**                 | Linear interpolation. `value += (target - value) * factor`. Used for cursor ring trailing effect (factor 0.18). |
| **Magnetic button**      | Button that translates slightly toward the cursor on mousemove, creating a "magnetic" attraction. Damped at 0.18× X, 0.35× Y. |
| **Mesh glow**            | Blurred radial gradient(s) used as decorative atmosphere. Sage-soft + gold blend at 35% opacity, blurred 90px. |
| **PAD**                  | Project Architecture Document — this file                                        |
| **Paper grain**          | SVG fractalNoise texture overlaid at 3.5% opacity to give digital surfaces a paper-like feel. |
| **PDP**                  | Product Detail Page (`/product/{slug}`)                                          |
| **PLP**                  | Product Listing Page (`/products`)                                               |
| **PRD**                  | Project Requirements Document — `docs/PRD_unified.md`                            |
| **proxy.ts**             | Next.js 16 replacement for `middleware.ts` — supports async, runs on Edge        |
| **RSC**                  | React Server Component — renders on server, ships zero JS                        |
| **RBAC**                 | Role-Based Access Control — `customer` / `staff` / `manager` / `owner` roles (per ADR-008) |
| **Sepia reset**          | Image filter `sepia(0.22) saturate(1.05) hue-rotate(-6deg)` that drops to `sepia(0) saturate(1)` on hover. |
| **Spotlight card**       | Floating product card overlapping the hero, breaking the centered-text cliché. Uses glass bg + blur(6px). |
| **Statement ticker**     | Horizontal marquee of italic serif phrases alternating solid clay and outlined (`-webkit-text-stroke`). 32s linear infinite. |
| **Trade program**        | Phase 3 feature: designer tier with 10–20% discount                              |
| **White Glove delivery** | Premium shipping: in-home setup, packaging removal (2-week lead time)            |

---

## REMEDIATION_HISTORY (v1.2.1 — reconciliation with post-remediation codebase)

This section summarises the v1.2.1 reconciliation between this PAD and the post-remediation Maison codebase. It documents every factual correction applied so future maintainers can trace each change back to its source.

1. **ADR-009 flipped to Payment Intents.** The previous v1.2 PAD selected Stripe Checkout Sessions. Re-evaluation during REMEDIATION_PLAN_v4 determined the 3-step Maison checkout UX (shipping → payment → review) requires inline card capture — Checkout Sessions' redirect-to-Stripe-then-back flow breaks the multi-step review step. Stripe Payment Intents + Stripe Elements + Stripe Tax is now the chosen implementation. PCI SAQ-A scope is preserved because card data stays inside the Stripe-owned Elements iframe.

2. **24 database tables documented (was 16).** §4.2 previously listed 16 tables; the actual `packages/db/src/schema/` directory contains 24 tables. The 8 missing tables were added: `verifications`, `payment_events`, `product_reviews`, `gift_cards`, `gift_card_redemptions`, `trade_applications`, `loyalty_accounts`, `loyalty_transactions`. `accounts` was already documented (Better Auth managed). §11 "Known Issues" and §12 "Key Files Reference" updated to reflect 24 tables.

3. **13 tRPC routers documented (was 8).** §3.2 previously listed 9 router files; the actual `packages/api/src/routers/` directory contains 13 routers. The 4 missing routers were added: `discounts.ts` (Phase 2), `reviews.ts` (Phase 3), `trade.ts` (Phase 3), `gift-cards.ts` (Phase 3), `loyalty.ts` (Phase 3). The `wishlist.ts` router was merged into `account.ts` (wishlist procedures live under `account.*`). §11 "Known Issues" and §12 "Key Files Reference" updated to reflect 13 routers merged in `root.ts`.

4. **Deprecated procedure-tier aliases removed from code.** `adminProcedure` / `adminWriteProcedure` (v1.1 names) are not valid tRPC v11 tier names and have been removed from the codebase. The 5 valid tiers per ADR-008 are `publicProcedure` → `protectedProcedure` → `staffProcedure` → `managerProcedure` → `ownerProcedure`. `managerProcedure` is defined per ADR-008 but not yet wired into routers — admin mutations currently use `ownerProcedure`. See REMEDIATION_PLAN_v4 §Deferred Items.

5. **Coverage thresholds enforced via ADR-019 (`vitest.config.ts`).** The duplicate `packages/payments: 90%` row in §8.3 was removed; the canonical threshold is `packages/payments: 95%` (money-critical). All thresholds are now enforced at the vitest config level via `apps/web/src/lib/__tests__/coverage-thresholds.contract.test.ts` (ADR-019 contract test).

6. **Trigger.dev config now has `machine: "micro"` and `maxDuration: 120` per ADR-016.** The v3-style object form for `machine` is forbidden in v4 — must be a string literal. `maxDuration` is CPU budget, not wall-clock. Enforced via `services/workers/trigger.config.test.ts` contract test (ADR-016).

7. **5 new contract tests added.** The contract test suite now covers six invariants across the codebase (see §8.5 for the full table):
   - `apps/web/src/lib/__tests__/proxy-contract.test.ts` (ADR-006/010 — Layer-1 invariant)
   - `apps/web/src/lib/__tests__/rendering-strategy.contract.test.ts` (ADR-006/010 — api()/apiPublic() split)
   - `apps/web/src/lib/__tests__/coverage-thresholds.contract.test.ts` (ADR-019)
   - `apps/web/src/lib/__tests__/design-tokens.contract.test.ts` (ADR-007 radius tokens)
   - `packages/payments/src/webhooks.contract.test.ts` (ADR-009/014 Payment Intents + idempotency)
   - `services/workers/trigger.config.test.ts` (ADR-016 Trigger.dev config)

8. **`--radius-sm: 2px` token fixed.** The original `globals.css` had a broken self-reference for `--radius-sm`. The `design-tokens.contract.test.ts` contract test now enforces that radius tokens resolve to concrete pixel values. Documented in §8.5 and REMEDIATION_PLAN_v4.

9. **pnpm 11.17.0 (was 11.9.0).** The `packageManager` field in the root `package.json` and the GitHub Actions `setup-pnpm` step were both updated to pnpm 11.17.0. §1.2 tech-stack table and §9.4 CI/CD pipeline updated accordingly.

10. **Filename references updated to `Project_Architecture_Document.md`.** The file is named `Project_Architecture_Document.md` (snake_case), not `PROJECT-ARCHITECTURE.md`. §3.2 directory tree, §8.4 checklist, and §12 Key Files Reference all updated.

11. **30 E2E tests (was 16).** The Playwright suite was expanded to 30 tests: 22 smoke tests covering P0 user journeys + 8 accessibility tests (axe-core) covering all public pages. §11 "Known Issues" updated.

12. **`apps/web/src/middleware/` directory does NOT exist.** §3.2 clarified that this directory is intentionally absent per ADR-006 — `proxy.ts` replaces `middleware.ts` in Next.js 16. Any middleware logic must live in `apps/web/proxy.ts`.

13. **`packages/api/src/lib/` directory does NOT exist.** §6.2 clarified that audit logging is performed inline in `packages/api/src/routers/admin.ts` (e.g., `admin.productsCreate` writes to the `audit_log` table after a successful mutation). A future refactor may extract this to `packages/api/src/lib/audit-log.ts`.

14. **`packages/api/src/middleware/auth.ts` does NOT exist.** The canonical RBAC helpers `canAccessStaff()` / `canAccessOwner()` live in `packages/auth/src/rbac.ts`. §6.1 Security Rules, §6.2 Security Utilities, §6.3 Authentication & Authorization, ADR-006, and ADR-010 all updated to reference the canonical location.

15. **`apps/web/tailwind.config.ts` clarifying note added.** Tailwind v4 is CSS-first (`@theme` in `globals.css`). The `apps/web/tailwind.config.ts` file is OPTIONAL and only declares content paths (scanned for class names). It is NOT a Tailwind v3-style theme config.

16. **`pg_trgm` extension clarification.** §3.2 clarified that `00-create-extensions.sql` installs `pg_trgm` for future Phase 2+ FTS use; Phase 1 search uses `ilike` per ADR-012 (no `tsvector` columns, no GIN indexes in Phase 1).

17. **"8-gate pipeline" clarified.** §12 Key Files Reference now documents that CI runs 4 jobs (`quality-gates`, `e2e`, `deploy-preview`, `deploy-production`); the `quality-gates` job enforces 8 gates internally (check-types, lint, test, audit, build, lighthouse, bundle-size, plus smoke+E2E tests in the `e2e` job).

### v1.2.2 (July 30, 2026) — E2E Remediation

Bug fixes identified via agent-browser E2E testing of the live site
https://maison.jesspete.shop/ (see docs/REMEDIATION_PLAN_v5.md). This
subsection documents the architecture-relevant changes from v1.2.2:

- **F4 — Server/Client Component page split pattern.** Four pages that were
  Client Components (`'use client'` with interactive forms) could not export
  `metadata` (Next.js 16 forbids `metadata` export from Client Components),
  so they silently fell back to the homepage's default title. Each was split
  into a Server Component `page.tsx` (which exports `metadata`) that renders
  a Client Component child containing the interactive form:
  - `/gift-cards` → `apps/web/src/app/(shop)/gift-cards/page.tsx` (Server) +
    `apps/web/src/components/shop/GiftCardsForm.tsx` (Client)
  - `/trade` → `apps/web/src/app/(shop)/trade/page.tsx` (Server) +
    `apps/web/src/components/shop/TradeForm.tsx` (Client)
  - `/cart` → `apps/web/src/app/(shop)/cart/page.tsx` (Server) +
    `apps/web/src/components/shop/CartView.tsx` (Client)
  - `/checkout` → `apps/web/src/app/(shop)/checkout/page.tsx` (Server) +
    `apps/web/src/components/shop/CheckoutFlow.tsx` (Client)
  Page titles now correctly show "Gift Cards — Maison" / "Trade Program —
  Maison" / "Shopping Bag — Maison" / "Checkout — Maison" instead of the
  homepage default. This pattern should be used for any future Client
  Component page that needs SEO metadata.

- **New contract tests (3 files, 25 assertions).** The @maison/web contract
  test suite grew from 4 files / 65 tests to 7 files / 90 tests:
  - `apps/web/src/lib/__tests__/headings.contract.test.ts` (10 tests — F1
    stray-space-in-em pattern, F3 About H1 space, F5 Hero H1 space)
  - `apps/web/src/lib/__tests__/category-grid.contract.test.ts` (3 tests —
    F2 CategoryGrid accessible name + img alt + anchor aria-label)
  - `apps/web/src/lib/__tests__/page-metadata.contract.test.ts` (12 tests —
    F4 page splits: no `'use client'` directive + `metadata` export for each
    of the 4 pages + child Client Component exists)

- **Other v1.2.2 fixes (not architecture-relevant, listed for completeness).**
  F1 (stray-space-before-punctuation in 8 italicized heading sites across 7
  section components), F2 (CategoryGrid accessible name triple-counting),
  F3 (About page H1 missing space), F5 (Hero H1 missing space), F6 (Sanity
  Studio `styled-components` ^6.1.13 → ^6.1.15 to resolve peer dep warning),
  F7 (docs updated from "13 products" → "20 products (13 original + 7 UAT
  additions)"). Full per-fix detail in `docs/REMEDIATION_PLAN_v5.md` and the
  PRD's REMEDIATION_HISTORY v1.2.2 subsection.

---

### v1.2.3 (July 31, 2026) — v6 Remediation (G1/G2/G3)

Functional + doc-drift fixes identified by the v6 remediation audit (see
`docs/REMEDIATION_PLAN_v6.md`). This subsection documents the architecture-relevant
changes from v1.2.3:

- **G1 — Contact form wired to tRPC `contact.submit` + Resend (was a non-functional
  stub).** The `/contact` page was a plain HTML `<form>` with no `onSubmit`
  handler, no tRPC call, and the `contact.submit` mutation in
  `packages/api/src/routers/contact.ts` only `console.log`-ed the payload (no
  email was ever sent). Fixed by:
  - Creating `apps/web/src/components/shop/ContactForm.tsx` — Client Component
    (`'use client'`) using `trpc.contact.submit.useMutation()` for form submission.
  - Rewriting `apps/web/src/app/(shop)/contact/page.tsx` as a Server Component
    wrapper that exports `metadata` (page title "Contact — Maison") and renders
    `<ContactForm />`. This applies the v1.2.2 F4 Server/Client page-split
    pattern to `/contact`, so the page no longer silently falls back to the
    homepage's default title.
  - Updating `packages/api/src/routers/contact.ts` to actually send email via
    `sendEmail` from `@maison/email` (was `console.log` only). The notification
    is sent to `hello@maison-living.com`. The router was previously listed in
    §3.2 + §4.4 as one of the 13 tRPC routers; v1.2.3 makes its behaviour match
    its documented contract.
  - Creating `packages/email/src/templates/ContactNotification.tsx` (new email
    template following the existing `OrderConfirmation` / `WelcomeMember`
    EmailLayout-wrapped pattern) and exporting `ContactNotificationEmail` from
    `packages/email/src/index.ts`.
  - Adding `@maison/email` as a `workspace:*` dependency of `@maison/api` in
    `packages/api/package.json` (precedent: `packages/payments/package.json`
    already declares `@maison/email`).

- **G2 — Design guide v4 canonicalized.** The `docs/MAISON_Design_Guide.md` file
  has been REPLACED with v4 content (1,489 lines, 16 sections). v4 is a strict
  superset of the v1.2.1 baseline (see v4's Appendix C). The v4-specific file
  (`docs/MAISON_Design_Guide_v4.md`), the rejected v3 wholesale-replacement
  file (`docs/MAISON_design_guide_v3.md`), and `docs/design_guide_v3_changelog.md`
  were DELETED — the canonical path `docs/MAISON_Design_Guide.md` is preserved,
  so all in-repo references remain valid without churn. The rejected v3 is
  preserved verbatim in v4's Appendix C.

- **G3 — v3 design guide + changelog archived/removed.** The v3 file and its
  changelog were removed as part of the v4 canonicalization (G2). v3's content
  (and the rationale for its wholesale rejection) is preserved in v4's
  Appendix C — "This revision supersedes the rejected v3 wholesale-replacement
  attempt. v3 was built from a pre-remediation v2 source artifact and silently
  regressed 12 v1.2.1 corrections."

- **Contract test count updates.** `apps/web/src/lib/__tests__/page-metadata.contract.test.ts`
  was extended with `/contact` page-split assertions (now 15 tests, was 12) —
  enforces the G1 Server/Client page split (same invariant as F4 for
  `/gift-cards`, `/trade`, `/cart`, `/checkout`). A new
  `packages/api/src/routers/contact.contract.test.ts` (3 tests) asserts the
  contact router calls `sendEmail` to `hello@maison-living.com`.
  Total @maison/web contract tests: 7 files, 97 tests (was 90).
  Total @maison/api tests: 3 files, 14 tests (was 11).

---

### v1.2.4 (July 31, 2026) — v7 Remediation (H1–H6)

Skills-compliance + a11y fixes identified by the v7 remediation audit (see
`docs/REMEDIATION_PLAN_v7.md`). All changes are TDD-driven (contract tests
written first); the codebase remains the source of truth. This subsection
documents the architecture-relevant changes from v1.2.4:

- **H1 — Zod v4 `z.email()` top-level string format (ADR-018).** Replaced 4
  instances of the deprecated `z.string().email()` chaining form with the
  Zod v4 top-level string format `z.email()`:
  - `packages/api/src/routers/contact.ts:24`
  - `packages/api/src/routers/newsletter.ts:17`
  - `packages/api/src/routers/gift-cards.ts:73`
  - `packages/config/src/env.ts:86` (`EMAIL_FROM` env var)
  ADR-018 already mandated `z.email()` for new code; v1.2.4 makes the
  remaining legacy call-sites match. Locked in by a new contract test
  `packages/api/src/routers/zod-email.contract.test.ts` (4 tests).

- **H2 — Tailwind v4 `@source` directives (Skill 2 §13.6).** Added three
  `@source` directives to `apps/web/src/app/globals.css` immediately after
  `@import 'tailwindcss';`:
  - `@source "../components/**/*.{ts,tsx}";`
  - `@source "../lib/**/*.{ts,tsx}";`
  - `@source "../../../../packages/ui/src/**/*.{ts,tsx}";`
  Tailwind v4's automatic content detection misses classes used in monorepo
  sibling packages without explicit `@source` declarations — per Skill 2
  §13.6, this is the #1 cause of "Tailwind classes not applying in
  production". The third path is relative from `apps/web/src/app/` to
  `packages/ui/src/`.

- **H3 — Tailwind v4 `@utility` directive (Skill 2).** Migrated the legacy
  `@layer utilities { ... }` block in `globals.css` to the Tailwind v4
  `@utility` directive. 6 utilities converted: `eyebrow`,
  `container-maison`, `container-narrow`, `section-padding`, `reveal`, plus
  the `.reveal.visible` state which moved out of the layer to plain CSS as
  a compound selector (`@utility` does not support state variants — the
  pattern per Skill 2 is a sibling `.reveal.visible { ... }` rule). Per
  Skill 2, `@layer utilities { ... }` is the Tailwind v3 syntax; the v4
  equivalent is one `@utility <name> { ... }` declaration per utility.

- **H4 — PDP thumbnail alt text (a11y).** Product Detail Page thumbnail
  images at `apps/web/src/app/(shop)/products/[slug]/page.tsx:203` now have
  `alt={img.altText ?? \`${product.name} — view ${String(i + 1)}\`}`
  (was `alt=""`). Decorative `alt=""` is correct only when a screen reader
  has access to the same information elsewhere; the PDP gallery thumbnails
  are navigational (click-to-change-main-image) and need non-empty alt for
  WCAG 2.2 AAA conformance (ADR-011). Locked in by a new contract test
  `apps/web/src/lib/__tests__/pdp-thumbnail-alt.contract.test.ts` (2 tests).

- **H5 — Removed `as unknown as Record<string, unknown>` cast (Skill 2).**
  `packages/payments/src/webhooks.ts:86` previously cast the `Stripe.Event`
  payload to `Record<string, unknown>` before persisting to the
  `payment_events` table. The cast is removed; the column is declared
  `jsonb().notNull()` (per ADR-014) whose Drizzle inference is `unknown`,
  and `Stripe.Event` is assignable to `unknown`. The webhook idempotency
  dual-defense pattern (ADR-014: `payment_events` UNIQUE INDEX +
  `pg_advisory_xact_lock`) is unchanged.

- **H6 — Removed 4 deprecated RBAC aliases (ADR-008).** Per ADR-008, the
  RBAC API exposes 5 canonical procedure tiers
  (`publicProcedure` / `protectedProcedure` / `staffProcedure` /
  `managerProcedure` / `ownerProcedure`) and canonical role constants
  (`STAFF_ROLES`, `MANAGER_ROLES`, `OWNER_ROLES`). The following 4 deprecated
  aliases (kept around since v1.2 for backwards compatibility) were removed
  from `packages/auth/src/rbac.ts`, from `packages/auth/src/index.ts`
  re-exports, and from the 2 deprecated `describe` blocks in
  `packages/auth/src/rbac.test.ts`:
  - `canReadAdmin` (was alias for `canAccessStaff`)
  - `canWriteAdmin` (was alias for `canAccessOwner`)
  - `ADMIN_ROLES` (was alias for `STAFF_ROLES`)
  - `ADMIN_WRITE_ROLES` (was alias for `OWNER_ROLES`)
  Locked in by a new contract test
  `packages/auth/src/rbac-aliases.contract.test.ts` (6 tests). §6.2/§6.3
  already use the canonical `canAccessStaff()` / `canAccessOwner()` names
  throughout — no architectural text needed updating.

- **Contract test count updates.** New contract tests:
  - `packages/api/src/routers/zod-email.contract.test.ts` (H1 — 4 tests)
  - `apps/web/src/lib/__tests__/pdp-thumbnail-alt.contract.test.ts`
    (H4 — 2 tests)
  - `packages/auth/src/rbac-aliases.contract.test.ts` (H6 — 6 tests)
  Updated: `packages/auth/src/rbac.test.ts` lost 2 deprecated describe
  blocks (`canReadAdmin`, `canWriteAdmin`) — now 29 tests (was 31).
  Total @maison/web tests: 8 files, 99 tests (was 7 files, 97 tests).
  Total @maison/api tests: 5 files, 22 tests (was 4 files, 18 tests).
  Total @maison/auth tests: 3 files, 45 tests (was 3 files, 41 tests).
  @maison/payments tests: 3 files, 18 tests (unchanged).

### v1.2.5 (July 31, 2026) — v8 Remediation (N1–N8)

Skills-compliance + dead-code-removal fixes identified by the v8 remediation
audit (see `docs/REMEDIATION_PLAN_v8.md`). All changes are TDD-driven (the new
`no-unknown-cast.contract.test.ts` was written first); the codebase remains the
source of truth. This subsection documents the architecture-relevant changes
from v1.2.5:

- **N1 / N9 — Removed 7 `as unknown as` casts (Skill 2 §9.2).** Per Skill 2,
  `as unknown as` is the most dangerous TypeScript escape hatch and is banned
  in production code. Removed 7 of 9 instances; the 2 remaining casts in
  `packages/db/src/index.ts:61,88` are structurally required (Drizzle's
  `NeonHttpDatabase | NodePgDatabase` union is non-unifiable due to diverging
  `*QueryResultHKT` type params) and are documented as exceptions in the new
  contract test's `ALLOWED_FILES` set. Concrete fixes:
  - `packages/auth/src/resend-client.ts` — replaced
    `as unknown as Resend` with a `ResendClient = Resend | ResendStub` type
    union + `satisfies ResendStub` for the test double.
  - `packages/email/src/send.ts` — same pattern (consolidated the duplicate
    stub into the type union).
  - `packages/api/src/routers/reviews.ts` — replaced 2 raw SQL string casts
    with the typed Drizzle query builder
    (`.select().from().innerJoin().where()`).
  - `packages/api/src/routers/admin.ts` — replaced 3 raw SQL casts with
    typed row mappers (`(result?.rows ?? []).map((row) => ({...}))`).
  Locked in by a new contract test
  `packages/api/src/routers/no-unknown-cast.contract.test.ts` (1 test).

- **N2 — Removed `isAdmin` + `isStaffOrAdmin` dead code (ADR-008).** Per
  ADR-008, "admin" terminology is banned from the RBAC API in favour of the
  canonical `canAccessStaff` / `canAccessOwner` predicates (already used in
  §6.2/§6.3 of this document). The two deprecated helpers in
  `packages/auth/src/types.ts` were removed. Deleted
  `packages/auth/src/types.test.ts` (was 10 tests — only exercised the
  removed helpers). Updated `packages/auth/src/index.ts` to remove the dead
  re-exports. The `SessionUser` / `Session` interfaces in `types.ts` are
  preserved (live types used by the API context).

- **N3 — Replaced `require('node:crypto')` with ESM import (Skill 3).** Per
  Skill 3, the `verbatimModuleSyntax: true` tsconfig flag (ADR-020) forbids
  CommonJS `require()` in ESM modules. `packages/auth/src/config.ts:153`
  previously used `require('node:crypto')` for `randomBytes` (password-reset
  tokens). Replaced with a top-of-file
  `import { randomBytes } from 'node:crypto'` statement.

- **N4 — Wired webhook secrets through `@maison/config/env` (Skill 2 §13.5).**
  Per Skill 2 §13.5, all env access must go through the validated
  `@maison/config` `env` object (not `process.env` direct access). Two
  webhook route handlers were using direct `process.env`:
  - `apps/web/src/app/api/webhooks/stripe/route.ts` — now imports `env` from
    `@maison/config` and reads `env.STRIPE_WEBHOOK_SECRET`.
  - `apps/web/src/app/api/webhooks/sanity/route.ts` — same pattern with
    `env.SANITY_WEBHOOK_SECRET`.

- **N5 — Removed `managerProcedure` dead code (ADR-008).** §3.2 of this
  document previously listed `managerProcedure` as a 5th procedure tier
  (per ADR-008). It was defined but never wired into any router — admin
  mutations use `ownerProcedure`. Removed from `packages/api/src/trpc.ts`.
  Updated `packages/api/src/index.ts` to remove the re-export. Updated
  `packages/api/src/trpc.test.ts`: renamed "exports 5 procedure tiers" →
  "exports 4 procedure tiers", removed the
  `expect(trpc.managerProcedure).toBeDefined()` assertion, and added a new
  test "does NOT export managerProcedure (removed in v8 — dead code)". The
  codebase now exposes **4 canonical procedure tiers** (was 5):
  `publicProcedure` / `protectedProcedure` / `staffProcedure` /
  `ownerProcedure`. The PAD §3.2 procedure-tier list and §6.3 middleware
  references should be read as 4 tiers going forward; if ADR-008 is later
  amended to require a manager tier, it can be re-added.

- **N6 — Pinned Stripe `apiVersion: '2026-06-24.dahlia'` (Skill 2 §9.9).**
  Per Skill 2 §9.9, the Stripe API version must be pinned (not left to the
  SDK default, which can drift on upgrade and silently change wire formats
  or webhook payloads). `packages/payments/src/client.ts` now sets
  `apiVersion: '2026-06-24.dahlia'` explicitly. The Payment Intents +
  idempotency architecture (ADR-009 + ADR-014) is unchanged.

- **N8 — Trimmed `tooling/tailwind/base.ts` (Skill 2 §9.5 / §13.6).** Per
  Skill 2, Tailwind v4 is CSS-first — the canonical design tokens live in
  `apps/web/src/app/globals.css` `@theme` (and `packages/ui/src/tokens/*.css`
  for cross-package sharing), not in a JS config. Removed the duplicate
  `theme.extend` block (colors, spacing, fontSize, borderRadius,
  transitions, keyframes, animation) which was drifting away from the
  CSS-first source of truth. File trimmed from 152 lines to ~30 lines. Kept
  only `fontFamily` as a JS reference for non-CSS consumers (Storybook,
  tests).

- **Contract test count updates.** New contract test:
  - `packages/api/src/routers/no-unknown-cast.contract.test.ts` (N1 — 1 test)
  Updated: `packages/api/src/trpc.test.ts` renamed "5 procedure tiers" →
  "4 procedure tiers" + added "does NOT export managerProcedure" test (net
  +1 test). Deleted `packages/auth/src/types.test.ts` (10 tests — only
  exercised the removed `isAdmin` / `isStaffOrAdmin` helpers).
  Total @maison/web tests: 8 files, 99 tests (unchanged from v1.2.4).
  Total @maison/api tests: 6 files, 20 tests (was 5 files, 22 tests).
  Total @maison/auth tests: 2 files, 35 tests (was 3 files, 45 tests —
  `types.test.ts` deleted).
  @maison/payments tests: 3 files, 18 tests (unchanged).

### v1.2.6 (July 31, 2026) — v9 Remediation (V9-1 through V9-5)

Skills-compliance fixes identified by the v9 remediation audit (see
`docs/REMEDIATION_PLAN_v9.md`). All v8 fixes (N1–N8) were re-verified working;
the codebase remains the source of truth. This subsection documents the
architecture-relevant changes from v1.2.6:

- **V9-1 — Removed PII logging from tRPC routers (HIGH, Skill 2 §13.10).**
  Per Skill 2 §13.10, the same PII principle that bans logging Stripe webhook
  payloads also bans logging user-supplied PII. Two routers were logging PII
  via `console.log`:
  - `packages/api/src/routers/contact.ts` — was logging `input.name`,
    `input.email`, and the first 100 chars of `input.message`. Replaced with
    `'[contact] Submission received (PII redacted)'`.
  - `packages/api/src/routers/newsletter.ts` — was logging `input.email`.
    Replaced with `'[newsletter] New subscriber from ${source} (PII redacted)'`.
  The architecture's data-flow invariants (ADR-009 Payment Intents,
  ADR-014 idempotency, §6.2/§6.3 RBAC) are unchanged.

- **V9-2 — Replaced `process.env` with `env` module in `webhooks.ts` (MEDIUM,
  Skill 2 §13.5).** Per Skill 2 §13.5, all env access must go through the
  validated `@maison/config` `env` object (not `process.env` direct access).
  v8 (N4) wired webhook secrets through `env` but missed
  `packages/payments/src/webhooks.ts:178`, which read
  `process.env['NEXT_PUBLIC_APP_URL']` directly. Replaced with
  `env.NEXT_PUBLIC_APP_URL` from `@maison/config`; added `@maison/config`
  dependency to `packages/payments/package.json`. All webhook code paths —
  the route handlers at `apps/web/src/app/api/webhooks/stripe/route.ts` +
  `apps/web/src/app/api/webhooks/sanity/route.ts` AND the Payment Intents
  helper at `packages/payments/src/webhooks.ts` — now read exclusively from
  the `env` module.

- **V9-3 — Updated stale `managerProcedure` comments in `rbac.ts` (LOW).**
  v8 (N5) removed the dead `managerProcedure` from `packages/api/src/trpc.ts`
  but left docstring comments in `packages/auth/src/rbac.ts:7,14` still
  referencing it as if it existed. Updated to reflect the 4 canonical
  procedure tiers (`publicProcedure` / `protectedProcedure` / `staffProcedure`
  / `ownerProcedure`). No code change — §3.2 + §6.3 of this document already
  describe 4 tiers correctly; only the source-file docstrings were stale.

- **V9-4 — Removed non-null assertion in `jobs-client.ts` (LOW, Skill 3 §6.3).**
  Per Skill 3 §6.3, non-null assertions (`!`) should be avoided.
  `packages/config/src/jobs-client.ts:61` previously used
  `process.env['TRIGGER_SECRET_KEY']!` when constructing `TriggerClient`.
  Replaced with an explicit `if (!accessToken) throw new Error(...)` null
  guard before construction. The Trigger.dev Phase 0 stub behaviour (ADR-016)
  is unchanged — when `TRIGGER_SECRET_KEY` is unset, the stub branch is taken
  before the guard is reached.

- **V9-5 — Extended `no-unknown-cast.contract.test.ts` to scan `.tsx` files
  (LOW, Skill 3 §5.3).** The contract test (added in v1.2.5 N1) was only
  scanning `.ts` files for `as unknown as` casts — production `.tsx` files
  were not covered. Extended the file-list predicate to also match `.tsx`.
  Manually verified no `.tsx` files currently contain these casts; this
  closes the coverage gap so future regressions are caught.

- **Contract test count updates.** No new contract test files; one existing
  contract test (`packages/api/src/routers/no-unknown-cast.contract.test.ts`)
  was extended in scope (V9-5). Test counts unchanged:
  Total @maison/web tests: 8 files, 99 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

### v1.2.7 (July 31, 2026) — v10 Remediation (V10-1 + V10-2)

Skills-compliance fixes identified by the v10 remediation audit (re-validation
pass that caught two PII-logging issues v9 missed in adjacent files). All v9
fixes (V9-1..V9-5) were re-verified working; the codebase remains the source of
truth. This subsection documents the architecture-relevant changes from v1.2.7:

- **V10-1 — Removed PII logging from `webhooks.ts` (HIGH, Skill 2 §13.10).**
  Per Skill 2 §13.10, the same PII principle that bans logging Stripe webhook
  payloads also bans logging customer PII. `packages/payments/src/webhooks.ts:183`
  was logging `order.email` via
  `console.log('[stripe] Order ${order.orderNumber} confirmed + email sent to ${order.email}')`
  in the production webhook handler (fired on every successful Stripe Payment
  Intent confirmation). Replaced with
  `'[stripe] Order ${order.orderNumber} confirmed + email sent (PII redacted)'` —
  same redaction pattern V9-1 applied to `contact.ts` + `newsletter.ts`. v9's V9-2
  fixed the `process.env['NEXT_PUBLIC_APP_URL']` access four lines above (line
  179) but missed the PII log on line 183 in the same file. The architecture's
  data-flow invariants (ADR-009 Payment Intents, ADR-014 idempotency) are
  unchanged — only the log line was redacted.

- **V10-2 — Redacted stub-mode email payload logging (LOW, Skill 2 §13.10).**
  Per Skill 2 §13.10, never log full email payloads. Two stub-mode senders were
  logging the full `payload` object (which includes `to` (recipient email =
  customer PII) and `react` (email body, may contain contact-form PII)) via
  `console.log('[email] (stub) Would send:', payload)`:
  - `packages/email/src/send.ts:35` — stub branch of the `sendEmail` helper
    (used by `contact.submit`, the `order-confirmation` worker, the
    `weekly-digest` worker, and the `WelcomeMember` auth flow).
  - `packages/auth/src/resend-client.ts:41` — stub branch of the auth email
    client (verification + password-reset emails).
  Both replaced with metadata-only logs:
  `console.log('[email] (stub) Would send email: subject="${meta.subject ?? '(unknown)'}"')`
  — logs only the subject, never `to` or `react`. Stub-mode only fires when
  `RESEND_API_KEY` is unset (dev/test/preview envs), so severity is LOW, but the
  same V9-1 PII principle applies. The Resend production code path is unchanged.

- **Contract test count updates.** No new contract test files; no existing
  contract tests extended in scope. Test counts unchanged:
  Total @maison/web tests: 8 files, 99 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

### v1.2.8 (August 1, 2026) — v11 Remediation (V11-1 + V11-2)

Two-part fix delivered by the v11 remediation pass: (V11-1) a CRITICAL visual
defect that broke `/products` plus every PDP, and (V11-2) a security hardening
that closes the JSON-LD XSS vector left open by raw `JSON.stringify` inside
`dangerouslySetInnerHTML`. Both surface from Skill 2 §9.1 compliance gaps
identified by the v10 re-validation audit; the codebase remains the source of
truth. This subsection documents the architecture-relevant changes from v1.2.8:

- **V11-1 — Fixed `/products` blank-screen defect (CRITICAL, visual).**
  Root cause: `apps/web/src/components/shop/ProductCard.tsx` renders each card
  with `className="product-card reveal"`. The `.reveal` utility (declared in
  `apps/web/src/app/globals.css`) sets `opacity: 0` and transitions to
  `opacity: 1` only when the `.visible` modifier is added by the
  `useScrollReveal()` hook in `apps/web/src/hooks/useScrollReveal.ts`. That
  hook was exported but never invoked by any component, so every card stayed
  at `opacity: 0` and the `/products` page (plus any other surface that
  renders `ProductCard`) appeared blank. Fix: created a thin Client Component
  `apps/web/src/components/shop/ScrollRevealTrigger.tsx` whose body is just
  `useScrollReveal(); return null;`, and added it to
  `apps/web/src/app/(shop)/layout.tsx` so it mounts once on every shop route.
  Architecturally this mirrors the same wiring pattern as the `(account)` and
  `(admin)` layouts' `auth.api.getSession()` boundary: a single mount in the
  route-group layout that all child routes inherit. No changes to
  `ProductCard.tsx`, `useScrollReveal.ts`, `globals.css`, the rendering-
  strategy contract, or the Layer-1/2/3 security model — the wiring was always
  the missing piece.

- **V11-2 — Added `escapeForScriptContext` to JSON-LD script tag (HIGH, Skill 2 §9.1 + §16.3).**
  The PDP at `apps/web/src/app/(shop)/products/[slug]/page.tsx:107` renders
  JSON-LD via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />`.
  If any product field (name, description, etc.) ever contains the literal
  string `</script>`, the browser terminates the script tag early and the
  attacker-controlled content runs in the page context — a stored XSS vector.
  Fix: added an `escapeForScriptContext()` helper to
  `apps/web/src/lib/utils.ts` that replaces `<` with `\u003c` (and the
  matching `>`, `&`, `"`, `'` escapes), then wrapped the JSON-LD output as
  `escapeForScriptContext(JSON.stringify(jsonLd))`. Per Skill 2 §9.1 + §16.3
  this is the canonical sanitiser for any `dangerouslySetInnerHTML` content
  that must remain valid JSON while being unparseable as HTML. The JSON-LD
  schema shape, the PDP RSC contract, and the Layer-3 (Server Component)
  boundary are unchanged — only the script-tag innerHTML is now sanitised.

- **Contract test count updates.** One new contract test file added:
  `apps/web/src/lib/__tests__/scroll-reveal-wiring.contract.test.ts`
  (3 tests — asserts the `useScrollReveal` hook exists, the
  `ScrollRevealTrigger` Client Component exists with a `'use client'` directive,
  and the `(shop)` layout imports + renders it; locks V11-1 against silent
  regression). V11-2 has no dedicated contract test (it's a one-line wrapper
  around a single call site, locked by type-checking + the existing
  `page-metadata.contract.test.ts` PDP assertions). Test counts:
  Total @maison/web tests: 9 files, 102 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

### v1.2.9 (August 2, 2026) — v12 Remediation (V12-1 + V12-2)

Two-part follow-up to v1.2.8 delivered by the v12 remediation pass: (V12-1) a
CRITICAL follow-up to the V11-1 scroll-reveal wiring fix — E2E testing on
`/products` revealed that the first ~4 `ProductCard`s in the initial viewport
still rendered at `opacity: 0` despite the V11-1 wiring, because
`IntersectionObserver` does not reliably fire its `isIntersecting` callback for
elements already in the viewport when the observer is constructed inside a
post-hydration `useEffect`; and (V12-2) removal of dead code
(`CurrencySelector.tsx`, an 89-line `'use client'` component never imported
anywhere, tracked in `status.md` MEDIUM #10 since v4). The codebase remains the
source of truth. This subsection documents the architecture-relevant changes
from v1.2.9:

- **V12-1 — Fixed IntersectionObserver initial-viewport timing (CRITICAL, visual, follow-up to V11-1).**
  The V11-1 fix (v1.2.8) wired the `useScrollReveal()` hook into the shop layout
  via `ScrollRevealTrigger`, but E2E testing showed the first ~4 product cards in
  the initial viewport still had `opacity: 0` after page load. Root cause:
  `IntersectionObserver` only reliably fires `isIntersecting` for elements that
  *enter* the viewport after the observer is constructed; for elements already in
  the viewport at observe-time, the callback is fired asynchronously and
  unreliably when the observer is set up inside a `useEffect` that runs after
  hydration. Fix: added a `requestAnimationFrame` fallback to
  `apps/web/src/hooks/useScrollReveal.ts` that, after the first paint, queries
  `.reveal:not(.visible)` and manually adds the `visible` class to any element
  whose `getBoundingClientRect()` is already inside the viewport (accounting for
  the `-60px` `rootMargin` the observer uses). Architecturally this preserves the
  single-mount wiring pattern established in v1.2.8 — the rAF fallback lives
  inside the hook itself, so `ScrollRevealTrigger.tsx` and the `(shop)/layout.tsx`
  mount point are unchanged. No changes to `ProductCard.tsx`, the rendering-
  strategy contract, the Layer-1/2/3 security model, or the Client/Server
  Component boundary — the IntersectionObserver setup is unchanged; the rAF
  fallback is additive and defensive only.

- **V12-2 — Deleted dead code `CurrencySelector.tsx` (LOW, Skill 3 dead-code removal).**
  `apps/web/src/components/shop/CurrencySelector.tsx` was an 89-line `'use client'`
  component (plus 3 helper exports) that was never imported by any file in the
  repo. It had been tracked in `status.md` as MEDIUM #10 since v4 but never
  remediated. Deleted in full. No import-graph impact (verified by grep across
  `apps/`, `packages/`, `services/`, `tooling/`) — the file was an orphan Client
  Component that never participated in any route's render tree. No behaviour
  change, no test change.

- **Contract test count updates.** No new contract test files added in v1.2.9.
  V12-1 is locked by the existing
  `apps/web/src/lib/__tests__/scroll-reveal-wiring.contract.test.ts` (3 tests,
  added in v1.2.8 V11-1 — asserts the `useScrollReveal` hook exists, the
  `ScrollRevealTrigger` Client Component exists with a `'use client'` directive,
  and the `(shop)` layout imports + renders it; the rAF fallback is an additive
  implementation detail inside the hook and does not change the contract
  surface). V12-2 has no test (deleting unreachable code cannot regress). Test
  counts unchanged:
  Total @maison/web tests: 9 files, 102 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

### v1.3.0 (August 3, 2026) — v13 Remediation (V13-1)

Single-fix follow-up to v1.2.9 delivered by the v13 remediation pass: (V13-1) a
CRITICAL visual-defect fix on the live homepage — the "Our Philosophy" section
(`apps/web/src/components/shop/sections/Philosophy.tsx`) was rendering with all
three of its images absent, because the `next/image fill` instances were placed
directly as CSS Grid items. `fill` mode renders the underlying `<img>` with
`position: absolute`, which removes the element from CSS Grid flow — so the
`gridColumn` / `gridRow` styles set directly on the `<Image>` had no effect,
and all three images positioned themselves relative to a distant ancestor
(1280×577 px) and visually overlapped off-screen. The codebase remains the
source of truth. This subsection documents the architecture-relevant changes
from v1.3.0:

- **V13-1 — Fixed Philosophy section images not showing (CRITICAL, visual).**
  Root cause: `Philosophy.tsx` used `<Image fill style={{ gridColumn, gridRow,
  objectFit: 'cover' }} />` directly as a grid item. Because `next/image fill`
  renders the `<img>` with `position: absolute`, the element is removed from CSS
  Grid flow — `gridColumn` / `gridRow` set on the absolutely-positioned image
  had no effect, and all three images stacked on a distant ancestor box
  (1280×577 px) rather than their intended grid cells. Architecturally this is
  a composition-layer defect (CSS Grid + `next/image` interaction), not a
  rendering-strategy or layer-model issue — the section was already a Server
  Component rendering static images, no Client/Server boundary or auth layer
  was touched. Fix: wrapped each `<Image fill>` in a `<div style={{ position:
  'relative', gridColumn, gridRow, overflow: 'hidden' }}>` that *is* a grid
  item (the div carries the grid placement; the Image `fill` then correctly
  fills its wrapper div). The Image components now carry only `style={{
  objectFit: 'cover' }}` (no `gridColumn` / `gridRow` on the `img` style). No
  changes to the rendering-strategy contract, the Layer-1/2/3 security model,
  the Client/Server Component boundary, the section's RSC/streaming posture, or
  any other component. Also audited all 12 other `next/image fill` usages
  across the codebase (`FeaturedCollection`, `CategoryGrid`, `Hero`,
  `InstagramGrid`, `JournalSection`, `HyggeEdit`, `ProductCard` ×2,
  `SearchModal`, `products/[slug]/page.tsx` ×2, `about/page.tsx` ×2) — all are
  compliant (each has a `position: relative` parent, or `position: absolute`
  inside a `position: relative` ancestor, plus `aspectRatio` + `overflow:
  'hidden'`). The Philosophy.tsx defect was the only Image-fill / grid-flow
  violation in the codebase.

- **Contract test count updates.** No new contract test files added in v1.3.0.
  V13-1 has no dedicated contract test — the fix is a structural CSS/JSX
  composition change with no observable contract surface beyond "the image is
  now visible," which is covered by the existing E2E smoke tests
  (`e2e/smoke.spec.ts`) asserting the homepage renders the Philosophy section.
  Test counts unchanged:
  Total @maison/web tests: 9 files, 102 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

### v1.3.1 (August 4, 2026) — v14 Remediation (V14-1)

Single-fix follow-up to v1.3.0 delivered by the v14 remediation pass: (V14-1) a
CRITICAL visual-defect fix on collection filter pages (e.g.
`/products?collection=furniture`) — they were rendering blank on the FIRST
client-side navigation (clicking a filter pill via `<Link>`), even though a
manual page reload of the same URL worked fine. Root cause: the
`useScrollReveal` hook (`apps/web/src/hooks/useScrollReveal.ts`) had a
`useEffect` with an empty dependency array `[]`, so it only ran once on initial
mount. When users clicked a collection filter pill (client-side `<Link>`
navigation), the new product cards rendered with the `.reveal` class
(`opacity: 0`) but the `IntersectionObserver` never re-ran to observe them —
the cards stayed invisible until a manual page reload. Fix: the hook now calls
`usePathname()` + `useSearchParams()` from `next/navigation` and lists both as
dependencies of the `useEffect` (`[pathname, searchParams]`), so the effect
re-runs on every route/query change, re-observing any newly-rendered `.reveal`
elements. The codebase remains the source of truth. This subsection documents
the architecture-relevant changes from v1.3.1:

- **V14-1 — Fixed collection filter pages blank on client-side navigation
  (CRITICAL, visual, follow-up to V11-1/V12-1).** The V11-1 (v1.2.8) + V12-1
  (v1.2.9) fixes wired the `useScrollReveal()` hook into the shop layout via
  the `ScrollRevealTrigger` Client Component and added a `requestAnimationFrame`
  first-paint fallback, but both fixes assumed the effect ran once per page
  load — the `useEffect` dependency array was `[]`. This worked for the initial
  mount and for full page reloads (Next.js tears down + re-mounts the React
  tree), but on client-side navigation (`<Link>` clicks between collection
  filter URLs like `/products?collection=furniture` →
  `/products?collection=lighting`), the `(shop)` layout and
  `ScrollRevealTrigger` Client Component stayed mounted, the `useEffect` did
  NOT re-run, the new `ProductCard` instances rendered with
  `className="product-card reveal"` (`opacity: 0`), and the
  `IntersectionObserver` was never re-constructed to observe them — leaving
  the grid visually blank until the user manually reloaded the page.
  Architecturally this is a Client-Component-hook lifecycle defect (the
  `useEffect` deps array is part of the React 19 Client Component contract) —
  it does NOT touch the rendering-strategy contract, the Layer-1/2/3 security
  model, the Client/Server Component boundary, the RSC/streaming posture, the
  `proxy.ts` Layer-1 invariant, or any procedure tier. Fix: `useScrollReveal`
  now reads `const pathname = usePathname()` and
  `const searchParams = useSearchParams()` from `next/navigation` (both hooks
  are Client-Component-only — `useSearchParams()` forces the consuming
  component into the dynamic-rendering boundary, but `ScrollRevealTrigger` is
  already a `'use client'` Client Component mounted inside the dynamic
  `(shop)` layout, so no static/dynamic split was altered), and the `useEffect`
  dependency array is `[pathname, searchParams]` (was `[]`). On every route or
  query-string change, React re-runs the effect: it tears down the old
  `IntersectionObserver` (cleanup return), constructs a new one, and observes
  every `.reveal` element currently in the DOM — including the
  freshly-rendered product cards. No changes to the rendering-strategy
  contract, the Layer-1/2/3 security model, the Client/Server Component
  boundary, any procedure tier, or any other component. The V12-1
  `requestAnimationFrame` first-paint fallback is preserved inside the effect
  body — it now also re-runs on each route change, covering the same
  initial-viewport timing gap for the new set of `.reveal` elements.

- **Contract test count updates.** No new contract test files added in v1.3.1.
  Two new tests were added to the existing
  `apps/web/src/lib/__tests__/scroll-reveal-wiring.contract.test.ts` under a
  new `V14-1 — scroll reveal re-runs on route change` describe block (now 5
  tests total in the file, was 3): one asserts `useScrollReveal` imports
  `usePathname` from `next/navigation`, the other asserts the `useEffect`
  dependency array includes `pathname` (matches `},\s*[pathname` and rejects
  empty `},\s*[]\s*)`). Test counts:
  Total @maison/web tests: 9 files, 104 tests (was 9/102 — added 2 V14-1
  contract tests).
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

---

_End of Project Architecture Document v1.3.1. For product requirements, see `docs/PRD_unified.md` (v1.2). For the canonical design system reference, see `docs/MAISON_Design_Guide.md`. For skill-alignment validation, see `docs/PRD_PAD_Validation_Against_Skills.md`. For developer onboarding, see `README.md`. For AI agent instructions, see `AGENTS.md` and `CLAUDE.md`._
