# Maison — Codebase ↔ Documentation Alignment Remediation Plan (v4)

> **Goal**: Align the codebase with the canonical documentation (PRD, PAD, Design Guide, AGENTS.md, CLAUDE.md, README.md), then update documentation to reflect the remediated reality. All code changes use TDD (RED → GREEN → REFACTOR).
>
> **Source-of-truth hierarchy** (per README §Overview):
> 1. `Project_Requirements_Document.md` (unified PRD)
> 2. `docs/MAISON_Design_Guide.md` (canonical design guide)
> 3. `Project_Architecture_Document.md` (PAD — engineering blueprint with ADRs)
> 4. `AGENTS.md` and `CLAUDE.md` (engineering instructions)
>
> **Decision rule for misalignments**:
> - **Doc is authoritative design intent → change code** (TDD)
> - **Code is the actual current implementation that docs failed to track → change docs** (e.g., 24 tables not 15; 13 routers not 8; Payment Intents not Checkout Sessions)
> - **Internal doc contradictions → fix in docs**

---

## Summary of Findings — 31 misalignments across 6 categories

### Category A — Code violates authoritative ADR (TDD code change required)

| # | ADR | Violation | Fix |
|---|-----|-----------|-----|
| A1 | ADR-008 | `adminProcedure`/`adminWriteProcedure` deprecated aliases still exported and used by 6 routers (admin, reviews, trade, discounts, gift-cards, loyalty) | Migrate all 6 routers to canonical tier names; remove deprecated aliases |
| A2 | ADR-008 | `managerProcedure` defined but never used | Use `managerProcedure` for admin write operations currently using `adminWriteProcedure` |
| A3 | ADR-016 | `trigger.config.ts` missing `machine: "micro"` and `maxDuration: 120` | Add both fields per ADR-016 |
| A4 | ADR-019 | None of the 8 `vitest.config.ts` files enforce coverage thresholds | Add `coverage.thresholds` block to each config |
| A5 | ADR-020 | `noUnusedLocals`/`noUnusedParameters` missing from `tooling/typescript-config/base.json` | Add both flags (deferred — see Deferred Items) |

### Category B — Docs out-of-sync with code (doc-only change)

| # | Doc | Claim | Reality | Fix |
|---|-----|-------|---------|-----|
| B1 | PRD §9.2 + PAD §4.2 | 15 / 16 tables | **24 tables** (Phase 3 added `accounts`, `payment_events`, `product_reviews`, `gift_cards`, `gift_card_redemptions`, `trade_applications`, `loyalty_accounts`, `loyalty_transactions`) | Update table list + count to 24 |
| B2 | PAD §11/§12 | "8 routers merged" | **13 routers** (products, collections, cart, checkout, account, newsletter, contact, admin, discounts, reviews, trade, gift-cards, loyalty) | Update count + list |
| B3 | PAD §11 | "16 smoke tests" | **23 smoke tests + 8 accessibility tests = 31 total** | Update count |
| B4 | PAD §6.2/§6.3 | `requireRole()` helper exists at `packages/api/src/middleware/auth.ts` | Helper is named `canAccessStaff()` (etc.); file is `packages/auth/src/rbac.ts` | Rename helper to `requireRole()` per ADR-008 + update file path references |
| B5 | PAD §6.2 | `auditLog` utility at `packages/api/src/lib/audit-log.ts` | Directory `packages/api/src/lib/` does not exist; audit-log logic is in router | Move audit-log to `packages/api/src/lib/audit-log.ts` per PAD |
| B6 | PAD | Contract test at `apps/web/src/lib/__tests__/proxy-contract.test.ts` | Actual filename: `rendering-strategy.contract.test.ts` | Add `proxy-contract.test.ts` as separate test (per ADR-006/ADR-010 Verification); rename for clarity |
| B7 | README + AGENTS.md + CLAUDE.md | "Phase 3 complete" but Trigger.dev jobs are stubs | Workers `src/index.ts` says "Phase 0 stubs — no jobs registered yet" | Mark Trigger.dev jobs as "stub" in docs, OR implement them (deferred — see Deferred Items) |
| B8 | PRD §8.1 + PAD §1.2 | pnpm 11.9.0 | Actual: `pnpm@11.17.0` (root package.json + README) | Update PRD/PAD to 11.17.0 |
| B9 | PRD §8.4 ADR-009 + PAD ADR-009 + AGENTS.md + CLAUDE.md | "Stripe Checkout Sessions (not Payment Intents)" | Code uses **Stripe Payment Intents** end-to-end (`checkout.createPaymentIntent`, webhook `payment_intent.succeeded`, `orders.stripe_payment_intent_id`) | Flip ADR-009 to "Stripe Payment Intents" with rationale; update AGENTS.md, CLAUDE.md, README |
| B10 | README + PAD §3.2 | Filename `PROJECT-ARCHITECTURE.md` | Actual file: `Project_Architecture_Document.md` | Fix all references in README, PAD, AGENTS.md, CLAUDE.md |
| B11 | README:39 + AGENTS.md + CLAUDE.md + PRD §9.2 | RBAC roles include `admin` | Actual roles: `customer`/`staff`/`manager`/`owner` (no `admin`) | Replace all `admin` role references with `staff`/`manager`/`owner` per ADR-008 |
| B12 | PAD §3.2 | "8-gate pipeline" + CI workflows | Actual CI has 4 jobs (`quality-gates`, `e2e`, `deploy-preview`, `deploy-production`) | Clarify that the 8 gates are enforced inside `quality-gates` job |
| B13 | PAD §3.2 + PRD §8.2 | "apps/web/tailwind.config.ts should not exist" vs "should exist" | File exists, minimal v4-style content-paths config | Update docs to clarify: Tailwind v4 is CSS-first; `tailwind.config.ts` is OPTIONAL and only declares content paths |
| B14 | Design Guide §9 | "13 sections" but lists 17; Appendix A lists 16 | Reality: 17 sections per actual `apps/web/src/app/(shop)/page.tsx` | Update Design Guide to 17 sections consistently |
| B15 | Design Guide §15 + CLAUDE.md | "15 color tokens" / `--radius-sm: 2px` | Actual: 16 color tokens; no `--radius-*` tokens defined | Update count to 16; add `--radius-sm: 2px` token to `packages/ui/src/tokens/colors.css` and `globals.css` |
| B16 | PRD §4.5 + Design Guide | "24 animations" | Design Guide Appendix B lists 27 animations | Update count to 27 in both PRD and Design Guide |
| B17 | Design Guide | References `/public/landing.html` as canonical | Actual canonical file: `docs/landing_page_unified.html` (no `/public/landing.html` in repo) | Update Design Guide references |

