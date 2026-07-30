# Maison — E2E Remediation Plan v5 (post-deployment)

> **Goal**: Fix 5 confirmed bugs found via agent-browser E2E testing of the live site
> `https://maison.jesspete.shop/`, plus 2 documentation-hygiene items. All code
> changes use TDD (RED → GREEN → REFACTOR).
>
> **Live site evidence**: see `/home/z/my-project/worklog.md` Task ID 5 for the
> full validation report with file paths, line numbers, and code excerpts.

---

## Scope

### In scope (7 fixes)

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| F1 | Stray space before punctuation in italicized headings (8 sites) | P1 a11y/UX | Code |
| F2 | Category card accessible name triple-counts the name | P2 a11y | Code |
| F3 | About page H1 missing space: `care,materials` | P1 a11y/SEO | Code |
| F4 | `/gift-cards` + `/trade` pages use homepage title metadata | P2 SEO | Code |
| F5 | Hero H1 missing space: `Objects ofQuiet Beauty` | P1 a11y/SEO | Code |
| F6 | Sanity Studio `styled-components` version mismatch warning | P3 hygiene | Code |
| F7 | Docs claim 13 seeded products but seed has 20 | P3 doc drift | Docs |

### Out of scope (intentional / deferred)

- **Search page inline input** (Issue 5): intentional Phase 1 UX — empty state tells users to use the header search modal. Future enhancement only.
- **`DYNAMIC_SERVER_USAGE` build warnings** (Issue 7): expected per ADR-010 + locked by `rendering-strategy.contract.test.ts` + `proxy-contract.test.ts`. AGENTS.md L233 explicitly forbids silencing them.
- **Trigger.dev stubs** (Issue 8): already documented in `docs/REMEDIATION_PLAN_v4.md` §E1 as deferred.

---

## Execution Plan (TDD where applicable)

### Phase 1 — Code fixes (TDD)

#### Task 1.1 — Fix stray-space-before-punctuation in italicized headings (F1, 8 sites)

**Root cause**: JSX pattern `<base><em>{' accent '}</em>.` — the `{' accent '}` JSX expression contains literal leading+trailing spaces, and the punctuation sits OUTSIDE the `<em>`. The browser renders the spaces, producing visible "accent ." with a space before the period.

**Fix strategy**: Move the punctuation INSIDE the `<em>` (so the space is contained), OR remove the leading/trailing spaces inside `<em>` and put them as `{' '}` outside. The cleanest fix is to wrap the entire phrase including punctuation in the heading text and use `<em>` only for the italicized word WITHOUT surrounding spaces.

**Concrete pattern transformation**:
```tsx
// BEFORE (buggy):
<h2>Lighting that<em>{' casts warmth '}</em>.</h2>
// Renders: "Lighting that casts warmth ." (stray space before period)

// AFTER (fixed):
<h2>Lighting that <em>casts warmth</em>.</h2>
// Renders: "Lighting that casts warmth." (correct)
```

**Files to fix** (8 sites across 7 files):
1. `apps/web/src/components/shop/sections/FeaturedCollection.tsx` ~L93
2. `apps/web/src/components/shop/sections/ProductGrid.tsx` ~L95
3. `apps/web/src/components/shop/sections/Philosophy.tsx` ~L90 (`care`) + ~L100 (`gracefully`) — 2 sites
4. `apps/web/src/components/shop/sections/Materials.tsx` ~L88
5. `apps/web/src/components/shop/sections/HyggeEdit.tsx` ~L79
6. `apps/web/src/components/shop/sections/JournalSection.tsx` ~L94
7. `apps/web/src/components/shop/sections/CategoryGrid.tsx` ~L110

**TDD**:
- **RED**: Add a Vitest contract test in `apps/web/src/lib/__tests__/headings.contract.test.ts` that reads each section source file and asserts no `<em>{'` pattern (which indicates literal-space-in-em).
- **GREEN**: Apply the pattern transformation to all 8 sites.
- **REFACTOR**: N/A.

#### Task 1.2 — Fix category card accessible name triple-counting (F2)

**Root cause**: `CategoryGrid.tsx` L148-192 — `<a>` wraps:
- `<img alt={cat.name}>` (provides "Lighting")
- `<h3>{cat.name}</h3>` (provides "Lighting")
- `<p><span>{cat.count}</span></p>` where `count = \`${cat.name} pieces\`` (provides "Lighting pieces", uppercased to "LIGHTING PIECES" via CSS)

Accessible name algorithm concatenates → "Lighting Lighting LIGHTING PIECES".

