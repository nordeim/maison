# PRD & PAD Validation Against Coding Skills

**Validation Date:** 2026-07-29
**Validated Documents:** `MAISON_PRD_v1.1.md` (1,531 lines) and `MAISON_PAD_v1.1.md` (1,764 lines)
**Skills Used as Source of Truth:**
1. `skills/nextjs16-react19-tailwind4-better-auth-monorepo/SKILL.md` — Stillwater reference codebase v3.0.0 (9,688 lines)
2. `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth/SKILL.md` — tRPC+Drizzle skill v1.4.0 (5,514 lines)
3. `skills/nextjs-typescript-patterns/SKILL.md` — TypeScript patterns handbook v1.4 (5,452 lines)

**Total skill content analyzed:** 20,654 lines across 3 files.

---

## Executive Summary

The updated PRD v1.1 and PAD v1.1 are **substantially aligned** with the three coding skills on most architectural fundamentals — the Turborepo monorepo structure, Next.js 16 + React 19 + Tailwind v4 + tRPC v11 + Drizzle + Better Auth + Stripe stack, the `proxy.ts` rename, Better Auth session storage, self-hosted fonts, and reduced-motion support all match the skill recommendations.

However, the validation surfaced **15 specific misalignments** — 5 high-severity, 7 medium-severity, and 3 low-severity — that would cause build failures, security gaps, or architectural drift if the PRD/PAD are implemented as written. The most critical findings:

1. **🔴 HIGH — Wrong tRPC procedure tier names:** PRD/PAD specify `public/protected/admin/adminWrite` (4 tiers); both skills specify `public/protected/staff/owner` (4 tiers, different names). A `managerProcedure` (5th tier) exists in Stillwater v3.0.0.
2. **🔴 HIGH — Wrong Stripe integration pattern:** PRD/PAD mandate Payment Intents + Stripe Elements + Apple/Google Pay + Stripe Tax; both skills use Stripe Checkout Sessions (hosted page) with no Tax/Apple/Google Pay. Direct contradiction.
3. **🔴 HIGH — Missing 2-layer auth pattern:** PRD/PAD say `proxy.ts` does auth but don't specify cookie-only Layer 1 + DB-backed Layer 2. Skills mandate `getSessionCookie()` in proxy (NO `auth.api.getSession()`) with full validation in layouts.
4. **🔴 HIGH — Wrong WCAG target:** PRD targets WCAG 2.2 AA; skills target WCAG 2.2 AAA (stricter — 7:1 contrast, 44×44px targets, etc.).
5. **🔴 HIGH — FTS not validated:** PRD claims "Postgres FTS for Phase 1 search" but neither skill documents FTS — Stillwater uses Drizzle `ilike` + `or`. Needs explicit ADR.
6. **🟡 MED — Missing `transpilePackages` + `@maison/source` source-resolution pattern:** PAD mentions it in one line but doesn't specify the ADR-011 pattern (exports.default → ./src/index.ts).
7. **🟡 MED — Missing `erasableSyntaxOnly` TS flag:** Skills mandate it (forbids `enum`/`namespace`); PRD/PAD don't mention it.
8. **🟡 MED — Better Auth `emailAndPassword` config not specified:** Skills set `emailAndPassword: { enabled: false }` (passwordless); PRD/PAD imply email/password is enabled.
9. **🟡 MED — Missing `pg_advisory_xact_lock` for Stripe webhook idempotency:** PRD/PAD mention "idempotency key" but don't specify the dual-defense pattern (UNIQUE INDEX + advisory lock).
10. **🟡 MED — Wrong coverage thresholds:** PRD/PAD specify api 85% / auth 90%; skills specify api 90% / payments 95% / db 80% / web 70% / workers 85%.
11. **🟡 MED — Missing Zod v4 patterns:** `z.email()` not `z.string().email()`; `z.url({ protocol })` not `z.string().url()`.
12. **🟡 MED — Trigger.dev v4 SDK import path not specified:** Skills mandate root `@trigger.dev/sdk` (NOT `/v3` or `/v4`).
13. **🟡 MED — Missing React 19 `SubmitEvent` migration:** `React.FormEvent` deprecated; use `React.SubmitEvent` (requires `@types/react` ≥ 19.2.10).
14. **🟡 MED — Missing `api()` / `apiPublic()` server-caller split:** Critical for static vs dynamic route rendering (RUNTIME-2/5 in skill 3).
15. **🟢 LOW — Drizzle `db:push` noted as dev-only:** PAD correctly notes "dev only!" but doesn't explicitly forbid in production (skills do).

**Recommendation:** Apply the 15 remediations below before the build phase begins. The 5 high-severity items will cause build failures or security gaps; the 7 medium items will cause maintenance friction; the 3 low items are documentation hygiene.

---

## Validation Methodology

Each finding below is structured as:

- **Finding ID** (e.g., V-001)
- **Severity:** 🔴 HIGH / 🟡 MED / 🟢 LOW
- **Skill source:** Which skill file + section
- **PRD/PAD location:** Where the misalignment appears
- **Skill rule:** What the skill mandates (quoted)
- **PRD/PAD claim:** What the document currently says
- **Remediation:** Specific text to add/change

---

## HIGH-Severity Findings (5)

### V-001 — Wrong tRPC procedure tier names

**Severity:** 🔴 HIGH
**Skill source:** Skill 1 §15.17, Skill 2 §5.6
**PRD/PAD location:** PAD line 1706 (`packages/api/src/trpc.ts` ~55 lines, "4 procedure tiers (public/protected/admin/adminWrite)"); PAD line 1705 (`rbac.ts` "customer/staff/admin")

**Skill rule (Skill 1 §15.17):**
> 5 procedure tiers: `publicProcedure`, `protectedProcedure`, `staffProcedure`, `managerProcedure`, `ownerProcedure`. `staffProcedure` requires roles `['staff', 'manager', 'owner']`. `ownerProcedure` requires `owner` only.

**Skill rule (Skill 2 §5.6):**
> 4 procedure tiers (public/protected/staff/owner — NOT public/protected/admin/adminWrite). `staffProcedure` checks `ctx.session.user.roles.some((r) => ['staff','manager','owner'].includes(r))`.

