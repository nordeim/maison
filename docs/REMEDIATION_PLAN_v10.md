# MAISON — Codebase Remediation Plan v10

**Date:** 2026-08-01
**Author:** Super Z coding agent (audit-driven, TDD-executed)
**Predecessor:** `docs/REMEDIATION_PLAN_v9.md` (V11–V16 arc; closed)
**Companion audits:** `AUDIT_REPORT.md` (v1.5 skill audit, 92% compliance), `last_remediation.md` (reconciled V11→V16 summary)
**Source-of-truth docs:** `README.md`, `Project_Requirements_Document.md`, `docs/MAISON_Design_Guide.md`, `Project_Architecture_Document.md`, `AGENTS.md`, `CLAUDE.md`

---

## 0. Executive Summary

This plan addresses the **outstanding** findings from `AUDIT_REPORT.md` and `last_remediation.md` that survived the V11→V16 remediation arc. The V11→V16 arc closed all *active* rendering and security defects (RENDER-1 through RENDER-5, SECURITY-1) — what remains is a set of *latent* and *hygiene* gaps that block the codebase from reaching the documented "100% skill compliance" target.

The remediation is **TDD-driven**: each fix is paired with a contract test that fails red before the fix is applied and passes green after. The contract tests then become permanent regression guards.

### Verification Gates — Baseline (captured 2026-08-01)

| Gate | Command | Result |
|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 packages pass |
| ESLint | `pnpm lint` | ✅ pass (only `@maison/web` has a `lint` script) |
| Prettier | `pnpm format:check` | ✅ clean |
| Unit tests | `pnpm test` | ✅ 207 tests across 8 packages |
| Build | `pnpm build` | ✅ 10/10 packages build; 42 routes generated (16 ○ + 26 ƒ) |

### Skill Compliance Baseline

| Skill Area | Compliance | Gap |
|---|---|---|
| All V11–V16 patterns | ✅ Full | — |
| Dependency hygiene | ⚠️ Partial | 6 packages with unused deps (MEDIUM-1–6) + 12 additional in `@maison/web` |
| Per-package lint scripts | ⚠️ Partial | 12 of 13 packages have no `lint` script (LOW-1) |
| `useSearchParams` Suspense | ⚠️ Partial | ScrollRevealTrigger fixed (V15-1); SortSelect still un-Suspense'd (LOW-2) |
| Config-file type-checking | ⚠️ Partial | 7 library-style packages exclude root `*.config.ts` from tsconfig (LOW-4) |
| `@maison/ui` test infra | ⚠️ Partial | No `test` script, no `vitest.config.ts` (LOW-8) |
| Routing-table doc claim | ⚠️ Drift | AGENTS.md/CLAUDE.md claim 25 ○ + 12 ƒ = 37; actual is 16 ○ + 26 ƒ = 42 |

**Target:** 100% skill compliance, 0 critical/high/medium findings, all doc claims match the live codebase.

---

## 1. Alignment Audit Findings (Codebase vs Canonical Docs)

The audit was performed by independent Explore sub-agents against the live codebase at HEAD (`fefbc57`). Three audit dimensions were scanned in parallel:

### 1.1 Routing-Count Drift (HIGH-priority doc fix)

**Claim** (verbatim from `AGENTS.md:9`, `CLAUDE.md:9`):
> "37 production routes (25 static ○ + 12 dynamic ƒ)"

**Reality** (captured from `pnpm build` output 2026-08-01):
- **16 ○ Static**: `/`, `/_not-found`, `/about`, `/auth/callback`, `/auth/sign-in`, `/auth/sign-up`, `/cart`, `/checkout`, `/collections`, `/contact`, `/gift-cards`, `/journal`, `/manifest.webmanifest`, `/robots.txt`, `/sitemap.xml`, `/trade`
- **26 ƒ Dynamic**: `/account`, `/account/addresses`, `/account/loyalty`, `/account/orders`, `/account/settings`, `/account/wishlist`, `/admin`, `/admin/analytics`, `/admin/customers`, `/admin/discounts`, `/admin/inventory`, `/admin/orders`, `/admin/products`, `/admin/products/new`, `/admin/reviews`, `/admin/trade`, `/api/auth/[...all]`, `/api/og/[...slug]`, `/api/trpc/[trpc]`, `/api/webhooks/sanity`, `/api/webhooks/stripe`, `/journal/[slug]`, `/opengraph-image`, `/products`, `/products/[slug]`, `/search`
- **Total: 42 routes** (not 37)

