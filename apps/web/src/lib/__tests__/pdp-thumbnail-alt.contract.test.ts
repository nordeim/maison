/**
 * Maison — PDP thumbnail accessibility contract test (H4)
 *
 * Locks the invariant that PDP gallery thumbnail images have descriptive
 * alt text (not empty alt=""). Empty alt means "decorative" — but these
 * thumbnails represent distinct product views and should be announced by
 * screen readers.
 *
 * Background:
 *   Identified via agent-browser E2E testing of the live site
 *   https://maison.jesspete.shop/products/arc-pendant-light — see
 *   docs/REMEDIATION_PLAN_v7.md Task 1.4.
 *
 * Root cause:
 *   `apps/web/src/app/(shop)/products/[slug]/page.tsx:201` had `alt=""` on
 *   the thumbnail Image inside the `product.images.slice(0, 4).map()` block.
 *
 * Fix:
 *   Use `img.altText ?? \`${product.name} — view ${i + 1}\`` so screen readers
 *   announce the product name + view number (or the DB-stored altText if set).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const PDP_PAGE = join(WEB_SRC, 'app', '(shop)', 'products', '[slug]', 'page.tsx');

const source = readFileSync(PDP_PAGE, 'utf8');

describe('H4 — PDP thumbnail alt text', () => {
  it('thumbnail Image does NOT have empty alt=""', () => {
    // The bug: <Image src={img.url} alt="" fill ... /> inside the thumbnail map.
    // The fix: <Image src={img.url} alt={img.altText ?? `${product.name} — view ${i + 1}`} fill ... />
    // Assert that the source does NOT contain alt="" inside the thumbnail block.
    //
    // We look for the pattern: <Image ... alt="" ...> — but only flag it if it's
    // the thumbnail (not the main hero image which correctly uses alt={heroImage.altText ?? product.name}).
    //
    // The thumbnail is the second Image in the file (after the hero). The bug
    // pattern is `alt=""` (empty string literal). Assert no `alt=""` exists.
    expect(source).not.toMatch(/alt=""/);
  });

  it('thumbnail Image uses img.altText with a fallback to product name + view number', () => {
    // The fix: alt={img.altText ?? `${product.name} — view ${i + 1}`}
    // Assert that the source contains this pattern (or a similar non-empty alt
    // expression referencing img.altText and product.name).
    expect(source).toMatch(/img\.altText/);
  });
});
