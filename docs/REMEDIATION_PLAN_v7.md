# Maison — E2E + Skills-Compliance Remediation Plan v7

> **Goal**: Fix 5 skills-compliance non-compliances + 1 minor a11y enhancement
> found via agent-browser E2E testing + validation against 3 coding skills.
> All v5+v6 fixes (F1–F6, G1–G3) are confirmed working in production.
>
> **Evidence**: see `/home/z/my-project/worklog.md` Task ID 7b (skills compliance)
> + Task ID 5 (v7 E2E) for full validation reports.

---

## Scope

### In scope (6 fixes)

| # | Issue | Severity | Category | Source |
|---|-------|----------|----------|--------|
| H1 | `z.string().email()` deprecated in Zod v4 (4 instances) | P1 compliance | Code | Skill 2 §9 + ADR-018 |
| H2 | Missing `@source` directives in `globals.css` | P2 compliance | Code | Skill 2 §13.6 |
| H3 | `@layer utilities` should use `@utility` (Tailwind v4) | P3 compliance | Code | Skill 2 |
| H4 | PDP thumbnail images have empty alt (minor a11y) | P3 a11y | Code | E2E |
| H5 | `as unknown as` cast in `webhooks.ts:82` | P3 compliance | Code | Skill 2 |
| H6 | Deprecated RBAC aliases in `rbac.ts` (cleanup) | P3 hygiene | Code | Skill 1 |

### Out of scope (intentional / deferred)

- **React Compiler** (`useCallback` elimination): requires `babel-plugin-react-compiler` package + config — defer to separate PR
- **`noUnusedLocals`/`noUnusedParameters`**: deferred from v4 — would surface many existing unused vars
- **Non-null assertions in routers** (~27 `!`): mostly safe Drizzle `.returning()` patterns — defer
- **Trigger.dev stubs**: known deferred (REMEDIATION_PLAN_v4 §E1)
- **DYNAMIC_SERVER_USAGE warnings**: expected per ADR-010

---

## Execution Plan (TDD where applicable)

### Phase 1 — Code fixes (TDD)

#### Task 1.1 — Replace `z.string().email()` with `z.email()` (H1)

**Root cause**: Zod v4 deprecated `z.string().email()` in favor of `z.email()`. ADR-018 mandates the new pattern. 4 instances:
1. `packages/api/src/routers/contact.ts:24` — `email: z.string().email()`
2. `packages/api/src/routers/newsletter.ts:17` — `email: z.string().email()`
3. `packages/api/src/routers/gift-cards.ts:73` — `recipientEmail: z.string().email()`
4. `packages/config/src/env.ts:86` — likely `z.string().email()` for some env var

**Fix**: Replace all 4 with `z.email()`.

**TDD**:
- **RED**: Add a contract test asserting no `z.string().email()` pattern in routers + config.
- **GREEN**: Apply the 4 replacements.
- **REFACTOR**: N/A.

#### Task 1.2 — Add `@source` directives to `globals.css` (H2)

**Root cause**: Tailwind v4 only scans the current directory tree for class names. Without `@source` directives, classes used in `packages/ui/src/` won't be detected. Currently masked because `packages/ui/src/` has only CSS, but will break when React components are added.

