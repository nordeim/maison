# E2E Remediation Report v3 — Image Fixes + Seed Data Expansion

**Date:** 2026-07-29
**Live URL:** `https://maison.jesspete.shop/`
**Deployment log reviewed:** `pnpm_log.txt` (build succeeded 10/10 packages, 37/37 routes)

---

## Issues Found via E2E Testing

### Issue 1 — 22 broken images on homepage (HIGH)

**Symptom:** 22 of 27 images on the homepage had `naturalWidth === 0` (broken). All broken images were from `images.unsplash.com` — some Unsplash photo IDs had been removed from their CDN or had inconsistent hotlink protection.

**Root cause:** The section components and seed data used Unsplash URLs as placeholder images. Unsplash's CDN has inconsistent hotlink protection — some photo IDs work, others return 403/404. The `next.config.ts` correctly allowed `images.unsplash.com` in `remotePatterns`, but the upstream URLs were broken.

**Fix:**
1. Added `images.pexels.com` to `next.config.ts` `remotePatterns` and CSP `img-src` directive
2. Replaced ALL Unsplash URLs in section components (9 files) with working Pexels URLs borrowed from the reference mockup at `https://v1uc168atjn1-d.space-z.ai/landing.html`
3. Replaced ALL Unsplash URLs in seed data (`packages/db/src/seed/fixtures/products.ts`) with Pexels URLs
4. Replaced 2 Unsplash URLs in the about page with Pexels URLs

**Files changed:**
- `apps/web/next.config.ts` — added Pexels to remotePatterns + CSP
- `apps/web/src/components/shop/sections/Hero.tsx`
- `apps/web/src/components/shop/sections/CategoryGrid.tsx`
- `apps/web/src/components/shop/sections/FeaturedCollection.tsx`
- `apps/web/src/components/shop/sections/HyggeEdit.tsx`
- `apps/web/src/components/shop/sections/InstagramGrid.tsx`
- `apps/web/src/components/shop/sections/JournalSection.tsx`
- `apps/web/src/components/shop/sections/Philosophy.tsx`
- `apps/web/src/app/(shop)/about/page.tsx`
- `packages/db/src/seed/fixtures/products.ts`

**Status:** ✅ Fixed

---

### Issue 2 — Insufficient seed data for UAT (MED)

**Symptom:** Only 13 products in the seed data, limiting user acceptance test coverage across collections.

**Fix:** Added 7 new products to the seed data, bringing the total to 20:

| New Product | Collection | Price | Badge |
|---|---|---|---|
| Striped Linen Bed Throw | Textiles | $245 | New |
| Floating Oak Wall Shelf | Furniture | $185 | New |
| Stoneware Dinner Plates (Set of 4) | Ceramics | $165 | Bestseller |
| Solid Brass Candle Holder | Objects | $75 | — |
| Hand-Felted Wool Floor Cushion | Textiles | $195 | New |
| Oak Cutting Board with Handle | Objects | $95 | — |
| Washed Linen Apron | Textiles | $65 | New |

All new products have:
- Full long descriptions (matching the brand voice)
- Materials and dimensions metadata
- Primary + alternate Pexels image URLs for hover-swap
- Collection mapping for filtering

**Status:** ✅ Fixed

---

## Verification (all gates green)

| Gate | Result |
|---|---|
| `pnpm check-types` | ✅ 10/10 packages |
| `pnpm lint` | ✅ 0 errors |
| `pnpm test` | ✅ 101/101 tests passed |
| `pnpm format:check` | ✅ All conformant |
| `pnpm build` | ✅ 37/37 routes, exit 0 |

---

## Previously Fixed Issues (verified still working)

| Issue | Fix (commit) | Status |
|---|---|---|
| Text spacing stripped in production | `bcbfece` — spaces inside `<em>` as string literals | ✅ Working |
| Double spaces in headings | `b5cf2c2` — removed redundant `{' '}` before `<em>` | ✅ Working |
| Mobile nav not hiding desktop links | `bcbfece` — added `!important` to media query | ✅ Working |
| `/checkout` incorrectly auth-guarded | `bcbfece` — removed from AUTH_REQUIRED_ROUTES | ✅ Working |
| `@types/node` missing in config | `bcbfece` — added to devDependencies | ✅ Working |