### Category C — Internal doc contradictions (doc-only fix)

| # | Doc | Contradiction | Fix |
|---|-----|---------------|-----|
| C1 | PRD §9.2 vs ADR-008 | Role enum `('customer','staff','admin')` vs procedure tiers `staff/manager/owner` | Replace `admin` with `manager`+`owner` in role enum |
| C2 | PRD §10.2 vs ADR-009 | `checkout.createPaymentIntent` vs "Checkout Sessions" | Replace procedure with `createCheckoutSession` semantics OR flip ADR-009 (chosen: flip ADR-009, see B9) |
| C3 | PRD §9.3 vs ADR-012 | "FTS index" vs "ilike only for Phase 1" | Remove FTS claims; document `ilike` pattern |
| C4 | PRD §9.2 vs ADR-020 | TS `enum()` vs `erasableSyntaxOnly` forbids `enum` | Replace `enum()` with `pgEnum()` (Drizzle) — already done in code; update PRD schema snippets |
| C5 | PRD §17.3 | `packages/payments` listed twice with 95% and 90% | Remove duplicate; keep 95% per ADR-019 |
| C6 | PRD §17.4 vs §12.5 | Lighthouse a11y gate "≥ 95" vs "= 100" | Standardize on "≥ 95" (gate threshold) with "target = 100" |
| C7 | PRD v1.2 changelog | "7 MED-severity fixes" but lists 8 (ADR-013 through ADR-020) | Update to "8 MED-severity fixes" |
| C8 | PRD §5.1 sitemap | `/checkout/success` and `/checkout/cancel` referenced but missing from sitemap | Add both routes to sitemap |
| C9 | PAD §6.3 | Procedure tier chain missing `managerProcedure` | Add `managerProcedure` to chain |
| C10 | PAD §3.2 | Schema list missing `accounts.ts` | Add `accounts.ts` |
| C11 | PAD §3.2 | Router list missing Phase 3 routers | Add 5 Phase 3 routers (reviews, trade, gift-cards, discounts, loyalty) |
| C12 | PAD §3.2 | `apps/web/src/middleware/` directory claim | Remove — directory does not exist (correct per ADR-006) |
| C13 | PAD §3.3 Pattern 2 | Uses `payment_intent.succeeded` event + `stripe_payment_intent_id` | Update to consistent Payment Intents flow (post B9) |
| C14 | PAD §1.2 vs §3.2 | "no tailwind.config.js" vs "tailwind.config.ts exists" | Reconcile per B13 |
| C15 | PAD §3.2 vs ADR-012 | `pg_trgm` extension install contradicts "no FTS" | Remove `pg_trgm` from init script OR clarify it's not used in Phase 1 |
| C16 | Design Guide §6 intro | "seven keyframe animations" but §6.2 lists six | Update to "six keyframe animations" |
| C17 | CLAUDE.md L249 | "Stripe Tokens (legacy) → Use Payment Intents" contradicts ADR-009 Checkout Sessions | Update to "Use Stripe Payment Intents (current standard)" per B9 |
| C18 | PRD §8.4 ADR-019 vs §17.3 | Coverage thresholds contradict each other | Standardize on ADR-019 values: api 90 / payments 95 / db 80 / auth 90 / web 70 / workers 85 |
| C19 | README L296 | "See `PROJECT-ARCHITECTURE.md` §9.2" | Update to `Project_Architecture_Document.md` per B10 |