**Fix**: Add after `@import 'tailwindcss';` in `apps/web/src/app/globals.css`:
```css
@source "../components/**/*.{ts,tsx}";
@source "../lib/**/*.{ts,tsx}";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

**TDD**: No test — this is a Tailwind config change. Verify by `pnpm build` succeeding + no class regressions.

#### Task 1.3 — Migrate `@layer utilities` to `@utility` (H3)

**Root cause**: Tailwind v4 prefers `@utility` directive over `@layer utilities` for custom utilities. The `@layer utilities { ... }` block in `globals.css:142` should use `@utility` instead.

**Fix**: Convert each utility in the `@layer utilities` block to `@utility name { ... }` syntax.

**TDD**: No test — CSS change. Verify by `pnpm build` succeeding + visual regression check.

#### Task 1.4 — Add descriptive alt to PDP thumbnails (H4)

**Root cause**: PDP thumbnail images at `apps/web/src/app/(shop)/products/[slug]/page.tsx:201` have `alt=""` (empty). While these are non-clickable visual indicators, screen readers would benefit from knowing what each thumbnail represents.

**Fix**: Change `alt=""` to `alt={\`${product.name} — view ${i + 1}\`}` so screen readers announce the product name + view number.

**TDD**:
- **RED**: Add a contract test asserting PDP page source does NOT contain `alt=""` for thumbnail images (i.e., the `Image` inside the thumbnail map has a non-empty alt).
- **GREEN**: Apply the fix.
- **REFACTOR**: N/A.

#### Task 1.5 — Replace `as unknown as` cast in webhooks.ts (H5)

**Root cause**: `packages/payments/src/webhooks.ts:82` has `payload: event as unknown as Record<string, unknown>`. The skill rule is strict about avoiding `as unknown as` casts. Should use a Zod schema or targeted type.

**Fix**: Define a proper type for the payload (or use `z.record(z.unknown())` for the payload field in the schema). The cleanest fix: change the `paymentEvents` insert to use a typed payload.

**TDD**: No test — type refinement. Verify by `pnpm check-types` passing.

#### Task 1.6 — Remove deprecated RBAC aliases in rbac.ts (H6)

**Root cause**: `packages/auth/src/rbac.ts` may still have deprecated RBAC helper aliases (e.g., `canAccessAdmin` or similar). The v4 plan removed `adminProcedure`/`adminWriteProcedure` from tRPC but may have left RBAC helper aliases.

**Fix**: Audit `rbac.ts` for any deprecated aliases and remove them. Verify no consumers via `rg`.

**TDD**: No test — cleanup. Verify by `pnpm check-types` + `pnpm test` passing.

### Phase 2 — Documentation updates

#### Task 2.1 — Add v1.2.4 REMEDIATION_HISTORY
Append a v1.2.4 note to the REMEDIATION_HISTORY sections in:
- `Project_Requirements_Document.md`
- `Project_Architecture_Document.md`
- `docs/MAISON_Design_Guide.md`

The v1.2.4 note should document:
- H1: 4 `z.string().email()` → `z.email()` (ADR-018 compliance)
- H2: `@source` directives added to `globals.css` (Tailwind v4 compliance)
- H3: `@layer utilities` → `@utility` (Tailwind v4 compliance)
- H4: PDP thumbnail alt text improved (a11y)
- H5: `as unknown as` cast replaced with typed payload (Skill 2 compliance)
- H6: Deprecated RBAC aliases removed (cleanup)

#### Task 2.2 — Update AGENTS.md + CLAUDE.md
- Add the new contract test (zod-email pattern) to the contract-test enumeration.
- Note the `@source` directive pattern in CLAUDE.md §Tailwind v4.

### Phase 3 — Verify

#### Task 3.1 — Run all gates
```bash
pnpm check-types
pnpm lint
pnpm test
pnpm format:check
```

### Phase 4 — Commit and push

#### Task 4.1 — Commit to main (Conventional Commits)
- Single commit: `fix(web): skills-compliance fixes + PDP thumbnail a11y (v7)`

#### Task 4.2 — Push to GitHub
```bash
GIT_SSH_COMMAND="python3.13 /home/z/my-project/scripts/ssh_git_wrapper_patched.py -i /home/z/my-project/maison/docs/ssh-key.txt -o StrictHostKeyChecking=accept-new" git push origin main
```

---

## Validation Checklist (run after execution)

- [ ] H1: 0 instances of `z.string().email()` in `packages/` + `apps/`
- [ ] H1: New contract test passes
- [ ] H2: `@source` directives present in `globals.css`
- [ ] H3: `@layer utilities` replaced with `@utility` in `globals.css`
- [ ] H4: PDP thumbnail `alt` is non-empty (contract test passes)
- [ ] H5: No `as unknown as` in `webhooks.ts`
- [ ] H6: No deprecated RBAC aliases in `rbac.ts`
- [ ] v1.2.4 REMEDIATION_HISTORY added to PRD, PAD, Design Guide
- [ ] `pnpm check-types` passes
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] Git commit on main branch
- [ ] Git push to GitHub succeeds
