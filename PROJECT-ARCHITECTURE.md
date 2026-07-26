# MAISON — Master Project Architecture Document (PAD) v1.0

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION-LOCKED BLUEPRINT
**Companion Document:** [`docs/PRD_unified.md`](./docs/PRD_unified.md)
**Last Updated:** 2026-07-26
**Audience:** Senior Engineers, Tech Leads, DevOps, and Onboarding Engineers
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

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

---

## 1. System Overview & Decisions

### 1.1 Document Metadata & Purpose

This PAD is the **single source of truth** for the Maison platform's engineering architecture. It complements the PRD (which defines *what* to build) by defining *how* to build it — every technology choice, every layer boundary, every security rule, every operational procedure.

**How to use this document:**

| If you are… | Read these sections first |
|-------------|---------------------------|
| A new engineer onboarding | §1, §3, §10 (Developer Handbook) |
| Debugging a production issue | §2 (Topology), §6 (Security), §9 (Build/Deploy), §11 (Known Issues) |
| Reviewing a tech choice | §1.3 (ADRs) — every decision has Context, Rationale, Consequences, Alternatives |
| Adding a new feature | §3 (Layer Model), §4 (Data), §5 (Design System), §8 (Testing) |
| An AI coding agent | This PAD + `AGENTS.md` + `CLAUDE.md` before touching any file |

### 1.2 Technology Stack Summary

| Layer | Technology | Pinned Version | Key Rationale |
|-------|-----------|----------------|---------------|
| Monorepo tooling | Turborepo | ≥2.10.4 | Task orchestration, caching, incremental builds; proven in Stillwater (651 tests, 11 ADRs) |
| Package manager | pnpm | 11.9.0 (`packageManager` field) | Workspace protocol, supply-chain guardrails (`minimumReleaseAge: 1440`) |
| Runtime | Node.js | ≥22.0.0 | LTS required by Next.js 16; ESM-first |
| Meta-framework | Next.js | 16.2.x | App Router, RSC, `proxy.ts` (replaces `middleware.ts`), Turbopack, async params |
| UI runtime | React | 19.2.x | React Compiler, `use()` hook, ref-as-prop (no `forwardRef`) |
| Language | TypeScript | 5.9.x | Strict mode, `noUnusedLocals`, `erasableSyntaxOnly` |
| Styling | Tailwind CSS | v4.3.x | CSS-first `@theme` config (no `tailwind.config.js`), `@tailwindcss/postcss` |
| API layer | tRPC | v11.18.x | End-to-end type safety, server-side caller for RSC, React Query integration |
| ORM | Drizzle ORM | 0.45.x | Type-safe SQL, migration system, no runtime overhead, edge-runtime compatible |
| Database | PostgreSQL | 17 (Neon prod / Docker dev) | Relational integrity, JSONB for flexible content, FTS for Phase 1 search |
| Authentication | Better Auth | 1.6.23 | Replaces Auth.js v5 — better OAuth, magic links, session control, simpler config |
| Payments | Stripe | 22.3.x (Dahlia) | Payment Intents, Checkout, Webhooks, Stripe Tax, Apple/Google Pay |
| Background jobs | Trigger.dev | v4 | Webhook processing, abandoned cart emails, digest emails |
| CMS | Sanity | v6 Studio + v7 client | Headless, real-time, Live Preview, GROQ queries, Next.js integration |
| Email | Resend + React Email | 6.17 / 6.6 | Transactional emails, type-safe templates |
| Image CDN | Cloudflare Images + R2 | — | On-the-fly optimization, AVIF/WebP, cost-effective storage |
| Error tracking | Sentry | 10.63.x | Next.js integration, source maps, performance monitoring |
| Analytics | PostHog | 1.396.x | Privacy-friendly, session replay, feature flags |
| Logging | Axiom | — | Structured logs, OpenTelemetry-compatible |
| Hosting | Vercel | — | Next.js optimised, Edge functions, ISR |
| Database hosting | Neon | — | Serverless Postgres, branching, point-in-time recovery |
| Rate limiting | Upstash Redis | — | Serverless Redis, sliding window, fail-open pattern |

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
  - *Single Next.js app* — couples CMS admin with storefront; can't share code with Trigger.dev workers
  - *Nx* — heavier, more opinionated; Turborepo is lighter and sufficient for this scope
  - *Separate repos* — breaks type safety, complicates CI, requires manual version publishing

#### ADR-002: Better Auth over Auth.js v5

- **Context:** Authentication requires email/password, OAuth (Google, Apple), magic links, session management, and RBAC (`customer`/`staff`/`admin`). Auth.js (formerly NextAuth) v5 is the incumbent, but has known issues with OAuth reliability and session revocation.
- **Decision:** Use Better Auth 1.6.23. Config in `packages/auth/src/config.ts`. Sessions stored in PostgreSQL (`sessions` table), not JWTs.
- **Rationale:** Better Auth has a simpler mental model (no JWT complexity), built-in magic links (Auth.js requires custom provider), and database-backed sessions (enables instant revocation — critical for admin security). The Stillwater codebase migrated from Auth.js v5 to Better Auth and documented 7 specific pain points that Better Auth resolves (see `skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md`).
- **Consequences:**
  - ✅ Instant session revocation (delete row from `sessions`)
  - ✅ Built-in magic links, email verification
  - ✅ Simpler OAuth config (no separate provider definitions)
  - ❌ Smaller community than Auth.js (fewer Stack Overflow answers)
  - ❌ Newer project (less battle-tested at scale)
