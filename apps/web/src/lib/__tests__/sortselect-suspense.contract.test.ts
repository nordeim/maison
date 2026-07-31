/**
 * Maison — SortSelect Suspense boundary contract test (v10 LOW-2)
 *
 * Locks the invariant that <SortSelect /> (which calls useSearchParams())
 * is wrapped in a <Suspense> boundary at its call site in the PLP.
 *
 * Why this matters: Next.js requires any component using useSearchParams()
 * to be wrapped in a <Suspense> boundary, otherwise `next build` fails with
 * "useSearchParams() should be wrapped in a suspense boundary at page /xxx".
 *
 * Today the gap is masked because /products already opts into ƒ (Dynamic)
 * via `await searchParams` — so the build does not break. But the moment
 * anyone removes `await searchParams` to make /products static, the build
 * will break. This test prevents that latent regression.
 *
 * Mirrors the precedent in scroll-reveal-wiring.contract.test.ts:42-51
 * (V15-1 fix) which locks the same invariant for <ScrollRevealTrigger />.
 *
 * Per REMEDIATION_PLAN_v10 Task 1.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const PLP_PAGE = join(WEB_SRC, 'app', '(shop)', 'products', 'page.tsx');
const SORT_SELECT_COMPONENT = join(WEB_SRC, 'components', 'shop', 'SortSelect.tsx');

describe('LOW-2 — SortSelect is wrapped in a Suspense boundary at its call site', () => {
  it('SortSelect component uses useSearchParams (Client Component)', () => {
    const source = readFileSync(SORT_SELECT_COMPONENT, 'utf8');
    expect(source).toMatch(/['"]use client['"]/);
    expect(source).toMatch(/useSearchParams/);
  });

  it('PLP imports Suspense from react', () => {
    const source = readFileSync(PLP_PAGE, 'utf8');
    expect(source, 'products/page.tsx must import Suspense from react').toMatch(
      /import\s+\{[^}]*\bSuspense\b[^}]*\}\s+from\s+['"]react['"]/,
    );
  });

  it('PLP renders <SortSelect /> wrapped in <Suspense fallback={null}>', () => {
    const source = readFileSync(PLP_PAGE, 'utf8');
    expect(source).toMatch(/<SortSelect/);
    expect(source).toMatch(/<Suspense/);
    // Mirror the precedent regex from scroll-reveal-wiring.contract.test.ts:50
    expect(source).toMatch(/<Suspense[^>]*>\s*<SortSelect/);
  });
});
