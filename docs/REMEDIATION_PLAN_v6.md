# Maison — E2E Remediation Plan v6 (post-v5-deployment)

> **Goal**: Fix 1 new functional bug (G1 — contact form) + 2 doc-drift items
> (G2/G3 — design guide canonicalization) found via agent-browser E2E testing
> of the live site `https://maison.jesspete.shop/` (deployed with v5 fixes).
> All v5 fixes (F1–F6) are confirmed working in production.
>
> **Live site evidence**: see `/home/z/my-project/worklog.md` Task ID 5 (v6)
> for the full validation report with file paths, line numbers, and code excerpts.

---

## Scope

### In scope (3 fixes)

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| G1 | Contact form is non-functional (no onSubmit, backend not wired to email) | P1 functional | Code + Docs |
| G2 | Design guide v4 is the new canonical, but README/CLAUDE still reference v1.2.1 | P2 doc drift | Docs |
| G3 | Design guide v3 (rejected) should be archived | P3 doc hygiene | Docs |

### Out of scope (intentional / deferred / informational)

- **G4** (Sanity 6.6.0 → 6.7.0): optional bump, no security fixes — defer
- **G5/G6** (transient registry warnings): not bugs — network latency only
- **G7** (`DYNAMIC_SERVER_USAGE` warnings): expected per ADR-010, locked by 2 contract tests
- **G8** (Trigger.dev stubs): known deferred, documented in REMEDIATION_PLAN_v4 §E1
- **G9/G10** (v5 fixes confirmed): no action needed

---

## Execution Plan (TDD where applicable)

### Phase 1 — Code fix (TDD)

#### Task 1.1 — Fix contact form (G1)

**Root cause** (2 parts):
1. `apps/web/src/app/(shop)/contact/page.tsx` is a pure Server Component with a plain HTML `<form>` — no `'use client'`, no `onSubmit`, no tRPC call. Submitting reloads the page.
2. `packages/api/src/routers/contact.ts` `submit` mutation only `console.log`s the message — doesn't send email via Resend (per PRD §10.1 L1160 which says "send email via Resend").

**Fix strategy**:
- **Part A**: Convert the contact page to a Server Component wrapper + Client Component child pattern (same as F4). The Client Component (`ContactForm.tsx`) will use `trpc.contact.submit.useMutation()` to call the backend.
- **Part B**: Wire the `contact.submit` mutation to actually send email via `@maison/email`'s `sendEmail` function. The email should go to `hello@maison-living.com` (the address shown on the contact page) with the submitter's name, email, and message.

**Files to create/modify**:
1. `apps/web/src/components/shop/ContactForm.tsx` — NEW Client Component (extracted from current page.tsx form)
2. `apps/web/src/app/(shop)/contact/page.tsx` — REWRITE as Server Component wrapper with metadata + `<ContactForm />`
3. `packages/api/src/routers/contact.ts` — UPDATE `submit` mutation to send email via `@maison/email`

**TDD**:
- **RED**: Add a contract test asserting:
  - `contact/page.tsx` is a Server Component (no `'use client'`) and exports `metadata`
  - `ContactForm.tsx` exists, is a Client Component (`'use client'`), and uses `trpc.contact.submit`
  - `contact.ts` router calls `sendEmail` (not just `console.log`)
- **GREEN**: Apply the fixes
- **REFACTOR**: N/A

#### Task 1.2 — Canonicalize design guide v4 (G2)

**Root cause**: `docs/MAISON_Design_Guide_v4.md` is the new canonical (per its header: "v4 (this revision) — supersedes the rejected v3 wholesale-replacement attempt. Built as a strict superset of v1.2.1"), but README L22/L187 + CLAUDE.md L33 still reference `docs/MAISON_Design_Guide.md` (v1.2.1).

