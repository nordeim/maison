# E2E Remediation Report — Live Site `maison.jesspete.shop`

**Date:** 2026-07-29
**Live URL:** `https://maison.jesspete.shop/`
**Deployment log reviewed:** `pnpm_log.txt` (build succeeded 10/10 packages, 37/37 routes)

---

## Issues Found via Agent-Browser E2E Testing

### Issue 1 — Text spacing in section headings (HIGH)

**Symptom:** Section titles rendered with missing spaces between regular text and italic `<em>` words:
- "For everyquietcorner." (should be "For every quiet corner.")
- "Pieces we'dlive with." (should be "Pieces we'd live with.")
- Same pattern in 7 other section headings

**Root cause:** JSX `{' '}` whitespace expressions between text nodes and `<em>` elements are stripped by Turbopack's production minifier. The spaces exist in source but are removed in the compiled output.

**Files affected:** 9 section components in `apps/web/src/components/shop/sections/`

**Fix:** Moved spaces inside the `<em>` tag content as `{' word '}` string literals — string content can't be stripped by the minifier.

**Status:** ✅ Fixed

---

### Issue 2 — Mobile nav not hiding desktop links (HIGH)

**Symptom:** At 375px viewport (iPhone SE), the desktop navigation links (Shop All, Collections, Our Story, Journal, Contact) remained visible alongside the hamburger button. The mobile drawer was redundant.

**Root cause:** The `<nav>` element had inline `style={{ display: 'flex', ... }}`. Inline styles have higher CSS specificity than the media query rule `header nav[aria-label="Primary"] { display: none; }`. The `!important` flag was missing from the media query.

**File:** `apps/web/src/components/shop/Header.tsx`

**Fix:** Added `!important` to the media query: `header nav[aria-label="Primary"] { display: none !important; }`

**Status:** ✅ Fixed

---

### Issue 3 — Checkout page incorrectly auth-guarded (MED)

**Symptom:** `/checkout` returned HTTP 200 instead of 307 redirect when unauthenticated. The proxy.ts had `/checkout` in `AUTH_REQUIRED_ROUTES`, but since the page is statically prerendered (○ Static), the proxy redirect wasn't executing.

**Root cause:** Two issues:
1. The PRD §6.5 states "Guest checkout supported (no account required)" — `/checkout` should NOT be auth-guarded
2. Static prerendering can bypass proxy redirects in some Next.js 16 hosting configurations

**File:** `apps/web/proxy.ts`

**Fix:** Removed `/checkout` from `AUTH_REQUIRED_ROUTES`. Guest checkout is the correct behavior per PRD.

**Status:** ✅ Fixed

---

### Issue 4 — Missing page metadata (LOW)

**Symptom:** Several pages (cart, checkout, gift-cards, trade, homepage) showed the default title "Maison — Objects of Quiet Beauty" instead of page-specific titles.

**Root cause:** No `export const metadata` in those pages. Client Component pages (`'use client'`) can't export metadata in Next.js 16.

**Files affected:** 4 Client Component pages (cart, checkout, gift-cards, trade) + homepage (uses layout default)

**Fix:** Homepage correctly uses the layout's default title. Client Component pages require restructuring to Server Component wrappers for page-specific metadata — deferred to Phase 2 (SEO optimization).

**Status:** ⏳ Deferred (low priority — default title is functional, not a bug)

---

### Issue 5 — Pre-existing `@types/node` missing in `@maison/config` (HIGH)

**Symptom:** `pnpm check-types` failed with `TS2580: Cannot find name 'process'` and `TS2584: Cannot find name 'console'` in `packages/config/src/jobs-client.ts` and `packages/config/src/site.ts`.

**Root cause:** `@maison/config` package's `devDependencies` was missing `@types/node`. The tsconfig extends `library.json` which sets `lib: ["ES2022"]` — no Node.js or DOM types included.

**File:** `packages/config/package.json`

**Fix:** Added `"@types/node": "^22.19.15"` to devDependencies.

**Status:** ✅ Fixed

---

## Verification (all gates green after fixes)

| Gate | Result |
|---|---|
| `pnpm check-types` | ✅ 10/10 packages |
| `pnpm lint` | ✅ 0 errors |
| `pnpm test` | ✅ 101/101 tests passed |
| `pnpm build` | ✅ 37/37 routes, exit 0 |

---

## E2E Test Coverage

16 screenshots captured via agent-browser:
- Homepage (desktop + mobile)
- Scroll through all sections (8 screenshots)
- Product detail page
- Products listing
- Cart, collections, sign-in, sign-up, about, contact
- Mobile nav drawer
- Search modal
- Checkout, journal, gift-cards

All pages returned HTTP 200 (public) or 307 (auth-guarded). No console errors detected on any page.