### Category D — SSH push setup (operational)

| # | Item | Status |
|---|------|--------|
| D1 | SSH key at `docs/ssh-key.txt` has `[REDACTED:ssh_private_key]` first line + missing `-----BEGIN OPENSSH PRIVATE KEY-----` header | Needs transformation before use |
| D2 | SSH wrapper script at `skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py` exists (30,865 bytes) | Ready to use |
| D3 | Git remote is HTTPS, not SSH | Need to switch remote to `git@github.com:nordeim/maison.git` for SSH push |
| D4 | CLAUDE.md L226 + AGENTS.md L202 reference `/home/project/maison/docs/ssh_git_wrapper_v3.py` | Should reference `skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py` per user instruction |

### Category E — Optional improvements (deferred)

| # | Item | Reason for deferral |
|---|------|---------------------|
| E1 | Implement Trigger.dev v4 jobs (currently stubs) | Out of scope — would require Resend/Klaviyo integration; docs will be updated to mark as stub |
| E2 | Migrate Stripe Payment Intents → Checkout Sessions per ADR-009 (alternative path) | Rejected — flipping ADR-009 is the chosen path (B9) since entire codebase uses Payment Intents |
| E3 | Add `noUnusedLocals`/`noUnusedParameters` to tsconfig | Deferred — would surface many existing unused vars; require separate cleanup PR |
| E4 | Implement Google OAuth + Magic Link per ADR-013 | Out of scope — Phase 2 feature |
| E5 | Add Lighthouse CI config (`lighthouserc.*`) | Out of scope — README already notes "config pending" |
| E6 | Move `auditLog` to `packages/api/src/lib/audit-log.ts` per PAD §6.2 | Out of scope — current inline implementation works; PAD will be updated to reflect actual location |

---

## Execution Plan (TDD where applicable)

### Phase 1 — Code changes (TDD)

#### Task 1.1 — Migrate tRPC procedure tiers (A1, A2)
- **RED**: Add tests in `packages/api/src/trpc.test.ts` asserting:
  - `adminProcedure` and `adminWriteProcedure` are NOT exported from `@maison/api`
  - `managerProcedure` IS exported and IS used by at least one router (e.g., `admin.createProduct`)
- **GREEN**:
  - Migrate `packages/api/src/routers/admin.ts`: change `adminProcedure` → `staffProcedure`, `adminWriteProcedure` → `managerProcedure`
  - Migrate `packages/api/src/routers/reviews.ts`, `trade.ts`, `discounts.ts`, `gift-cards.ts`, `loyalty.ts`: same pattern
  - Remove `adminProcedure` and `adminWriteProcedure` exports from `packages/api/src/trpc.ts`
  - Remove re-exports from `packages/api/src/index.ts`
- **REFACTOR**: Verify no router still imports the deprecated names

#### Task 1.2 — Update Trigger.dev config (A3)
- **RED**: Add test in `services/workers/trigger.config.test.ts` asserting `config.machine === 'micro'` and `config.maxDuration === 120`
- **GREEN**: Add `machine: 'micro'` and `maxDuration: 120` to `services/workers/trigger.config.ts`
- **REFACTOR**: N/A

#### Task 1.3 — Add coverage thresholds to vitest configs (A4)
- **RED**: Add test in each `vitest.config.test.ts` (or one central test) asserting `coverage.thresholds` block exists with correct values per ADR-019
- **GREEN**: Add `coverage.thresholds` block to:
  - `packages/db/vitest.config.ts` → lines: 80, functions: 80, branches: 80, statements: 80
  - `packages/api/vitest.config.ts` → 90 (per ADR-019)
  - `packages/auth/vitest.config.ts` → 90
  - `packages/payments/vitest.config.ts` → 95
  - `packages/config/vitest.config.ts` → 80
  - `packages/email/vitest.config.ts` → 70
  - `apps/web/vitest.config.ts` → 70
  - `services/workers/vitest.config.ts` → 85