**Fix strategy** (cleaner option — replace contents, no archived-doc reference churn):
1. Replace `docs/MAISON_Design_Guide.md` contents with `docs/MAISON_Design_Guide_v4.md` contents
2. Delete `docs/MAISON_Design_Guide_v4.md` (now redundant)
3. Delete `docs/MAISON_design_guide_v3.md` (rejected, archived in v4's Appendix C)
4. Delete `docs/design_guide_v3_changelog.md` (v3 changelog, no longer needed)
5. Update CLAUDE.md L33 line count: "1,336 lines, 15 sections" → actual v4 count (~1,490 lines, 16 sections)

**Alternative** (less destructive — keep all versions, just update references):
- Update README L22/L187 + CLAUDE.md L33 to reference `docs/MAISON_Design_Guide_v4.md` directly
- Add a note in `docs/MAISON_Design_Guide.md` header: "Superseded by v4 — see `docs/MAISON_Design_Guide_v4.md`"
- Keep v3 + changelog as historical archives

**Chosen approach**: The cleaner option (replace + delete) — it eliminates confusion and archived-doc reference churn. The v4's Appendix C preserves the rejection rationale for v3.

**TDD**: No test — this is a doc-only change. Verify by `rg` that no references to v3 or v4-specific paths remain after consolidation.

### Phase 2 — Documentation updates

#### Task 2.1 — Update README.md
- L22: `docs/MAISON_Design_Guide.md` → keep (now contains v4 content)
- L187: file tree entry `MAISON_Design_Guide.md` → keep
- Phase 1 row: add "contact form (functional, wired to Resend)" to deliverables — OR explicitly note "contact form stub" if G1 is deferred. **Decision**: Since G1 is being fixed in Task 1.1, add "contact form (functional)" to Phase 1 deliverables.

#### Task 2.2 — Update CLAUDE.md
- L33: Update line count from "1,336 lines, 15 sections" to actual v4 count (~1,490 lines, 16 sections). Verify by `wc -l docs/MAISON_Design_Guide.md` after consolidation.

#### Task 2.3 — Update AGENTS.md
- Check if AGENTS.md references the design guide. If so, verify the path is correct (should be `docs/MAISON_Design_Guide.md` after consolidation).

#### Task 2.4 — Add v1.2.3 REMEDIATION_HISTORY
Append a v1.2.3 note to the REMEDIATION_HISTORY sections in:
- `Project_Requirements_Document.md`
- `Project_Architecture_Document.md`
- `docs/MAISON_Design_Guide.md` (the consolidated v4)

The v1.2.3 note should document:
- G1: Contact form wired to tRPC `contact.submit` + Resend email send
- G2: Design guide v4 canonicalized (v3 + v4 files consolidated into `docs/MAISON_Design_Guide.md`)
- G3: v3 design guide + changelog archived/removed

#### Task 2.5 — Update PRD Phase 1 acceptance criteria
- Check PRD §18 Phase 1 acceptance criteria — does it list "contact form"? If not, add it.
- If it lists "contact form" as a stub, update to "functional contact form (wired to Resend)".

### Phase 3 — Verify

#### Task 3.1 — Run all gates
```bash
pnpm check-types
pnpm lint
pnpm test
pnpm format:check
```

#### Task 3.2 — Re-validate via agent-browser (optional, after redeploy)
- Re-open `https://maison.jesspete.shop/contact` after the next deployment
- Fill the form + submit
- Verify success message appears
- Verify no page reload

Note: The live site won't reflect fixes until the user redeploys.

### Phase 4 — Commit and push

#### Task 4.1 — Stage all changes
```bash
git add -A
git status
```

#### Task 4.2 — Commit to main (Conventional Commits)
- Single commit: `fix(web): wire contact form to Resend + canonicalize design guide v4 (v6)`
- Body explains G1, G2, G3 fixes.

#### Task 4.3 — Push to GitHub
```bash
GIT_SSH_COMMAND="python3.13 /home/z/my-project/scripts/ssh_git_wrapper_patched.py -i /home/z/my-project/maison/docs/ssh-key.txt -o StrictHostKeyChecking=accept-new" git push origin main
```

---

## Validation Checklist (run after execution)

- [ ] G1: `contact/page.tsx` is a Server Component (no `'use client'`) + exports `metadata`
- [ ] G1: `ContactForm.tsx` exists, is a Client Component, uses `trpc.contact.submit`
- [ ] G1: `contact.ts` router calls `sendEmail` (not just `console.log`)
- [ ] G1: New contract test passes
- [ ] G2: `docs/MAISON_Design_Guide.md` contains v4 content (header says "v4")
- [ ] G2: `docs/MAISON_Design_Guide_v4.md` deleted (consolidated)
- [ ] G2: `docs/MAISON_design_guide_v3.md` deleted (rejected, archived in v4 Appendix C)
- [ ] G2: `docs/design_guide_v3_changelog.md` deleted
- [ ] G2: README L22/L187 + CLAUDE.md L33 references are correct
- [ ] G2: CLAUDE.md L33 line count updated to actual v4 count
- [ ] G3: No references to v3 or v4-specific paths remain
- [ ] v1.2.3 REMEDIATION_HISTORY added to PRD, PAD, Design Guide
- [ ] `pnpm check-types` passes
- [ ] `pnpm test` passes (including new contract tests)
- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] Git commit on main branch
- [ ] Git push to GitHub succeeds