- **Alternatives Rejected:**
  - *Auth.js v5* — JWT-based sessions complicate revocation; magic links require custom provider; Stillwater migration documented 7 pain points
  - *Clerk* — hosted, adds vendor lock-in, less control over data residency
  - *Supabase Auth* — couples auth with database choice; we want Neon, not Supabase Postgres

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
  - *REST + OpenAPI codegen* — codegen step is fragile; type drift between server and client
  - *GraphQL* — schema/resolver overhead; Apollo client bundle is heavy; overkill for a single-team app
  - *Next.js Server Actions only* — no client-side mutations without manual fetch; doesn't integrate with React Query caching

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
  - *Prisma* — Rust binary adds CI weight; generated code in `node_modules` is opaque; edge-runtime support is incomplete
  - *Raw SQL with `pg`* — no type safety; too easy to introduce SQL injection
  - *Kysely* — query builder, not an ORM; no migration system

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
  - *Strapi* — self-hosted (adds ops); UI is less polished; real-time preview is weaker
  - *Contentful* — enterprise pricing; less flexible content modelling
  - *Payload CMS* — newer, smaller community; Next.js integration less mature

#### ADR-006: `proxy.ts` over `middleware.ts`

- **Context:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and made it support async. The rename signals that it's now a full proxy (can rewrite, modify headers, check auth) not just middleware.
- **Decision:** Use `proxy.ts` at `apps/web/proxy.ts`. Use it for: auth checks (redirect to `/auth/sign-in` if unauthenticated on `/account/*` or `/admin/*`), locale detection (Phase 2), security headers (CSP, HSTS, X-Frame-Options).
- **Rationale:** Next.js 16 breaking change — `middleware.ts` is deprecated. The new name reflects the expanded scope. Async support enables DB-backed auth checks (Better Auth session validation).
- **Consequences:**
  - ✅ Async support (DB-backed auth)
  - ✅ Clearer naming (it's a proxy, not middleware)
  - ❌ Confusing for engineers familiar with Next.js 15 (mitigation: documented in `AGENTS.md` + `CLAUDE.md`)
- **Alternatives Rejected:**
  - *`middleware.ts`* — deprecated in Next.js 16; will be removed in 17

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
  - *Google Fonts CDN* — privacy concern, DNS lookup, render-blocking
  - *Fontsource* — convenient but adds a dependency; self-hosting is simpler for a fixed font set

---

## 2. High-Level System Topology

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                     CLIENT                                       │
│  Browser (Chrome / Safari / Firefox / Edge)                                       │
│  ├─ Next.js 16 RSC (Server Components render on Vercel Edge)                     │
│  ├─ Client Components (hydrated, minimal JS)                                      │
│  └─ Stripe Elements (card capture, Apple Pay, Google Pay)                        │
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
│   │   │   │   ├── (admin)/                 # Route group: admin (RBAC: staff/admin)
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
│   │   │   └── middleware/                  # (Empty — use proxy.ts instead)
│   │   ├── proxy.ts                         # ← AUTH + SECURITY (Next.js 16, replaces middleware.ts)
│   │   ├── next.config.ts                   # CSP headers, image domains, webpack → Turbopack
│   │   ├── tailwind.config.ts               # Minimal (v4 is CSS-first; this just sets content paths)
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
│   │   │   │   ├── index.ts                 # Main seed (8 collections, 13 products)
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
│   │   │   ├── routers/                     # One file per router
│   │   │   │   ├── products.ts
│   │   │   │   ├── collections.ts
│   │   │   │   ├── cart.ts
│   │   │   │   ├── checkout.ts
│   │   │   │   ├── account.ts
│   │   │   │   ├── wishlist.ts
│   │   │   │   ├── newsletter.ts
│   │   │   │   ├── contact.ts
│   │   │   │   └── admin.ts                 # All admin.* procedures
│   │   │   ├── middleware/
│   │   │   │   ├── rateLimit.ts             # Upstash Redis, fail-open
│   │   │   │   └── auth.ts                  # Session + RBAC checks
│   │   │   ├── lib/
│   │   │   │   └── ilike.ts                 # Case-insensitive LIKE helper
│   │   │   ├── trpc.ts                      # tRPC init (context, procedures)
│   │   │   ├── context.ts                   # tRPC context (session, db, req)
│   │   │   ├── root.ts                      # Root router (appRouter)
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
│           └── 00-create-extensions.sql     # pgcrypto, pg_trgm (for FTS)
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
│   ├── landing_page_unified.html            # ← Canonical visual reference
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
└── PROJECT-ARCHITECTURE.md                  # ← You are here
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
import { stripe } from "@maison/payments";
import { db } from "@maison/db";
import { orders } from "@maison/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Idempotency: Stripe retries webhooks. The orders table has a UNIQUE
  // constraint on stripe_idempotency_key. If we already processed this,
  // the INSERT throws — we catch it and return 200 (don't retry).
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    try {
      await db
        .update(orders)
        .set({ status: "confirmed", stripe_payment_intent_id: paymentIntent.id })
        .where(eq(orders.stripe_idempotency_key, event.idempotency_key ?? ""));
    } catch (e) {
      // Already processed — return 200 so Stripe stops retrying
      if (e instanceof Error && e.message.includes("unique")) {
        return new Response("OK (duplicate)", { status: 200 });
      }
      throw e;
    }
  }

  return new Response("OK", { status: 200 });
}
```

**Why this pattern:** Stripe retries webhooks up to 3 times if it doesn't receive a 200. Without idempotency, a retried `payment_intent.succeeded` webhook would update the order twice (or worse, create two orders). The `stripe_idempotency_key` column with a UNIQUE constraint makes retries safe.

#### Pattern 3: Fail-open rate limiting

```typescript
// packages/api/src/middleware/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 req/min per identifier
});