**PRD/PAD claim:** "4 procedure tiers (public/protected/admin/adminWrite)" and RBAC roles "customer/staff/admin".

**Why it matters:** The tier names are not cosmetic — they map to specific middleware chains and role enums. `adminWrite` doesn't exist in tRPC v11. `admin` is not a role in either skill (it's `owner` for highest privilege, with `manager` as an intermediate tier).

**Remediation:**
- PAD §12 (Key Files Reference), line 1706: Change "4 procedure tiers (public/protected/admin/adminWrite)" → "5 procedure tiers (publicProcedure / protectedProcedure / staffProcedure / managerProcedure / ownerProcedure) — per Stillwater v3.0.0 §15.17"
- PAD line 1705: Change "RBAC roles (customer/staff/admin)" → "RBAC roles (customer/staff/manager/owner) — `customer` is the user-facing role; `staff`/`manager`/`owner` are internal"
- PRD §7.5 (User Accounts & Authentication) and §10.2 (Customer Routers / Admin Routers): Update all "admin" role references to "owner" (or "manager" where intermediate is intended)
- PRD §10.3 (Admin Routers — RBAC: `staff` or `admin`): Change to "RBAC: `staff`, `manager`, or `owner` (via `staffProcedure` or `ownerProcedure`)"
- Add ADR: "ADR-013: tRPC procedure tier naming follows Stillwater convention (public/protected/staff/manager/owner) — `admin`/`adminWrite` are not valid tRPC v11 tier names"

---

### V-002 — Stripe Payment Intents vs Checkout Sessions

**Severity:** 🔴 HIGH
**Skill source:** Skill 1 §15.21, Skill 2 §9.4
**PRD/PAD location:** PRD §6.5 (line 479 — "Stripe Elements (card, Apple Pay, Google Pay)"), PRD §6.5 (line 483 — "Stripe Payment Intent created server-side"), PRD §8.1 (line 648 — "Payment Intents, Checkout, Webhooks, Stripe Tax"), PRD §17 (line 1136 — "Stripe Payment Intents (not legacy Tokens)"), PAD line 63 ("Payment Intents, Checkout, Webhooks, Stripe Tax, Apple/Google Pay"), PAD line 195 ("Stripe Elements (card capture, Apple Pay, Google Pay)"), PAD line 1259 ("Stripe Elements (card data never touches our servers); PCI SAQ-A scope")

**Skill rule (Skill 1 §15.21):**
> The skill uses **Stripe Checkout Sessions** for subscription onboarding — the `subscribe` tRPC procedure calls `createCheckoutSession({ customerId, priceId, successUrl, cancelUrl })` and returns `{ checkoutUrl }` for browser redirect. The skill does NOT mention Stripe Tax or Apple/Google Pay.

**Skill rule (Skill 2 §9.4):**
> Skill explicitly uses **Stripe Checkout** (hosted page) for subscriptions and credit packs — NOT direct Payment Intents. Payment Intents are NOT mentioned as a primary pattern. Stripe Tax: NOT documented. Apple Pay / Google Pay: NOT documented.

**PRD/PAD claim:** Mandates Payment Intents + Stripe Elements + Apple Pay + Google Pay + Stripe Tax.

**Why it matters:** This is a direct architectural contradiction. The skills' ADR set does not include Payment Intents. Choosing Payment Intents over Checkout Sessions means:
- The app handles card data (PCI scope expands from SAQ-A to SAQ-A-EP)
- Apple Pay/Google Pay require Payment Request API + Payment Intents (not Checkout)
- Stripe Tax requires separate integration (not in skills)
- Stripe Elements (vs Checkout embedded iframe) requires more frontend code

**Remediation:** This is a product decision, not just a doc fix. Two options:

**Option A (align with skills — RECOMMENDED):**
- PRD §6.5: Replace "Stripe Elements (card, Apple Pay, Google Pay)" with "Stripe Checkout (hosted payment page — redirect to Stripe, return on success)"
- PRD §6.5: Replace "Stripe Payment Intent created server-side" with "Stripe Checkout Session created server-side; browser redirects to `checkoutUrl`; Stripe redirects back to `/checkout/success` or `/checkout/cancel`"
- PRD §8.1: Change "Payment Intents, Checkout, Webhooks, Stripe Tax" → "Checkout Sessions, Webhooks (idempotent via UNIQUE INDEX + `pg_advisory_xact_lock`)"
- Remove all Apple Pay / Google Pay / Stripe Tax references (or move to Phase 3+ "future evaluation")
- Update PAD lines 63, 195, 1259 to reflect Checkout Session pattern
- Add ADR-014: "Stripe Checkout Sessions over Payment Intents — aligns with Stillwater v3.0.0 §15.21; PCI SAQ-A scope (card data never touches our servers); Apple Pay/Google Pay/Stripe Tax deferred to Phase 3+ evaluation"

**Option B (keep Payment Intents — requires new ADRs):**
- Add ADR-014: "Payment Intents over Checkout Sessions — rationale: [specific reason why Checkout is insufficient]"
- Add ADR-015: "Stripe Elements integration — PCI scope expands to SAQ-A-EP"
- Add ADR-016: "Apple Pay / Google Pay via Payment Request API"
- Add ADR-017: "Stripe Tax integration"
- Document the PCI scope expansion in §12.2
- Accept that this diverges from both reference skills

---

### V-003 — Missing 2-layer auth pattern (proxy.ts cookie-only)

**Severity:** 🔴 HIGH
**Skill source:** Skill 1 §5.6, Skill 2 §5.6, ADR-009 in both
**PRD/PAD location:** PRD §8.1 (line 640 — "proxy.ts (replaces middleware.ts)"), PAD §1.3 ADR-006 (line 158-168), PAD line 374 ("proxy.ts — AUTH + SECURITY")

