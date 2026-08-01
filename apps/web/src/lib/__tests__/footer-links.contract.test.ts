/**
 * Maison — Footer links contract test (v12 E2E-HIGH)
 *
 * Locks the invariant that every footer link in site.ts points to a page
 * that exists (or is an external URL). Broken footer links return 404
 * on the live site, which is a poor user experience and hurts SEO.
 *
 * Per REMEDIATION_PLAN_v12 Task 1.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const APP_DIR = join(REPO_ROOT, 'apps', 'web', 'src', 'app');

// Pages that exist in the app directory (collected once).
// Each route is a directory under app/ (or (shop)/, (account)/, (admin)/).
function getExistingRoutes(): Set<string> {
  const routes = new Set<string>();
  const routeGroups = ['', '(shop)', '(account)', '(admin)'];

  for (const group of routeGroups) {
    const groupDir = join(APP_DIR, group);
    if (!existsSync(groupDir)) continue;
    for (const entry of readdirSync(groupDir, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.name.startsWith('_') && entry.name !== 'api') {
        routes.add(`/${entry.name}`);
      }
    }
  }

  // Root route always exists
  routes.add('/');

  return routes;
}

const EXISTING_ROUTES = getExistingRoutes();

// Footer links that are allowed to be "broken" — these are known Phase 2+
// pages that don't exist yet. The fix removes them from site.ts entirely,
// but if any remain, they must be in this allowlist.
const ALLOWED_MISSING: string[] = [];

describe('E2E-HIGH — footer links point to existing pages', () => {
  it('site.ts exists and can be read', () => {
    const sitePath = join(REPO_ROOT, 'packages', 'config', 'src', 'site.ts');
    expect(existsSync(sitePath)).toBe(true);
  });

  it('no footer column links point to missing pages', () => {
    const sitePath = join(REPO_ROOT, 'packages', 'config', 'src', 'site.ts');
    const source = readFileSync(sitePath, 'utf8');

    // Extract all href values from the footer config
    // Match: href: '/some-path'  or  href: '/some-path#anchor'
    const hrefMatches = Array.from(source.matchAll(/href:\s*['"]([^'"]+)['"]/g));
    const internalHrefs = hrefMatches
      .map((m) => m[1] ?? '')
      .filter((href) => href.startsWith('/') && !href.includes('?'));

    // For each internal href, check that either:
    // 1. The route exists in the app directory, OR
    // 2. It's in the ALLOWED_MISSING list, OR
    // 3. It's an anchor link (#) on a page that exists
    const broken: string[] = [];
    for (const href of internalHrefs) {
      if (ALLOWED_MISSING.includes(href)) continue;

      // Strip anchor fragment for route check
      const [path] = href.split('#');

      if (path && !EXISTING_ROUTES.has(path)) {
        broken.push(href);
      }
    }

    expect(
      broken,
      `Footer links pointing to missing pages: ${broken.join(', ')}. ` +
        `Existing routes: ${Array.from(EXISTING_ROUTES).sort().join(', ')}`,
    ).toEqual([]);
  });

  it('no footer legal links point to missing pages', () => {
    const sitePath = join(REPO_ROOT, 'packages', 'config', 'src', 'site.ts');
    const source = readFileSync(sitePath, 'utf8');

    // The legal section has links like Privacy Policy, Terms of Service, Cookie Preferences
    // These must not point to /privacy-policy, /terms-of-service, /cookie-policy (which 404)
    const bannedPaths = [
      '/privacy-policy',
      '/terms-of-service',
      '/cookie-policy',
      '/care-guide',
      '/faq',
      '/shipping-returns',
    ];

    for (const path of bannedPaths) {
      expect(
        source,
        `site.ts still references banned path "${path}" which returns 404 on the live site`,
      ).not.toContain(`href: '${path}'`);
      expect(
        source,
        `site.ts still references banned path "${path}" which returns 404 on the live site`,
      ).not.toContain(`href: "${path}"`);
    }
  });
});
