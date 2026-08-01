/**
 * Maison — Search cursor pagination contract test (v15 HIGH)
 *
 * Locks the invariant that the products.search query supports cursor-based
 * pagination (not just a flat limit). Without a cursor, search results
 * beyond the limit cannot be paginated — a data-correctness gap.
 *
 * Mirrors the cursor-pagination.contract.test.ts pattern from v12 Task 2.
 *
 * Per REMEDIATION_PLAN_v15 Task 1.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const PRODUCTS_ROUTER = join(REPO_ROOT, 'packages', 'api', 'src', 'routers', 'products.ts');

describe('HIGH — products.search supports cursor pagination', () => {
  it('search query input schema includes a cursor field', () => {
    const source = readFileSync(PRODUCTS_ROUTER, 'utf8');
    // Extract the search query's input schema block
    const inputRe = /search:\s*publicProcedure[\s\S]*?input\(\s*z\.object\(\{([^}]+)\}/;
    const searchMatch = inputRe.exec(source);
    expect(searchMatch, 'search query not found').not.toBeNull();
    const searchInput = searchMatch?.[1] ?? '';
    expect(searchInput, 'search query input must include a cursor field for pagination').toMatch(
      /cursor:\s*z\.string\(\)\.optional\(\)/,
    );
  });

  it('search query returns a nextCursor field', () => {
    const source = readFileSync(PRODUCTS_ROUTER, 'utf8');
    // Extract the search query block (from 'search:' to the end of the router)
    const searchIdx = source.indexOf('search: publicProcedure');
    expect(searchIdx, 'search query not found').toBeGreaterThan(-1);
    // Get the search block (from 'search:' to the closing '});' of the router)
    const searchBlock = source.substring(searchIdx, source.indexOf('});', searchIdx));
    expect(searchBlock, 'search query must return a nextCursor field for pagination').toMatch(
      /nextCursor/,
    );
  });
});
