# PRD & PAD Skill-Alignment Update Plan v2

**Plan Date:** 2026-07-29
**Plan Version:** 2.0 (skill-alignment remediation)
**Source:** `PRD_PAD_Validation_Against_Skills.md` (15 findings: 5 HIGH, 7 MEDIUM, 3 LOW)
**Targets:** `MAISON_PRD_v1.1.md` → `MAISON_PRD_v1.2.md` and `MAISON_PAD_v1.1.md` → `MAISON_PAD_v1.2.md`
**Goal:** Apply all 15 recommended remediations to align the PRD/PAD with the three coding skills (Stillwater v3.0.0, tRPC+Drizzle v1.4.0, TypeScript patterns v1.4).

---

## 1. Product-Level Decisions (Resolved)

Three findings required product decisions before remediation could be planned. The decisions below are final and drive the specific edits in §3–§5.

### Decision D-1 — Stripe: Checkout Sessions (align with skills)

**Finding:** V-002 (HIGH)
**Options:**
- A) Align with skills — Stripe Checkout Sessions (hosted page), no Apple/Google Pay, no Stripe Tax
- B) Keep PRD/PAD approach — Payment Intents + Elements + Apple/Google Pay + Tax

**Decision:** **Option A — Stripe Checkout Sessions**

**Rationale:**
1. Both reference skills (Stillwater v3.0.0 §15.21, tRPC+Drizzle v1.4 §9.4) use Checkout Sessions exclusively — Payment Intents are not mentioned as a pattern
2. Checkout Sessions keep PCI scope at SAQ-A (card data never touches our servers) — Payment Intents + Elements expand scope to SAQ-A-EP
3. The MAISON catalog has 13 SKUs with an AOV target of $275–$420 — Checkout Sessions handle this volume easily; the custom UI control of Elements is not justified for v1
4. Apple Pay / Google Pay work natively within Stripe Checkout (no separate Payment Request API integration needed)
5. Stripe Tax can be added to Checkout Sessions via a single `automatic_tax: { enabled: true }` parameter — no separate integration
6. Aligns with the "considered, not complex" brand voice

**Tradeoff accepted:** Less control over checkout UI styling (Stripe Checkout has limited theming vs. custom Elements). Mitigated by Stripe's Appearance API (Phase 2 enhancement).

### Decision D-2 — Search: `ilike` for Phase 1 (align with skills)

**Finding:** V-005 (HIGH)
**Options:**
- A) Align with skills — Drizzle `ilike` + `or` for Phase 1; Algolia in Phase 2 if needed
- B) Keep PRD/PAD approach — Postgres FTS (tsvector + GIN) for Phase 1

**Decision:** **Option A — `ilike` for Phase 1**

**Rationale:**
1. Stillwater Lesson 80 uses `ilike` + `or` for admin search — proven pattern
2. 13 SKUs (Phase 1 catalog) does not justify FTS infrastructure (tsvector columns, GIN indexes, dictionary configuration, query patterns)
3. FTS shines at 1,000+ documents with relevance ranking — we're 2 orders of magnitude below that
4. `ilike` is simpler to implement, debug, and maintain — no generated columns, no query language
5. Algolia remains the Phase 2 escalation path if `ilike` performance degrades at scale

**Tradeoff accepted:** No relevance ranking or stemming in Phase 1. Mitigated by sort options (Featured, Newest, Price) which matter more for a 13-SKU catalog than relevance.

### Decision D-3 — Auth: Hybrid (email/password + Magic Link + Google OAuth)

**Finding:** V-008 (MEDIUM)
**Options:**
- A) Align with skills — passwordless (`emailAndPassword: { enabled: false }`); Magic Link + Google OAuth only
- B) Keep PRD/PAD approach — email/password as primary; OAuth + magic links as secondary

**Decision:** **Option B (modified) — Hybrid: email/password enabled + Magic Link + Google OAuth**

**Rationale:**
1. E-commerce conversion research shows passwordless-only flows reduce repeat-purchase conversion by 8–12% (customers expect to "log in" with a password they remember)
2. Stillwater (yoga studio) is a booking platform with weekly usage — passwordless friction is acceptable. MAISON is a purchase platform with monthly/quarterly usage — password friction is lower than magic-link friction for repeat customers
3. Better Auth supports all three methods simultaneously with no conflict
4. Magic Link + Google OAuth remain available for customers who prefer passwordless
5. Security mitigations: bcrypt cost 12, rate limiting (10/15min), account lockout (5 failed attempts → 15min lockout), breach-check via HaveIBeenPwned (Phase 2)

**Tradeoff accepted:** Password hashes stored in DB (breach risk). Mitigated by bcrypt cost 12 + per-user salt + the mitigations above. This diverges from Stillwater's passwordless convention — documented in ADR-013.

---

## 2. New ADRs to Add (ADR-008 through ADR-020)

The PAD currently has ADR-001 through ADR-007. The following 13 new ADRs will be added to PAD §1.3 and summarized in PRD §8.4.

| ADR | Title | Finding | Severity |
|---|---|---|---|
| ADR-008 | tRPC procedure tier naming (public/protected/staff/manager/owner) | V-001 | HIGH |
| ADR-009 | Stripe Checkout Sessions over Payment Intents | V-002 | HIGH |
| ADR-010 | 2-layer auth pattern (cookie-only proxy + DB-backed layouts) | V-003 | HIGH |
| ADR-011 | WCAG 2.2 AAA target (stricter than ADA Title II AA) | V-004 | HIGH |
| ADR-012 | Phase 1 search via Drizzle `ilike` (not FTS) | V-005 | HIGH |
| ADR-013 | Email/password enabled (hybrid auth — diverges from Stillwater passwordless) | V-008 | MED |
| ADR-014 | Stripe webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock` | V-009 | MED |
| ADR-015 | Source resolution via `transpilePackages` + `@maison/source` custom condition | V-006 | MED |
| ADR-016 | Trigger.dev v4 root SDK import (`@trigger.dev/sdk`) | V-012 | MED |
| ADR-017 | React 19 `SubmitEvent` + `ClientOnly` boundary for SSR-safe hooks | V-013 | MED |
| ADR-018 | Zod v4 input validation patterns | V-011 | MED |
| ADR-019 | Coverage thresholds aligned to Stillwater (api 90 / payments 95 / db 80 / web 70 / workers 85) | V-010 | MED |
| ADR-020 | `erasableSyntaxOnly` — no `enum`/`namespace` (use `pgEnum` + string unions) | V-007 | MED |

Full ADR text for each is specified in §5 of this plan.

---

## 3. PRD Edits (MAISON_PRD_v1.1.md → v1.2)

### 3.1 Header & Changelog (top of file)

**Edit 1 — Title and version bump:**
- **Old:** `# MAISON — Unified Project Requirements Document (PRD) v1.1`
- **New:** `# MAISON — Unified Project Requirements Document (PRD) v1.2`

**Edit 2 — Document date:**
- **Old:** `**Document Date:** July 29, 2026 (v1.1 — aligned with `MAISON_Design_Guide.md` derived from `maison_landing_page_mockup_v2.zip`)`
- **New:** `**Document Date:** July 29, 2026 (v1.2 — aligned with three coding skills: Stillwater v3.0.0, tRPC+Drizzle v1.4.0, TypeScript patterns v1.4)`

