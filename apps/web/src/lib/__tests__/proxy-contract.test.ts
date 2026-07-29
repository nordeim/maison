/**
 * Maison — proxy.ts contract test (ADR-006 + ADR-010 Layer-1 invariant)
 *
 * Locks the architectural invariant documented in:
 *   - PROJECT-ARCHITECTURE.md §6.3 (2-layer auth pattern)
 *   - ADR-006 (`proxy.ts` replaces `middleware.ts`)
 *   - ADR-010 (2-layer auth: cookie-only Layer 1 + DB-backed Layer 2)
 *   - AGENTS.md "Things that look wrong but aren't"
 *   - CLAUDE.md §Next.js 16 + §Better Auth
 *
 * Layer 1 (this file): `apps/web/proxy.ts` MUST only call `getSessionCookie()`
 *   from `better-auth/cookies`. It MUST NOT call `auth.api.getSession()`,
 *   MUST NOT touch the database, MUST NOT do RBAC role checks. Edge-compatible.
 *   Purpose: fast redirect for unauthenticated users (optimistic).
 *
 * Layer 2 (layout.tsx files): `apps/web/src/app/(account)/layout.tsx` and
 *   `apps/web/src/app/(admin)/layout.tsx` MUST call `auth.api.getSession()`
 *   (the actual security boundary). This is enforced by the rendering-strategy
 *   contract test.
 *
 * Why this test exists:
 *   The most common Layer-1 violation is "just call auth.api.getSession() in
 *   proxy.ts — it's simpler." That breaks the Edge runtime (DB access),
 *   destroys the static prerender for shop routes, and centralizes auth in a
 *   single point of failure. This test catches such regressions at build time.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = join(HERE, '..', '..'); // apps/web/src
const APPS_WEB_ROOT = join(WEB_ROOT, '..'); // apps/web
const PROXY_PATH = join(APPS_WEB_ROOT, 'proxy.ts');

function readProxySource(): string {
  return readFileSync(PROXY_PATH, 'utf8');
}

describe('ADR-006 + ADR-010 — proxy.ts Layer-1 contract', () => {
  it('apps/web/proxy.ts exists at the canonical location', () => {
    const source = readProxySource();
    expect(source.length).toBeGreaterThan(0);
  });

  it('exports a function named `proxy` (NOT `middleware`)', () => {
    const source = readProxySource();
    expect(source).toMatch(/export\s+function\s+proxy\b/);
    expect(source).not.toMatch(/export\s+function\s+middleware\b/);
  });

  it('imports getSessionCookie from better-auth/cookies', () => {
    const source = readProxySource();
    expect(source).toMatch(
      /import\s+\{[^}]*getSessionCookie[^}]*\}\s+from\s+['"]better-auth\/cookies['"]/,
    );
  });

  it('does NOT call auth.api.getSession (Layer 2 boundary only)', () => {
    const source = readProxySource();
    // Match the actual call form `auth.api.getSession({ ... })` (with arg).
    // Comment mentions like "auth.api.getSession()" (no arg) are allowed —
    // they document the Layer 2 contract without invoking it.
    expect(source).not.toMatch(/auth\.api\.getSession\s*\(\s*\{/);
    expect(source).not.toMatch(/await\s+auth\.api\.getSession/);
    expect(source).not.toMatch(/return\s+auth\.api\.getSession/);
  });

  it('does NOT import from @maison/auth (no DB-layer auth in Edge runtime)', () => {
    const source = readProxySource();
    expect(source).not.toMatch(/from\s+['"]@maison\/auth['"]/);
  });

  it('does NOT do RBAC role checks (Layer 1 is cookie-only)', () => {
    const source = readProxySource();
    // Role checks (e.g. `role === 'staff'`, `requireRole(`) belong in Layer 2 layouts.
    expect(source).not.toMatch(/requireRole\(/);
    expect(source).not.toMatch(/role\s*===?\s*['"]staff['"]/);
    expect(source).not.toMatch(/role\s*===?\s*['"]manager['"]/);
    expect(source).not.toMatch(/role\s*===?\s*['"]owner['"]/);
  });

  it('exports a `config` with a matcher that excludes API routes + static assets', () => {
    const source = readProxySource();
    expect(source).toMatch(/export\s+const\s+config\b/);
    expect(source).toMatch(/matcher:/);
    // API routes handle their own auth — proxy must not run on them.
    expect(source).toMatch(/api\//);
    // Static assets must bypass the proxy.
    expect(source).toMatch(/_next\/static/);
  });
});