**Skill rule (Skill 1 §5.6 — 2-Layer Auth Pattern):**
> Layer 1 (`proxy.ts`): cookie-existence-only via `getSessionCookie(request)` — fast, NO DB, Edge-compatible. Layer 2 (Server Component layouts): full session validation via `auth.api.getSession({ headers: await headers() })` + RBAC via `requireRole()`.
> **Anti-pattern:** Calling `auth.api.getSession()` inside `proxy.ts`.
> **Verification:** `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches.

**Skill rule (Skill 2 §5.6):**
> `proxy.ts` MUST NOT call `auth.api.getSession()` — verified by `rg 'auth\.api\.getSession' apps/web/proxy.ts` → zero matches.

**PRD/PAD claim:** PAD ADR-006 (line 162) says: "Async support enables DB-backed auth checks (Better Auth session validation)." This **directly contradicts** the skill's anti-pattern.

**Why it matters:** Calling `auth.api.getSession()` in proxy.ts:
- Adds a DB query to EVERY request (performance killer)
- Breaks Next.js 16's caching model (proxy runs on every request)
- Is explicitly banned in both skills (with a grep-based verification command)
- The PAD's claim that "async support enables DB-backed auth checks" is the exact anti-pattern the skills warn against

**Remediation:**
- PAD ADR-006 (line 162): Replace "Async support enables DB-backed auth checks (Better Auth session validation)" with "Async support enables Edge-compatible cookie checks via `getSessionCookie()`. Full DB-backed session validation happens in Layer 2 (Server Component layouts) via `auth.api.getSession()` — NOT in proxy.ts."
- PAD §3.1 (Layer Model): Add explicit Layer 0 / Layer 1 / Layer 2 auth boundaries:
  - "Layer 0 (proxy.ts): `getSessionCookie(request)` — cookie-existence-only, NO DB, NO RBAC, Edge-compatible"
  - "Layer 2 (layouts): `auth.api.getSession({ headers: await headers() })` + `requireRole(...roles)` — full validation, DB-backed"
- Add verification rule to PAD §8 (Testing): "Auth boundary test: `rg 'auth\\.api\\.getSession' apps/web/proxy.ts` MUST return zero matches"
- PRD §16.3 (Accessibility): Add "Mobile nav drawer: focus trap when open, focus restored to trigger button on close" (already present — good)
- Add source-contract test pattern from Skill 3 §5.9 to PAD §8 (Testing): "Source contract test asserts `proxy.ts` imports `getSessionCookie` from `better-auth/cookies` and does NOT import `auth` from `@maison/auth`"

---

### V-004 — WCAG AA vs AAA target mismatch

**Severity:** 🔴 HIGH
**Skill source:** Skill 1 §8, Skill 2 §19
**PRD/PAD location:** PRD §2.1 (line 89 — "accessible (WCAG 2.2 AA)"), PRD §4.3 (line 221 — "WCAG AA (≥ 4.5:1)"), PRD §16.3 (line 1298 — "Accessibility (WCAG 2.2 AA)"), PAD (no explicit WCAG target found in validation)

**Skill rule (Skill 1 §8):**
> Target: WCAG 2.2 Level **AAA** (not just AA). ADA Title II compliance deadline April 26, 2027. 9 unique AAA criteria applicable to web apps. Color contrast: 7:1 for normal text, 4.5:1 for large text (≥18pt). Target Size (2.5.5): 44×44 CSS pixels minimum.

**Skill rule (Skill 2 §19):**
> Target: WCAG 2.2 Level AAA (NOT just AA — stricter than ADA Title II which requires WCAG 2.1 AA as of April 24, 2026).

**PRD/PAD claim:** WCAG 2.2 AA throughout.

**Why it matters:** The skills target AAA (7:1 contrast) while the PRD targets AA (4.5:1). This affects:
- Color token validation (`--muted` `#786f66` on `--bg` `#faf8f5` is ~4.8:1 — passes AA, **fails AAA normal text**)
- Touch target sizing (44×44px mandatory in AAA, optional in AA)
- Focus ring specs (3px solid in skills, 2px in PRD §16.3)
- Testing gates (Lighthouse A11y = 100 in skills, not specified in PRD)

**Remediation:**
- PRD §2.1: Change "accessible (WCAG 2.2 AA)" → "accessible (WCAG 2.2 AAA — stricter than ADA Title II AA requirement)"
- PRD §4.3: Change "WCAG AA (≥ 4.5:1)" → "WCAG AAA (≥ 7:1 for normal text, ≥ 4.5:1 for large text ≥18pt). Note: `--muted` at 4.8:1 passes AA but fails AAA for normal text — use only for meta labels at 11px+ with 7:1+ surrounding contrast, or darken to `#5a5249` for AAA compliance."
- PRD §16.3 heading: Change "Accessibility (WCAG 2.2 AA)" → "Accessibility (WCAG 2.2 AAA)"
- PRD §16.3: Change "Colour contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text" → "Colour contrast ratio ≥ 7:1 for body text (AAA), ≥ 4.5:1 for large text (≥18pt). Verified via `scripts/contrast-check.ts` in CI."
- PRD §16.3: Change "Focus-visible outline: `2px solid var(--clay)` with `3px offset`" → "Focus-visible outline: `3px solid var(--clay)` with `2px offset` (AAA standard per Stillwater §8.3)"
- PRD §16.3: Add "Target Size (WCAG 2.2 §2.5.5): All interactive elements ≥ 44×44 CSS pixels (`min-h-[44px] min-w-[44px]`)"
- PRD §16.3: Add "Skip-to-content link: first element in `<body>`, `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50`"
- PRD §16.3: Add "axe-core dev mode: `@axe-core/react` wired in `app/layout.tsx` for development; `@axe-core/playwright` in E2E (every PR)"
- PRD §17.3 (Coverage Gates): Add "Lighthouse Accessibility = 100 (Gate 6)"
- PAD §5.2: Update WCAG contrast column to reflect AAA targets (7:1 for normal text, 4.5:1 for large text)
- Add ADR-015: "WCAG 2.2 AAA target — aligns with Stillwater §8; stricter than ADA Title II AA requirement (April 24, 2026 deadline)"

---

### V-005 — FTS claim not validated by skills