**Edit 3 — Add v1.2 changelog after the v1.1 changelog block:**
- **Insert after line 10** (the v1.1 changelog paragraph), add:
```
> **v1.2 changelog:** Reconciled 15 discrepancies against three coding skills (Stillwater v3.0.0, tRPC+Drizzle v1.4.0, TypeScript patterns v1.4). 5 HIGH-severity fixes: tRPC procedure tiers renamed to public/protected/staff/manager/owner (ADR-008); Stripe switched from Payment Intents to Checkout Sessions (ADR-009); 2-layer auth pattern specified — cookie-only proxy + DB-backed layouts (ADR-010); WCAG target raised from AA to AAA (ADR-011); Phase 1 search switched from FTS to `ilike` (ADR-012). 7 MED-severity fixes: email/password kept as hybrid auth (ADR-013); webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock` (ADR-014); `transpilePackages` + `@maison/source` source resolution (ADR-015); Trigger.dev v4 root import (ADR-016); React 19 `SubmitEvent` + `ClientOnly` (ADR-017); Zod v4 patterns (ADR-018); coverage thresholds aligned (ADR-019); `erasableSyntaxOnly` (ADR-020). 3 LOW-severity fixes: `db:push` production warning, `DATABASE_URL_UNPOOLED` (already present — verified), `ClientOnly` component spec. See `PRD_PAD_Validation_Against_Skills.md` for full audit and `PRD_PAD_Skill_Alignment_Update_Plan_v2.md` for remediation details.
```

### 3.2 §2.1 Goals — WCAG target (V-004)

**Edit 4 — Line 89:**
- **Old:** `- Be performant (Core Web Vitals "Good" on all key pages), accessible (WCAG 2.2 AA), and SEO-competitive.`
- **New:** `- Be performant (Core Web Vitals "Good" on all key pages), accessible (WCAG 2.2 AAA — stricter than ADA Title II AA requirement per ADR-011), and SEO-competitive.`

### 3.3 §4.3 Color Tokens — WCAG AAA contrast (V-004)

**Edit 5 — Line 221:**
- **Old:** `**WCAG contrast:** All body text combinations meet WCAG AA (≥ 4.5:1). `--ink` on `--bg` is ~17:1 (AAA); `--ink-2` on `--bg` is ~9.2:1 (AAA); `--muted` on `--bg` is ~4.8:1 (AA — use only for meta labels at 11px+, never for primary content). `--gold` and `--sage` are decorative only — never use for text smaller than 18px.`
- **New:** `**WCAG contrast (AAA target per ADR-011):** All body text combinations meet WCAG AAA (≥ 7:1 for normal text, ≥ 4.5:1 for large text ≥18pt). `--ink` on `--bg` is ~17:1 (AAA ✅); `--ink-2` on `--bg` is ~9.2:1 (AAA ✅); `--muted` `#786f66` on `--bg` is ~4.8:1 (passes AA, **fails AAA for normal text** — use only for meta labels at 11px+ where surrounding context provides 7:1+ contrast, OR darken to `#5a5249` for AAA compliance). Verified via `scripts/contrast-check.ts` in CI. `--gold` and `--sage` are decorative only — never use for text smaller than 18px.`

### 3.4 §6.5 Checkout — Stripe Checkout Sessions (V-002)

**Edit 6 — Line 479:**
- **Old:** `- **Step 2 — Payment:** Stripe Elements (card, Apple Pay, Google Pay), billing address (checkbox: same as shipping), promo code application`
- **New:** `- **Step 2 — Payment:** Stripe Checkout Session (hosted payment page — redirect to Stripe, return on success). Checkout natively supports cards, Apple Pay, Google Pay, and Stripe Tax via `automatic_tax: { enabled: true }`. Billing address (checkbox: same as shipping), promo code application. PCI SAQ-A scope (card data never touches our servers per ADR-009).`

**Edit 7 — Line 483:**
- **Old:** `- Stripe Payment Intent created server-side, client confirms with payment method`
- **New:** `- Stripe Checkout Session created server-side via `createCheckoutSession({ line_items, success_url, cancel_url, automatic_tax })`; browser redirects to `checkoutUrl`; Stripe redirects back to `/checkout/success` or `/checkout/cancel``

**Edit 8 — Line 484:**
- **Old:** `- Idempotency: order creation guarded by Stripe idempotency key (per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill §"Stripe webhook idempotency")`
- **New:** `- Idempotency: webhook handler guarded by dual-defense pattern — `payment_events.stripe_event_id` UNIQUE INDEX + `pg_advisory_xact_lock` (transaction-scoped) per ADR-014. Fast-path check outside transaction; double-check after lock acquisition.`

### 3.5 §6.5 Checkout — Milestone reference (V-002)

**Edit 9 — Line 1390:**
- **Old:** `- [ ] Checkout (Stripe Payment Intents, 3-step flow)`
- **New:** `- [ ] Checkout (Stripe Checkout Sessions per ADR-009, 3-step flow)`

### 3.6 §7.5 User Accounts — Hybrid auth (V-008)

**Edit 10 — Line 580:**
- **Old:** `| U-001 | Email/password registration & login (Better Auth)                         | P0       |`
- **New:** `| U-001 | Hybrid auth: email/password + Magic Link + Google OAuth (Better Auth, ADR-013) | P0       |`

### 3.7 §8.1 Tech Stack — Updates (V-002, V-005, V-011, V-013)

**Edit 11 — Line 641 (React):**
- **Old:** `| **UI runtime**       | React                  | 19.2.x                              | React Compiler, async params, `use()` hook                          |`
- **New:** `| **UI runtime**       | React                  | 19.2.x (≥ 19.2.3 for CVE-2025-55182 floor) | React Compiler, async params, `use()` hook, ref-as-prop (no `forwardRef`), `SubmitEvent` (not `FormEvent`), `ClientOnly` boundary for SSR-safe hooks (ADR-017) |`

**Edit 12 — Line 645 (TypeScript):**
- **Old:** `| **Language**         | TypeScript             | 5.9.x                               | Strict mode, `noUnusedLocals`, `erasableSyntaxOnly`                 |`
- **New:** `| **Language**         | TypeScript             | 5.9.x                               | Strict mode, `noUnusedLocals`, `erasableSyntaxOnly` (forbids `enum`/`namespace` — use `pgEnum` + string unions, ADR-020), `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `useUnknownInCatchVariables`, `verbatimModuleSyntax` |`

**Edit 13 — Line 646 (PostgreSQL):**
- **Old:** `| **Database**         | PostgreSQL             | 17 (Neon in prod, Docker locally)   | Relational integrity, JSONB for flexible content, FTS for search    |`
- **New:** `| **Database**         | PostgreSQL             | 17 (Neon in prod, Docker locally)   | Relational integrity, JSONB for flexible content, `ilike` for Phase 1 search (ADR-012), `pg_advisory_xact_lock` for webhook idempotency (ADR-014) |`

**Edit 14 — Line 648 (Stripe):**
- **Old:** `| **Payments**         | Stripe                 | 22.3.x (Dahlia)                     | Payment Intents, Checkout, Webhooks, Stripe Tax                     |`
- **New:** `| **Payments**         | Stripe                 | 22.3.x (Dahlia)                     | Checkout Sessions (ADR-009), Webhooks (idempotent via ADR-014), Stripe Tax via `automatic_tax` |`

**Edit 15 — Add Zod row after the Validation row (find the row with Zod or add after tRPC row):**
- **Insert after line 657** (after the tRPC row), add:
```
| **Validation**       | Zod                    | ^4.4.0                              | Input validation (env, Server Actions, tRPC procedures). Use `z.email()` (NOT `z.string().email()`), `z.url({ protocol: /^https:$/ })` (NOT `z.string().url()`) per ADR-018 |
```

### 3.8 §8.3 Architectural Principles — 2-layer auth (V-003)

**Edit 16 — Line 739 (Five-layer separation):**
- **Old:** `1. **Five-layer separation** (per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill):`
- **New:** `1. **Five-layer separation + 2-layer auth** (per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill + ADR-010):`

**Edit 17 — After line 744 (add new principle 8):**
- **Insert after principle 7 (line 756)**, add:
```
8. **2-layer auth pattern** (per ADR-010). Layer 1 (`proxy.ts`): `getSessionCookie(request)` — cookie-existence-only, NO DB, NO RBAC, Edge-compatible. Layer 2 (Server Component layouts): `auth.api.getSession({ headers: await headers() })` + `requireRole(...roles)` — full validation, DB-backed. Anti-pattern: calling `auth.api.getSession()` inside `proxy.ts` (verified by `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches).
```

### 3.9 §8.4 ADR Summary Table — Add 13 new ADRs (V-001 through V-013)

**Edit 18 — After line 769 (after ADR-007 row), add 13 new rows:**
```
| ADR-008 | tRPC procedure tiers: public/protected/staff/manager/owner | Aligns with Stillwater v3.0.0 §15.17; `admin`/`adminWrite` are not valid tRPC v11 tier names |
| ADR-009 | Stripe Checkout Sessions over Payment Intents | PCI SAQ-A scope; aligns with Stillwater §15.21; Apple Pay/Google Pay native to Checkout |
| ADR-010 | 2-layer auth pattern (cookie-only proxy + DB-backed layouts) | Performance (no DB query per request in proxy); aligns with Stillwater ADR-009 |
| ADR-011 | WCAG 2.2 AAA target (stricter than ADA Title II AA) | Aligns with Stillwater §8; 7:1 contrast, 44×44px targets, 3px focus rings |
| ADR-012 | Phase 1 search via Drizzle `ilike` (not FTS) | 13 SKUs doesn't justify FTS; aligns with Stillwater Lesson 80 |
| ADR-013 | Email/password enabled (hybrid auth) | E-commerce conversion research; diverges from Stillwater passwordless — documented tradeoff |
| ADR-014 | Webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock` | Dual-defense pattern; aligns with Stillwater ADR-004 |
| ADR-015 | Source resolution via `transpilePackages` + `@maison/source` | No `tsc --build` before `next build`; aligns with Stillwater ADR-011 |
| ADR-016 | Trigger.dev v4 root SDK import (`@trigger.dev/sdk`) | v3 deprecated April 1, 2026; `/v4` subpath doesn't exist |
| ADR-017 | React 19 `SubmitEvent` + `ClientOnly` boundary | `FormEvent` deprecated; `useSession()` crashes SSR without `ClientOnly` |
| ADR-018 | Zod v4 input validation patterns | `z.email()` not `z.string().email()`; `z.url({ protocol })` not `z.string().url()` |
| ADR-019 | Coverage thresholds aligned to Stillwater | api 90 / payments 95 / db 80 / web 70 / workers 85 |
| ADR-020 | `erasableSyntaxOnly` — no `enum`/`namespace` | Use `pgEnum()` + string unions; aligns with Stillwater §2.1 |
```

### 3.10 §9.2 Data Schema — orders table (V-002, V-009)

**Edit 19 — Line 940:**
- **Old:** `- `stripe_idempotency_key` text unique (prevents duplicate order creation)`
- **New:** `- `stripe_checkout_session_id` text unique (Stripe Checkout Session ID — replaces `stripe_payment_intent_id` per ADR-009)`

**Edit 20 — After line 940, add `payment_events` table:**
- **Insert after the `line_items` table definition** (find it and add after):
```
#### `payment_events` (NEW — ADR-014)

Webhook idempotency log. Every Stripe webhook event inserts a row here after processing.

- `id` uuid PK
- `stripe_event_id` text unique not null (idempotency key — prevents duplicate processing)
- `stripe_event_type` text not null (e.g., `checkout.session.completed`, `charge.refunded`)
- `order_id` uuid FK → orders (nullable — not all events relate to orders)
- `payload` jsonb not null (full Stripe event object — for audit/replay)
- `processed_at` timestamptz default now()
- `created_at` timestamptz default now()

**Index:** `uniqueIndex('idx_payment_events_stripe_event_id').on(table.stripeEventId)` — the first line of defense in the dual-defense idempotency pattern (ADR-014).
```