**Fix strategy**:
1. Set `<img alt="">` (empty alt — image is decorative; the heading provides the name)
2. Change `count` from `${cat.name} pieces` to `${count} pieces` where count is the actual numeric count (e.g., "28 pieces"). Currently `count` is set to `${c.name} pieces` which duplicates the name.

Looking at the existing `FALLBACK_CATEGORIES` (L16-45), each entry has a `count` field like "42 pieces", "28 pieces". But the dynamic path (L48-59) sets `count: \`${c.name} pieces\`` — this is the bug. It should be `count: \`${c.name} pieces\`` only if we want "Lighting pieces" as a descriptor; OR we should make the count numeric.

The simplest fix that preserves the visual design:
- Set `<img alt="">` (decorative)
- Wrap the `<a>` in an `aria-labelledby` pointing to the `<h3>` ID, so only the H3 is the accessible name
- OR add `aria-label={\`Browse ${cat.name} collection\`}` to the `<a>`

**TDD**:
- **RED**: Add a contract test asserting the `CategoryGrid.tsx` source does NOT contain `<img alt={cat.name}>` (i.e., the image alt should be empty or different from the heading text) AND asserts the `<a>` has an `aria-label` OR `aria-labelledby`.
- **GREEN**: Apply the fix.
- **REFACTOR**: N/A.

#### Task 1.3 — Fix About page H1 missing space after comma (F3)

**Root cause**: `about/page.tsx` L85-106:
```tsx
Objects made with{' '}
<em>care</em>,
<br />
materials that age{' '}
<em>gracefully</em>.
```

The `<br/>` produces no whitespace in textContent, so screen readers read "Objects made with care,materials that age gracefully." (no space after comma).

**Fix strategy**: Replace `<br/>` with `{' '}` (which produces a real space), OR restructure to use two separate `<span>` blocks with display:block. The cleanest fix is to remove the `<br/>` and let the line break happen via CSS (or accept that the heading wraps naturally). Since the heading is in a hero with limited width, we can use `{' '}` and let it wrap.

But wait — the visual design wants a line break between "care," and "materials". The fix that preserves the visual line break AND fixes the textContent:
```tsx
Objects made with{' '}<em>care</em>,{' '}
<br />
materials that age{' '}<em>gracefully</em>.
```
Adding `{' '}` after the comma but before `<br/>` ensures textContent has "care, materials" (with space).

**TDD**:
- **RED**: Add a contract test asserting the about page source has `{' '}` between `</em>,` and `<br/>`.
- **GREEN**: Apply the fix.
- **REFACTOR**: N/A.

#### Task 1.4 — Fix Hero H1 missing space (F5)

**Root cause**: `Hero.tsx` L91-101:
```tsx
Objects of
<br />
<em>Quiet Beauty</em>
```

Same as F3 — `<br/>` produces no whitespace, so textContent is "Objects ofQuiet Beauty".

**Fix strategy**: Add `{' '}` before `<br/>` OR restructure. Cleanest:
```tsx
Objects of{' '}
<br />
<em>Quiet Beauty</em>
```

**TDD**:
- **RED**: Add a contract test asserting the Hero source has `{' '}` before `<br/>` in the H1.
- **GREEN**: Apply the fix.
- **REFACTOR**: N/A.

#### Task 1.5 — Fix /gift-cards and /trade page metadata (F4)

**Root cause**: Both pages are Client Components (`'use client'`) and don't export `metadata`. Next.js 16 forbids `metadata` export from Client Components.

**Fix strategy**: Split each page into:
- A Server Component `page.tsx` that exports `generateMetadata` (or static `metadata`) and renders the Client Component
- A Client Component child (e.g., `GiftCardsForm.tsx`, `TradeForm.tsx`) that contains the interactive form

For `/gift-cards`:
- `apps/web/src/app/(shop)/gift-cards/page.tsx` — Server Component with `metadata` + renders `<GiftCardsForm />`
- `apps/web/src/components/shop/GiftCardsForm.tsx` — Client Component (the current page content)

For `/trade`:
- `apps/web/src/app/(shop)/trade/page.tsx` — Server Component with `metadata` + renders `<TradeForm />`
- `apps/web/src/components/shop/TradeForm.tsx` — Client Component (the current page content)

**TDD**:
- **RED**: Add a contract test asserting both `gift-cards/page.tsx` and `trade/page.tsx`:
  - Do NOT have `'use client'` directive at the top
  - DO export `metadata` (static) or `generateMetadata` (dynamic)
- **GREEN**: Split the components and apply the fix.
- **REFACTOR**: N/A.

