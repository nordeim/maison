/**
 * Maison — Design token contract test (ADR-007 + Design Guide §15)
 *
 * Validates that the radius tokens declared in `packages/ui/src/tokens/spacing.css`
 * (the canonical source per ADR-007) are correctly mirrored in
 * `apps/web/src/app/globals.css` `@theme` block with CONCRETE values — not
 * broken recursive self-references like `--radius-sm: var(--radius-sm)`.
 *
 * Per CLAUDE.md §"Anti-Generic UI Checklist":
 *   "No rounded-everything — `--radius-sm: 2px` is deliberate. Sharp = editorial."
 *
 * Recursive self-references are invalid CSS that silently resolve to the
 * unset (initial) value, breaking Tailwind utility classes like `rounded-sm`.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
// HERE = apps/web/src/lib/__tests__
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const REPO_ROOT = join(WEB_SRC, '..', '..', '..'); // repo root (3 ups from apps/web/src)

const SPACING_CSS_PATH = join(REPO_ROOT, 'packages', 'ui', 'src', 'tokens', 'spacing.css');
const GLOBALS_CSS_PATH = join(WEB_SRC, 'app', 'globals.css');

function readSpacingCss(): string {
  return readFileSync(SPACING_CSS_PATH, 'utf8');
}

function readGlobalsCssNoComments(): string {
  // Strip /* ... */ block comments and // line comments before asserting,
  // so the test doesn't false-positive on comment text that quotes the
  // broken pattern for documentation purposes.
  const raw = readFileSync(GLOBALS_CSS_PATH, 'utf8');
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/.*$/gm, ''); // line comments
}

describe('Design tokens — radius (ADR-007 + Design Guide §15)', () => {
  describe('packages/ui/src/tokens/spacing.css (canonical source)', () => {
    it('defines --radius-sm: 2px', () => {
      const source = readSpacingCss();
      expect(source).toMatch(/--radius-sm:\s*2px/);
    });

    it('defines --radius-md: 4px', () => {
      const source = readSpacingCss();
      expect(source).toMatch(/--radius-md:\s*4px/);
    });

    it('defines --radius-lg: 8px', () => {
      const source = readSpacingCss();
      expect(source).toMatch(/--radius-lg:\s*8px/);
    });

    it('defines --radius-full: 9999px', () => {
      const source = readSpacingCss();
      expect(source).toMatch(/--radius-full:\s*9999px/);
    });
  });

  describe('apps/web/src/app/globals.css @theme (mirrors canonical source)', () => {
    it('--radius-sm has concrete value (NOT recursive self-reference)', () => {
      const source = readGlobalsCssNoComments();
      // Must NOT be the broken self-reference form.
      expect(source).not.toMatch(/--radius-sm:\s*var\(\s*--radius-sm\s*\)/);
      // Must have a concrete value (2px per canonical source).
      expect(source).toMatch(/--radius-sm:\s*2px/);
    });

    it('--radius-md has concrete value (NOT recursive self-reference)', () => {
      const source = readGlobalsCssNoComments();
      expect(source).not.toMatch(/--radius-md:\s*var\(\s*--radius-md\s*\)/);
      expect(source).toMatch(/--radius-md:\s*4px/);
    });

    it('--radius-lg has concrete value (NOT recursive self-reference)', () => {
      const source = readGlobalsCssNoComments();
      expect(source).not.toMatch(/--radius-lg:\s*var\(\s*--radius-lg\s*\)/);
      expect(source).toMatch(/--radius-lg:\s*8px/);
    });

    it('--radius-full has concrete value (NOT recursive self-reference)', () => {
      const source = readGlobalsCssNoComments();
      expect(source).not.toMatch(/--radius-full:\s*var\(\s*--radius-full\s*\)/);
      expect(source).toMatch(/--radius-full:\s*9999px/);
    });
  });
});
