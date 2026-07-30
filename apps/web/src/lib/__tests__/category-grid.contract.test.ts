/**
 * Maison — CategoryGrid accessibility contract test (F2)
 *
 * Locks the invariant that category card links expose a SINGLE accessible
 * name (not triple-counted).
 *
 * Background:
 *   The bug was identified via agent-browser E2E testing of the live site
 *   https://maison.jesspete.shop/ — see docs/REMEDIATION_PLAN_v5.md Task 1.2.
 *   The accessibility tree showed each category link as
 *   "Lighting Lighting LIGHTING PIECES" (3 copies of the name).
 *
 * Root cause:
 *   The `<a>` wrapped `<img alt={cat.name}>` (1 copy) + `<h3>{cat.name}</h3>`
 *   (1 copy) + `<p><span>{cat.count}</span></p>` where `count = \`${cat.name} pieces\``
 *   (1 copy). The accessible name algorithm concatenated all three.
 *
 * Fix:
 *   - Set `<img alt="">` (image is decorative; the heading provides the name)
 *   - Add `aria-label={\`Browse ${cat.name} collection\`}` to the `<a>` so the
 *     accessible name is explicit and singular.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const CATEGORY_GRID = join(WEB_SRC, 'components', 'shop', 'sections', 'CategoryGrid.tsx');

const source = readFileSync(CATEGORY_GRID, 'utf8');

describe('F2 — CategoryGrid accessible name contract', () => {
  it('category card <img> has empty alt (decorative — heading provides the name)', () => {
    // The bug: <Image alt={cat.name} ... /> contributed a 2nd copy of the name.
    // The fix: <Image alt="" ... /> — image is decorative.
    // Assert that the <Image> inside the category card map does NOT use alt={cat.name}.
    // We look for the pattern `alt={cat.name}` and assert it's gone.
    expect(source).not.toMatch(/alt=\{cat\.name\}/);
  });

  it('category card <a> has an aria-label (explicit singular accessible name)', () => {
    // The fix: <a aria-label={`Browse ${cat.name} collection`} ...>
    // Assert that the <a> inside the category card map has an aria-label.
    // Look for `aria-label={` within the cats.map block.
    // Simplest assertion: source contains `aria-label` near the category <a>.
    expect(source).toMatch(/aria-label=/);
    // More specific: the aria-label references cat.name
    expect(source).toMatch(/aria-label=\{[^}]*cat\.name[^}]*\}/);
  });

  it('does NOT set alt={cat.name} on the category card image (would duplicate accessible name)', () => {
    // Double-check: no `alt={cat.name}` anywhere in the file
    expect(source).not.toMatch(/alt=\{cat\.name\}/);
  });
});