- **REFACTOR**: N/A

#### Task 1.4 — Add `proxy-contract.test.ts` per ADR-006/010 Verification (B6)
- **RED**: Test asserts `proxy.ts` does NOT call `auth.api.getSession` (regression test)
- **GREEN**: Create `apps/web/src/lib/__tests__/proxy-contract.test.ts` that:
  - Reads `apps/web/proxy.ts` source
  - Asserts no `auth.api.getSession` substring
  - Asserts `getSessionCookie` is imported from `better-auth/cookies`
- **REFACTOR**: N/A

#### Task 1.5 — Add `--radius-sm: 2px` design token (B15)
- **RED**: Test in `packages/ui/src/tokens/colors.test.ts` (new) asserts `--radius-sm: 2px` exists in `colors.css`
- **GREEN**: Add `--radius-sm: 2px;` and `--radius-md: 4px;` to `packages/ui/src/tokens/colors.css` and mirror in `apps/web/src/app/globals.css` `@theme`
- **REFACTOR**: N/A

### Phase 2 — Documentation updates (no TDD; pure doc edits)

#### Task 2.1 — PRD updates
- Update §8.1: pnpm 11.9.0 → 11.17.0
- Update §9.2: 15 tables → 24 tables; add `accounts`, `payment_events`, `product_reviews`, `gift_cards`, `gift_card_redemptions`, `trade_applications`, `loyalty_accounts`, `loyalty_transactions`; replace `enum('customer','staff','admin')` with `pgEnum('customer','staff','manager','owner')`
- Update §9.3: remove FTS index claim; document `ilike` search per ADR-012
- Update §10.2: rename `createPaymentIntent` → keep (since Payment Intents is the chosen path per B9); update procedure to reflect actual implementation
- Update §17.3: remove duplicate `packages/payments`; standardize on ADR-019 values
- Update §17.4: standardize a11y gate "≥ 95" (target 100)
- Update v1.2 changelog: "7 MED-severity fixes" → "8 MED-severity fixes"
- Update §5.1: add `/checkout/success` and `/checkout/cancel` to sitemap
- Update §8.4 ADR-009: flip to "Stripe Payment Intents" with rationale
- Update §4.5: 24 animations → 27 animations

#### Task 2.2 — PAD updates
- Update §1.2: pnpm 11.9.0 → 11.17.0
- Update §3.2: add `accounts.ts` to schema list; add 5 Phase 3 routers to router list; clarify `apps/web/tailwind.config.ts` is optional minimal v4-style; remove `apps/web/src/middleware/` claim; rename file references `PROJECT-ARCHITECTURE.md` → `Project_Architecture_Document.md`
- Update §4.2: 16 tables → 24 tables; full list
- Update §6.3: add `managerProcedure` to procedure chain
- Update §11: 8 routers → 13 routers; 16 smoke tests → 23 smoke tests + 8 accessibility tests = 31 total
- Update §3.3 Pattern 2: keep Payment Intents flow (post B9)
- Update §3.2: clarify Lighthouse 8-gate pipeline structure (4 CI jobs × 8 gates inside `quality-gates`)
- Update §3.2: remove `pg_trgm` from init script (or clarify not used)
- Update §1.2 vs §3.2: reconcile tailwind.config.ts claim

#### Task 2.3 — Design Guide updates
- Update §9 intro: "13 sections" → "17 sections"; reconcile with Appendix A (16 → 17)
- Update §6 intro: "seven keyframe animations" → "six keyframe animations"
- Update §15: 15 color tokens → 16 color tokens; add `--radius-sm: 2px` and `--radius-md: 4px` to token list
- Update references: `/public/landing.html` → `docs/landing_page_unified.html`
- Update Appendix B: 24 → 27 animations

#### Task 2.4 — README updates
- Fix L296 + L456: `PROJECT-ARCHITECTURE.md` → `Project_Architecture_Document.md`
- Fix L39: RBAC roles `staff`/`admin` → `staff`/`manager`/`owner`
- Fix L37 + L442: keep "Stripe Payment Intents" (already correct)
- Fix "13 tRPC routers" claim — already correct
- Fix "23 Drizzle tables" → "24 Drizzle tables"
- Add note about Phase 3 stub status of Trigger.dev jobs
- Fix SSH wrapper path references (D4)

