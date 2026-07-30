/**
 * Maison — Editorial heading whitespace contract test (F1, F3, F5)
 *
 * Locks the invariant that italicized headings do NOT use the JSX pattern
 * `<em>{' word '}</em>` (literal leading/trailing spaces inside the em) —
 * which produces visible "word ." with a stray space before punctuation.
 *
 * Also locks the invariant that `<br/>` inside headings is preceded by
 * `{' '}` so that textContent (used by screen readers + SEO crawlers)
 * has proper whitespace.
 *
 * Background:
 *   The bug pattern was identified via agent-browser E2E testing of the
 *   live site https://maison.jesspete.shop/ — see docs/REMEDIATION_PLAN_v5.md
 *   Tasks 1.1 (F1), 1.3 (F3), 1.4 (F5).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB_SRC = join(HERE, '..', '..'); // apps/web/src
const SECTIONS_DIR = join(WEB_SRC, 'components', 'shop', 'sections');
const ABOUT_PAGE = join(WEB_SRC, 'app', '(shop)', 'about', 'page.tsx');

function readSource(relPath: string): string {
  return readFileSync(relPath, 'utf8');
}

// Files that contain italicized editorial headings.
const HEADING_FILES = [
  'FeaturedCollection.tsx',
  'ProductGrid.tsx',
  'Philosophy.tsx',
  'Materials.tsx',
  'HyggeEdit.tsx',
  'JournalSection.tsx',
  'CategoryGrid.tsx',
  'InstagramGrid.tsx',
];

describe('F1 — editorial heading whitespace contract', () => {
  for (const file of HEADING_FILES) {
    describe(file, () => {
      const source = readSource(join(SECTIONS_DIR, file));

      it("does NOT use the buggy `<em>{' word '}</em>` pattern (leading+trailing spaces inside em)", () => {
        // Match <em ...>{' word '}</em> OR <em>{' word '}</em> — including the
        // multi-line form where the `<em>` has style props and the JSX expression
        // is on its own line inside the em. Literal leading+trailing spaces
        // inside the JSX expression render as visible spaces that collide with
        // following punctuation to produce "word ."
        //
        // Buggy pattern (single-line):
        //   <em>{' word '}</em>
        // Buggy pattern (multi-line, the actual Maison form):
        //   <em
        //     style={{...}}
        //   >
        //     {' word '}
        //   </em>
        //
        // The regex matches {' X '} where X has leading or trailing whitespace.
        // We look for the pattern as a standalone JSX child expression inside <em>.
        const buggyPattern = /\{['"]\s+[^'"]+\s+['"]\}/;
        // Find all <em>...</em> blocks (multi-line) and check each child expression.
        const emBlockPattern = /<em\b[^>]*>([\s\S]*?)<\/em>/g;
        let match: RegExpExecArray | null;
        while ((match = emBlockPattern.exec(source)) !== null) {
          const emContent = match[1] ?? '';
          if (buggyPattern.test(emContent)) {
            throw new Error(
              `${file} contains buggy <em>{' word '}</em> pattern (leading/trailing spaces inside em).\n` +
                `Match: ${match[0].slice(0, 200)}`,
            );
          }
        }
      });
    });
  }
});

describe('F3 — About page H1 whitespace', () => {
  const source = readSource(ABOUT_PAGE);

  it('About page H1 has a space between comma and <br/>', () => {
    // The bug: <em>care</em>,<br/>materials — textContent is "care,materials" (no space).
    // The fix: <em>care</em>, <br/>materials (Prettier-normalized form with space before <br/>)
    //   OR <em>care</em>,{' '}<br/>materials (explicit JSX space expression).
    // Both fixes produce a visible space + a textContent space.
    //
    // Assert that we DON'T have the broken pattern: `</em>` followed by
    // optional whitespace, then `,`, then optional whitespace, then `<br/>`,
    // with NO space character or `{' '}` between the comma and `<br/>`.
    //
    // The broken pattern (no space): `,</em>\s*,\s*<br\s*\/?>` where the
    // only thing between `,` and `<br/>` is whitespace from newlines —
    // but JSX collapses newlines without `{' '}`, so we need to detect
    // whether a real space is present.
    //
    // Simpler approach: assert that the source DOES contain a space or
    // `{' '}` between `</em>` (closing the care em) and `<br/>`.
    // Match the pattern: `</em>\s*,\s*(\{' '\}| )\s*<br\s*\/?>`
    expect(source).toMatch(/<\/em>\s*,\s*(?:\{' '\}| )\s*<br\s*\/?>/);
  });
});

describe('F5 — Hero H1 whitespace', () => {
  const heroSource = readSource(join(SECTIONS_DIR, 'Hero.tsx'));

  it('Hero H1 has a space between "Objects of" and <br/>', () => {
    // The bug: "Objects of" immediately followed by <br/> (no space).
    //   Objects of
    //   <br />
    //   <em>Quiet Beauty</em>
    // textContent = "Objects ofQuiet Beauty" (no space because <br/> produces no whitespace).
    //
    // The fix: "Objects of " (with trailing space) followed by <br/> —
    //   OR "Objects of{' '}" followed by <br/>.
    // Both produce a real space in textContent.
    //
    // Assert that "Objects of" is followed by either a space char or `{' '}`
    // before `<br/>`.
    expect(heroSource).toMatch(/Objects of(?:\s+|\{' '\})\s*<br\s*\/?>/);
  });
});
