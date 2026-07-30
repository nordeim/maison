/**
 * Maison — Scroll reveal wiring contract test (V11-1)
 *
 * Locks the invariant that the `useScrollReveal` hook is actually mounted
 * somewhere in the shop layout (via `ScrollRevealTrigger`). Without this
 * wiring, `.reveal` elements (e.g. ProductCard) stay at `opacity: 0` forever
 * — the root cause of the "/products shows blank screen" defect.
 *
 * Per REMEDIATION_PLAN_v11 Task 1.1.
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