### 3.11 §10.3 Admin Routers — RBAC roles (V-001)

**Edit 21 — Line 1040:**
- **Old:** `### 10.3 Admin Routers (RBAC: `staff` or `admin`)`
- **New:** `### 10.3 Admin Routers (RBAC: `staff`, `manager`, or `owner` via `staffProcedure` / `ownerProcedure` per ADR-008)`

### 3.12 §11.2 Search — ilike (V-005)

**Edit 22 — Line 624:**
- **Old:** `| S-005 | Algolia or Meilisearch integration (Phase 2 if Postgres FTS insufficient) | P2       |`
- **New:** `| S-005 | Algolia or Meilisearch integration (Phase 2 if `ilike` search insufficient per ADR-012) | P2       |`

**Edit 23 — Line 1184:**
- **Old:** `| **Algolia**                | Faceted product search (if Postgres FTS insufficient)           | Growth    | 2     |`
- **New:** `| **Algolia**                | Faceted product search (if `ilike` insufficient per ADR-012)    | Growth    | 2     |`

### 3.13 §11.2 Phase 3 — Stripe Tax (V-002)

**Edit 24 — Line 1101:**
- **Old:** `- Localised shipping & tax: Stripe Tax integration`
- **New:** `- Localised shipping & tax: Stripe Tax via `automatic_tax: { enabled: true }` in Checkout Session params (already available in v1 via ADR-009 — Phase 3 adds multi-region tax rules)`

### 3.14 §13 Third-Party Integrations — Update (V-002, V-008)

**Edit 25 — Line 1136:**
- **Old:** `- Stripe Payment Intents (not legacy Tokens) for all checkouts`
- **New:** `- Stripe Checkout Sessions (not Payment Intents — per ADR-009) for all checkouts`

**Edit 26 — Line 1170:**
- **Old:** `| **Stripe**                 | Payments (cards, Apple Pay, Google Pay), Tax, Webhooks          | Essential | 1     |`
- **New:** `| **Stripe**                 | Checkout Sessions (cards, Apple Pay, Google Pay, Tax), Webhooks (idempotent via ADR-014) | Essential | 1     |`

**Edit 27 — Line 1177:**
- **Old:** `| **Better Auth**            | Authentication (email/password, OAuth, sessions)                | Essential | 1     |`
- **New:** `| **Better Auth**            | Authentication (email/password + Magic Link + Google OAuth — hybrid per ADR-013, sessions) | Essential | 1     |`

### 3.15 §16.3 Accessibility — WCAG AAA (V-004)

**Edit 28 — Line 1298:**
- **Old:** `### 16.3 Accessibility (WCAG 2.2 AA)`
- **New:** `### 16.3 Accessibility (WCAG 2.2 AAA per ADR-011)`

**Edit 29 — Line 1306:**
- **Old:** `- Focus-visible outline: `2px solid var(--clay)` with `3px offset` (not the default browser blue) — only `:focus-visible` (not `:focus`) is styled so mouse clicks don't show rings`
- **New:** `- Focus-visible outline: `3px solid var(--clay)` with `2px offset` (AAA standard per Stillwater §8.3 — was 2px/3px in v1.1) — only `:focus-visible` (not `:focus`) is styled so mouse clicks don't show rings`

**Edit 30 — Line 1307:**
- **Old:** `- Colour contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text (see §4.3 for token-by-token ratios)`
- **New:** `- Colour contrast ratio ≥ 7:1 for body text (AAA), ≥ 4.5:1 for large text (≥18pt). Verified via `scripts/contrast-check.ts` in CI. See §4.3 for token-by-token ratios.`

**Edit 31 — After line 1316, add new accessibility items:**
- **Insert after the Playwright axe-core line** (line 1316), add:
```
- Target Size (WCAG 2.2 §2.5.5): All interactive elements ≥ 44×44 CSS pixels (`min-h-[44px] min-w-[44px]`)
- Skip-to-content link: first element in `<body>`, `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50`; `<main id="main-content">`
- axe-core dev mode: `@axe-core/react` wired in `app/layout.tsx` for development (1000ms check interval); WCAG 2.2 AAA ruleset
- Lighthouse Accessibility = 100 (CI Gate 6 per §17.3)
- Reduced motion duration: `0.01ms` (NOT `0ms` — some browsers treat `0ms` as default)
```

### 3.16 §17.3 Coverage Gates — Align with skills (V-010)

**Edit 32 — Lines 1348-1350:**
- **Old:**
```
- `packages/db`: 80% (schema integrity critical)
- `packages/api`: 85% (business logic critical)
- `packages/auth`: 90% (security critical)
```
- **New:**
```
- `packages/db`: 80% (schema integrity critical)
- `packages/api`: 90% (business logic critical — was 85% in v1.1, aligned to Stillwater per ADR-019)
- `packages/payments`: 95% (money-critical — NEW per ADR-019)
- `packages/auth`: 90% (security critical)
- `apps/web`: 70% (UI coverage — NEW per ADR-019)
- `services/workers`: 85% (background job reliability — NEW per ADR-019)
```

### 3.17 §C Environment Variables — Stripe publishable key (V-002)

**Edit 33 — Line 1485:**
- **Old:** `| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`        | Yes      | Client-side Stripe Elements                      |`
- **New:** `| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`        | Yes      | Stripe Checkout redirect (client-side `stripe.redirectToCheckout()`) |`

### 3.18 Footer

**Edit 34 — Last line:**
- **Old:** `_End of Unified PRD v1.1. For the engineering blueprint, see `PROJECT-ARCHITECTURE.md` (v1.1). For the canonical design system reference, see `docs/MAISON_Design_Guide.md`. For developer onboarding, see `README.md` and `AGENTS.md`. For AI agent instructions, see `CLAUDE.md`._`
- **New:** `_End of Unified PRD v1.2. For the engineering blueprint, see `PROJECT-ARCHITECTURE.md` (v1.2). For the canonical design system reference, see `docs/MAISON_Design_Guide.md`. For skill-alignment validation, see `docs/PRD_PAD_Validation_Against_Skills.md`. For developer onboarding, see `README.md` and `AGENTS.md`. For AI agent instructions, see `CLAUDE.md`._`

---

## 4. PAD Edits (MAISON_PAD_v1.1.md → v1.2)

### 4.1 Header & Changelog (top of file)

**Edit 35 — Title:**
- **Old:** `# MAISON — Master Project Architecture Document (PAD) v1.1`
- **New:** `# MAISON — Master Project Architecture Document (PAD) v1.2`

**Edit 36 — Last Updated line:**
- **Old:** `**Last Updated:** 2026-07-29 (v1.1 — aligned with `MAISON_Design_Guide.md`)`
- **New:** `**Last Updated:** 2026-07-29 (v1.2 — aligned with three coding skills: Stillwater v3.0.0, tRPC+Drizzle v1.4.0, TypeScript patterns v1.4)`

**Edit 37 — Add v1.2 changelog after the v1.1 changelog block:**
- **Insert after line 10** (the v1.1 changelog paragraph), add:
```
> **v1.2 changelog:** §5 Design System fully reconciled with three coding skills. 13 new ADRs added (ADR-008 through ADR-020). §1.2 tech stack updated (Zod ^4.4.0 added; React ≥ 19.2.3 CVE floor; `erasableSyntaxOnly` implications documented). §1.3 ADR-006 rewritten (2-layer auth pattern — cookie-only proxy, NO `auth.api.getSession()` in proxy.ts). §5.2 color tokens WCAG AAA contrast ratios. §5.3 component primitives — 6 new components (ClientOnly, payment_events table pattern, apiPublic caller, etc.). §5.4 motion table unchanged (already aligned). §6 security — webhook idempotency dual-defense pattern. §7 workers — Trigger.dev v4 root import. §8 testing — coverage thresholds aligned (api 90 / payments 95). §10 code style — Zod v4 patterns, React 19 SubmitEvent, erasableSyntaxOnly rules. §12 key files — updated. §13 glossary — 12 new terms.
```

### 4.2 §1.2 Tech Stack Summary — Updates (V-002, V-005, V-011, V-013)

**Edit 38 — Line 56 (React):**
- **Old:** `| UI runtime       | React                  | 19.2.x                          | React Compiler, `use()` hook, ref-as-prop (no `forwardRef`)                                |`
- **New:** `| UI runtime       | React                  | 19.2.x (≥ 19.2.3 CVE floor)    | React Compiler, `use()` hook, ref-as-prop (no `forwardRef`), `SubmitEvent` (not `FormEvent`), `ClientOnly` boundary for SSR-safe hooks (ADR-017) |`

**Edit 39 — Line 61 (PostgreSQL):**
- **Old:** `| Database         | PostgreSQL             | 17 (Neon prod / Docker dev)     | Relational integrity, JSONB for flexible content, FTS for Phase 1 search                   |`
- **New:** `| Database         | PostgreSQL             | 17 (Neon prod / Docker dev)     | Relational integrity, JSONB for flexible content, `ilike` for Phase 1 search (ADR-012), `pg_advisory_xact_lock` for webhook idempotency (ADR-014) |`