**Root cause** (verified by code inspection):

`AGENTS.md:262` claims: *"Public shop routes (`/`, `/collections`, `/products`, `/search`) use `apiPublic()` and render as `○ Static`."*

This claim is **incomplete**. The `api()`/`apiPublic()` split is correctly implemented in `apps/web/src/lib/trpc/server.ts:52-75` — `api()` calls `next/headers` (forces dynamic), `apiPublic()` does not (static-capable). **But** in Next.js 16 there are **three** independent opt-outs of static generation, not one:

1. Calling `next/headers` (only `api()` does this — by design).
2. `await searchParams` inside the page body or `generateMetadata`.
3. `await params` inside a dynamic-segment page with no `generateStaticParams`.

`/products` and `/search` use `apiPublic()` correctly, but they ALSO call `await searchParams`, which opts them out of static generation:

```tsx
// apps/web/src/app/(shop)/products/page.tsx:41
const params = await searchParams;       // ← forces ƒ (Dynamic)
const sort = params.sort ?? 'featured';
```

```tsx
// apps/web/src/app/(shop)/search/page.tsx:28
const { q } = await searchParams;        // ← forces ƒ (Dynamic)
```

So the AGENTS.md/CLAUDE.md mental model — *"`apiPublic()` ⟹ `○ Static`"* — is **necessary but not sufficient**. The doc claim needs to be corrected to reflect the actual 16/26 split and the actual `/`, `/collections`-only static shop set.

**Other counts verified correct** (no doc edit needed):
- 13 tRPC routers — ✅ matches `packages/api/src/root.ts:9-21`
- 24 Drizzle tables — ✅ matches (24 `pgTable()` across 22 schema files; `loyalty.ts` and `gift-cards.ts` each define two)
- 30 E2E tests (22 smoke + 8 a11y) — ✅ matches `e2e/smoke.spec.ts` (22 tests) + `e2e/accessibility.spec.ts` (8 tests via `for...of PUBLIC_PAGES`)

### 1.2 SortSelect Suspense Gap (LOW-2, latent)

**Claim** (implicit in `AGENTS.md:262`): the repo's only `useSearchParams()` consumers are properly wrapped in `<Suspense>` (V15-1 fix locked this for `ScrollRevealTrigger`).

**Reality** (verified by repo-wide grep):

`apps/web/src/components/shop/SortSelect.tsx` calls `useSearchParams()` at line 22, and is rendered by `apps/web/src/app/(shop)/products/page.tsx:155` with NO `<Suspense>` ancestor:

```tsx
<SortSelect currentSort={sort} />     // ← line 155, no <Suspense> wrapping it
```

The repo has exactly **two** `<Suspense>` matches, both in `apps/web/src/app/(shop)/layout.tsx:34-36`, wrapping only `<ScrollRevealTrigger />`. `SortSelect` is the **only** un-Suspense'd `useSearchParams()` consumer in production code.

**Why the build does not fail today**: Next.js emits *"useSearchParams() should be wrapped in a suspense boundary"* only on routes that would otherwise be statically prerendered. `/products` already flips to `ƒ (Dynamic)` via `await searchParams` (see §1.1), so the SortSelect gap is silently masked. **The moment anyone removes `await searchParams` from `/products` to make it static, the build will break.** This is a textbook latent defect.

**Fix:** wrap `<SortSelect>` in `<Suspense fallback={null}>` in `products/page.tsx`, mirroring the V15-1 pattern. Add a contract test that locks the wrapping.

### 1.3 Unused Dependencies (MEDIUM-1 through MEDIUM-6 + 12 additional)

**Claim** (`AUDIT_REPORT.md` MEDIUM-1 through MEDIUM-6): 6 packages have unused dependencies (full list in §3 of `AUDIT_REPORT.md`).

**Reality** (independent re-verification by Explore sub-agent):