export const rateLimitMiddleware = t.procedure.middleware(async ({ ctx, next }) => {
  const identifier = ctx.session?.user.id ?? ctx.requestIP ?? "anonymous";
  try {
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }
  } catch (e) {
    // FAIL OPEN: if Redis is down, allow the request.
    // Rationale: blocking legitimate users during a Redis outage is worse
    // than allowing a brief window of unthrottled traffic. Log for review.
    if (e instanceof TRPCError) throw e; // Re-throw rate limit errors
    console.error("Rate limit check failed (Redis down?), failing open:", e);
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
import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  // ... other fields
  priceCents: integer("price_cents").notNull(), // ← Cents, not dollars
  compareAtPriceCents: integer("compare_at_price_cents"), // ← Nullable
  currency: text("currency").default("USD").notNull(),
});

// Display logic (apps/web/src/components/shop/ProductCard.tsx)
function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
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

| Table | Layer | Purpose | Notes |
|-------|-------|---------|-------|
| `users` | Better Auth managed | Email, password hash, role | Better Auth creates this; we add `role` enum |
| `sessions` | Better Auth managed | Session tokens, expiry, IP | DB-backed (not JWT) — enables instant revocation |
| `accounts` | Better Auth managed | OAuth provider links | Google, Apple (Phase 2) |
| `customers` | Application | Customer profile (name, phone, newsletter) | 1:1 with `users` |
| `addresses` | Application | Shipping/billing addresses | Multiple per customer; default flags |
| `collections` | Application | Product collections (Lighting, Furniture, etc.) | Slug-indexed |
| `products` | Application | Product catalog | Soft-deleted (`is_active = false`) |
| `product_variants` | Application | Size/finish/material variants | Each has own SKU + stock |
| `product_images` | Application | Multiple images per product | Sort-ordered |
| `carts` | Application | Shopping cart (anonymous + authenticated) | `anonymous_id` cookie for guests |
| `cart_items` | Application | Cart line items | Quantity 1–99 |
| `orders` | Application | Placed orders | `stripe_idempotency_key` UNIQUE |
| `line_items` | Application | Order line items (snapshot of product + price) | Never references live product (preserves order history) |
| `wishlist_items` | Application | Saved products | UNIQUE (customer_id, product_id) |
| `discounts` | Application (Phase 2) | Promo codes | Percentage / fixed / free shipping |
| `audit_log` | Application | Admin action audit trail | Required for PCI DSS compliance |

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

> **Canonical source:** `docs/landing_page_unified.html`. The CSS custom properties in that file are the source of truth. This section documents them for engineering reference.

### 5.1 Typographic System

| Role | Font | Weights | Fallback | Usage |
|------|------|---------|----------|-------|
| Display | Cormorant Garamond | 300, 400, 500, 600, 700, italic 400, italic 500 | Georgia, serif | H1–H6, product names, logo, editorial headlines |
| Body | Inter | 300, 400, 500, 600 | system-ui, -apple-system, sans-serif | Paragraphs, labels, buttons, nav, form inputs |

**Self-hosting:** woff2 files in `packages/ui/src/fonts/cormorant/` and `packages/ui/src/fonts/inter/`. Subsets: Latin, Latin Extended, Cyrillic (for future Russian market). `font-display: swap` with preload of critical weights (regular 400 + bold 600) in `apps/web/src/app/layout.tsx`.

**Type scale (CSS custom properties):**
- Hero title: `clamp(3rem, 8.5vw, 7.5rem)` (Cormorant 400, line-height 0.98)
- Section title: `clamp(2rem, 4.5vw, 3.4rem)` (Cormorant 500)
- Body large (lede): `clamp(1rem, 1.15vw, 1.125rem)` (Inter 400, line-height 1.7)
- Body: `1rem` (Inter 400, line-height 1.65)
- Eyebrow: `11px` (Inter 500, letter-spacing 0.22em, uppercase)
- Button: `13px` (Inter 500, letter-spacing 0.14em, uppercase)

### 5.2 Color Tokens

All tokens are CSS custom properties, ported to `packages/ui/src/tokens/colors.css` and re-exported via `@theme` in `apps/web/src/app/globals.css`.

| Token | Hex | Usage | WCAG Contrast (on --bg) |
|-------|-----|-------|--------------------------|
| `--bg` | `#faf8f5` | Page background (warm cream) | — |
| `--bg-2` | `#f3efe8` | Linen section backgrounds | — |
| `--bg-3` | `#ece5d8` | Deeper linen (journal, testimonials) | — |
| `--bg-card` | `#ffffff` | Product cards, modal surfaces | — |
| `--bg-dark` | `#1f1b17` | Footer, newsletter, marquee | — |
| `--ink` | `#1f1b17` | Primary text | 14.8:1 ✅ AAA |
| `--ink-2` | `#4a433b` | Secondary text | 9.2:1 ✅ AAA |
| `--muted` | `#8a8178` | Tertiary text, meta labels | 4.6:1 ✅ AA |
| `--line` | `#e5ddd1` | Borders, dividers | — |
| `--line-soft` | `#efe9df` | Subtle dividers | — |
| `--clay` | `#a86b4a` | Primary accent (CTAs, links, badges) | 4.8:1 ✅ AA |
| `--clay-dark` | `#8a5538` | Hover state for clay | 6.1:1 ✅ AA |
| `--clay-light` | `#c17d52` | Secondary clay | 3.9:1 (large text only) |
| `--gold` | `#c4a265` | Editorial accent (hero italic, ornament) | 3.2:1 (large/decorative only) |
| `--sage` | `#8b9a82` | Tertiary muted green (Phase 2 badges) | 3.5:1 (large text only) |

