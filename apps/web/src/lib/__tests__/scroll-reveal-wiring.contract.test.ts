/**
 * Maison — Scroll reveal wiring contract test (V11-1 + V14-1)
 *
 * Locks the invariant that the `useScrollReveal` hook is actually mounted
 * somewhere in the shop layout (via `ScrollRevealTrigger`). Without this
 * wiring, `.reveal` elements (e.g. ProductCard) stay at `opacity: 0` forever
 * — the root cause of the "/products shows blank screen" defect.
 *
 * V14-1 addition: also locks the invariant that the useEffect dependency
 * array includes `pathname` (or `usePathname`) so the observer re-runs on
 * client-side navigations between collection filter pages.
 *
 * Per REMEDIATION_PLAN_v11 Task 1.1 + REMEDIATION_PLAN_v14 Task 1.1.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const SHOP_LAYOUT = join(WEB_SRC, 'app', '(shop)', 'layout.tsx');
const SCROLL_REVEAL_TRIGGER = join(WEB_SRC, 'components', 'shop', 'ScrollRevealTrigger.tsx');
const USE_SCROLL_REVEAL_HOOK = join(WEB_SRC, 'hooks', 'useScrollReveal.ts');

describe('V11-1 — scroll reveal is wired (not just defined)', () => {
  it('useScrollReveal hook file exists', () => {
    expect(existsSync(USE_SCROLL_REVEAL_HOOK), 'hooks/useScrollReveal.ts should exist').toBe(true);
  });

  it('ScrollRevealTrigger client component exists', () => {
    expect(existsSync(SCROLL_REVEAL_TRIGGER), 'ScrollRevealTrigger.tsx should exist').toBe(true);
    if (existsSync(SCROLL_REVEAL_TRIGGER)) {
      const source = readFileSync(SCROLL_REVEAL_TRIGGER, 'utf8');
      expect(source).toMatch(/['"]use client['"]/);
      expect(source).toMatch(/useScrollReveal/);
    }
  });

  it('shop layout imports and renders ScrollRevealTrigger', () => {
    const source = readFileSync(SHOP_LAYOUT, 'utf8');
    expect(source).toMatch(/ScrollRevealTrigger/);
    expect(source).toMatch(/<ScrollRevealTrigger\s*\/>/);
  });
});

describe('V14-1 — scroll reveal re-runs on route change', () => {
  it('useScrollReveal imports usePathname from next/navigation', () => {
    const source = readFileSync(USE_SCROLL_REVEAL_HOOK, 'utf8');
    expect(source).toMatch(/usePathname/);
    expect(source).toMatch(/from\s+['"]next\/navigation['"]/);
  });

  it('useEffect dependency array includes pathname (not empty)', () => {
    // The V14 fix: the effect had `[]` (empty deps), so it only ran once.
    // Now it includes `pathname` so it re-runs on client-side navigation.
    const source = readFileSync(USE_SCROLL_REVEAL_HOOK, 'utf8');
    // Assert the dependency array is NOT empty — must contain at least `pathname`
    expect(source).not.toMatch(/\},\s*\[\]\s*\)/);
    // Assert it DOES contain pathname in the deps array
    expect(source).toMatch(/\},\s*\[pathname/);
  });
});