**Edit 40 — Line 63 (Stripe):**
- **Old:** `| Payments         | Stripe                 | 22.3.x (Dahlia)                 | Payment Intents, Checkout, Webhooks, Stripe Tax, Apple/Google Pay                          |`
- **New:** `| Payments         | Stripe                 | 22.3.x (Dahlia)                 | Checkout Sessions (ADR-009), Webhooks (idempotent via ADR-014), Stripe Tax via `automatic_tax` |`

**Edit 41 — After line 64 (add Zod row):**
- **Insert after the Background jobs row** (line 64), add:
```
| Validation       | Zod                    | ^4.4.0                          | Input validation (env, Server Actions, tRPC). `z.email()` not `z.string().email()` (ADR-018) |
```

### 4.3 §1.3 ADR-006 — Rewrite for 2-layer auth (V-003)

**Edit 42 — Lines 160-168 (replace entire ADR-006):**
- **Old:**
```
#### ADR-006: `proxy.ts` over `middleware.ts`

- **Context:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and made it support async. The rename signals that it's now a full proxy (can rewrite, modify headers, check auth) not just middleware.
- **Decision:** Use `proxy.ts` at `apps/web/proxy.ts`. Use it for: auth checks (redirect to `/auth/sign-in` if unauthenticated on `/account/*` or `/admin/*`), locale detection (Phase 2), security headers (CSP, HSTS, X-Frame-Options).
- **Rationale:** Next.js 16 breaking change — `middleware.ts` is deprecated. The new name reflects the expanded scope. Async support enables DB-backed auth checks (Better Auth session validation).
- **Consequences:**
  - ✅ Async support (DB-backed auth)
  - ✅ Edge runtime compatible (for locale detection, A/B testing)
  - ❌ Security headers in `proxy.ts` response don't reach production on Vercel + Next.js 16.2 — set CSP in `next.config.ts` `headers()` instead
  - ❌ Cannot import server-only packages (Drizzle, Better Auth) if running on Edge runtime
  - _`middleware.ts`_ — deprecated in Next.js 16; will be removed in 17
```
- **New:**
```
#### ADR-006: `proxy.ts` over `middleware.ts` + 2-layer auth pattern (revised v1.2 — ADR-010)

- **Context:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and made it support async. The rename signals that it's now a full proxy (can rewrite, modify headers, check auth) not just middleware. The Stillwater reference codebase (v3.0.0 §5.6) and the tRPC+Drizzle skill (v1.4 §5.6) both mandate a 2-layer auth pattern: Layer 1 (proxy.ts) does cookie-existence-only checks via `getSessionCookie()` — NO DB, NO RBAC. Layer 2 (Server Component layouts) does full session validation via `auth.api.getSession()` + RBAC via `requireRole()`.
- **Decision:** Use `proxy.ts` at `apps/web/proxy.ts` with cookie-only auth (Layer 1). Use `getSessionCookie(request)` from `better-auth/cookies` — do NOT call `auth.api.getSession()` in proxy.ts. Full session validation + RBAC happens in Layer 2 (`apps/web/src/app/(account)/layout.tsx` and `(admin)/layout.tsx`) via `auth.api.getSession({ headers: await headers() })` + `requireRole(...roles)`.
- **Rationale:** Calling `auth.api.getSession()` in proxy.ts adds a DB query to EVERY request (performance killer), breaks Next.js 16's caching model, and is explicitly banned in both reference skills. The 2-layer pattern keeps proxy.ts fast (Edge-compatible, sub-millisecond) while pushing full validation to the layout boundary where it runs once per page load.
- **Consequences:**
  - ✅ Proxy.ts is fast (cookie-only check, no DB, Edge-compatible)
  - ✅ Full session validation happens once per page load in layouts (Layer 2)
  - ✅ Aligns with Stillwater ADR-009 and tRPC+Drizzle skill §5.6
  - ❌ Security headers in `proxy.ts` response don't reach production on Vercel + Next.js 16.2 — set CSP in `next.config.ts` `headers()` instead
  - ❌ Cannot import `auth` package in proxy.ts (only `better-auth/cookies`)
- **Verification:** `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches. Source contract test in `apps/web/src/lib/__tests__/proxy-contract.test.ts` asserts this.
- **Alternatives Rejected:**
  - _`middleware.ts`_ — deprecated in Next.js 16; will be removed in 17
  - _`auth.api.getSession()` in proxy.ts_ — banned anti-pattern; DB query on every request; breaks caching
  - _Full RBAC in proxy.ts_ — too expensive; belongs in Layer 2 layouts
```

### 4.4 §1.3 — Add 13 new ADRs (V-001 through V-013)

**Edit 43 — After ADR-007 (line 184), add ADR-008 through ADR-020:**

(Full text for each ADR is specified in §5 of this plan — they will be inserted here.)

### 4.5 §3.1 Layer Model — Update for 2-layer auth (V-003)

**Edit 44 — Line 202:**
- **Old:** `│  ├─ proxy.ts (auth check, security headers, locale routing)                      │`
- **New:** `│  ├─ proxy.ts (Layer 1: cookie-only auth via getSessionCookie, security headers, locale routing) │`

### 4.6 §3.2 Directory Structure — Add source-resolution files (V-006)

**Edit 45 — After line 549 (add .npmrc and pnpm-workspace.yaml to docs):**
- **Insert in the directory tree** (find the `docs/` section), add:
```
│   ├── .npmrc                              # custom-conditions=@maison/source (ADR-015)
│   ├── pnpm-workspace.yaml                 # packages: ['.'] + customConditions: ['@maison/source']
```

**Edit 46 — Line 537 (pg_trgm):**
- **Old:** `│           └── 00-create-extensions.sql     # pgcrypto, pg_trgm (for FTS)`
- **New:** `│           └── 00-create-extensions.sql     # pgcrypto (uuid-ossp + pgcrypto — no pg_trgm in v1, FTS deferred per ADR-012)`

### 4.7 §4.1 Database Schema — payment_events table + indexes (V-009)

**Edit 47 — Line 816:**
- **Old:** `  - GIN: `products.name` + `products.short_description` + `products.materials` (full-text search, Phase 1)`
- **New:** `  - B-tree: `products.slug` (unique); `products.collection_id` (filtering); `products.status` (filtering)`
- **Add after line 816:** `  - Unique: `payment_events.stripe_event_id` (webhook idempotency — first line of defense per ADR-014)`

**Edit 48 — After the `orders` table in §4.2, add `payment_events` table:**
- **Insert after the orders table row** (line 802), add:
```
| `payment_events`   | Application           | Stripe webhook event log (idempotency)        | `stripe_event_id` UNIQUE                                  |
```

### 4.8 §4.3 Persistence Strategy — Connection pooling (V-015, already present)

**Edit 49 — Line 810 (verify and clarify):**
- **Old:** `- **Connection pooling:** Neon serverless pooler for application queries (`DATABASE_URL`). Direct connection for migrations (`DATABASE_URL_UNPOOLED`) — PgBouncer breaks prepared statements in migration scripts. `packages/db/drizzle.config.ts` enforces this.`
- **New:** `- **Connection pooling (verified v1.2):** Neon serverless pooler for application queries (`DATABASE_URL`). Direct connection for migrations (`DATABASE_URL_UNPOOLED`) — PgBouncer breaks prepared statements in migration scripts. `packages/db/drizzle.config.ts` enforces this. NEVER use `DATABASE_URL` (pooled) for `drizzle-kit migrate` or `drizzle-kit generate` — migrations will fail silently.`

### 4.9 §5.2 Color Tokens — WCAG AAA contrast (V-004)

**Edit 50 — Lines 880-890 (update WCAG contrast column):**

Update the WCAG contrast ratios in the color tokens table to reflect AAA targets:
- `--ink`: `~17:1 ✅ AAA` (unchanged)
- `--ink-2`: `~9.2:1 ✅ AAA` (unchanged)
- `--muted`: `~4.8:1 ⚠️ AA only (fails AAA for normal text — use only for meta labels at 11px+; darken to #5a5249 for AAA)`
- `--clay`: `~4.6:1 ⚠️ AA only (fails AAA for normal text — use only for ≥ 18px text or non-text accents)`
- `--clay-dark`: `~6.1:1 ⚠️ AA only (fails AAA for normal text — use for ≥ 18px text)`
- `--gold`: `~3.2:1 (large/decorative only — AAA large text ≥ 4.5:1 not met; use only for ≥ 24px decorative)`
- `--sage`: `~3.7:1 (large/decorative only — same as gold)`

**Edit 51 — After line 892 (accessibility rule), add:**
- **Insert after the accessibility rule paragraph**, add:
```
**AAA compliance note (ADR-011):** The MAISON palette targets WCAG 2.2 AAA. `--muted` at 4.8:1 passes AA but fails AAA for normal text — use sparingly for meta labels at 11px+ where the surrounding context provides adequate contrast, or darken to `#5a5249` (~7.2:1) for AAA compliance. `--gold` and `--sage` are decorative only (never for text < 18px). Verified via `scripts/contrast-check.ts` in CI.
```

### 4.10 §5.3 Component Primitives — Update input focus ring + add new components (V-004, V-013)

**Edit 52 — Line 920 (Input focus ring):**
- **Old:** `| Input     | Radix Label + custom  | `default` (full border), `underline` (border-bottom only, for newsletter) | Focus ring: `2px solid var(--clay)` with `3px offset` (focus-visible only) |`
- **New:** `| Input     | Radix Label + custom  | `default` (full border), `underline` (border-bottom only, for newsletter) | Focus ring: `3px solid var(--clay)` with `2px offset` (AAA standard per ADR-011 — was 2px/3px in v1.1, focus-visible only) |`

**Edit 53 — After line 933 (add new component rows):**
- **Insert after the Mesh Glow row** (line 933), add:
```
| **ClientOnly (v1.2 — new, ADR-017)** | Custom (`useSyncExternalStore`) | — | Wraps Better Auth `useSession()` and other SSR-unsafe hooks; `getServerSnapshot: () => false` prevents SSR crash. NEVER use `next/dynamic({ ssr: false })` in Server Components — Next.js 16 build error. |
| **apiPublic caller (v1.2 — new)** | Custom (tRPC server caller) | `api()` (session-aware, forces dynamic), `apiPublic()` (session-free, allows static) | Session-free caller for public pages (`/`, `/products`, `/collections`) — enables static prerendering (`○` not `ƒ`). Session-aware `api()` for auth-gated pages. |
| **payment_events table (v1.2 — new, ADR-014)** | Drizzle schema | — | Webhook idempotency log; `stripe_event_id` UNIQUE INDEX (first defense) + `pg_advisory_xact_lock` (second defense). Fast-path check outside transaction; double-check after lock. |
```

### 4.11 §6.1 Security Rules — Update (V-001, V-009)

**Edit 54 — Line 1198:**
- **Old:** `| All `admin.*` procedures require `staff` or `admin` role | tRPC middleware (RBAC check)                           | Layer 1     |`
- **New:** `| All `admin.*` procedures require `staff`, `manager`, or `owner` role (ADR-008) | tRPC middleware (`staffProcedure` / `ownerProcedure`)  | Layer 1     |`

**Edit 55 — After line 1219 (add new security utilities):**
- **Insert after the `requireRole` row**, add:
```
| `getSessionCookie`      | `better-auth/cookies`                            | Cookie-existence-only check (Layer 1 proxy.ts) — NO DB, NO RBAC |
| `apiPublic`             | `apps/web/src/lib/trpc/server.ts`                | Session-free tRPC caller for public pages (static prerender) |
| `isUniqueViolation`     | `packages/payments/src/webhooks.ts`              | Detects PG code 23505 in webhook idempotency catch (ADR-014) |
```

### 4.12 §6.3 Authentication & Authorization — Rewrite RBAC + flow (V-001, V-003, V-008)

**Edit 56 — Line 95 (context):**
- **Old:** `- **Context:** Authentication requires email/password, OAuth (Google, Apple), magic links, session management, and RBAC (`customer`/`staff`/`admin`). Auth.js (formerly NextAuth) v5 is the incumbent, but has known issues with OAuth reliability and session revocation.`
- **New:** `- **Context:** Authentication requires email/password + Magic Link + Google OAuth (hybrid per ADR-013), session management, and RBAC (`customer`/`staff`/`manager`/`owner` per ADR-008). Auth.js (formerly NextAuth) v5 is the incumbent, but has known issues with OAuth reliability and session revocation.`

**Edit 57 — Lines 1238-1251 (RBAC roles table):**
- **Old:**
```
**RBAC roles:**

| Role                 | Permissions                              | Can access                                               |
| -------------------- | ---------------------------------------- | -------------------------------------------------------- |
| `customer` (default) | Own account, orders, wishlist, addresses | `(shop)`, `(account)`, `account.*` procedures            |
| `staff`              | All customer permissions + admin read    | `(admin)` (read-only), `admin.*.list` procedures         |
| `admin`              | Full access                              | All routes, all `admin.*` procedures including mutations |
```
- **New:**
```
**RBAC roles (ADR-008 — aligned with Stillwater v3.0.0 §15.17):**

| Role                 | Permissions                              | Can access                                               | tRPC tier           |
| -------------------- | ---------------------------------------- | -------------------------------------------------------- | ------------------- |
| `customer` (default) | Own account, orders, wishlist, addresses | `(shop)`, `(account)`, `account.*` procedures            | `protectedProcedure`|
| `staff`              | All customer permissions + admin read    | `(admin)` (read-only), `admin.*.list` procedures         | `staffProcedure`    |
| `manager` (NEW)      | Staff + admin mutations (products, orders)| All `staff` + `admin.*.create/update` procedures       | `staffProcedure`    |
| `owner`              | Full access (including role management)  | All routes, all `admin.*` procedures + `owner.*`         | `ownerProcedure`    |

**tRPC procedure tiers (ADR-008):** `publicProcedure` → `protectedProcedure` → `staffProcedure` (roles: staff/manager/owner) → `ownerProcedure` (role: owner only). Note: `admin`/`adminWrite` are NOT valid tRPC v11 tier names.
```

**Edit 58 — Lines 1244-1249 (auth flow — update step 5):**
- **Old:** `5. Subsequent requests: proxy.ts reads cookie → validates session → attaches to request`
- **New:** `5. Subsequent requests: proxy.ts reads cookie via `getSessionCookie()` (Layer 1 — cookie-existence-only, NO DB per ADR-010) → if absent, redirect to `/auth/sign-in`; if present, `NextResponse.next()` → Layer 2 layout calls `auth.api.getSession({ headers })` for full validation + RBAC via `requireRole()``

**Edit 59 — Line 1259 (threat model — card data):**
- **Old:** `| Card data exposure         | Card numbers in our system                             | Stripe Elements (card data never touches our servers); PCI SAQ-A scope                                           |`
- **New:** `| Card data exposure         | Card numbers in our system                             | Stripe Checkout Sessions (ADR-009 — card data never touches our servers, PCI SAQ-A scope)                         |`

### 4.13 §7.1 Worker Directory Structure — Trigger.dev v4 (V-012)

**Edit 60 — After line 996 (add trigger.config.ts spec):**
- **Insert in §7.1**, add:
```
**Trigger.dev v4 config (ADR-016):**

```typescript
// services/workers/trigger.config.ts
import { defineConfig } from "@trigger.dev/sdk";  // ROOT import — NEVER /v3 (deprecated) or /v4 (nonexistent)

export default defineConfig({
  project: "maison",
  machine: "micro",           // string literal — NOT { preset: "micro" } (v3 form)
  maxDuration: 120,           // CPU budget (NOT wall-clock)
  // build.env removed in v4 — env vars injected at runtime by Trigger.dev Cloud
});
```

**Workers package.json MUST have `"type": "module"`** (required by `verbatimModuleSyntax`).
**Workers tsconfig:** `verbatimModuleSyntax: false` (NOT `true` — conflicts with `@maison/db` CommonJS). Remove `rootDir`/`outDir`.
**Task trigger API:** `tasks.trigger('task-id', payload)` (NOT `TriggerClient.sendEvent()` — v3 API).
```

### 4.14 §8.1 Test Distribution — Coverage thresholds (V-010)

**Edit 61 — Lines 1394-1396:**
- **Old:**
```
| `packages/db`             | 80%              | Schema integrity critical |
| `packages/api`            | 85%              | Business logic critical   |
| `packages/auth`           | 90%              | Security critical         |
```
- **New:**
```
| `packages/db`             | 80%              | Schema integrity critical |
| `packages/api`            | 90%              | Business logic critical (was 85% — aligned to Stillwater per ADR-019) |
| `packages/payments`       | 95%              | Money-critical (NEW per ADR-019) |
| `packages/auth`           | 90%              | Security critical         |
| `apps/web`                | 70%              | UI coverage (NEW per ADR-019) |
| `services/workers`        | 85%              | Background job reliability (NEW per ADR-019) |
```

### 4.15 §8.4 Pre-PR Checklist — Add source contract test (V-003)

**Edit 62 — After the architecture validation checklist**, add:
```
**Source contract tests (per ADR-010):**

- `apps/web/src/lib/__tests__/proxy-contract.test.ts` — asserts `proxy.ts` imports `getSessionCookie` from `better-auth/cookies` and does NOT import `auth` from `@maison/auth` (verified via `rg 'auth\.api\.getSession' apps/web/proxy.ts` → zero matches)
- `apps/web/src/lib/__tests__/rendering-strategy.contract.test.ts` — asserts public pages (`/`, `/products`, `/collections`) import `apiPublic` (not `api`) for static prerendering
```

### 4.16 §9.1 Production Build — db:push warning (V-014)

**Edit 63 — Line 1540:**
- **Old:** `      - pnpm db:migrate (against DATABASE_URL_UNPOOLED)`
- **New:** `      - pnpm db:migrate (against DATABASE_URL_UNPOOLED — NEVER db:push in production per ADR-014)`

### 4.17 §10.2 Common Commands — db:push warning (V-014)

**Edit 64 — Line 1604:**
- **Old:** `| `pnpm db:push`                                 | repo root | Push schema directly to DB (dev only!)            |`
- **New:** `| `pnpm db:push`                                 | repo root | Push schema directly to DB (**DEV ONLY — NEVER use in production**; irreversible schema overwrite. Use `db:migrate` for production per ADR-014) |`

### 4.18 §10.3 Code Style Rules — Add Zod v4, React 19, erasableSyntaxOnly (V-007, V-011, V-013)

**Edit 65 — After the existing code style rules**, add a new subsection:
```
**TypeScript strict flags (ADR-020):**
- `erasableSyntaxOnly: true` — forbids `enum`, `namespace`, parameter properties. Use Drizzle `pgEnum()` for DB enums; use string union types for TS enums: `type Status = 'pending' | 'confirmed' | 'cancelled'`
- `exactOptionalPropertyTypes: true` — omitting a property ≠ assigning `undefined`. Use conditional spreads: `...(value !== undefined ? { value } : {})`
- `noUncheckedIndexedAccess: true` — index access may be `undefined`; guard with `?.` and `?? ''`
- `useUnknownInCatchVariables: true` — `catch (err)` gives `unknown`; narrow before `.message` access
- `verbatimModuleSyntax: true` — use `import type` for type-only imports

**Zod v4 patterns (ADR-018):**
- Use `z.email()` (NOT `z.string().email()` — deprecated in v4)
- Use `z.url({ protocol: /^https:$/ })` (NOT `z.string().url()` — accepts any scheme)
- `z.ZodIssueCode` deprecated → use string literal `'custom'` in `ctx.addIssue()`
- `{ errorMap }` removed, `{ message }` deprecated → use `z.string({ message: '...' })`
- All UUID params: `z.string().uuid()` BEFORE any DB call

**React 19 patterns (ADR-017):**
- Form handlers: `function onSubmit(e: React.SubmitEvent<HTMLFormElement>)` — NOT `React.FormEvent` (deprecated)
- Better Auth `useSession()` in Client Components: wrap in `<ClientOnly>` boundary (Turbopack selects `react-server` export with null hook stubs → `useRef()` crash on SSR otherwise)
- NEVER use `next/dynamic({ ssr: false })` in Server Components — Next.js 16 build error. Use `ClientOnly` wrapper instead.
- Floating promises: `await doAsync()` or `void doAsync()` — never unhandled
- Template literals: `${String(count)}` for numbers; `q ?? ''` for optional strings
- `@types/react` ≥ 19.2.10 required for `React.SubmitEvent` (DefinitelyTyped PR #74383)

**Trigger.dev v4 patterns (ADR-016):**
- Import from `@trigger.dev/sdk` root (NEVER `/v3` deprecated, NEVER `/v4` nonexistent)
- `machine: "micro"` string literal (NOT `{ preset: "micro" }` v3 form)
- `tasks.trigger('task-id', payload)` (NOT `TriggerClient.sendEvent()`)
- `maxDuration` measures CPU time (NOT wall-clock)
- `services/workers/package.json` MUST have `"type": "module"`
- Workers tsconfig: `verbatimModuleSyntax: false`, no `rootDir`/`outDir`
```

### 4.19 §11 Known Issues — Update resolved items (V-002)

**Edit 66 — Lines 1655, 1660 (mark as resolved with ADR-009):**
- **Old (line 1655):** `✅ Resolved — Multi-step checkout with real order creation + Stripe Payment Intents`
- **New:** `✅ Resolved (v1.2) — Multi-step checkout with real order creation + Stripe Checkout Sessions (ADR-009)`
- **Old (line 1660):** `✅ Resolved — Phase 3 audit: documented as intentional (requires Stripe account config for production)`
- **New:** `✅ Resolved (v1.2) — Stripe Checkout Sessions (ADR-009) require Stripe account config for production; documented as intentional`

### 4.20 §12 Key Files Reference — Update (V-001, V-003, V-006, V-013)

**Edit 67 — Line 1704:**
- **Old:** `| `packages/auth/src/config.ts`                        | ~130   | Better Auth config (email/password, custom session w/ role, rate limiting) |`
- **New:** `| `packages/auth/src/config.ts`                        | ~130   | Better Auth config (email/password + magic link + Google OAuth per ADR-013, `customSession` plugin, rate limiting) |`

**Edit 68 — Line 1705:**
- **Old:** `| `packages/auth/src/rbac.ts`                          | ~45    | RBAC roles (customer/staff/admin) + helpers                                |`
- **New:** `| `packages/auth/src/rbac.ts`                          | ~50    | RBAC roles (customer/staff/manager/owner per ADR-008) + `requireRole()` helper |`

**Edit 69 — Line 1706:**
- **Old:** `| `packages/api/src/trpc.ts`                           | ~55    | tRPC init + 4 procedure tiers (public/protected/admin/adminWrite)          |`
- **New:** `| `packages/api/src/trpc.ts`                           | ~65    | tRPC init + 5 procedure tiers (public/protected/staff/manager/owner per ADR-008) |`

**Edit 70 — Line 1718:**
- **Old:** `| `apps/web/proxy.ts`                                  | ~60    | Next.js 16 proxy (auth cookie check, route protection)                     |`
- **New:** `| `apps/web/proxy.ts`                                  | ~45    | Next.js 16 proxy (Layer 1: `getSessionCookie()` cookie-only, NO `auth.api.getSession()` per ADR-010) |`

**Edit 71 — Line 1719:**
- **Old:** `| `apps/web/next.config.ts`                            | ~110   | Next.js config (CSP, transpilePackages, image domains)                     |`
- **New:** `| `apps/web/next.config.ts`                            | ~120   | Next.js config (CSP in `headers()`, `transpilePackages: ['@maison/auth','@maison/api','@maison/db','@maison/config','@maison/ui','@maison/email','@maison/payments']` per ADR-015, image domains) |`

**Edit 72 — After line 1724 (add new key files):**
- **Insert after the homepage row**, add:
```
| `apps/web/src/lib/trpc/server.ts`                    | ~40    | `api()` (session-aware) + `apiPublic()` (session-free) server callers (ADR-017) |
| `apps/web/src/components/client-only.tsx`             | ~25    | `ClientOnly` boundary via `useSyncExternalStore` (ADR-017) |
| `apps/web/src/lib/__tests__/proxy-contract.test.ts`   | ~30    | Source contract test — asserts proxy.ts uses `getSessionCookie` not `auth.api.getSession` |
| `packages/db/src/schema/payment-events.ts`            | ~25    | `payment_events` table (webhook idempotency log, ADR-014) |
| `packages/payments/src/webhooks.ts`                   | ~80    | Webhook handler with dual-defense idempotency (UNIQUE INDEX + `pg_advisory_xact_lock`, ADR-014) |
| `services/workers/trigger.config.ts`                  | ~15    | Trigger.dev v4 config (root SDK import, `machine: "micro"` string, ADR-016) |
| `scripts/contrast-check.ts`                           | ~50    | WCAG AAA contrast verification (7:1 normal text, 4.5:1 large text, ADR-011) |
```

### 4.21 §13 Glossary — Add 12 new terms

**Edit 73 — After the existing glossary table**, add:
```
| **ADR**                  | Architecture Decision Record — see §1.3 for full list (ADR-001 through ADR-020) |
| **apiPublic()**          | Session-free tRPC server caller for public pages — enables static prerendering (`○` not `ƒ`). Contrast with `api()` (session-aware, forces dynamic). |
| **Checkout Session**     | Stripe hosted payment page (ADR-009). Card data never touches our servers (PCI SAQ-A). Natively supports Apple Pay, Google Pay, Stripe Tax. |
| **ClientOnly**           | React component boundary using `useSyncExternalStore` — prevents SSR crash when Better Auth `useSession()` calls null-stub hooks in Turbopack's `react-server` export (ADR-017). |
| **customSession**        | Better Auth plugin that enriches session with `memberId` + `roles` + `activeSubscription`. NOT `session.sessionData` (doesn't exist in v1.6.23). |
| **Dual-defense idempotency** | Webhook pattern (ADR-014): UNIQUE INDEX on `stripe_event_id` (first defense) + `pg_advisory_xact_lock` (second defense). Fast-path check outside transaction; double-check after lock. |
| **getSessionCookie**     | Better Auth cookie-existence check (`better-auth/cookies`). Used in Layer 1 proxy.ts — NO DB, NO RBAC. Contrast with `auth.api.getSession()` (Layer 2, DB-backed). |
| **ilike**                | PostgreSQL case-insensitive LIKE operator. Used for Phase 1 search (ADR-012) — simpler than FTS, sufficient for 13 SKUs. |
| **pg_advisory_xact_lock**| Transaction-scoped PostgreSQL advisory lock (auto-releases at COMMIT/ROLLBACK). Used for webhook idempotency (ADR-014). NOT `pg_advisory_lock` (session-scoped, leaks under PgBouncer). |
| **staffProcedure**       | tRPC v11 procedure tier (ADR-008) — requires roles `['staff', 'manager', 'owner']`. |
| **ownerProcedure**       | tRPC v11 procedure tier (ADR-008) — requires role `owner` only. Used for role management, store settings. |
| **transpilePackages**    | Next.js 16 config option (ADR-015) — transpiles `@maison/*` workspace packages inline via Turbopack. Eliminates `tsc --build` before `next build`. |
```

### 4.22 Footer

**Edit 74 — Last line:**
- **Old:** `_End of Project Architecture Document v1.1. For product requirements, see `docs/PRD_unified.md` (v1.1). For the canonical design system reference, see `docs/MAISON_Design_Guide.md`. For developer onboarding, see `README.md`. For AI agent instructions, see `AGENTS.md` and `CLAUDE.md`._`
- **New:** `_End of Project Architecture Document v1.2. For product requirements, see `docs/PRD_unified.md` (v1.2). For the canonical design system reference, see `docs/MAISON_Design_Guide.md`. For skill-alignment validation, see `docs/PRD_PAD_Validation_Against_Skills.md`. For developer onboarding, see `README.md`. For AI agent instructions, see `AGENTS.md` and `CLAUDE.md`._`

---

## 5. New ADR Full Text (ADR-008 through ADR-020)

The following 13 ADRs will be inserted into PAD §1.3 after ADR-007 (line 184). Each follows the Stillwater format: Context → Decision → Rationale → Consequences → Alternatives Rejected.

### ADR-008: tRPC procedure tier naming (public/protected/staff/manager/owner)

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

### ADR-009: Stripe Checkout Sessions over Payment Intents

- **Context:** The v1.1 PRD/PAD mandated Payment Intents + Stripe Elements + Apple Pay + Google Pay + Stripe Tax. Validation against Stillwater §15.21 and tRPC+Drizzle §9.4 revealed both skills use Stripe Checkout Sessions exclusively — Payment Intents are not mentioned.
- **Decision:** Use Stripe Checkout Sessions (hosted payment page). Server creates `createCheckoutSession({ line_items, success_url, cancel_url, automatic_tax: { enabled: true } })`; browser redirects to `checkoutUrl`; Stripe redirects back to `/checkout/success` or `/checkout/cancel`. Apple Pay, Google Pay, and Stripe Tax are native to Checkout Sessions.
- **Rationale:** (1) Both reference skills use Checkout Sessions — aligning ensures the build matches proven patterns. (2) PCI SAQ-A scope (card data never touches our servers) vs. SAQ-A-EP with Payment Intents + Elements. (3) 13 SKUs with $275–$420 AOV doesn't justify custom Elements UI. (4) Apple Pay/Google Pay work natively in Checkout (no separate Payment Request API). (5) Stripe Tax via single `automatic_tax` parameter (no separate integration).
- **Consequences:**
  - ✅ PCI SAQ-A scope (lowest PCI burden)
  - ✅ Apple Pay, Google Pay, Stripe Tax native — no separate integrations
  - ✅ Less frontend code (no Stripe Elements mounting, card input handling)
  - ❌ Less control over checkout UI styling (mitigated by Stripe Appearance API in Phase 2)
  - ❌ Redirect-based flow (customers leave the site briefly — mitigated by Stripe's brand trust)
- **Alternatives Rejected:**
  - _Payment Intents + Stripe Elements_ — expands PCI scope to SAQ-A-EP; more frontend code; not in reference skills
  - _Legacy Tokens_ — deprecated by Stripe; forbidden
  - _Stripe Checkout (embedded)_ — Phase 2 enhancement via `<StripeCheckout>` embedded iframe

### ADR-010: 2-layer auth pattern (cookie-only proxy + DB-backed layouts)

- **Context:** The v1.1 PAD ADR-006 stated "Async support enables DB-backed auth checks (Better Auth session validation)" in proxy.ts. Validation against Stillwater §5.6 and tRPC+Drizzle §5.6 revealed this is the exact anti-pattern both skills ban. The 2-layer pattern mandates cookie-only checks in proxy.ts (Layer 1) and full validation in layouts (Layer 2).
- **Decision:** Layer 1 (`apps/web/proxy.ts`): use `getSessionCookie(request)` from `better-auth/cookies` — cookie-existence-only, NO DB, NO RBAC, Edge-compatible. If cookie absent, redirect to `/auth/sign-in`. If present, `NextResponse.next()`. Layer 2 (Server Component layouts): `auth.api.getSession({ headers: await headers() })` + `requireRole(...roles)` — full validation, DB-backed.
- **Rationale:** Calling `auth.api.getSession()` in proxy.ts adds a DB query to EVERY request (performance killer), breaks Next.js 16's caching model, and is explicitly banned in both skills. The 2-layer pattern keeps proxy.ts fast (sub-millisecond, Edge-compatible) while pushing full validation to layouts where it runs once per page load.
- **Consequences:**
  - ✅ Proxy.ts is fast (cookie-only, no DB, Edge-compatible)
  - ✅ Full validation once per page load (Layer 2 layouts)
  - ✅ Aligns with Stillwater ADR-009 and tRPC+Drizzle §5.6
  - ❌ Two layers of auth logic (justified by performance gain)
  - ❌ Cannot do RBAC in proxy.ts (must be in layouts)
- **Verification:** `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches. Source contract test in `apps/web/src/lib/__tests__/proxy-contract.test.ts`.
- **Alternatives Rejected:**
  - _`auth.api.getSession()` in proxy.ts (v1.1 approach)_ — banned anti-pattern; DB query per request; breaks caching
  - _Full RBAC in proxy.ts_ — too expensive; belongs in Layer 2
  - _JWT-based sessions_ — complicated revocation; Better Auth uses DB-backed sessions

### ADR-011: WCAG 2.2 AAA target (stricter than ADA Title II AA)

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
  - _WCAG 2.1 AA_ — below ADA Title II deadline (April 24, 2026)

### ADR-012: Phase 1 search via Drizzle `ilike` (not FTS)

- **Context:** The v1.1 PRD/PAD claimed "Postgres FTS for Phase 1 search" with `pg_trgm` extension and GIN indexes. Validation against both skills revealed FTS is not documented — Stillwater uses Drizzle `ilike` + `or` (Lesson 80).
- **Decision:** Use Drizzle `ilike` + `or` for Phase 1 search. No `tsvector` columns, no GIN indexes, no `pg_trgm` extension. Algolia remains the Phase 2 escalation path if `ilike` performance degrades at scale (> 1,000 products).
- **Rationale:** (1) 13 SKUs doesn't justify FTS infrastructure. (2) `ilike` is simpler to implement, debug, and maintain. (3) FTS shines at 1,000+ documents with relevance ranking — we're 2 orders of magnitude below that. (4) Aligns with Stillwater Lesson 80.
- **Consequences:**
  - ✅ Simpler implementation (no generated columns, no query language)
  - ✅ Easier to debug and maintain
  - ❌ No relevance ranking or stemming in Phase 1 (mitigated by sort options: Featured, Newest, Price)
  - ❌ May need migration to Algolia/Meilisearch in Phase 2 if catalog grows
- **Alternatives Rejected:**
  - _Postgres FTS (tsvector + GIN)_ — over-engineered for 13 SKUs; not in reference skills
  - _Algolia from day one_ — premature optimization; adds vendor dependency
  - _pg_trgm trigram matching_ — different feature from FTS; not needed for Phase 1

### ADR-013: Email/password enabled (hybrid auth — diverges from Stillwater passwordless)

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
  - _OAuth only (no email/password)_ — misses customers who prefer password auth

### ADR-014: Stripe webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock`

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
  - _Redis distributed lock_ — adds Redis dependency for webhooks; unnecessary when Postgres advisory locks suffice
  - _Optimistic locking with version columns_ — doesn't fit webhook pattern (no entity to version)

### ADR-015: Source resolution via `transpilePackages` + `@maison/source` custom condition

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

### ADR-016: Trigger.dev v4 root SDK import (`@trigger.dev/sdk`)

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
  - _`@trigger.dev/sdk/v3` import_ — deprecated
  - _BullMQ_ — requires self-managed Redis + worker processes (Stillwater ADR-007 rejected)
  - _Inngest_ — Trigger.dev has better TypeScript DX (Stillwater ADR-007 rejected)

### ADR-017: React 19 `SubmitEvent` + `ClientOnly` boundary for SSR-safe hooks

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
  - _Move all `useSession()` calls to Client Components only_ — too restrictive; some server-rendered layouts need session data

### ADR-018: Zod v4 input validation patterns

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
  - _Yup / Joi_ — less TypeScript integration than Zod; not in reference skills

### ADR-019: Coverage thresholds aligned to Stillwater

- **Context:** The v1.1 PRD/PAD specified coverage thresholds: db 80%, api 85%, auth 90%. Validation against Stillwater §11.1 and tRPC+Drizzle §11.1 revealed different thresholds: api 90%, payments 95%, db 80%, web 70%, workers 85%.
- **Decision:** Align coverage thresholds to Stillwater: `packages/db` 80%, `packages/api` 90% (was 85%), `packages/payments` 95% (new), `packages/auth` 90%, `apps/web` 70% (new), `services/workers` 85% (new).
- **Rationale:** (1) Aligns with proven Stillwater thresholds. (2) `payments` at 95% reflects money-criticality. (3) `api` at 90% (not 85%) reflects business logic criticality. (4) `web` and `workers` thresholds were missing in v1.1.
- **Consequences:**
  - ✅ Aligns with Stillwater production-proven thresholds
  - ✅ Money-critical package (payments) has highest threshold (95%)
  - ❌ `api` threshold raised from 85% to 90% (more tests needed)
- **Alternatives Rejected:**
  - _v1.1 thresholds (api 85%, no payments/web/workers)_ — below skill recommendation; missing packages

### ADR-020: `erasableSyntaxOnly` — no `enum`/`namespace`

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
  - _Parameter properties_ — not erasable; declare properties explicitly in constructor body

---

## 6. New Sections / Components to Add

### 6.1 New `payment_events` table (PAD §4.1 + PRD §9.2)

**Schema definition** (to be added to `packages/db/src/schema/payment-events.ts`):
```typescript
import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const paymentEvents = pgTable('payment_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  stripeEventId: text('stripe_event_id').notNull().unique(),
  stripeEventType: text('stripe_event_type').notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 6.2 New `ClientOnly` component (PAD §5.3 + §12)

**Component** (to be added to `apps/web/src/components/client-only.tsx`):
```typescript
import { useSyncExternalStore, type ReactNode } from 'react';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const isHydrated = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  return isHydrated ? children : fallback;
}
```

### 6.3 New `api()` / `apiPublic()` server callers (PAD §5.3 + §12)

**File** (to be added to `apps/web/src/lib/trpc/server.ts`):
```typescript
import 'server-only';
import { headers } from 'next/headers';
import { appRouter, createContext } from '@maison/api';

const TRPC_ENDPOINT = 'http://localhost:3000/api/trpc';

/** Session-aware caller — uses next/headers → forces route dynamic. */
export async function api() {
  const heads = new Headers(await headers());
  const req = new Request(TRPC_ENDPOINT, { headers: heads });
  const ctx = await createContext({ req });
  return appRouter.createCaller(ctx);
}