**Accessibility rule:** Body text must use `--ink` or `--ink-2` (both AAA on `--bg`). `--muted` is AA (use only for meta labels at 11px+, never for primary content). `--gold` and `--sage` are decorative only — never use for text smaller than 18px.

### 5.3 Component Primitives

Built on Radix UI (accessibility) + Tailwind v4 (styling) + `class-variance-authority` (variants).

| Component | Base | Variants | Customisation |
|-----------|------|----------|---------------|
| Button | Radix Slot + CVA | `primary` (clay), `outline` (ink border), `ghost` (no border) | Uppercase 13px, 0.14em tracking, 0.95rem 1.75rem padding |
| Input | Radix Label + custom | `default` (full border), `underline` (border-bottom only, for newsletter) | Focus ring: clay outline |
| Dialog | Radix Dialog | `drawer` (slide-in right, 380px), `modal` (centered) | Used for cart drawer, quick view |
| Toast | Sonner | `default` (ink bg, cream text) | Bottom-center, 2.8s auto-dismiss |
| Select | Radix Select | — | Minimal, ink-on-cream |
| Tabs | Radix Tabs | `gallery` (PDP image thumbnails) | — |
| Dropdown | Radix Popover | `mega-nav` (Phase 2) | Category previews |
| Tooltip | Radix Tooltip | — | — |
| Form | React Hook Form + Zod | — | `@hookform/resolvers` for Zod |

### 5.4 Motion / Animation

| Animation | Duration | Easing | Reduced-Motion Fallback |
|-----------|----------|--------|--------------------------|
| Ken Burns (hero) | 24s | ease-in-out, alternate infinite | Disabled (static image) |
| Marquee | 38s | linear infinite | Disabled (static, wraps) |
| Scroll reveal | 0.9s | `cubic-bezier(0.16, 1, 0.3, 1)` | Instant (no transform) |
| Image hover scale | 1.0–1.2s | ease-out | Disabled |
| Button hover translate | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Color change only |
| Toast slide | 0.45s | ease | Instant |
| Stagger delay | 0.1s/item | — | Removed |

All animations respect `prefers-reduced-motion: reduce` via a global CSS rule:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Security Architecture

### 6.1 Security Rules

| Rule | Enforcement | Layer |
|------|-------------|-------|
| All mutating tRPC procedures require authentication | tRPC middleware (`@maison/api/src/middleware/auth.ts`) | Layer 1 |
| All `admin.*` procedures require `staff` or `admin` role | tRPC middleware (RBAC check) | Layer 1 |
| All user inputs validated with Zod | tRPC input parsers (compile-time + runtime) | Layer 1 |
| All SQL parameterised (no string interpolation) | Drizzle ORM (enforces parameterisation) | Layer 0 |
| All Stripe webhooks signature-verified | Route handler (`api/webhooks/stripe/route.ts`) | API routes |
| All Sanity webhooks signature-verified | Route handler (`api/webhooks/sanity/route.ts`) | API routes |
| Rate limiting on auth + checkout endpoints | tRPC middleware (Upstash Redis, fail-open) | Layer 1 |
| CSP headers enforced | `next.config.ts` + CI test (CSP verify) | Vercel Edge |
| No secrets in client code | `NEXT_PUBLIC_*` prefix audit in CI | CI |
| Dependencies audited for CVEs | `pnpm audit --audit-level=high` in CI | CI |
| Supply-chain guardrail (24h release delay) | `pnpm-workspace.yaml` `minimumReleaseAge: 1440` | Install |
| Admin actions logged | `audit_log` table + `@maison/api/src/lib/audit-log.ts` | Layer 1 |
| Sessions DB-backed (revocable) | Better Auth config | Layer 1 |
| HTTPS enforced | Vercel (auto-TLS, HSTS header) | Edge |

### 6.2 Security Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `verifyStripeSignature` | `packages/payments/src/webhooks.ts` | Stripe webhook signature verification |
| `verifySanitySignature` | `apps/web/src/app/api/webhooks/sanity/route.ts` | Sanity webhook signature verification |
| `rateLimit` | `packages/api/src/middleware/rateLimit.ts` | Upstash Redis sliding-window rate limit (fail-open) |
| `requireRole` | `packages/api/src/middleware/auth.ts` | RBAC role check (throws `UNAUTHORIZED` if insufficient) |
| `auditLog` | `packages/api/src/lib/audit-log.ts` | Write to `audit_log` table (admin actions) |
| `sanitizeInput` | Zod schemas (per-procedure) | Input validation + sanitisation |
| `generateIdempotencyKey` | Client-side (UUID v4) | Stripe idempotency key generation |

### 6.3 Authentication & Authorization

**Session model:** Better Auth with database-backed sessions.

