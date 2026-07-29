/**
 * Maison — Rendering-strategy contract test (regression guard).
 *
 * Locks the architectural invariant documented in AGENTS.md /
 * PROJECT-ARCHITECTURE.md §6.3 and the api()/apiPublic() split in
 * lib/trpc/server.ts:
 *
 *   ── Public, cacheable routes (○ Static) MUST use `apiPublic()`
 *      (session-free, no `headers()` → opts OUT of static generation).
 *      A null session is correct: they only invoke `publicProcedure`.
 *
 *   ── Auth-guarded routes (ƒ Dynamic) MUST use `api()`
 *      (session-aware, calls `headers()` → forced dynamic). They invoke
 *      `protectedProcedure` / `adminProcedure` and sit behind the
 *      `(account)` / `(admin)` layouts, which call `auth.api.getSession()`
 *      (the real Layer-2 security boundary).
 *
 * Why this test exists:
 *   During `next build`, Next.js runs a static pre-render probe on every
 *   route. Auth-guarded routes hit `headers()` → the probe throws
 *   `DYNAMIC_SERVER_USAGE` → Next.js opts them into dynamic rendering
 *   (they appear as ƒ in the route table). This is EXPECTED and correct.
 *   The danger is the opposite: an agent accidentally migrating an
 *   auth-guarded route to `apiPublic()` (silently nulling the session →
 *   `protectedProcedure` throws UNAUTHORIZED at runtime) — OR migrating
 *   a public route to `api()` (forcing it dynamic, killing the static
 *   prerender and CDN caching). This test fails the build in both cases
 *   before they ship.
 *
 * This is a SOURCE contract (no React rendering, no tRPC/auth mocks,
 * no build invocation). It reads the page + layout source and asserts
 * the import contract. Fast, deterministic, hermetic — matches the
 * Surgical Change Discipline (no speculative test harness scaffolded).
 *
 * Pattern alignment: Stillwater SKILL Lessons 109 + 112 —
 * "apiCaller is for request-scoped pages only; public/SSG content must
 *  never use apiCaller (headers) — query the DB / use the session-free
 *  caller instead."
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(HERE, '..', '..', 'app'); // apps/web/src/app

// Synchronous + throwing: a missing page file fails the spec loudly with
// a readable ENOENT instead of being swallowed to `null` and surfacing later
// as a confusing regex-assertion failure. This mirrors the Stillwater
// reference (index-routes-no-apiCaller.test.ts) and keeps `src` typed
// `string` (no null branch → no TS18047 under `strict: true`).
const read = (rel: string): string => readFileSync(join(APP_ROOT, rel), 'utf8');

// Pages that fetch public catalog data via tRPC. They MUST use apiPublic()
// so `headers()` is never touched → the route can be prerendered static.
// (Pages that render purely static content — /journal, /about, /contact,
// /gift-cards, /trade, /cart, /checkout — don't call tRPC at all and are
// naturally static; not enumerated here.)
const PUBLIC_TRPC_PAGES = [
  '(shop)/page.tsx',
  '(shop)/products/page.tsx',
  '(shop)/products/[slug]/page.tsx',
  '(shop)/collections/page.tsx',
  '(shop)/search/page.tsx',
];

// Auth-guarded route-group layouts. Each MUST call auth.api.getSession()
// (via headers()) — this is the Layer-2 security boundary and is what
// (correctly) forces the group dynamic.
const AUTH_LAYOUTS = ['(account)/layout.tsx', '(admin)/layout.tsx'];

// Leaf pages under the auth-guarded groups that call the SERVER-side tRPC
// caller (api()). Each MUST use api() so the session is present for
// protectedProcedure / adminProcedure. Using apiPublic() here would null
// ctx.session → UNAUTHORIZED at runtime.
//
// NOTE: Some leaf pages (addresses, loyalty, settings, admin/products/new)
// are pure 'use client' and use the CLIENT-side tRPC caller (trpc from
// @/lib/trpc/client). They don't call api() but are still correctly
// forced dynamic by the layout's headers() call. They're omitted here
// because the server-import contract doesn't apply to them.
const AUTH_LEAF_PAGES = [
  '(account)/account/page.tsx',
  '(account)/account/orders/page.tsx',
  '(account)/account/wishlist/page.tsx',
  '(admin)/admin/page.tsx',
  '(admin)/admin/analytics/page.tsx',
  '(admin)/admin/customers/page.tsx',
  '(admin)/admin/discounts/page.tsx',
  '(admin)/admin/inventory/page.tsx',
  '(admin)/admin/orders/page.tsx',
  '(admin)/admin/products/page.tsx',
  '(admin)/admin/reviews/page.tsx',
  '(admin)/admin/trade/page.tsx',
  // Excluded: (account)/account/addresses, loyalty, settings +
  // (admin)/admin/products/new — these are pure 'use client' pages
  // using the client-side tRPC caller, not the server-side api().
  // They are still correctly forced dynamic by the layout's
  // headers() call.
];

describe('rendering-strategy contract', () => {
  describe('public routes — must be statically prerenderable', () => {
    for (const rel of PUBLIC_TRPC_PAGES) {
      it(`${rel} imports apiPublic (not api) → opts OUT of static generation`, () => {
        const src = read(rel);
        // Import contract: apiPublic must be imported; api (the headers-bound
        // caller) must NOT. `api(` as a call is banned too.
        expect(src).toMatch(/import\s+\{\s*apiPublic\s*\}\s+from\s+['"]@\/lib\/trpc\/server['"]/);
        expect(src).not.toMatch(/from\s+['"]@\/lib\/trpc\/server['"]\s*[^;]*\bapi\b/);
        // Strip comment lines before checking - `api()` in JSDoc is benign
        const codeOnly = src
          .split('\n')
          .filter((line) => !line.trimStart().startsWith('//') && !line.trimStart().startsWith('*'))
          .join('\n');
        expect(codeOnly).not.toMatch(/\bapi\(\s*\)/);
      });
    }
  });

  describe('auth-guarded routes — must be forced dynamic by design', () => {
    for (const rel of AUTH_LAYOUTS) {
      it(`${rel} calls auth.api.getSession({ headers }) — Layer-2 boundary, forces dynamic`, () => {
        const src = read(rel);
        expect(src).toMatch(/auth\.api\.getSession\(/);
        expect(src).toMatch(/from\s+['"]next\/headers['"]/);
        expect(src).toMatch(/await\s+headers\(\)/);
      });
    }

    for (const rel of AUTH_LEAF_PAGES) {
      it(`${rel} imports api (session-aware) — never apiPublic`, () => {
        const src = read(rel);
        // Page must use the session-aware caller. (Some pages also call
        // useSession via ClientOnly-wrapped components — that's fine and
        // orthogonal. This asserts the SERVER-side tRPC caller contract.)
        expect(src).toMatch(/import\s+\{\s*api\s*\}\s+from\s+['"]@\/lib\/trpc\/server['"]/);
        expect(src).not.toMatch(/apiPublic/);
      });
    }
  });

  // Meta-guard: ensure the split-caller module itself stays consistent
  // with this test's assumptions. Headers-bound `api()` must call
  // next/headers; `apiPublic()` must NOT (that's the whole point).
  it('lib/trpc/server.ts maintains the api/apiPublic contract', () => {
    const src = readFileSync(join(HERE, '..', 'trpc', 'server.ts'), 'utf8');
    expect(src).toContain('export async function api()');
    expect(src).toContain('export async function apiPublic()');
    // api() must read headers() (this is what makes consumers dynamic).
    expect(src).toMatch(/import\s+\{\s*headers\s*\}\s+from\s+['"]next\/headers['"]/);
    // apiPublic() must NOT import or call headers — assert by bounding the
    // function body contains no headers() call. (The import above is
    // shared, so we check apiPublic's own body text segment.)
    const apiPublicBody = src.slice(
      src.indexOf('export async function apiPublic()'),
      src.indexOf('export async function apiPublic()') + 400,
    );
    expect(apiPublicBody).not.toMatch(/\bheaders\(\)/);
  });
});