| Audit claim | Verdict | Notes |
|---|---|---|
| MEDIUM-1: `@maison/api` → `@maison/config` unused | ✅ **CONFIRMED** | 0 imports in `packages/api/` |
| MEDIUM-2: `@maison/auth` → `zod` unused | ✅ **CONFIRMED** | 0 imports in `packages/auth/src/` |
| MEDIUM-3: `@maison/db` → `zod`, `testcontainers` unused | ✅ **CONFIRMED** | Both unused |
| MEDIUM-4: `@maison/payments` → `zod` unused | ✅ **CONFIRMED** | 0 imports |
| MEDIUM-5: `@maison/email` → `react-dom`, `zod`, `@types/react-dom` unused | ✅ **CONFIRMED** | All 3 unused (minor peer-dep caveat on `react-dom` — see §3.2.5) |
| MEDIUM-6: `@maison/web` → 20 deps claimed unused | ✅ **18 CONFIRMED UNUSED** + 1 USED-VIA-WORKSPACE-DEP (`stripe`) + 1 FALSE-CLAIM-FROM-AUDIT (`@sanity/client` is unused but only as a string literal in `next.config.ts` serverExternalPackages — fix is to remove both) |

**Additional findings beyond the audit (12 more unused deps in `@maison/web`):**

| Dep | Type | Confidence |
|---|---|---|
| `@hookform/resolvers` | dependencies | High (paired with `react-hook-form`) |
| `@radix-ui/react-avatar` | dependencies | High |
| `@radix-ui/react-dialog` | dependencies | High |
| `@radix-ui/react-dropdown-menu` | dependencies | High |
| `@radix-ui/react-label` | dependencies | High |
| `@radix-ui/react-popover` | dependencies | High |
| `@radix-ui/react-select` | dependencies | High |
| `@tailwindcss/typography` | devDependencies | High (no `@plugin` directive in `globals.css`) |
| `@testing-library/react` | devDependencies | High (component tests don't exist) |
| `@testing-library/user-event` | devDependencies | High |
| `autoprefixer` | devDependencies | High (Tailwind v4 doesn't use autoprefixer) |
| `superjson` | dependencies | High |

**Deps to KEEP** (despite appearing unused by direct-import scan):
- `@maison/web` → `react-dom`, `@types/react-dom` — peer dep of `next`, required at runtime
- `@maison/web` → `@types/react` — required for JSX type checking
- `@maison/web` → `postcss` (devDep) — peer dep of `@tailwindcss/postcss`
- `@maison/web` → `@axe-core/playwright`, `@playwright/test` — used by `e2e/*.spec.ts` and `playwright.config.ts`
- `@maison/web` → `jsdom` (devDep) — referenced by `vitest.config.ts`
- `@maison/web` → `better-auth` — used at runtime in `proxy.ts:27` (`getSessionCookie`)
- `@maison/web` → `drizzle-orm`, `stripe`, `@maison/db` — declared in `next.config.ts` `serverExternalPackages` / `transpilePackages`; needed for Next.js bundling config even though not directly imported
- `@maison/web` → `server-only` — standard side-effect import package (deferred — low confidence)

### 1.4 Lint Gap (LOW-1)

**Claim** (`AUDIT_REPORT.md` LOW-1): "Only `@maison/web` has a `lint` script; the other 12 packages have no per-package lint."

**Reality** (verified): CONFIRMED. 12 of 13 packages have no `lint` script and no `eslint.config.mjs`.

The shared flat config at `tooling/eslint/index.js` exports a flat-config array; new per-package entry points should spread it (`...sharedConfig`). The shared config uses `projectService: true` with `tsconfigRootDir: import.meta.dirname`, so type-aware linting requires every linted file to be in a tsconfig `include` — this couples LOW-1 to LOW-4.

**Packages needing lint setup:**
- `apps/studio`, `services/workers`
- `packages/api`, `packages/auth`, `packages/config`, `packages/db`, `packages/email`, `packages/payments`, `packages/ui`
- `tooling/eslint`, `tooling/tailwind`
- (`tooling/typescript` is JSON-only — excluded)

**devDeps note:** `tooling/eslint` already has `eslint` in `dependencies` (not devDeps) — the "add devDeps" step for `tooling/eslint` applies to `@maison/eslint-config` only. `tooling/tailwind` has no devDependencies block at all — needs both `@maison/eslint-config` and `eslint` added. `tooling/eslint/eslint.config.mjs` may import from `./index.js` directly as a workspace-self-reference alternative.

### 1.5 Tsconfig Include Gap (LOW-4)

**Claim** (`AUDIT_REPORT.md` LOW-4): "`tsconfig.json` in each package only includes `src/**/*.ts`, so root-level config files are not type-checked."

**Reality** (verified): PARTIALLY CONFIRMED. True for 7 library-style packages. **False for `apps/web` and `apps/studio`** — both use `**/*.ts` includes that cover root configs (via `nextjs.json` for web, standalone glob for studio).

**Packages needing `tsconfig.config.json`:**
- `services/workers` (`trigger.config.ts`, `vitest.config.ts`)
- `packages/api`, `packages/auth`, `packages/config`, `packages/db`, `packages/email`, `packages/payments` (each has `vitest.config.ts`; `db` also has `drizzle.config.ts`)

**Fix pattern:** add a separate `tsconfig.config.json` extending `@maison/typescript-config/base.json` with `include: ["*.config.ts"]`, `rootDir: "."`, `noEmit: true`. Update each `check-types` script to run both tsconfigs. (Prefer this over widening the main `tsconfig.json` `include` because `library.json` sets `rootDir: "src"` and `composite: true` — widening would break the composite emit boundary.)

**Latent-risk hotspots** (root config files that could break without anyone noticing):
- `packages/db/drizzle.config.ts` — imports `drizzle-kit`, `dotenv`
- `services/workers/trigger.config.ts` — `TriggerConfig` typed import from `@trigger.dev/sdk`
- All `vitest.config.ts` files (coverage thresholds are enforced by `coverage-thresholds.contract.test.ts` via regex on source text, not via tsc)

### 1.6 `@maison/ui` Test Config Gap (LOW-8)

**Claim** (`AUDIT_REPORT.md` LOW-8): "`@maison/ui` has no `test` script and no `vitest.config.ts`."

**Reality** (verified): CONFIRMED. `packages/ui/package.json` has only `build`, `dev`, `clean`, `check-types` scripts. No `vitest.config.ts`. `turbo test` silently skips `@maison/ui`. The package has 2 lines of `src/index.ts` and is currently CSS-token-only.

**Fix:** add minimal `vitest.config.ts` with `passWithNoTests: true` (mirroring the `packages/email` pattern). Add `test` and `test:watch` scripts. Add `vitest` devDep.

---

## 2. Remediation ToDo List (TDD-Driven)

Each task follows the **RED → GREEN → REFACTOR** TDD cycle:

1. **RED**: write the contract test first; run it; confirm it fails for the right reason.
2. **GREEN**: apply the minimal fix; re-run the test; confirm it passes.
3. **REFACTOR**: clean up; re-run the full gate (`pnpm check-types && pnpm lint && pnpm test && pnpm build`); confirm green.

All contract tests live in `apps/web/src/lib/__tests__/` (the existing test-harness location), mirroring the precedent set by `coverage-thresholds.contract.test.ts`, `scroll-reveal-wiring.contract.test.ts`, and `rendering-strategy.contract.test.ts`.

### Task 1 — SortSelect Suspense Boundary (LOW-2)

**Files touched:**
- `apps/web/src/app/(shop)/products/page.tsx` (wrap `<SortSelect>` in `<Suspense>`)
- `apps/web/src/lib/__tests__/sortselect-suspense.contract.test.ts` (NEW)

**TDD steps:**

1. **RED** — write `sortselect-suspense.contract.test.ts`:
   - Asserts `apps/web/src/app/(shop)/products/page.tsx` source contains `<Suspense` AND `<SortSelect` AND the regex `/<Suspense[^>]*>\s*<SortSelect/` (Suspense wraps SortSelect) — mirrors the precedent `/<Suspense[^>]*>\s*<ScrollRevealTrigger/` in `scroll-reveal-wiring.contract.test.ts:50`.
   - Asserts the imports include `Suspense` from `react`.
   - Run `pnpm --filter @maison/web test` → expect 2 failing tests.
2. **GREEN** — edit `products/page.tsx`:
   - Add `Suspense` to the existing `react` import (or add a new import).
   - Wrap `<SortSelect currentSort={sort} />` with `<Suspense fallback={null}>…</Suspense>`.
   - Re-run → expect 2 passing tests.
3. **REFACTOR** — verify the full gate is still green; verify `pnpm build` still produces `/products ƒ (Dynamic)` (no change — wrapping in Suspense does not alter rendering strategy when the route is already dynamic; it only protects against future regression).

**Definition of Done:** contract test passes; `pnpm test` count goes from 104 to 106 in `@maison/web`; `pnpm build` still produces 42 routes (16 ○ + 26 ƒ).

### Task 2 — Unused-Dependency Cleanup (MEDIUM-1 through MEDIUM-6 + 12 additional)

**Files touched:**
- `packages/api/package.json` (remove `@maison/config`)
- `packages/auth/package.json` (remove `zod`)
- `packages/db/package.json` (remove `zod`, `testcontainers`)
- `packages/payments/package.json` (remove `zod`)
- `packages/email/package.json` (remove `zod`, `react-dom`, `@types/react-dom`)
- `apps/web/package.json` (remove 30 deps — see full list in §1.3)
- `apps/web/next.config.ts` (remove dead `@sanity/client` and `posthog-js` entries from `serverExternalPackages` if those deps are removed — verify each entry)
- `apps/web/src/lib/__tests__/deps-hygiene.contract.test.ts` (NEW)
- `pnpm-lock.yaml` (regenerated by `pnpm install`)

**TDD steps:**

1. **RED** — write `deps-hygiene.contract.test.ts`:
   - Table-driven test: for each `(package, dep)` pair in the removal list, read the relevant `package.json`, parse JSON, assert the dep is NOT in `dependencies` or `devDependencies`.
   - Run → expect ~35 failing cases.
2. **GREEN** — edit each `package.json` to remove the listed dep. Run `pnpm install` to regenerate `pnpm-lock.yaml`. Re-run the test → expect all green.
3. **REFACTOR** — run `pnpm check-types && pnpm lint && pnpm test && pnpm build` to confirm no regressions. (Critical: the `@maison/email` `react-dom` removal may trigger a peer-dep warning from `@vitejs/plugin-react@6` — if so, evaluate whether to keep `react-dom` or downgrade `@vitejs/plugin-react`. Default: keep `react-dom` only if `pnpm install` errors out.)

**Definition of Done:** `deps-hygiene.contract.test.ts` passes; `pnpm install` is clean (no peer-dep errors); `pnpm check-types && pnpm lint && pnpm test && pnpm build` all green; lockfile diff is minimal.

**Conservative scoping:** the medium-confidence items (`@maison/web` → `stripe`, `@maison/db`, `drizzle-orm` — all listed in `serverExternalPackages` / `transpilePackages` in `next.config.ts`) are KEPT to avoid breaking Next.js bundling. They will be revisited in a future cleanup pass after verifying that Next.js resolves them transitively.

**Total removals:** 38 high-confidence dep removals (8 non-web + 19 from MEDIUM-6 web list excl. `stripe` + 11 additional web deps). The contract test will have 38 cases. If `@maison/email`→`react-dom` is held back due to a `@vitejs/plugin-react@6` peer-dep error, the count drops to 37.

**`next.config.ts` cleanup:** `@sanity/client` is listed in `serverExternalPackages` at `next.config.ts:32` — once the dep is removed, also remove this entry (otherwise Next.js silently ignores the unknown package string). `posthog-js` is referenced ONLY as URL strings in the CSP header (line 89) and rewrites (lines 120/124) — no `next.config.ts` edit needed for `posthog-js`.

### Task 3 — Per-Package Lint Scripts (LOW-1)

**Files touched:**
- 12 new `eslint.config.mjs` files (one per package listed in §1.4)
- 12 updated `package.json` files (add `lint` + `lint:fix` scripts; for `tooling/eslint` and `tooling/tailwind` also add `@maison/eslint-config` + `eslint` devDeps)
- `apps/web/src/lib/__tests__/lint-scripts.contract.test.ts` (NEW)

**TDD steps:**

1. **RED** — write `lint-scripts.contract.test.ts`:
   - Table-driven test: for each of the 12 packages, assert `package.json` defines `lint: "eslint ."` and `lint:fix: "eslint . --fix"`, and that `eslint.config.mjs` exists and imports `@maison/eslint-config`.
   - Run → expect 12 × 3 = 36 failing cases.
2. **GREEN** — add `eslint.config.mjs` and `lint`/`lint:fix` scripts to each package. For `tooling/eslint` and `tooling/tailwind`, also add `@maison/eslint-config` and `eslint` to `devDependencies`. Run `pnpm install` if devDeps changed. Re-run the test → expect all green.
3. **REFACTOR** — run `pnpm lint` (which now invokes `turbo lint` across 13 packages, not just 1). Fix any newly-surfaced lint errors. Verify `pnpm check-types && pnpm test && pnpm build` are still green.

**Definition of Done:** `lint-scripts.contract.test.ts` passes; `pnpm lint` runs on 13 packages and exits 0; `pnpm check-types && pnpm test && pnpm build` all green.

**Coupling note:** the shared ESLint config sets `projectService: true`. If LOW-4 hasn't been applied yet, ESLint may emit "file is not part of any project" warnings for root config files — but the shared config already ignores `**/*.config.ts` globally, so this should be safe. If issues arise, apply LOW-4 first.

### Task 4 — Root Config Type-Checking (LOW-4)

**Files touched:**
- 7 new `tsconfig.config.json` files (one per `services/workers`, `packages/api`, `packages/auth`, `packages/config`, `packages/db`, `packages/email`, `packages/payments`)
- 7 updated `package.json` files (update `check-types` script to run both tsconfigs)
- `apps/web/src/lib/__tests__/tsconfig-include.contract.test.ts` (NEW)

**TDD steps:**

1. **RED** — write `tsconfig-include.contract.test.ts`:
   - Table-driven test: for each of the 7 packages, list the root `*.config.ts` files; assert that either `tsconfig.json` or `tsconfig.config.json` exists AND its `include` covers the config file (via `**/*.ts` glob, `*.config.ts` glob, or explicit filename).
   - Run → expect ~10 failing cases (one per root config file).
2. **GREEN** — add `tsconfig.config.json` to each package using the template:
   ```jsonc
   {
     "extends": "@maison/typescript-config/base.json",
     "compilerOptions": { "noEmit": true, "rootDir": ".", "composite": false },
     "include": ["*.config.ts", "*.config.tsx"]
   }
   ```
   Update each `check-types` script:
   ```json
   "check-types": "tsc -p tsconfig.config.json --noEmit && tsc --noEmit"
   ```
   Re-run the test → expect all green.
3. **REFACTOR** — run `pnpm check-types` (now type-checks root configs too). Fix any latent type errors in root config files (e.g. `drizzle.config.ts` env narrowing). Verify `pnpm lint && pnpm test && pnpm build` still green.

**Definition of Done:** `tsconfig-include.contract.test.ts` passes; `pnpm check-types` now type-checks root configs and is still green; full gate green.

### Task 5 — `@maison/ui` Test Config (LOW-8)

**Files touched:**
- `packages/ui/vitest.config.ts` (NEW)
- `packages/ui/package.json` (add `test` + `test:watch` scripts, add `vitest` devDep)
- `apps/web/src/lib/__tests__/ui-vitest-config.contract.test.ts` (NEW)

**TDD steps:**

1. **RED** — write `ui-vitest-config.contract.test.ts`:
   - Asserts `packages/ui/package.json` defines `test: "vitest run"` and `test:watch: "vitest"`.
   - Asserts `packages/ui/vitest.config.ts` exists, sets `passWithNoTests: true`, and does NOT declare a `coverage.thresholds` block (per ADR-019, `@maison/ui` is not in the mandated-threshold list).
   - Run → expect 5 failing cases.
2. **GREEN** — create `packages/ui/vitest.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       environment: 'node',
       include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
       // Phase 0: @maison/ui is currently a CSS-token + font package with no
       // runtime tests. Without this, vitest exits 1 with "No test files found"
       // and blocks `turbo test`. Matches the Stillwater reference pattern
       // (packages/email, packages/auth, packages/payments).
       passWithNoTests: true,
     },
   });
   ```
   Add `vitest` to `packages/ui/package.json` `devDependencies` (version `^4.1.9` to match other packages). Add `test`/`test:watch` scripts. Run `pnpm install`. Re-run the test → expect all green.
3. **REFACTOR** — run `pnpm test` (now `@maison/ui` is included in `turbo test`). Verify the package reports "no test files found, passWithNoTests enabled" and exits 0. Confirm test count is still 207 + new contract tests.

**Definition of Done:** `ui-vitest-config.contract.test.ts` passes; `pnpm test` now runs `@maison/ui` and exits 0; full gate green.

### Task 6 — Documentation Alignment

**Files touched:**
- `AGENTS.md` — update §"What this repo is" (line 9): change "37 production routes (25 static ○ + 12 dynamic ƒ)" → "42 production routes (16 static ○ + 26 dynamic ƒ)"; update §"Build warnings" (line 262): change "Public shop routes (`/`, `/collections`, `/products`, `/search`) use `apiPublic()` and render as `○ Static`" → "Public shop routes (`/`, `/collections`) use `apiPublic()` and render as `○ Static`; `/products` and `/search` use `apiPublic()` but additionally `await searchParams`, which opts them into `ƒ (Dynamic)` rendering — this is intentional for query-driven pages"; ALSO in the same line 262 bullet, change "The build still completes (exit 0, 37/37)" → "The build still completes (exit 0, 42/42)"
- `CLAUDE.md` — update §"Project Identity" (line 9): same routing-count correction
- `AUDIT_REPORT.md` — append a "v10 Remediation" section documenting the closure of MEDIUM-1 through MEDIUM-6, LOW-1, LOW-2, LOW-4, LOW-8; bump overall compliance from 92% → 100%
- `last_remediation.md` — append a v10 section reconciling the routing-count drift (claim vs reality) and confirming all outstanding items are closed
- `README.md` — only update if it makes any routing/dep/test-count claim (audit shows it does NOT contain those claims; verify before editing)
- `docs/REMEDIATION_PLAN_v10.md` — this file (mark tasks complete as they close)

**TDD steps:** N/A (doc-only changes). Validated by re-running the canonical-docs grep at the end and confirming no stale claims remain.

**Definition of Done:** all canonical doc claims match the live codebase; `rg "25 static ○|12 dynamic ƒ|37 production|37/37" --type md -g '!docs/**'` returns zero hits in root canonical docs.

---

## 3. Execution Order & Dependencies

```
Task 1 (SortSelect Suspense)        ──┐
Task 2 (Unused Deps)                ──┤
Task 3 (Lint Scripts)               ──┼──► Task 6 (Doc Updates)
Task 4 (tsconfig.config.json)       ──┤      ↑ depends on all prior tasks
Task 5 (@maison/ui vitest)          ──┘
```

- Tasks 1, 2, 3, 4, 5 are **independent** and can be executed in any order. They will be executed sequentially in the order listed for clarity (each leaves the gate green).
- Task 4 must be applied before Task 3's `pnpm lint` step is fully green, because the shared ESLint config's `projectService: true` setting requires all linted files to be in a tsconfig `include`. (Apply Task 4 first if coupling issues arise — but the shared config's `**/*.config.ts` ignore should make this safe.)
- Task 6 (doc updates) is **last** — it documents the final state and must reflect the post-remediation reality.

### Commit Plan (single branch: `main`)

Per the user's instruction, **no new git branch** is created. All commits go to `main`. The recommended commit sequence (one TDD cycle per commit):

1. `test(web): add sortselect-suspense contract test (RED for LOW-2)` + `fix(web): wrap SortSelect in Suspense boundary (GREEN for LOW-2)`
2. `test(web): add deps-hygiene contract test (RED for MEDIUM-1..6)` + `chore(deps): remove 35 unused dependencies across 6 packages (GREEN for MEDIUM-1..6)`
3. `test(web): add tsconfig-include contract test (RED for LOW-4)` + `chore(packages): add tsconfig.config.json for root config type-checking (GREEN for LOW-4)`
4. `test(web): add lint-scripts contract test (RED for LOW-1)` + `chore(packages): add eslint.config.mjs + lint scripts to 12 packages (GREEN for LOW-1)`
0. `docs(v10): add REMEDIATION_PLAN_v10.md` (commit the plan itself as the first commit so the working tree is clean before TDD cycles begin)
5. `test(web): add ui-vitest-config contract test (RED for LOW-8)` + `chore(ui): add vitest.config.ts + test scripts to @maison/ui (GREEN for LOW-8)`
6. `docs: align canonical docs with remediated codebase (closes v10)`

(Commits may be squashed if the user prefers a single atomic commit; the default is the granular sequence above for git-bisect clarity.)

---

## 4. Risk Analysis

| Risk | Likelihood | Mitigation |
|---|---|---|
| Removing `react-dom` from `@maison/email` triggers `@vitejs/plugin-react@6` peer-dep error | Medium | Test in isolation first; if peer-dep error, keep `react-dom` in `@maison/email` and document the exception in `deps-hygiene.contract.test.ts` |
| Removing `stripe`/`@maison/db`/`drizzle-orm` from `@maison/web` breaks Next.js bundling | Medium | Conservative scope: KEEP these deps (they're in `next.config.ts` `serverExternalPackages` / `transpilePackages`) |
| New `eslint.config.mjs` files surface latent lint errors in packages | Low-Medium | Run `pnpm lint` after each package is updated; fix errors as they arise |
| `tsconfig.config.json` surfaces latent type errors in `drizzle.config.ts` (env narrowing) | Low | Apply standard `if (!connectionString) throw new Error(...)` guard pattern (already present in `packages/db/src/index.ts`) |
| `pnpm build` route count changes after Suspense wrap | Very Low | Wrapping in `<Suspense>` does NOT change rendering strategy for already-dynamic routes; verified by re-running build after Task 1 |
| Contract test brittle to formatting (regex on source text) | Low | Use loose regex (`/Suspense[^>]*>\s*<SortSelect/`) matching the precedent in `scroll-reveal-wiring.contract.test.ts` |

---

## 5. Validation Gates — Target (post-remediation)

| Gate | Command | Target | Notes |
|---|---|---|---|
| TypeScript strict | `pnpm check-types` | ✅ 10/10 packages pass (now including root config files) | Adds `tsconfig.config.json` coverage |
| ESLint | `pnpm lint` | ✅ pass on **13 packages** (was 1) | LOW-1 closed |
| Prettier | `pnpm format:check` | ✅ clean | Unchanged |
| Unit tests | `pnpm test` | ✅ **245+ tests across 9 packages** (was 207/8) | +~38 contract tests; +1 package (`@maison/ui`) |
| Build | `pnpm build` | ✅ 10/10 packages build; 42 routes (16 ○ + 26 ƒ) | Unchanged route count |
| Skill compliance | — | ✅ **100%** (was 92%) | All MEDIUM + LOW findings closed |
| Doc claims | `rg "25 static ○\|12 dynamic ƒ\|37 production" --type md -g '!docs/**'` | 0 hits in root canonical docs | AGENTS.md + CLAUDE.md updated |

---

## 6. Out-of-Scope / Deferred

These items from `AUDIT_REPORT.md` and `last_remediation.md` are **deferred** and out of scope for v10:

- `noUnusedLocals` / `noUnusedParameters` enablement (requires cleanup pass across codebase)
- React Compiler enablement (requires config change + benchmarking)
- 22 non-null assertions in tRPC routers (mostly safe Drizzle patterns; documented)
- Trigger.dev Phase 0 stubs (intentional placeholder; LOW-5)
- Stripe API version automation via Renovate/Dependabot (LOW-3)
- Better Auth `session.user.name` nullability fix (LOW-6 — monitor upstream)
- Single suppressed ESLint warning in `(account)/layout.tsx` (LOW-6 — justified)
- Auth/admin route `DYNAMIC_SERVER_USAGE` warnings (LOW-7 — expected per ADR-010)
- Conservative-scope deps kept in `@maison/web` (`stripe`, `@maison/db`, `drizzle-orm`) — revisit in v11

These deferrals are documented in `last_remediation.md` and revisited in the next sprint.

---

## 7. Plan Validation Checklist (pre-execution)

This plan has been independently validated by an Explore sub-agent against the live codebase at `fefbc57` (validation report run 2026-08-01). All V1–V7 checkpoints VERIFIED or PARTIAL-with-correction; no blocking issues. The 6 wording corrections from the validation have been applied to this document.

This plan has been validated against the codebase as follows:

- [x] All file paths cited exist (verified by direct `Read`/`LS` calls)
- [x] All code citations are quoted verbatim from the current HEAD (`fefbc57`)
- [x] All audit claims have been independently re-verified by Explore sub-agents (3 parallel audits)
- [x] The routing-count drift root cause (`await searchParams`) is traced to specific line numbers
- [x] The SortSelect Suspense gap is confirmed as the **only** un-Suspense'd `useSearchParams()` site (repo-wide grep)
- [x] Every claimed-unused dep has been verified by direct ripgrep of the package's `src/`
- [x] The 12 additional unused deps in `@maison/web` (not in the original audit) are flagged with confidence levels
- [x] The TDD contract tests are scoped to mirror existing precedents (`scroll-reveal-wiring.contract.test.ts`, `coverage-thresholds.contract.test.ts`)
- [x] The `tsconfig.config.json` pattern is the documented TypeScript solution (avoids breaking `library.json`'s `composite: true` boundary)
- [x] The `vitest.config.ts` template mirrors the closest Phase-0 analog (`packages/email/vitest.config.ts`)
- [x] Doc-update targets are scoped to the exact lines containing stale claims (no over-editing)
- [x] Risk analysis covers all medium-likelihood failure modes with concrete mitigations
- [x] Execution order respects the LOW-1 ↔ LOW-4 coupling (apply LOW-4 first if needed)
- [x] Commit plan respects the user's instruction: no new git branch; all commits to `main`

---

## 8. Post-Execution Summary (filled in after Task 6)

_To be appended after all tasks complete._
