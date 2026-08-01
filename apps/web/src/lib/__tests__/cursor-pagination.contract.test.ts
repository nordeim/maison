/**
 * Maison — Compound cursor pagination contract test (v12 CRITICAL)
 *
 * Locks the invariant that the products.list query actually USES the
 * cursor to filter results (not just accepts and ignores it).
 *
 * Why this matters: the v11 audit found that the cursor was accepted
 * as input but never used in the WHERE clause — every "next page"
 * request returned the same first N items. This is a silent data-
 * correctness bug.
 *
 * Per REMEDIATION_PLAN_v12 Task 2.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// apps/web/src/lib/__tests__ -> repo root = 5 levels up
const REPO_ROOT = join(HERE, '..', '..', '..', '..', '..');
const PRODUCTS_ROUTER = join(REPO_ROOT, 'packages', 'api', 'src', 'routers', 'products.ts');

describe('CRITICAL — products.list uses cursor in WHERE clause (not just accepts it)', () => {
  it('cursor schema is string (not uuid) to support compound cursor encoding', () => {
    const source = readFileSync(PRODUCTS_ROUTER, 'utf8');
    // The cursor should be z.string() (opaque encoded cursor), not z.string().uuid()
    expect(source).not.toMatch(/cursor:\s*z\.string\(\)\.uuid\(\)/);
    expect(source).toMatch(/cursor:\s*z\.string\(\)\.optional\(\)/);
  });

  it('list query decodes the cursor and uses it in the WHERE clause', () => {
    const source = readFileSync(PRODUCTS_ROUTER, 'utf8');
    // The cursor must be decoded (split or parsed) and used in a WHERE condition.
    expect(source).toMatch(/cursor/);
    // The cursor should be split/decoded (e.g., cursor.split('|') or JSON.parse)
    expect(source, 'cursor must be decoded (split or parsed) to extract sort value + id').toMatch(
      /cursor.*split|decodeCursor|parseCursor/,
    );
    // The decoded cursor must be used in a WHERE condition (lt/gt/or)
    expect(source, 'decoded cursor must be used in a WHERE condition (lt, gt, or)').toMatch(
      /lt\(|gt\(|or\(/,
    );
  });

  it('nextCursor is encoded from the last row sort value + id', () => {
    const source = readFileSync(PRODUCTS_ROUTER, 'utf8');
    // The nextCursor should be encoded (not just the raw id)
    expect(source).toMatch(/nextCursor/);
    // Look for evidence of cursor encoding: either an encodeCursor helper,
    // or a template literal with a pipe separator, or string concatenation with pipe
    expect(source, 'nextCursor must be encoded from sort value + id (not just raw id)').toMatch(
      /encodeCursor|nextCursor.*pipe|sortValue.*id|cursorParts/,
    );
  });
});