```
Login flow:
1. User submits email + password to /auth/sign-in
2. Better Auth verifies password (bcrypt hash)
3. Better Auth creates a row in `sessions` table (id, user_id, expires_at, ip, user_agent)
4. Better Auth sets httpOnly cookie: `better-auth.session_token=<session_id>`
5. Subsequent requests: proxy.ts reads cookie → validates session → attaches to request
6. tRPC context reads session from request → available in all procedures
```

**RBAC roles:**

| Role | Permissions | Can access |
|------|-------------|------------|
| `customer` (default) | Own account, orders, wishlist, addresses | `(shop)`, `(account)`, `account.*` procedures |
| `staff` | All customer permissions + admin read | `(admin)` (read-only), `admin.*.list` procedures |
| `admin` | Full access | All routes, all `admin.*` procedures including mutations |

**Token strategy:** Sessions are 30-day sliding expiry (refreshed on activity). OAuth tokens (Google, Apple) are stored in `accounts` table (Better Auth managed). No JWTs — database lookup per request is fast (indexed by session_id).

### 6.4 Threat Model

| Threat | Vector | Mitigation |
|--------|--------|------------|
| SQL injection | Unsanitised input in queries | Drizzle ORM (parameterised), Zod input validation |
| XSS | User-generated content (product descriptions, journal) | Sanity renders to structured JSON; React escapes by default; CSP blocks inline scripts |
| CSRF | Cross-site form submission | Better Auth uses SameSite=Lax cookies; tRPC mutations require origin header check |
| Session hijacking | Stolen session cookie | httpOnly + Secure + SameSite=Lax cookies; IP + User-Agent fingerprinting (Phase 2) |
| Brute-force login | Automated password guessing | Rate limiting (10 attempts / 10 min per IP); account lockout after 5 failed attempts |
| Webhook spoofing | Fake Stripe/Sanity webhook | Signature verification with `STRIPE_WEBHOOK_SECRET` / `SANITY_WEBHOOK_SECRET` |
| Supply-chain attack | Malicious npm package | `minimumReleaseAge: 1440` (24h delay); `pnpm audit` in CI; dependabot alerts |
| Card data exposure | Card numbers in our system | Stripe Elements (card data never touches our servers); PCI SAQ-A scope |
| Admin privilege escalation | Customer accessing admin routes | `proxy.ts` redirects unauthenticated users; tRPC `requireRole` middleware double-checks |
| GDPR violation | Customer data retained after erasure request | `account.deleteAccount` procedure cascades to customer data; orders retained 7 years (tax law) with PII stripped |

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

| Job | Trigger | Concurrency | Retry Policy |
|-----|---------|-------------|--------------|
| `abandoned-cart` | Cron (every 30 min, checks for carts abandoned 1h/24h/72h ago) | 5 concurrent | 3 retries, exponential backoff |
| `order-confirmation` | Event (order.created) | 10 concurrent | 5 retries (email is critical) |
| `shipping-update` | Event (order.status_changed to "shipped") | 10 concurrent | 3 retries |
| `weekly-digest` | Cron (Sunday 9am CET) | 1 (sequential, batches by recipient) | 2 retries |
| `inventory-alert` | Event (variant.stock_quantity < threshold) | 3 concurrent | No retry (alert is best-effort) |

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

| Category | Framework | Location | Test Count Target | Coverage Target |
|----------|-----------|----------|-------------------|-----------------|
| Unit tests (business logic) | Vitest | `packages/*/src/**/*.test.ts` | ~300 | 80% |
| Component tests | Vitest + Testing Library | `apps/web/src/components/**/*.test.tsx` | ~150 | 70% |
| Integration tests (tRPC + test DB) | Vitest + testcontainers | `packages/api/src/**/*.integration.test.ts` | ~80 | Critical paths |
| E2E tests (user journeys) | Playwright | `e2e/*.spec.ts` | ~40 | All P0 stories |
| Accessibility tests | `@axe-core/playwright` | `e2e/accessibility.spec.ts` | 1 per route | All pages |
| Visual regression | Playwright screenshots | `e2e/visual/*.spec.ts` | ~20 | Key pages |

### 8.2 Test Patterns

**Unit test (tRPC router):**

```typescript
// packages/api/src/routers/products.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { mockDB } from "../../test/mock-db";
import { productsRouter } from "./products";

describe("products.list", () => {
  beforeEach(() => mockDB.reset());

  it("returns paginated products", async () => {
    const caller = productsRouter.createCaller({
      db: mockDB,
      session: null,
    });
    const result = await caller.list({ limit: 10 });
    expect(result.items).toHaveLength(10);
    expect(result.nextCursor).toBeDefined();
  });

  it("filters by collection", async () => {
    const caller = productsRouter.createCaller({ db: mockDB, session: null });
    const result = await caller.list({ collection: "lighting", limit: 100 });
    expect(result.items.every((p) => p.collectionSlug === "lighting")).toBe(true);
  });
});
```

**E2E test (checkout flow):**

```typescript
// e2e/checkout.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Checkout flow", () => {
  test("guest user can complete purchase", async ({ page }) => {
    await page.goto("/products");
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart"]');
    await page.click('[data-testid="checkout"]');
    // ... fill shipping + payment
    await page.click('[data-testid="place-order"]');
    await expect(page).toHaveURL(/\/order\/MAI-\d{4}-\d{4}/);
    await expect(page.locator("h1")).toContainText("Order Confirmed");
  });
});
```