#### Task 1.6 — Bump Sanity Studio styled-components version (F6)

**Root cause**: `apps/studio/package.json` L17 has `"styled-components": "^6.1.13"` but `sanity@^6.6.0` requires `^6.1.15`.

**Fix strategy**: Bump to `^6.1.15` (or latest 6.x). Run `pnpm install` to update lockfile.

**TDD**: No test — this is a dependency bump. Verify by running `pnpm install` and confirming the warning is gone (or reduced).

### Phase 2 — Documentation updates

#### Task 2.1 — Update product count references (F7)

Update all docs that say "13 products" / "13 initial SKUs" to say "20 products (13 original + 7 UAT additions)" — OR just "20 products" if the breakdown isn't relevant.

Files to update (per Task 5 validation):
- `Project_Requirements_Document.md` ~L1386, L1527
- `README.md` (if it mentions 13 products)
- `AGENTS.md` (if it mentions 13 products)
- `CLAUDE.md` (if it mentions 13 products)
- `docs/MAISON_PRD_v1.2.md` ~L1259, L1401
- `docs/MAISON_PAD_v1.2.md` ~L605, L1803, L1900
- `docs/PROJECT-ARCHITECTURE_v1.md` ~L411, L1327, L1424
- `scripts/db-setup.sh` ~L38

Note: Some of these are archived/historical docs (docs/MAISON_PRD_v1.2.md, docs/MAISON_PAD_v1.2.md). Update the canonical docs (PRD, PAD, README, AGENTS.md, CLAUDE.md) and leave the archived v1.2 docs as-is (they're historical snapshots).

#### Task 2.2 — Add E2E findings to REMEDIATION_PLAN_v4 or create v5

Create `docs/REMEDIATION_PLAN_v5.md` (this file) documenting:
- The 5 confirmed bugs found via E2E
- The 2 doc-hygiene items
- The fixes applied
- The deferred items (search input, DYNAMIC_SERVER_USAGE warnings, Trigger.dev stubs)

#### Task 2.3 — Update REMEDIATION_HISTORY sections in PRD/PAD/Design Guide

Append a v1.2.2 note to the existing REMEDIATION_HISTORY sections (added in v1.2.1) documenting:
- 5 a11y/SEO fixes (F1-F5)
- 1 hygiene fix (F6 styled-components)
- 1 doc fix (F7 product count)

### Phase 3 — Verify

#### Task 3.1 — Run all gates
```bash
pnpm check-types
pnpm lint
pnpm test
pnpm format:check
```

#### Task 3.2 — Re-validate fixes via agent-browser (if time permits)
- Re-open `https://maison.jesspete.shop/` after the next deployment and verify:
  - No stray-space-before-punctuation in headings
  - Category card accessible name is single (not tripled)
  - About page H1 has space after comma
  - `/gift-cards` and `/trade` have correct titles
  - Hero H1 has space between "of" and "Quiet"

Note: The live site won't reflect fixes until the user redeploys. The local verification confirms the source is fixed; the user can redeploy at their convenience.

### Phase 4 — Commit and push

#### Task 4.1 — Stage all changes
```bash
git add -A
git status
```

#### Task 4.2 — Commit to main (Conventional Commits)
- Single commit: `fix(web): remediate E2E-identified a11y/SEO bugs + doc hygiene`
- Body explains each fix.

#### Task 4.3 — Push to GitHub
```bash
GIT_SSH_COMMAND="python3.13 /home/z/my-project/scripts/ssh_git_wrapper_patched.py -i /home/z/my-project/maison/docs/ssh-key.txt -o StrictHostKeyChecking=accept-new" git push origin main
```

---

## Validation Checklist (run after execution)

- [ ] F1: `rg "<em>\{'" apps/web/src/components/shop/sections/` returns 0 matches
- [ ] F2: `CategoryGrid.tsx` `<img alt="">` (empty) and `<a>` has `aria-label`
- [ ] F3: `about/page.tsx` has `{' '}` between `</em>,` and `<br/>`
- [ ] F4: `gift-cards/page.tsx` and `trade/page.tsx` lack `'use client'` and export `metadata`
- [ ] F5: `Hero.tsx` has `{' '}` before `<br/>` in H1
- [ ] F6: `apps/studio/package.json` `styled-components` is `^6.1.15` or higher
- [ ] F7: No "13 products" references in canonical docs (PRD, PAD, README, AGENTS.md, CLAUDE.md)
- [ ] `pnpm check-types` passes
- [ ] `pnpm test` passes (including new contract tests)
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] Git commit on main branch
- [ ] Git push to GitHub succeeds
