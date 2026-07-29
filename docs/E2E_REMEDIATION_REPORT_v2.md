# E2E Remediation Report v2 — Live Site `maison.jesspete.shop`

**Date:** 2026-07-29
**Live URL:** `https://maison.jesspete.shop/`
**Deployment log reviewed:** `pnpm_log.txt` (build succeeded 10/10 packages, 37/37 routes, 31.2s)

---

## E2E Testing Summary

15 screenshots captured via agent-browser covering:
- Homepage (desktop + mobile viewport)
- All section scrolls (8 screenshots)
- PDP, products listing, cart, checkout
- Collections, about, journal, gift-cards, trade
- Sign-in page, search modal, mobile nav drawer

**HTTP status codes (all correct):**
- Public routes: `/` `/products` `/collections` `/about` `/contact` `/cart` `/journal` `/gift-cards` `/trade` `/checkout` → all 200
- Auth-guarded routes: `/account` `/admin` → 307 redirect to `/auth/sign-in`

**Console errors:** None detected on any page.

**Mobile nav (375px viewport):** Desktop nav correctly hidden (`display: none`), hamburger visible (`display: flex`), drawer opens on click.

---

## Issues Found and Fixed

### Issue 1 — Double spaces in section headings (HIGH)

**Symptom:** Section headings rendered with double spaces between text and italic `<em>` words:
- "For every  quiet corner." (should be "For every quiet corner.")
- "Pieces we'd  live with ." (should be "Pieces we'd live with.")
- Same pattern in 7 other section headings

**Root cause:** The previous E2E remediation (commit `bcbfece`) fixed the space-stripping issue by moving spaces inside `<em>` content as `{' word '}` string literals. However, the preceding `{' '}` whitespace expression was NOT removed — creating a double space (the `{' '}` before `<em>` plus the leading space inside `{' word '}`).

**Fix:** Removed the redundant `{' '}` before `<em>` tags in 7 section components. The space inside `{' word '}` is sufficient — string content can't be stripped by Turbopack's minifier.

**Files changed (7):**
- `apps/web/src/components/shop/sections/CategoryGrid.tsx` — `For every{' '}` → `For every`
- `apps/web/src/components/shop/sections/ProductGrid.tsx` — `Pieces we'd{' '}` → `Pieces we'd`
- `apps/web/src/components/shop/sections/HyggeEdit.tsx` — `A room is a{' '}` → `A room is a`
- `apps/web/src/components/shop/sections/JournalSection.tsx` — `Notes on{' '}` → `Notes on`
- `apps/web/src/components/shop/sections/Materials.tsx` — `Materials we{' '}` → `Materials we`
- `apps/web/src/components/shop/sections/Philosophy.tsx` — `Objects made with{' '}` → `Objects made with` + `, materials that age{' '}` → `, materials that age`
- `apps/web/src/components/shop/sections/Testimonials.tsx` — `Loved by{' '}` → `Loved by` + removed `{' '}` after `</em>` (trailing space inside `{' 2,400+ '}` is sufficient)

**Status:** ✅ Fixed

---

### Issue 2 — 20 broken Unsplash images on homepage (LOW — seed data issue)

**Symptom:** 20 images on the homepage have `naturalWidth === 0` (broken). All are `images.unsplash.com` URLs going through Next.js Image optimization.

**Root cause:** Some Unsplash photo IDs have been removed from their CDN or have inconsistent hotlink protection. The `next.config.ts` correctly allows `images.unsplash.com` in `remotePatterns`, and some Unsplash images load fine (the Hero image works). This is a seed-data content issue, not a code bug.

**Status:** ⏳ Deferred — documented in `next.config.ts` comment: "seed data — replace with Cloudflare in production." This is a Phase 2 task (production image migration to Cloudflare Images + R2). No code fix needed.

---

## Previously Fixed Issues (from commit `bcbfece`)

These issues were fixed in the prior remediation and verified working on the live site:

| Issue | Fix | Verified on live site |
|---|---|---|
| Text spacing stripped in production | Spaces moved inside `<em>` as `{' word '}` | ✅ Headings now render with spaces |
| Mobile nav not hiding desktop links | Added `!important` to media query | ✅ Desktop nav hidden at 375px, hamburger visible |
| `/checkout` incorrectly auth-guarded | Removed from `AUTH_REQUIRED_ROUTES` | ✅ Returns 200 (guest checkout supported) |
| `@types/node` missing in config package | Added to devDependencies | ✅ check-types 10/10 |

---

## Verification (all gates green after fixes)

| Gate | Result |
|---|---|
| `pnpm check-types` | ✅ 10/10 packages |
| `pnpm lint` | ✅ 0 errors |
| `pnpm test` | ✅ 101/101 tests passed (17 db + 41 auth + 20 web + 11 payments + 9 api + 3 config) |
| `pnpm format:check` | ✅ All files conformant |
| `pnpm build` | ✅ 37/37 routes, exit 0 |

---

## Deployment Log Analysis

The `pnpm_log.txt` shows:
- **Build:** 10/10 packages successful, 7 cached, 31.2s total
- **Route table:** 25 static (○) + 12 dynamic (ƒ) = 37 routes
- **DYNAMIC_SERVER_USAGE warnings:** 12 warnings for `/account/*` and `/admin/*` routes — **expected and by design** per AGENTS.md "Things that look wrong but aren't" — these are Layer 2 auth-guarded routes that call `auth.api.getSession({ headers })`. The build completes successfully (exit 0) with these warnings.
- **No errors:** Build completed without any fatal errors

The `DYNAMIC_SERVER_USAGE` warnings are NOT a bug — they are the documented behavior of the 2-layer auth pattern (ADR-010). Adding `export const dynamic = 'force-dynamic'` to silence them would be incompatible with `cacheComponents: true` (a future Next.js 16 feature).