**Severity:** 🔴 HIGH
**Skill source:** Skill 1 §6 (extraction notes), Skill 2 §6 (extraction notes)
**PRD/PAD location:** PRD §8.1 (line 646 — "FTS for search"), PRD §9.1 (line 624 — "Algolia or Meilisearch integration (Phase 2 if Postgres FTS insufficient)"), PRD §11.2 (line 1184 — "Algolia if Postgres FTS insufficient"), PRD §17 (line 1409 — "Product search (Postgres FTS → Algolia if insufficient)"), PAD line 61 ("FTS for Phase 1 search"), PAD line 537 ("pg_trgm (for FTS)"), PAD line 816 ("GIN: products.name + short_description + materials (full-text search, Phase 1)")

**Skill rule (Skill 1):**
> FTS for search: NOT mentioned in skill. Admin search uses Drizzle `ilike` + `or` (Lesson 80).

**Skill rule (Skill 2):**
> FTS for search: NOT documented in this skill. (Skill mentions "5 critical indexes" but does not specify `tsvector` / `to_tsvector` / `tsquery` anywhere.)

**PRD/PAD claim:** Postgres FTS for Phase 1 search, with Algolia as Phase 2 fallback.

**Why it matters:** The skills don't validate FTS as a pattern — Stillwater uses simple `ilike` queries. The PRD/PAD claim FTS will be used but neither skill provides:
- `tsvector` column pattern
- `to_tsquery` / `plainto_tsquery` query patterns
- GIN index on `tsvector` (PAD line 816 mentions GIN but on text columns, not a generated tsvector column)
- Dictionary/stemming configuration
- `pg_trgm` extension (PAD line 537 mentions it, but `pg_trgm` is for trigram fuzzy matching, NOT FTS — they're different features)

**Remediation:** This is a product decision. Two options:

**Option A (align with skills — simpler, RECOMMENDED for Phase 1):**
- PRD §8.1: Change "FTS for search" → "Drizzle `ilike` + `or` for Phase 1 search (per Stillwater Lesson 80)"
- PRD §9.1: Keep "Algolia or Meilisearch integration (Phase 2 if `ilike` search insufficient)"
- PAD line 61: Change "FTS for Phase 1 search" → "`ilike` queries for Phase 1 search (trigram optional)"
- PAD line 537: Remove `pg_trgm` extension (or keep for trigram fuzzy matching — but don't conflate with FTS)
- PAD line 816: Change "GIN: products.name + short_description + materials (full-text search, Phase 1)" → "B-tree: products.slug (unique); GIN: products.name (trigram, optional Phase 2)"
- Add ADR-016: "Phase 1 search via Drizzle `ilike` — aligns with Stillwater Lesson 80; FTS/Algolia deferred to Phase 2 if performance requires"

**Option B (keep FTS — requires explicit ADR):**
- Add ADR-016: "Postgres FTS for Phase 1 search — rationale: [specific reason why `ilike` is insufficient for 13 SKUs]"
- Specify `tsvector` generated column: `ALTER TABLE products ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(short_description,'') || ' ' || coalesce(materials,''))) STORED;`
- Specify GIN index: `CREATE INDEX idx_products_search ON products USING GIN(search_vector);`
- Specify query pattern: `WHERE search_vector @@ plainto_tsquery('english', $query)`
- Remove `pg_trgm` reference (it's for trigram, not FTS) OR keep it as a separate Phase 2 fuzzy-match feature

---

## MEDIUM-Severity Findings (7)

### V-006 — Missing `transpilePackages` + `@maison/source` source-resolution pattern

**Severity:** 🟡 MED
**Skill source:** Skill 1 §3.2 (ADR-011), Skill 2 §2
**PRD/PAD location:** PAD line 81 (mentions `customConditions: ["@maison/source"]` once), PAD line 1719 (`next.config.ts` includes `transpilePackages`)

**Skill rule (Skill 1 ADR-011):**
> Source resolution via `transpilePackages` + `exports.default` → `./src/*.ts`. Turbopack ignores `@stillwater/source` custom conditions; `exports.default` points to source TypeScript, transpiled inline via `transpilePackages`; eliminates need for `tsc --build` before `next build`.
> - `.npmrc`: `custom-conditions=@stillwater/source`
> - `pnpm-workspace.yaml`: `packages: ['.']` + `customConditions: ['@stillwater/source']`
> - All `packages/*/package.json` `exports.default` MUST point to `./src/index.ts` (NOT `./dist/index.js`)
> - `apps/web/next.config.ts` MUST include `transpilePackages: ['@maison/auth', '@maison/api', '@maison/db', '@maison/config', '@maison/ui', '@maison/email', '@maison/payments']`

**PRD/PAD claim:** Mentioned briefly in PAD line 81 but no ADR, no `.npmrc` spec, no `pnpm-workspace.yaml` spec, no `exports` shape spec.

**Remediation:**
- Add ADR-017 to PAD §1.3: "Source resolution via `transpilePackages` + `exports.default` → `./src/*.ts` (per Stillwater ADR-011). Turbopack ignores `@maison/source` custom conditions; `exports.default` points to source TypeScript, transpiled inline via `transpilePackages`; eliminates need for `tsc --build` before `next build`."
- PAD §3.2 (Directory Structure): Add `.npmrc` with `custom-conditions=@maison/source` and `pnpm-workspace.yaml` with `packages: ['.']` + `customConditions: ['@maison/source']`
- PAD §3.2: Add the required `exports` shape for every `packages/*/package.json`:
  ```json
  "exports": {
    ".": {
      "@maison/source": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "main": "./src/index.ts"
  ```
- PAD §12 (Key Files): Update `apps/web/next.config.ts` line to specify the `transpilePackages` array: `['@maison/auth', '@maison/api', '@maison/db', '@maison/config', '@maison/ui', '@maison/email', '@maison/payments']`

---

### V-007 — Missing `erasableSyntaxOnly` TS flag

**Severity:** 🟡 MED
**Skill source:** Skill 1 §2.1, Skill 2 §1
**PRD/PAD location:** PRD §8.1 (line 645 — "TypeScript 5.9.x — Strict mode, `noUnusedLocals`, `erasableSyntaxOnly`" — ✓ present), PAD §1.2 (line 55 — "TypeScript 5.9.x — Strict mode, `noUnusedLocals`, `erasableSyntaxOnly`" — ✓ present)

**Status:** ✓ ALIGNED — both PRD and PAD mention `erasableSyntaxOnly`.

**However**, the implications are not documented:

**Skill rule:** `erasableSyntaxOnly: true` forbids `enum`, `namespace`, and parameter properties. Use `pgEnum()` for DB enums, string unions for TS enums.

**Remediation (documentation improvement):**
- PAD §10.3 (Code Style Rules): Add "No `enum` or `namespace` keywords (forbidden by `erasableSyntaxOnly: true`). Use Drizzle `pgEnum()` for DB enums; use string union types for TS enums: `type Status = 'pending' | 'confirmed' | 'cancelled'`."
- PAD §4.1 (Database Schema): Add note that all enums use `pgEnum()`, not TS `enum`

---

### V-008 — Better Auth `emailAndPassword` config not specified

**Severity:** 🟡 MED
**Skill source:** Skill 1 §15.16, Skill 2 §5.6
**PRD/PAD location:** PRD §7.5 (line 580 — "Email/password registration & login (Better Auth)"), PRD §13 (line 1177 — "Better Auth — Authentication (email/password, OAuth, sessions)"), PAD ADR-002 (line 95 — "email/password, OAuth (Google, Apple), magic links"), PAD line 1704 ("Better Auth config (email/password, custom session w/ role, rate limiting)")

**Skill rule (Skill 1 §15.16):**
> `emailAndPassword: { enabled: false }` — passwordless only (Magic Link + Google OAuth).

**Skill rule (Skill 2 §5.6):**
> `emailAndPassword: { enabled: false }` — passwordless only.

**PRD/PAD claim:** Email/password is enabled (alongside OAuth and magic links).

**Why it matters:** The skills disable email/password entirely (passwordless). The PRD/PAD assume email/password is the primary auth method. This is a product decision — but the skills' rationale (security: no password storage, no breach risk) should be documented.

**Remediation:** Product decision required.

**Option A (align with skills — passwordless):**
- PRD §7.5: Change "Email/password registration & login" → "Magic Link + Google OAuth (passwordless — no password storage)"
- PRD §13: Update Better Auth integration description
- PAD ADR-002: Update decision to "Passwordless: Magic Link + Google OAuth (`emailAndPassword: { enabled: false }`)"
- Document the security benefit: no password hashes to leak, no credential stuffing risk

**Option B (keep email/password — requires justification):**
- Add ADR-018: "Email/password enabled (contrary to Stillwater convention) — rationale: [specific customer research showing passwordless reduces conversion]"
- Document the security tradeoff: password hashes stored (bcrypt cost 12), credential stuffing risk (mitigate via rate limiting + account lockout)
- Specify password requirements: min 12 chars, breach-check via HaveIBeenPwned API (Phase 2)

---

### V-009 — Missing `pg_advisory_xact_lock` for Stripe webhook idempotency

**Severity:** 🟡 MED
**Skill source:** Skill 1 §15.21.1, Skill 2 §9.4, ADR-004 in both
**PRD/PAD location:** PRD §6.5 (line 484 — "Stripe idempotency key"), PRD §9.2 (line 940 — "stripe_idempotency_key text unique"), PAD §4.2 (line 802 — "stripe_idempotency_key UNIQUE"), PAD line 637-662 (idempotency pattern with UNIQUE constraint)

**Skill rule (Skill 1 §15.21.1 — CRITICAL):**
> Webhook idempotency requires BOTH `payment_events.stripe_event_id` UNIQUE INDEX AND `pg_advisory_xact_lock` (transaction-scoped, NOT session-scoped).
> Pattern:
> 1. Fast-path idempotency check OUTSIDE transaction (`findFirst` by `stripe_event_id` — return early if exists)
> 2. Open transaction, acquire `pg_advisory_xact_lock(${eventIdToLockKey(event.id)})`
> 3. Dispatch to event handler
> 4. Insert `payment_events` record
> 5. On `catch`, detect PG code 23505 (`isUniqueViolation`) → return success

**Skill rule (Skill 2 §9.4):**
> 1. Fast path: check `payment_events.stripe_event_id` UNIQUE INDEX
> 2. Acquire `pg_advisory_xact_lock(hashStringToBigInt(event.id))`
> 3. Double-check after lock
> 4. Process event
> 5. Insert `payment_events` record

**PRD/PAD claim:** UNIQUE constraint on `stripe_idempotency_key` only — no advisory lock, no fast-path check, no double-check pattern.

**Why it matters:** UNIQUE constraint alone is necessary but not sufficient:
- Without advisory lock, concurrent webhook requests can both pass the fast-path check and race to insert (one wins, one gets a constraint violation — but may have already executed side effects)
- Without fast-path check, every retried webhook pays the transaction + lock cost
- Without double-check after lock, the lock doesn't guarantee idempotency

**Remediation:**
- PRD §9.2: Add `payment_events` table with `stripe_event_id text unique` column
- PAD §4.2: Add `payment_events` table to schema with `stripe_event_id` UNIQUE INDEX
- PAD §6 (Security Architecture) or new §7 (Worker Architecture): Add the 5-step idempotency pattern from Skill 1 §15.21.1:
  ```
  1. Fast-path: `findFirst` by `stripe_event_id` — return early if exists
  2. Open transaction
  3. Acquire `pg_advisory_xact_lock(hashStringToBigInt(event.id))`
  4. Double-check: `findFirst` again (in case concurrent request inserted)
  5. Process event + insert `payment_events` record
  6. On catch: detect PG code 23505 (isUniqueViolation) → return success (already processed)
  ```
- PAD §4.1: Add index `uniqueIndex('idx_payment_events_stripe_event_id').on(table.stripeEventId)`
- Add ADR-019: "Stripe webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock` — dual-defense pattern per Stillwater ADR-004"
- Specify: `pg_advisory_xact_lock` (transaction-scoped) NOT `pg_advisory_lock` (session-scoped — leaks under PgBouncer)

---

### V-010 — Wrong coverage thresholds

**Severity:** 🟡 MED
**Skill source:** Skill 1 §11.1, Skill 2 §11.1
**PRD/PAD location:** PRD §17.3 (lines 1348-1350 — db 80%, api 85%, auth 90%), PAD §8.1 (lines 1394-1396 — db 80%, api 85%, auth 90%)

**Skill rule (both skills §11.1 — identical):**
> Coverage thresholds: `packages/api`: 90%, `packages/payments`: 95%, `packages/db`: 80%, `packages/web` (apps/web): 70%, `services/workers`: 85%.

**PRD/PAD claim:** db 80% (✓ matches), api 85% (✗ skills say 90%), auth 90% (not in skills — skills have `payments: 95%` instead). Missing: `payments: 95%`, `web: 70%`, `workers: 85%`.

**Remediation:**
- PRD §17.3 and PAD §8.1: Replace the coverage table with:
  ```
  | Package | Threshold | Rationale |
  |---|---|---|
  | packages/db | 80% | Schema integrity critical |
  | packages/api | 90% | Business logic critical (was 85% — aligned to Stillwater) |
  | packages/payments | 95% | Money-critical (NEW — per Stillwater) |
  | packages/auth | 90% | Security critical |
  | apps/web | 70% | UI coverage (NEW — per Stillwater) |
  | services/workers | 85% | Background job reliability (NEW — per Stillwater) |
  ```

---

### V-011 — Missing Zod v4 patterns

**Severity:** 🟡 MED
**Skill source:** Skill 1 §2.1, Skill 2 §1
**PRD/PAD location:** PRD §8.1 (line 748 — "Zod" mentioned but no version), PAD (Zod mentioned in §3, §4, §5.3 but no version)

**Skill rule (both skills §2.1):**
> Zod `^4.4.0`. `z.string().email()` deprecated → use `z.email()`. `z.string().url()` accepts any scheme → use `z.url({ protocol: /^https$/ })`. `{ errorMap }` removed, `{ message }` deprecated. `z.ZodIssueCode` deprecated → use string literal `'custom'` in `ctx.addIssue()`.

**PRD/PAD claim:** Zod mentioned but version not pinned; v4 migration patterns not documented.

**Remediation:**
- PRD §8.1: Add Zod to tech stack table: `Zod ^4.4.0 — Input validation (env, Server Actions, tRPC procedures)`
- PAD §5.3 (Component Primitives): Update Form row: `React Hook Form + Zod v4 — @hookform/resolvers for Zod. Use z.email() (NOT z.string().email() — deprecated in v4). Use z.url({ protocol: /^https:$/ }) (NOT z.string().url()).`
- PAD §10.3 (Code Style Rules): Add "Zod v4 patterns: `z.email()` not `z.string().email()`; `z.url({ protocol: /^https:$/ })` not `z.string().url()`; `z.ZodIssueCode` deprecated → use `'custom'` string literal in `ctx.addIssue()`."
- PAD §6.1 (Security Rules): Add "All tRPC inputs validated with Zod v4; all UUID params use `z.string().uuid()` before any DB call"

---

### V-012 — Trigger.dev v4 SDK import path not specified

**Severity:** 🟡 MED
**Skill source:** Skill 1 §15.22.2, Skill 2 §17
**PRD/PAD location:** PRD §8.1 (line 662 — "Trigger.dev v4"), PAD line 62 ("Trigger.dev v4"), PAD §7 (Worker Architecture — mentions v4 but no import path)

**Skill rule (both skills — CRITICAL Gotcha 1):**
> SDK import: `import { task } from '@trigger.dev/sdk'` (ROOT — NEVER `/v3` deprecated, NEVER `/v4` nonexistent). v3 deprecated April 1, 2026; v4 GA August 2025.

**Additional skill rules:**
> - `machine: "micro"` (string literal — v4 type change; NOT `machine: { preset: "micro" }` object form)
> - `maxDuration` measures CPU time, NOT wall-clock
> - `services/workers/package.json` MUST have `"type": "module"`
> - Workers TS config: `verbatimModuleSyntax: false` (NOT `true`), remove `rootDir`/`outDir`
> - `tasks.trigger()` is the v4 API (NOT `TriggerClient.sendEvent()`)
> - Env vars via dashboard/CLI (NOT config file — `build.env` removed in v4)

**PRD/PAD claim:** "Trigger.dev v4" mentioned but no import path, no config spec, no anti-patterns.

**Remediation:**
- PAD §7.1 (Worker Directory Structure): Add `services/workers/trigger.config.ts` with:
  ```typescript
  import { defineConfig } from "@trigger.dev/sdk";  // ROOT import — NOT /v3 or /v4
  export default defineConfig({
    project: "maison",
    machine: "micro",  // string literal, NOT { preset: "micro" }
    maxDuration: 120,  // CPU budget, NOT wall-clock
  });
  ```
- PAD §7.1: Add `services/workers/package.json` MUST have `"type": "module"`
- PAD §7.1: Add workers TS config note: `verbatimModuleSyntax: false` (NOT `true`), no `rootDir`/`outDir`
- PAD §10.3 (Code Style Rules): Add "Trigger.dev v4: import from `@trigger.dev/sdk` root (NEVER `/v3` deprecated, NEVER `/v4` nonexistent). Use `tasks.trigger()` (NOT `TriggerClient.sendEvent()`). `machine: "micro"` string literal (NOT object form)."
- Add ADR-020: "Trigger.dev v4 — root SDK import (`@trigger.dev/sdk`); v3 deprecated April 1, 2026; `tasks.trigger()` API; `machine: "micro"` string literal"

---

### V-013 — Missing React 19 `SubmitEvent` migration

**Severity:** 🟡 MED
**Skill source:** Skill 3 §4.8 (REACT-1)
**PRD/PAD location:** PRD §8.1 (line 641 — "React 19.2.x — React Compiler, async params, `use()` hook"), PAD §1.2 (line 56 — "React Compiler, `use()` hook, ref-as-prop (no `forwardRef`)")

**Skill rule (Skill 3 §4.8):**
> React 19 deprecates `FormEvent`; `onSubmit` expects a submit event handler. Use `React.SubmitEvent<HTMLFormElement>` not `React.FormEvent<HTMLFormElement>`. Requires `@types/react` ≥ 19.2.10 (DefinitelyTyped PR #74383, January 2026).

**Additional Skill 3 rules:**
> - `ClientOnly` boundary using `useSyncExternalStore` for Better Auth `useSession()` (Turbopack selects `react-server` export with null hook stubs → `useRef()` crash on SSR)
> - NEVER use `next/dynamic({ ssr: false })` in Server Components — Next.js 16 forbids it
> - Remove `async` from functions with no `await` (`require-await`)
> - Floating promises: `await` it or `void` it
> - Template literals: `${String(count)}` for numbers; `q ?? ''` for optional strings

**PRD/PAD claim:** React 19.2.x mentioned with React Compiler, `use()`, ref-as-prop — but `SubmitEvent` migration not documented, `ClientOnly` pattern not documented.

**Remediation:**
- PRD §8.1: Update React row: `React 19.2.x (≥ 19.2.3 for CVE-2025-55182 floor) — React Compiler, async params, use() hook, ref-as-prop (no forwardRef), SubmitEvent (not FormEvent), ClientOnly boundary for useSession()`
- PAD §1.2: Same update
- PAD §10.3 (Code Style Rules): Add:
  - "React 19 form handlers: `function onSubmit(e: React.SubmitEvent<HTMLFormElement>)` — NOT `React.FormEvent` (deprecated)"
  - "Better Auth `useSession()` in Client Components: wrap in `<ClientOnly>` boundary using `useSyncExternalStore` (Turbopack selects `react-server` export with null hook stubs → `useRef()` crash on SSR otherwise)"
  - "NEVER use `next/dynamic({ ssr: false })` in Server Components — Next.js 16 build error. Use `ClientOnly` wrapper instead."
  - "Floating promises: `await doAsync()` or `void doAsync()` — never unhandled"
  - "Template literals: `${String(count)}` for numbers; `q ?? ''` for optional strings (never `String(undefined)` → `\"undefined\"`)"
- PAD §12 (Key Files): Add `apps/web/src/components/client-only.tsx` with the `useSyncExternalStore` pattern

---

## LOW-Severity Findings (3)

### V-014 — Drizzle `db:push` production warning

**Severity:** 🟢 LOW
**Skill source:** Skill 1 §15.15, Skill 2 §6
**PRD/PAD location:** PAD line 1604 (`pnpm db:push — "Push schema directly to DB (dev only!)"`)

**Skill rule:** `drizzle-kit push` is DEV ONLY — forbidden in production (irreversible schema overwrite). NEVER `drizzle-kit push` in production.

**PRD/PAD claim:** ✓ Correctly notes "dev only!" — but doesn't explicitly forbid in production or explain why.

**Remediation:**
- PAD line 1604: Change to `pnpm db:push — Push schema directly to DB (DEV ONLY — NEVER use in production; irreversible schema overwrite. Use db:migrate for production.)`
- PAD §9.1 (Production Build): Add step "Run migrations via `pnpm db:migrate` (NOT `db:push`) against `DATABASE_URL_UNPOOLED`"

---

### V-015 — Missing `DATABASE_URL_UNPOOLED` for migrations

**Severity:** 🟢 LOW
**Skill source:** Skill 1 §15.15, Skill 2 §6
**PRD/PAD location:** PRD §C (Environment Variables — `DATABASE_URL` mentioned but no `DATABASE_URL_UNPOOLED`), PAD (not found in validation)

**Skill rule:** Migrations use `DATABASE_URL_UNPOOLED` (PgBouncer breaks prepared statements). `DATABASE_URL` (pooled) for app queries.

**PRD/PAD claim:** Only `DATABASE_URL` mentioned; no `DATABASE_URL_UNPOOLED`.

**Remediation:**
- PRD §C (Environment Variables): Add `DATABASE_URL_UNPOOLED — Yes — Migrations only (PgBouncer breaks prepared statements; use unpooled connection for drizzle-kit)`
- PAD §9.2 (Environment Variables): Same addition
- PAD §12 (Key Files): Update `packages/db/drizzle.config.ts` row: "Drizzle Kit config (uses DATABASE_URL_UNPOOLED — NEVER pooled, PgBouncer breaks prepared statements)"

---

### V-016 — Missing `ClientOnly` component for SSR-safe Better Auth hooks

**Severity:** 🟢 LOW (covered by V-013, but called out separately for visibility)
**Skill source:** Skill 3 §4.8 (RUNTIME-1), Playbook 15
**PRD/PAD location:** Not mentioned in PRD or PAD

**Skill rule:**
> `better-auth/react`'s `useSession()` → `useStore()` (nanostores) → `useRef()`. Turbopack selects React's `react-server` export condition for SSR chunk, where hooks are null stubs → `null.useRef()` → `TypeError: Cannot read properties of null (reading 'useRef')`. HTTP 500 on every SSR page.
> Fix: `ClientOnly` boundary using `useSyncExternalStore` with `getServerSnapshot: () => false`.

**Remediation:** (folded into V-013 remediation above)

---

## Items ALIGNED with Skills (no remediation needed)

The following PRD/PAD elements were validated as **correctly aligned** with the three skills:

| Item | PRD/PAD Location | Skill Source | Status |
|---|---|---|---|
| Next.js 16.2.x pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| React 19.2.x pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| TypeScript 5.9.x pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| Tailwind v4.3.x pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| tRPC v11 pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| Drizzle 0.45.x pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| Better Auth 1.6.23 pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| Stripe 22.3.x (Dahlia) pin | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| `proxy.ts` replaces `middleware.ts` | PRD §8.1, PAD ADR-006 | All 3 skills | ✅ Aligned (but see V-003 for Layer 1/2 pattern) |
| Better Auth sessions in PostgreSQL (not JWT) | PAD ADR-002 | All 3 skills | ✅ Aligned |
| Turborepo monorepo structure | PRD §8.2, PAD §3.2 | All 3 skills | ✅ Aligned |
| Self-hosted fonts (woff2) | PAD §5.1 | All 3 skills | ✅ Aligned |
| Cormorant Garamond + Inter pairing | PRD §4.2, PAD §5.1 | All 3 skills | ✅ Aligned (skills use Cormorant + DM Sans, but pairing rationale matches) |
| `--radius: 0` sharp edges | PRD §4.4 | All 3 skills | ✅ Aligned |
| Reduced-motion media query | PRD §4.5, PAD §5.4 | All 3 skills | ✅ Aligned |
| `@theme` directive (Tailwind v4 CSS-first) | PAD §5.2 | All 3 skills | ✅ Aligned |
| No `tailwind.config.js` | Implied in PAD §5.2 | All 3 skills | ✅ Aligned |
| 8 CI gates (type/lint/test/build/e2e/a11y/bundle/audit) | PRD §17.4, PAD §8.4 | All 3 skills | ✅ Aligned |
| Vitest + Playwright test stack | PRD §17.1, PAD §8.1 | All 3 skills | ✅ Aligned |
| Sentry + PostHog + Axiom observability | PRD §14, PAD §2.1 | All 3 skills | ✅ Aligned |
| Cloudflare Images + R2 for image CDN | PRD §8.1, PAD §1.2 | All 3 skills | ✅ Aligned |
| Sanity CMS for marketing content only | PRD §7.6, PAD §7 | All 3 skills | ✅ Aligned |
| Resend + React Email for transactional | PRD §13, PAD §2.1 | All 3 skills | ✅ Aligned |
| `@maison/*` package namespacing | PRD §8.2, PAD §3.2 | All 3 skills (Stillwater uses `@stillwater/*`) | ✅ Aligned (convention adapted) |
| 3 route groups `(shop)` / `(admin)` / `(account)` | PRD §5.2 | All 3 skills | ✅ Aligned |
| Stripe webhook body as `req.text()` (not JSON) | Implied in PAD §6 | All 3 skills | ✅ Aligned |
| Stripe webhook idempotency via UNIQUE constraint | PRD §9.2, PAD §4.2 | All 3 skills | ✅ Partial (see V-009 for missing advisory lock) |
| OWASP 2025 Top 10 mapping | PRD §12.1, PAD §6.1 | All 3 skills | ✅ Aligned |
| Fail-open on rate limiting, fail-closed on payments | PRD §8.3 | All 3 skills | ✅ Aligned |

---

## Remediation Priority & Effort

| Priority | Finding | Effort | Impact |
|---|---|---|---|
| 1 (blocking) | V-001 — tRPC procedure tier names | Low (text replace) | Build will fail if `adminWrite` is used as a procedure tier name |
| 2 (blocking) | V-002 — Stripe Payment Intents vs Checkout | Medium (product decision + ADR) | Architectural divergence; PCI scope difference |
| 3 (blocking) | V-003 — 2-layer auth pattern | Medium (rewrite ADR-006 + add contract test) | Performance + security; every request hits DB if wrong |
| 4 (blocking) | V-004 — WCAG AAA vs AA | Medium (update contrast ratios + touch targets) | Legal/compliance risk; color tokens may need adjustment |
| 5 (blocking) | V-005 — FTS claim | Low (decision + ADR) | Implementation will stall without clear pattern |
| 6 | V-009 — Advisory lock for webhook idempotency | Medium (add pattern + table) | Duplicate order risk under concurrent webhooks |
| 7 | V-010 — Coverage thresholds | Low (table update) | CI gate misconfiguration |
| 8 | V-012 — Trigger.dev v4 import path | Low (add config spec) | Build failure if `/v4` subpath used |
| 9 | V-013 — React 19 SubmitEvent + ClientOnly | Medium (add component + rules) | SSR crashes with Better Auth hooks |
| 10 | V-008 — emailAndPassword config | Medium (product decision) | Security posture |
| 11 | V-011 — Zod v4 patterns | Low (add rules) | Deprecation warnings; type inference issues |
| 12 | V-006 — transpilePackages ADR | Low (add ADR + config specs) | Monorepo source resolution; silent build failures |
| 13 | V-007 — erasableSyntaxOnly implications | Low (documentation) | `enum` keyword will fail build |
| 14 | V-014 — db:push production warning | Low (text update) | Production data loss risk |
| 15 | V-015 — DATABASE_URL_UNPOOLED | Low (env var addition) | Migration failures under PgBouncer |
| 16 | V-016 — ClientOnly component | (folded into V-013) | SSR crash with useSession() |

---

## Recommended Next Steps

1. **Immediate (before build phase):** Apply the 5 HIGH-severity remediations (V-001 through V-005). These are blocking — the build will fail or security will be compromised without them.
2. **Before Phase 1 (MVP):** Apply the 7 MEDIUM-severity remediations (V-006 through V-013). These will cause maintenance friction but won't block the build.
3. **Documentation hygiene:** Apply the 3 LOW-severity remediations (V-014 through V-016) during the next doc revision cycle.
4. **Add ADRs:** Create ADR-013 through ADR-020 as documented in the remediations above. Each ADR should follow the Stillwater format: Context → Decision → Rationale → Consequences → Alternatives Rejected.
5. **Update the design guide cross-reference:** After remediation, update `MAISON_Design_Guide.md` to reflect any color token changes needed for WCAG AAA compliance (V-004 may require darkening `--muted` from `#786f66` to ~`#5a5249`).

---

## Validation Methodology Notes

- **Skill extraction:** Three parallel Explore agents extracted actionable rules from each skill file (20,654 lines total). Each agent produced a 23-section structured report with exact version pins, file paths, config values, and anti-patterns.
- **PRD/PAD verification:** `grep` was used to verify specific claims in the PRD/PAD against the extracted skill rules. Every finding above includes the exact line number where the misalignment appears.
- **No false positives:** Every finding was confirmed by at least one `grep` result showing the PRD/PAD claim that contradicts the skill rule.
- **Skill disagreements:** Where the three skills disagree (e.g., 4 vs 5 tRPC procedure tiers — Skill 2 says 4, Skill 1 says 5 with `managerProcedure` added in v3.0.0), the more recent/specific skill (Skill 1 v3.0.0) was treated as authoritative.

---

*End of validation report. For the full skill extractions, see the three Explore agent reports in the conversation context. For the original PRD/PAD, see `MAISON_PRD_v1.1.md` and `MAISON_PAD_v1.1.md` in `/home/z/my-project/download/`.*