### 8.3 Coverage Thresholds

| Package | Minimum Coverage | Rationale |
|---------|------------------|-----------|
| `packages/db` | 80% | Schema integrity critical |
| `packages/api` | 85% | Business logic critical |
| `packages/auth` | 90% | Security critical |
| `packages/payments` | 90% | Money critical |
| `packages/email` | 70% | Templates, lower risk |
| `packages/ui` | 50% | Visual, hard to unit test |
| `packages/config` | 80% | Env validation critical |
| `apps/web/src/lib` | 75% | Server-side callers |
| `apps/web/src/components` | 60% | Visual, relies on E2E |

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
- [ ] New env vars documented in `.env.example` + `PROJECT-ARCHITECTURE.md` §9.2

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

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | `development` | `production` for prod builds |
| `NEXT_PUBLIC_APP_URL` | ✅ | — | Canonical app URL (e.g. `https://maison-living.com`) |
| `DATABASE_URL` | ✅ | — | Pooled Postgres (Neon pooler or Docker). Used for app queries. |
| `DATABASE_URL_UNPOOLED` | ✅ | — | Direct Postgres. Used ONLY for migrations (PgBouncer breaks prepared statements). |
| `BETTER_AUTH_SECRET` | ✅ | — | Session signing key (min 32 chars). Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | — | App URL for auth callbacks. MUST be set in production (config throws otherwise). |
| `GOOGLE_CLIENT_ID` | Phase 2 | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Phase 2 | — | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | ✅ | — | Server-side Stripe API key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | — | Stripe webhook signature verification (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | — | Client-side Stripe Elements (`pk_test_...` or `pk_live_...`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ | — | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ | `production` | Sanity dataset name |
| `SANITY_API_TOKEN` | ✅ | — | Server-side Sanity read token |
| `SANITY_WEBHOOK_SECRET` | ✅ | — | Sanity webhook signature verification |
| `RESEND_API_KEY` | ✅ | — | Resend API key (`re_...`) |
| `EMAIL_FROM` | ✅ | — | From address (e.g. `hello@maison-living.com`) |
| `TRIGGER_SECRET_KEY` | ✅ | — | Trigger.dev v4 secret key (`tr_dev_...` or `tr_prod_...`) |
| `UPSTASH_REDIS_REST_URL` | ✅ | — | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | — | Upstash Redis auth token |
| `SENTRY_DSN` | ⚪ Optional | — | Sentry DSN (app runs without if unset) |
| `NEXT_PUBLIC_SENTRY_DSN` | ⚪ Optional | — | Client-side Sentry DSN |
| `SENTRY_AUTH_TOKEN` | ⚪ CI only | — | Sentry source map upload auth |
| `NEXT_PUBLIC_POSTHOG_KEY` | ✅ | — | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | ✅ | `https://app.posthog.com` | PostHog host |
| `AXIOM_TOKEN` | ⚪ Optional | — | Axiom structured logging token |
| `AXIOM_DATASET` | ⚪ Optional | — | Axiom dataset name |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | — | Cloudflare account ID |
| `CLOUDFLARE_IMAGES_TOKEN` | ✅ | — | Cloudflare Images API token |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | ✅ | — | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | ✅ | — | R2 secret key |
| `CLOUDFLARE_R2_BUCKET` | ✅ | — | R2 bucket name |
| `CLOUDFLARE_R2_ENDPOINT` | ✅ | — | R2 endpoint URL |
| `NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL` | ✅ | — | Cloudflare Images delivery URL |

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
      - setup-pnpm@v4 (pnpm 11.9.0)
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

| Command | Location | Purpose |
|---------|----------|---------|
| `pnpm dev` | repo root | Start all apps in dev mode (Turbopack) |
| `pnpm --filter=@maison/web dev` | repo root | Start only the web app |
| `pnpm --filter=@maison/web build` | repo root | Production build of web app only |
| `pnpm check-types` | repo root | Type-check all packages |
| `pnpm lint` | repo root | Lint all packages |
| `pnpm lint:fix` | repo root | Lint + auto-fix |
| `pnpm format` | repo root | Prettier format all files |
| `pnpm format:check` | repo root | Check formatting (CI gate) |
| `pnpm test` | repo root | Run all unit/integration tests |
| `pnpm --filter=@maison/api test` | repo root | Test a single package |
| `pnpm test:e2e` | repo root | Run Playwright E2E (requires `pnpm build` first) |
| `pnpm db:generate` | repo root | Generate Drizzle migrations from schema changes |
| `pnpm db:migrate` | repo root | Apply pending migrations |
| `pnpm db:push` | repo root | Push schema directly to DB (dev only!) |
| `pnpm db:seed` | repo root | Seed initial catalog (8 collections, 13 products) |
| `pnpm db:studio` | repo root | Open Drizzle Studio GUI |
| `pnpm db:reset` | repo root | ⚠️ Drop all tables + re-seed (dev only) |
| `pnpm jobs:dev` | repo root | Start Trigger.dev workers in dev mode |
| `pnpm audit --audit-level=high` | repo root | Check for high/critical CVEs |
| `pnpm bundle-size` | repo root | Analyze bundle size (`ANALYZE=true` build) |
| `pnpm lighthouse` | repo root | Run Lighthouse CI |
| `docker compose up -d postgres redis` | repo root | Start local DB + cache |
| `docker compose --profile stripe up -d stripe` | repo root | Start Stripe CLI for webhook forwarding |
| `docker compose --profile tools up -d adminer` | repo root | Start Adminer DB GUI on :8080 |

### 10.3 Code Style Rules

| Rule | Enforcement | Tool |
|------|-------------|------|
| No `any` types | ESLint rule `@typescript-eslint/no-explicit-any` | ESLint |
| No `console.log` in production | ESLint rule `no-console` (warn) | ESLint |
| No unused imports/vars | ESLint rule `@typescript-eslint/no-unused-vars` | ESLint |
| Strict TypeScript | `strict: true` in tsconfig | tsc |
| Prettier formatting | `prettier --check` in CI | Prettier |
| Tailwind class sorting | `prettier-plugin-tailwindcss` | Prettier (auto) |
| Import order | `eslint-plugin-import` | ESLint |
| Conventional commits | `commitlint` (Phase 2) | commitlint |

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

| Priority | Issue | Impact | Status |
|----------|-------|--------|--------|
| ~~CRITICAL~~ | ~~Application code not yet scaffolded (Phase 0)~~ | ~~Cannot run the storefront~~ | ✅ Resolved — Phase 0 scaffold complete |
| ~~HIGH~~ | ~~GitHub Actions CI workflow not yet created~~ | ~~No automated quality gates~~ | ✅ Resolved — `.github/workflows/ci.yml` created |
| ~~HIGH~~ | ~~Drizzle schema not yet written~~ | ~~No DB layer~~ | ✅ Resolved — 16 tables in `packages/db/src/schema/`, migration `0000_initial.sql` |
| ~~HIGH~~ | ~~tRPC routers not yet implemented~~ | ~~No API layer~~ | ✅ Resolved — 8 routers in `packages/api/src/routers/` |
| ~~MEDIUM~~ | ~~Sanity Studio schemas not yet defined~~ | ~~No CMS content management~~ | ✅ Resolved — 4 schemas (product, collection, journalArticle, siteSettings) |
| ~~MEDIUM~~ | ~~Playwright E2E test suite not yet written~~ | ~~No automated user journey tests~~ | ✅ Resolved — 16 smoke tests + accessibility tests |
| ~~HIGH~~ | ~~Homepage renders only Phase 0 hero + 4 products~~ | ~~Brand experience incomplete~~ | ✅ Resolved — Full 15-section homepage with real data |
| ~~HIGH~~ | ~~Stripe webhook handler returns 200 but doesn't update order status~~ | ~~Cannot process payments end-to-end~~ | ✅ Resolved — Webhook updates order to "confirmed" + sends OrderConfirmation email |
| ~~HIGH~~ | ~~Cart router creates carts but no cart drawer UI~~ | ~~No add-to-cart from PDP~~ | ✅ Resolved — CartProvider + CartDrawer + AddToBagButton on PDP |
| ~~HIGH~~ | ~~Checkout page is a stub (no Stripe Elements, no order creation)~~ | ~~Cannot complete purchases~~ | ✅ Resolved — Multi-step checkout with real order creation + Stripe Payment Intents |
| ~~HIGH~~ | ~~Account dashboard is a stub (no order history, no wishlist UI)~~ | ~~Account section non-functional~~ | ✅ Resolved — Dashboard with order count + wishlist count, order history, wishlist grid |
| ~~HIGH~~ | ~~Admin dashboard is a stub (no KPI queries, no product table)~~ | ~~Admin section non-functional~~ | ✅ Resolved — Dashboard with KPIs + recent orders + low-stock alerts, product table, order fulfillment, customer directory, inventory management |
| MEDIUM | Stripe Elements not rendering card input (checkout uses demo mode) | No real card payments in dev | Open — Phase 2 (requires Stripe account config) |
| MEDIUM | Wishlist toggle on ProductCard is client-side only (not persisted to DB) | Wishlist lost on page refresh | Open — Phase 2 (wire to account.toggleWishlist mutation) |
| MEDIUM | No product image upload in admin | Admin can't add images to new products | Open — Phase 2 (Cloudflare Images integration) |
| LOW | OAuth providers (Google, Apple) not configured | Email/password only in v1 | Phase 2 |
| LOW | Multi-region (EU/UK) not implemented | US-only in v1 | Phase 2 |
| LOW | Product reviews not implemented | No social proof on PDP | Phase 3 |
| LOW | Trade program (designer tier) not implemented | No B2B workflow | Phase 3 |

---

## 12. Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `docs/PRD_unified.md` | ~1,374 | Product requirements — what to build (features, pages, data models, API) |
| `docs/landing_page_unified.html` | ~2,250 | Canonical visual reference — CSS tokens, sections, copy |
| `PROJECT-ARCHITECTURE.md` | ~1,450 | This document — engineering blueprint |
| `AGENTS.md` | ~212 | High-signal facts for AI agents |
| `CLAUDE.md` | ~248 | Claude Code instructions |
| `README.md` | ~490 | Project overview + quick start |
| `package.json` | ~50 | Root scripts + devDependencies |
| `pnpm-workspace.yaml` | ~55 | Workspace config + supply-chain guardrails |
| `turbo.json` | ~100 | Task pipeline definition |
| `.env.example` | ~104 | Environment variable template |
| `docker-compose.yml` | ~90 | Local Postgres + Redis + Stripe CLI |
| `scripts/db-setup.sh` | ~45 | One-shot DB setup |
| `scripts/pre-commit-check.sh` | ~20 | Pre-commit quality gates |
| `.github/workflows/ci.yml` | ~100 | GitHub Actions CI (8-gate pipeline) |
| `playwright.config.ts` | ~45 | Playwright E2E config (desktop + mobile) |
| `packages/config/src/env.ts` | ~190 | Zod-validated env (t3-env, build-context fallback) |
| `packages/config/src/site.ts` | ~110 | Brand metadata, nav, footer, shipping config |
| `packages/db/src/index.ts` | ~90 | Drizzle client (Neon + node-postgres auto-detect) |
| `packages/db/src/schema/index.ts` | ~60 | Schema barrel (re-exports all 16 tables + enums + relations) |
| `packages/db/drizzle/migrations/0000_initial.sql` | ~190 | Initial migration (all tables + enums + indexes) |
| `packages/db/src/seed/index.ts` | ~100 | Seed script (8 collections + 13 products, idempotent) |
| `packages/db/drizzle.config.ts` | ~45 | Drizzle Kit config (uses DATABASE_URL_UNPOOLED) |
| `packages/auth/src/config.ts` | ~130 | Better Auth config (email/password, custom session w/ role, rate limiting) |
| `packages/auth/src/rbac.ts` | ~45 | RBAC roles (customer/staff/admin) + helpers |
| `packages/api/src/trpc.ts` | ~55 | tRPC init + 4 procedure tiers (public/protected/admin/adminWrite) |
| `packages/api/src/context.ts` | ~35 | Context builder (db + session w/ 5s timeout) |
| `packages/api/src/root.ts` | ~30 | Root router (8 routers merged) |
| `packages/api/src/routers/products.ts` | ~130 | Products router (list, getBySlug, getRelated, search) |
| `packages/api/src/middleware/rateLimit.ts` | ~60 | Upstash Redis rate limit (fail-open) |
| `packages/payments/src/client.ts` | ~35 | Stripe client (lazy-init, stub fallback) |
| `packages/payments/src/webhooks.ts` | ~55 | Webhook event handlers (idempotent) |
| `packages/email/src/templates/OrderConfirmation.tsx` | ~170 | Order confirmation email (React Email) |
| `packages/ui/src/tokens/colors.css` | ~45 | Color tokens (WCAG contrast documented) |
| `packages/ui/src/globals.css` | ~80 | Combined tokens + fonts + CSS reset |
| `apps/web/src/app/globals.css` | ~140 | Tailwind v4 @theme mapping (CSS-first) |
| `apps/web/src/app/layout.tsx` | ~90 | Root layout (next/font, TRPCProvider, metadata) |
| `apps/web/proxy.ts` | ~60 | Next.js 16 proxy (auth cookie check, route protection) |
| `apps/web/next.config.ts` | ~110 | Next.js config (CSP, transpilePackages, image domains) |
| `apps/web/src/lib/trpc/server.ts` | ~20 | Server-side tRPC caller (for RSC, zero HTTP) |
| `apps/web/src/lib/trpc/client.tsx` | ~60 | Client tRPC provider + hooks |
| `apps/web/src/app/api/webhooks/stripe/route.ts` | ~65 | Stripe webhook handler (signature verify + idempotent) |
| `apps/web/src/app/api/webhooks/sanity/route.ts` | ~40 | Sanity webhook → ISR revalidation |
| `apps/web/src/app/(shop)/page.tsx` | ~140 | Homepage (Phase 0 hero + seeded products) |
| `apps/web/src/app/(shop)/products/[slug]/page.tsx` | ~150 | PDP (gallery, JSON-LD, async params) |
| `apps/web/src/app/(admin)/layout.tsx` | ~85 | Admin layout (RBAC guard — Layer 2) |
| `apps/web/src/app/(account)/layout.tsx` | ~55 | Account layout (auth guard — Layer 2) |
| `apps/studio/sanity.config.ts` | ~25 | Sanity Studio config |
| `apps/studio/schemas/index.ts` | ~15 | Schema barrel (4 content types) |
| `e2e/smoke.spec.ts` | ~50 | E2E smoke tests (homepage, products, auth redirect) |
| `e2e/accessibility.spec.ts` | ~35 | Axe-core accessibility tests (8 public pages) |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **AOV** | Average Order Value — total revenue / order count |
| **Considered living** | Brand philosophy: intentional, slow, quality-over-quantity consumption |
| **GMV** | Gross Merchandise Value — total order value before fees/refunds |
| **Hygge** | Danish concept of coziness, contentment, and warm simplicity |
| **ISR** | Incremental Static Regeneration — Next.js feature for periodic page re-rendering |
| **PAD** | Project Architecture Document — this file |
| **PDP** | Product Detail Page (`/product/{slug}`) |
| **PLP** | Product Listing Page (`/products`) |
| **PRD** | Project Requirements Document — `docs/PRD_unified.md` |
| **proxy.ts** | Next.js 16 replacement for `middleware.ts` — supports async, runs on Edge |
| **RSC** | React Server Component — renders on server, ships zero JS |
| **RBAC** | Role-Based Access Control — `customer` / `staff` / `admin` roles |
| **Trade program** | Phase 3 feature: designer tier with 10–20% discount |
| **White Glove delivery** | Premium shipping: in-home setup, packaging removal (2-week lead time) |

---

*End of Project Architecture Document v1.0. For product requirements, see `docs/PRD_unified.md`. For developer onboarding, see `README.md`. For AI agent instructions, see `AGENTS.md` and `CLAUDE.md`.*