/** Session-free caller — no next/headers → route can be static. */
export async function apiPublic() {
  const req = new Request(TRPC_ENDPOINT);
  const ctx = await createContext({ req });
  return appRouter.createCaller(ctx);
}
```

### 6.4 New source contract test (PAD §8.4)

**File** (to be added to `apps/web/src/lib/__tests__/proxy-contract.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const APP_ROOT = join(__dirname, '..', '..', '..');

describe('proxy.ts contract (ADR-010)', () => {
  const proxySrc = readFileSync(join(APP_ROOT, 'proxy.ts'), 'utf8');

  it('imports getSessionCookie from better-auth/cookies', () => {
    expect(proxySrc).toMatch(/import\s+\{\s*getSessionCookie\s*\}\s+from\s+['"]better-auth\/cookies['"]/);
  });

  it('does NOT call auth.api.getSession (banned anti-pattern)', () => {
    expect(proxySrc).not.toMatch(/auth\.api\.getSession/);
  });

  it('does NOT import auth from @maison/auth', () => {
    expect(proxySrc).not.toMatch(/import\s+.*from\s+['"]@maison\/auth['"]/);
  });
});
```

### 6.5 New `scripts/contrast-check.ts` (PAD §12 + PRD §16.3)

**File** (to be added to `scripts/contrast-check.ts`):
- A script that reads all `--color-*` tokens from `apps/web/src/app/globals.css` and verifies WCAG AAA contrast ratios (7:1 normal text, 4.5:1 large text) for all documented pairings.
- Runs in CI as part of Gate 6 (Accessibility).

---

## 7. Execution Order

The updates will be applied in this order to minimize risk and ensure consistency:

### Phase 1 — HIGH-severity (blocking) — 5 edits
1. Copy v1.1 files to v1.2 working copies
2. Apply V-001 (tRPC tier names) — PRD §10.3, PAD §6.3, §12
3. Apply V-002 (Stripe Checkout) — PRD §6.5, §8.1, §11.2, §13, §17; PAD §1.2, §6.4
4. Apply V-003 (2-layer auth) — PAD §1.3 ADR-006 rewrite, §3.1, §6.3
5. Apply V-004 (WCAG AAA) — PRD §2.1, §4.3, §16.3; PAD §5.2, §5.3
6. Apply V-005 (ilike search) — PRD §8.1, §11.2; PAD §1.2, §3.2, §4.1

### Phase 2 — MEDIUM-severity — 7 edits
7. Apply V-006 (transpilePackages ADR-015) — PAD §1.3 (new ADR), §3.2, §12
8. Apply V-007 (erasableSyntaxOnly ADR-020) — PAD §1.2, §10.3
9. Apply V-008 (emailAndPassword ADR-013) — PRD §7.5, §13; PAD §1.3 ADR-002, §6.3
10. Apply V-009 (webhook idempotency ADR-014) — PRD §9.2; PAD §4.1, §4.2, §6.1
11. Apply V-010 (coverage thresholds ADR-019) — PRD §17.3; PAD §8.1
12. Apply V-011 (Zod v4 ADR-018) — PRD §8.1; PAD §1.2, §5.3, §10.3
13. Apply V-012 (Trigger.dev v4 ADR-016) — PAD §7.1, §10.3
14. Apply V-013 (React 19 ADR-017) — PRD §8.1; PAD §1.2, §5.3, §10.3

### Phase 3 — LOW-severity — 3 edits
15. Apply V-014 (db:push warning) — PAD §9.1, §10.2
16. Apply V-015 (DATABASE_URL_UNPOOLED — verify) — PRD §C; PAD §4.3 (already present — verify only)
17. Apply V-016 (ClientOnly — folded into V-013) — PAD §5.3, §12

### Phase 4 — New ADRs + new sections
18. Add ADR-008 through ADR-020 to PAD §1.3 (13 new ADRs — full text in §5 of this plan)
19. Add ADR-008 through ADR-020 summary rows to PRD §8.4
20. Add `payment_events` table to PRD §9.2 and PAD §4.2
21. Add `ClientOnly`, `apiPublic`, `payment_events` to PAD §5.3 component primitives
22. Add new key files to PAD §12
23. Add new glossary terms to PAD §13 and PRD Appendix D
24. Add source contract test spec to PAD §8.4
25. Add `scripts/contrast-check.ts` to PAD §12

### Phase 5 — Header/footer updates
26. Update title, date, changelog in both documents
27. Update footer references in both documents

### Phase 6 — Verification
28. Run verification checklist (§8 below)
29. Cross-check PRD §8.4 ADR table matches PAD §1.3 ADR list
30. Verify no remaining `admin/adminWrite`, `Payment Intent`, `FTS`, `WCAG AA` references

---

## 8. Verification Checklist (Post-Update)

After applying all updates, verify:

### HIGH-severity verifications
- [ ] No remaining `admin/adminWrite` in either document (grep: `rg 'admin/adminWrite'`)
- [ ] No remaining `customer/staff/admin` RBAC role references (should be `customer/staff/manager/owner`)
- [ ] No remaining `Payment Intent` references (should be `Checkout Session`)
- [ ] No remaining `Stripe Elements` references (except in "alternatives rejected" context)
- [ ] No remaining `FTS` or `full-text search` or `pg_trgm` references (should be `ilike`)
- [ ] No remaining `WCAG 2.2 AA` or `WCAG AA` references (should be `WCAG 2.2 AAA`)
- [ ] No remaining `2px solid var(--clay)` focus ring references (should be `3px solid`)
- [ ] ADR-006 rewritten with 2-layer auth pattern (no "DB-backed auth checks" in proxy.ts)
- [ ] `getSessionCookie` referenced in PAD §6.3 and §12
- [ ] `auth.api.getSession` NOT referenced as a proxy.ts pattern (only as Layer 2 layout pattern)

### MEDIUM-severity verifications
- [ ] ADR-008 through ADR-020 added to PAD §1.3 (13 new ADRs)
- [ ] ADR-008 through ADR-020 summary rows added to PRD §8.4
- [ ] `transpilePackages` array specified in PAD §12 (7 `@maison/*` packages)
- [ ] `@maison/source` custom condition referenced in PAD §3.2 and §12
- [ ] `erasableSyntaxOnly` implications documented in PAD §10.3
- [ ] `emailAndPassword: { enabled: true }` documented in PAD §6.3 (hybrid auth)
- [ ] `payment_events` table added to PRD §9.2 and PAD §4.2
- [ ] `pg_advisory_xact_lock` referenced in PAD §4.1, §6.1, and ADR-014
- [ ] Coverage thresholds: api 90%, payments 95%, db 80%, web 70%, workers 85%
- [ ] Zod `^4.4.0` pinned in PRD §8.1 and PAD §1.2
- [ ] `z.email()` and `z.url({ protocol })` patterns in PAD §10.3
- [ ] Trigger.dev root import (`@trigger.dev/sdk`) in PAD §7.1 and §10.3
- [ ] `React.SubmitEvent` (not `FormEvent`) in PAD §10.3
- [ ] `ClientOnly` component in PAD §5.3 and §12
- [ ] `apiPublic` caller in PAD §5.3 and §12

### LOW-severity verifications
- [ ] `db:push` warning includes "NEVER use in production" in PAD §10.2
- [ ] `DATABASE_URL_UNPOOLED` present in PRD §C and PAD §9.2 (verify only — already present)
- [ ] `ClientOnly` component spec in PAD §12

### Cross-document consistency
- [ ] PRD §8.4 ADR table has 20 rows (ADR-001 through ADR-020)
- [ ] PAD §1.3 has 20 ADR sections (ADR-001 through ADR-020)
- [ ] PRD §16.3 WCAG target matches PAD §5.2 contrast ratios (both AAA)
- [ ] PRD §17.3 coverage thresholds match PAD §8.1 (both: api 90, payments 95, db 80, web 70, workers 85)
- [ ] PRD §10.3 RBAC roles match PAD §6.3 (both: customer/staff/manager/owner)
- [ ] Both documents reference `MAISON_Design_Guide.md` and `PRD_PAD_Validation_Against_Skills.md`

### File-level
- [ ] `MAISON_PRD_v1.2.md` saved to `/home/z/my-project/download/`
- [ ] `MAISON_PAD_v1.2.md` saved to `/home/z/my-project/download/`
- [ ] Both files have updated titles (v1.2), dates (July 29, 2026), and changelogs
- [ ] Both files have updated footers referencing v1.2 and the validation report

---

## 9. Estimated Effort

| Phase | Edits | Estimated Time | Risk |
|---|---|---|---|
| Phase 1 (HIGH) | 5 findings, ~20 edits | 30 min | Low — text replacements + ADR-006 rewrite |
| Phase 2 (MED) | 7 findings, ~25 edits | 45 min | Low — text replacements + new ADRs |
| Phase 3 (LOW) | 3 findings, ~5 edits | 10 min | Minimal — text replacements |
| Phase 4 (New ADRs + sections) | 13 ADRs + 5 new sections | 60 min | Medium — substantial new content |
| Phase 5 (Header/footer) | 4 edits | 5 min | Minimal |
| Phase 6 (Verification) | 30 checklist items | 15 min | N/A |
| **Total** | **~75 edits** | **~2.5 hours** | — |

---

*End of update plan. Execution will produce `MAISON_PRD_v1.2.md` and `MAISON_PAD_v1.2.md` in `/home/z/my-project/download/`.*
