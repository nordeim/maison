/**
 * Maison — Page metadata contract test (F4)
 *
 * Locks the invariant that key SEO-targeted pages export `metadata` or
 * `generateMetadata`. Next.js 16 forbids `metadata` export from Client
 * Components — pages that need interactivity must be split into a Server
 * Component wrapper (with metadata) + Client Component child.
 *
 * Background:
 *   The bug was identified via agent-browser E2E testing of the live site
 *   https://maison.jesspete.shop/ — see docs/REMEDIATION_PLAN_v5.md Task 1.5.
 *   `/gift-cards` and `/trade` (and `/cart`, `/checkout`) showed the homepage
 *   title "Maison — Objects of Quiet Beauty" instead of page-specific titles.
 *
 * Root cause:
 *   All 4 pages were `'use client'` Client Components with no metadata export.
 *   Next.js inherited the default title from `app/layout.tsx`.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const SHOP_DIR = join(WEB_SRC, 'app', '(shop)');

const SEO_PAGES = ['gift-cards', 'trade', 'cart', 'checkout'];

function readPage(page: string): string {
  const path = join(SHOP_DIR, page, 'page.tsx');
  return readFileSync(path, 'utf8');
}

describe('F4 — SEO page metadata contract', () => {
  for (const page of SEO_PAGES) {
    describe(`${page}/page.tsx`, () => {
      const source = readPage(page);

      it('is a Server Component (no "use client" directive at the top)', () => {
        // The bug: 'use client' at line 1 prevents metadata export.
        // Assert that the first 200 chars do NOT contain 'use client'.
        const top = source.slice(0, 200);
        expect(top, `${page}/page.tsx should not start with 'use client'`).not.toMatch(
          /^['"]use client['"];?/,
        );
      });

      it('exports metadata or generateMetadata', () => {
        // Assert that the source contains `export const metadata` OR
        // `export async function generateMetadata` OR `export function generateMetadata`.
        const hasMetadata =
          /export\s+const\s+metadata\s*[:=]/.test(source) ||
          /export\s+(?:async\s+)?function\s+generateMetadata\b/.test(source);
        expect(hasMetadata, `${page}/page.tsx should export metadata or generateMetadata`).toBe(
          true,
        );
      });
    });
  }
});

describe('F4 — Client Component children exist for interactive pages', () => {
  // After the split, the interactive form lives in a separate Client Component.
  // Verify the existence of these child components.
  const expectedClients = [
    join(WEB_SRC, 'components', 'shop', 'GiftCardsForm.tsx'),
    join(WEB_SRC, 'components', 'shop', 'TradeForm.tsx'),
  ];

  for (const clientPath of expectedClients) {
    const clientName = clientPath.split('/').pop() ?? clientPath;
    describe(clientName, () => {
      it('exists', () => {
        expect(existsSync(clientPath), `${clientPath} should exist`).toBe(true);
      });

      if (existsSync(clientPath)) {
        const source = readFileSync(clientPath, 'utf8');
        it('is a Client Component ("use client" directive)', () => {
          // The 'use client' directive must appear in the first 600 chars
          // (allowing for JSDoc comment block before the directive).
          const top = source.slice(0, 600);
          expect(top).toMatch(/['"]use client['"];?/);
        });
      }
    });
  }
});