#### Task 2.5 — AGENTS.md updates
- L9: "13 tRPC routers, 23 Drizzle tables" → "13 tRPC routers, 24 Drizzle tables, 31 E2E tests (23 smoke + 8 a11y)"
- L11: "Canonical visual reference: `docs/landing_page_unified.html`" — already correct
- L113: RBAC roles `(customer, staff, manager, owner)` — already correct
- L128: Keep deprecated aliases note — REMOVE (since we're removing them in Task 1.1)
- L142-147: Update Stripe section from "Checkout Sessions" to "Payment Intents" with rationale
- L197-205: Update SSH wrapper path to `skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py`
- L233: Update contract test path to include both `proxy-contract.test.ts` (new) and `rendering-strategy.contract.test.ts`

#### Task 2.6 — CLAUDE.md updates
- L21: pnpm 11.17.0 (already correct)
- L22: Stripe 22.3.x (already correct)
- L31-32: Keep references to `docs/MAISON_PRD_v1.2.md` and `docs/MAISON_PAD_v1.2.md` — verify these exist
- L104-116: Update tRPC section — REMOVE deprecated aliases note
- L133-139: Update Stripe section — "Payment Intents (not Checkout Sessions)" with rationale
- L215-227: Update SSH wrapper path to `skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py`
- L249: Update "Common Mistakes" table — keep "Stripe Tokens (legacy) → Use Payment Intents" (now consistent)

### Phase 3 — Verify

#### Task 3.1 — Run all tests
```bash
pnpm check-types
pnpm test
pnpm lint
```

#### Task 3.2 — Re-validate docs against code
- Re-run the validation checklist from this plan
- Confirm all Category A, B, C items resolved

### Phase 4 — Commit and push

#### Task 4.1 — Stage all changes
```bash
git add -A
git status
```

#### Task 4.2 — Commit to main (Conventional Commits)
- Single commit: `refactor(repo): align codebase with canonical docs per ADR-008/016/019 + flip ADR-009`
- Body explains:
  - Code: migrate procedure tiers, add Trigger.dev config, add coverage thresholds, add proxy contract test, add radius token
  - Docs: update PRD/PAD/Design Guide/README/AGENTS.md/CLAUDE.md to reflect remediated reality

#### Task 4.3 — Push to GitHub
```bash
# Set up SSH key (handle [REDACTED:ssh_private_key] first line + missing BEGIN header)
mkdir -p ~/.ssh
{ echo "-----BEGIN OPENSSH PRIVATE KEY-----"; sed '1d' docs/ssh-key.txt; } > ~/.ssh/id_maison
chmod 600 ~/.ssh/id_maison

# Switch remote to SSH
git remote set-url origin git@github.com:nordeim/maison.git

# Push using wrapper
GIT_SSH_COMMAND="python3 /home/z/my-project/maison/skills/how-to-git-push-using-ssh-wrapper/scripts/ssh_git_wrapper_v3.py -i ~/.ssh/id_maison -o StrictHostKeyChecking=accept-new" git push origin main
```

---

## Validation Checklist (run after execution)

- [ ] A1: `rg "adminProcedure|adminWriteProcedure" packages/api/src/` returns 0 matches
- [ ] A1: `rg "managerProcedure" packages/api/src/routers/` returns ≥1 match
- [ ] A2: All 6 routers use canonical tier names
- [ ] A3: `services/workers/trigger.config.ts` contains `machine: 'micro'` and `maxDuration: 120`
- [ ] A4: All 8 `vitest.config.ts` files have `coverage.thresholds` block
- [ ] B1: PRD §9.2 and PAD §4.2 list 24 tables
- [ ] B2: PAD §11 says 13 routers
- [ ] B3: PAD §11 says 31 E2E tests
- [ ] B6: `apps/web/src/lib/__tests__/proxy-contract.test.ts` exists
- [ ] B8: PRD §8.1 says pnpm 11.17.0
- [ ] B9: PRD/PAD/AGENTS.md/CLAUDE.md say "Stripe Payment Intents"
- [ ] B10: No references to `PROJECT-ARCHITECTURE.md` (only `Project_Architecture_Document.md`)
- [ ] B11: No `admin` role in docs (only customer/staff/manager/owner)
- [ ] B15: `--radius-sm: 2px` in `packages/ui/src/tokens/colors.css`
- [ ] C1-C19: All internal contradictions resolved
- [ ] `pnpm check-types` passes
- [ ] `pnpm test` passes
- [ ] `pnpm lint` passes
- [ ] Git commit on main branch
- [ ] Git push to GitHub succeeds
