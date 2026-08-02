Two strong findings: DEP-9's "10 consumer packages" is wrong (actually 11, omitting tooling/tailwind), and the historical framing is misleading. Now verifying the Zod v4 migration claim (the most numerically specific — 43 sites, 167 tests).
✓General Task — Verify TS-12 Zod v4 migration claims
↳ 14 toolcalls · 44m 59s
ctrl+x down view subagents
TS-12 largely holds — 167 tests, 4 email files, 4 patterns all exact matches. Only the headline "43 calls across 12 files" conflates pre-migration inventory with post-migration state (actual: 40 v4-native sites across 12 files, zero deprecated). Now verifying §16.5 (non-null assertions) and §16.6 (||→??).
✓General Task — Verify TS-13 non-null assertion claims
↳ 12 toolcalls · 58m 5s
ctrl+x down view subagents
Substantive finding on TS-13: the regex itself doesn't exclude Drizzle )! — that exclusion is via file-list omission of products.ts. The prose claims the regex does it. Otherwise numbers (6 tests, 6 files) hold. Now §16.6 (||→?? in trade.ts) and §16.7 (PII logging + apostrophes).
✓General Task — Verify REACT-7 || vs ?? in trade.ts
↳ 5 toolcalls · 40m 39s
ctrl+x down view subagents
Δ(v): the "3 sites with z.url().optional().or(z.literal(''))" framing is wrong — only website uses that type; instagram + projectTypes are z.string().optional(). All 3 are correctly migrated to ?? null, so the substance holds. Now §16.7 (PII + apostrophes) and §16.8 (SubmitEvent).
✓General Task — Verify SECURITY-3 PII logging + apostrophe escaping
↳ 17 toolcalls · 49m 36s
ctrl+x down view subagents
Several discrepancies captured for §16.7. Now the final verification of §16.8 (React 19 SubmitEvent) and the pattern/anti-pattern spot-checks.
✓General Task — Verify REACT-8 SubmitEvent migration + pattern snippets
↳ 11 toolcalls · 20m 36s
ctrl+x down view subagents
Δ found for §16.8: the React.SubmitEvent<HTMLFormElement> prose is type-syntax wrong (React 19's SubmitEvent is non-generic — actual code uses bare React.SubmitEvent with 11 files / 12 handlers). Substantive: copying the <HTMLFormElement> suffix from the deprecated FormEvent type without adjusting for the API change. The "11 migrated" count is corroborated. Now the final pattern/anti-pattern cross-checks via parallel reads.
✓General Task — Verify §17/§18 patterns match codebase
↳ 11 toolcalls · 30m 22s
ctrl+x down view subagents
Final confirmations: escapeForScriptContext is exactly 5-char canonical — accurate. But §17.3's React.SubmitEvent<HTMLFormElement> proposed replacement is a phantom: @types/react@19.2.17 doesn't export React.SubmitEvent at all — the production code actually uses bare React.SubmitEvent from the global DOM lib. Now compiling the validation report.
# Todos
[✓] Read full diff to enumerate every verifiable claim
[✓] Verify §16.1 DEP-7
[✓] Verify §16.2 DEP-8
[✓] Verify §16.3 DEP-9
[✓] Verify §16.4 TS-12
[✓] Verify §16.5 TS-13
[✓] Verify §16.6 REACT-7
[✓] Verify §16.7 SECURITY-3
[✓] Verify §16.8 REACT-8
[✓] Verify §17 / §18 patterns
[•] Compile validation report with discrepancies
Validation Report: docs/skill_diff_out.txt vs. Maison Codebase
The diff proposes upgrading nextjs-typescript_SKILL.md from v1.5 → v1.6, adding §16–§20 (8 new lessons, anti-pattern tables, pattern snippets, a 34-item field card). I verified every substantively falsifiable claim against the codebase. Headline numbers largely hold; prose framings and a few type-syntax claims are wrong.
Severity legend
- ✅ Accurate — codebase corroborates exactly
- ⚠️ Misleading framing — true in spirit but prose distorts facts
- ❌ Wrong — codebase contradicts the claim
Findings by section
§16.1 DEP-7 — Dependency hygiene contract test
- ✅ Test count (37) — verified exactly. apps/web/src/lib/__tests__/deps-hygiene.contract.test.ts (37 tests, loop-generated: api×1, db×2, payments×1, email×3, web×30 = 37; auth/zod deliberately commented out).
- ⚠️ "Parses package.json + scans src for imports" — WRONG description. The test only reads package.json; it contains no source-scanning logic (no readdir, no import regex). Declared "unused" deps are hardcoded literals sourced from AUDIT_REPORT.md, locked as a negative allowlist (expect(...includes(dep)).toBe(false) — i.e. "this known-unused dep must NOT be re-declared"). It does not assert "declared==used" in either direction.
- ✅ Transitive type dep (zod in @maison/auth) is documented — in the test file's comment block (lines 39–49), not in package.json (JSON can't hold comments).
§16.2 DEP-8 — tsconfig.config.json for root configs
- ✅ 7 tsconfig.config.json files exist (packages/* + services/workers), all with "include": ["*.config.ts", "*.config.tsx"] (verbatim).
- ✅ Contract test count (9) — verified by running vitest run: 9 passed. Path: apps/web/src/lib/__tests__/tsconfig-include.contract.test.ts.
- ⚠️ "Updated check-types script" — the literal string tsc -p tsconfig.config.json --noEmit && tsc --noEmit lives in 7 per-package package.json files, NOT the repo root (which is just "turbo check-types"). True at package level; misleading at the level the prose implies.
- ❌ "Asserts all root configs are type-check clean" — the test only asserts inclusion coverage (regex-extracts include globs, asserts each *.config.ts matches). It never invokes tsc; type-check cleanliness comes only from the per-package script, not this test. The test header itself acknowledges this gap.
§16.3 DEP-9 — ESLint flat config per package
- ✅ 11 consumer eslint.config.mjs files all import @maison/eslint-config and spread with the claimed pattern export default [...sharedConfig, {...}] (apps/web, apps/studio, packages/{api,auth,config,db,email,payments,ui}, services/workers — plus the shared config itself uses @eslint/js).
- ❌ "10 consumer packages" is a miscount; it's 11. The prose's math (7 @maison/* + services/web/studio = 10) omits tooling/tailwind (@maison/tailwind-config), which is also a consumer with a full override block. The lint-scripts.contract.test.ts PACKAGES array confirms 11.
- ✅ 33 test count for lint-scripts.contract.test.ts — verified (11 packages × 3 tests, all loop-generated).
- ⚠️ "Drizzle or()/and() false positives" — there is no Drizzle-specific carve-out. The override block is a single generic 15-rule blanket downgrade applied identically to all packages (incl. @maison/ui, which has no Drizzle). The Drizzle )! false positives are covered by the blanket no-unnecessary-condition: "warn" downgrade, not by a scoped rule. apps/web deliberately omits the override block entirely.
§16.4 TS-12 — Zod v4 native API migration
- ✅ 4 email-validating files + 4 tests for zod-email.contract.test.ts — exact (contact.ts, newsletter.ts, gift-cards.ts, config/env.ts).
- ✅ 167 tests for zod-v4-native-api.contract.test.ts — exact (independently reproduced twice: via Vitest and via rg --files | wc -l).
- ✅ All 4 deprecated regex patterns verbatim; mechanical mappings match scripts/migrate-zod-v4.py.
- ✅ Zero residual deprecated calls in production source (verified by rg).
- ⚠️ "43 deprecated calls across 12 files" — conflates pre-migration inventory with post-remediation state. Current state is 40 v4-native usages across 12 files, zero deprecated. The repo's own VALIDATION_REPORT_session_log_3.md flags this: "actual 40/12". The premise count (43) is also under-sourced (the file scan yields 40, the historical log yields 36). Headline number doesn't match either measurement.
§16.5 TS-13 — Non-null assertion cleanup
- ✅ 6 tests, 6 audited files (loyalty, admin, account, reviews, discounts, trade) — verified by running vitest: 6 passed. v16 set; cart was a v12 target, cleanly excluded.
- ✅ All 7 router files (incl. cart) currently clean of postfix ! — verified by rg.
- ✅ The 7-vs-6 split reconciles cleanly: v12 (checkout/gift-cards/cart) + v16 (the 6 audited) = combined cleanup footprint; contract test locks only the v16 subset.
- ❌/⚠️ "Regex catches postfix ! (excluding Drizzle or()/and() intentional )!)" — the regex [\w)\]]\s*!\s*[^=\s]|[\w)\]]!\s*$ DOES match )! if applied to products.ts (verified: it returns 5 hits at lines 75, 83, 92, 106, 110). Drizzle exclusion is achieved by omitting products.ts from AUDITED_FILES, not by regex behavior. The prose attributes the exclusion to the wrong mechanism.
§16.6 REACT-7 — ||→?? in trade.ts
- ✅ All 3 claimed sites migrated to ?? null (trade.ts:70 website, :71 instagram, :72 projectTypes). Zero residual || null.
- ❌ "3 sites where field was z.url().optional().or(z.literal(''))" — only 1 of 3 fields (website) uses that type. instagram and projectTypes are plain z.string().optional() (not URL-typed). The remediation logic (|| coerces '' to null) is valid for all 3 (none enforce .min(1)), but tying all 3 to the URL+literal type is a type-attribution error. The skill conflates "field accepts ''" (3 fields) with "field is z.url().optional().or(z.literal(''))" (1 field).
§16.7 SECURITY-3 — Apostrophe escaping + PII logging
- ⚠️ "5 unescaped apostrophes" — the count (5) matches but renders the claim as a present-tense violation ("Fix: Replace ' → '"). Reality: all 5 sites already use ' — the remediation shipped. Premise-violation framing is stale.
- ⚠️ "13 production sites logged PII" — overstated against the literal marker count: only 3 console.* calls contain (PII redacted) today (contact, newsletter, stripe). The "13" conflates cleanup scope with marker-string count.
- ❌ "console.log ... [contact] ... [newsletter] ... [stripe-webhook]" — three inaccuracies in the example log strings:
1. All 3 actually use console.warn, not console.log.
2. The Stripe log uses prefix [stripe], not [stripe-webhook].
3. The newsletter log interpolates ${input.source}, not ${source}.
§16.8 REACT-8 — SubmitEvent migration
- ✅ 1 test for react-submit-event.contract.test.ts — exact; test uses String.includes('React.SyntheticEvent<HTMLFormElement>') (not a regex) and asserts absence of SyntheticEvent only, as the claim's footnote acknowledges.
- ✅ Zero residual React.FormEvent<HTMLFormElement> or React.SyntheticEvent in production apps/web/src (verified by rg).
- ✅ "11 migrated" corroborated — actual state shows 11 files / 12 handlers using bare React.SubmitEvent (CheckoutFlow has 2 handlers → counts as 1 file).
- ❌ "Migrate to React.SubmitEvent<HTMLFormElement>" — type-syntax error. @types/react@19.2.17 exports no React.SubmitEvent at all (the FormEvent @deprecated JSDoc only {@link}-references the global DOM SubmitEvent, which is unparameterized). The production code uses bare React.SubmitEvent with no generic. Copy-pasting the <HTMLFormElement> suffix from the deprecated FormEvent/SyntheticEvent signature without adjusting for the API difference renders the prose technically wrong as written.
§17 — Anti-patterns tables
- ✅ §17.4 "Raw JSON.stringify in dangerouslySetInnerHTML" + §18.3 pattern — both accurate. escapeForScriptContext at apps/web/src/lib/utils.ts:108-115 escapes exactly the "5-char canonical" (<, >, &, U+2028, U+2029) — no more, no "/'. JSON-LD usage at apps/web/src/app/(shop)/products/[slug]/page.tsx:107 matches §18.3 verbatim.
- ❌ §17.3 React row again repeats the React.SubmitEvent<HTMLFormElement> phantom (see §16.8 above).
- ✅ §17.2 Zod and non-null patterns accurate; || → ?? row accurate.
§18 / §19 — Patterns + field card
- §18.4 React pattern code block (React.SubmitEvent<HTMLFormElement>) repeats the same phantom — would not compile as written.
- §19 field card items 26–34 are accurate summaries of the other sections; any downstream inaccuracies cascade from the parent-lesson discrepancies above.
Summary: should the diff land?
Acceptable to merge with patch-level fixes; do not merge verbatim. The structural skeleton (§16–§20, numbering, lesson/handbook framing) is sound, and the test counts (37, 9, 33, 167, 4, 6, 1) all match — meaning the regression locks are real. But 6 substantive prose inaccuracy classes must be corrected before a future agent trusts this as canonical:
§	Claim	Required correction
16.1	"Scans src for imports; asserts declared==used"	Replace with: "Negative allowlist asserting known-unused deps (per AUDIT_REPORT.md) stay removed; dep lists hardcoded, no source scan at test time."
16.2	"Contract test asserts type-check clean"	Replace with: "Asserts tsconfig.config.json include globs cover every root config file. Type-check cleanliness is enforced by the per-package check-types script, not this test."
16.3	"10 consumer packages"	Change to "11 consumer packages" (add tooling/tailwind); drop the "Drizzle or()/and() carve-out" language — it's a blanket 15-rule downgrade, no scoped Drizzle rule; apps/web omits the override block.
16.4	"43 deprecated calls"	Frame as pre-migration inventory; state post-state as "zero deprecated, 40 native-API sites across 12 files" (matches repo's own VALIDATION_REPORT_session_log_3.md).
16.6	"3 sites where field was z.url().optional().or(z.literal(''))"	Only website uses that type; instagram + projectTypes are z.string().optional(). Reframe as "fields that admit ''" not "URL-or-empty fields".
16.7	Example log strings	Switch console.log → console.warn; [stripe-webhook] → [stripe]; ${source} → ${input.source}. Reframe "5 unescaped apostrophes" / "13 PII sites" as historical scope, not current residual.
16.8 / 17.3 / 18.4	React.SubmitEvent<HTMLFormElement>	Change to bare React.SubmitEvent (global DOM, non-generic). Drop the <HTMLFormElement> suffix — that type doesn't exist in @types/react@19.2.17 and would not compile.
16.5	"Regex excludes Drizzle )!"	Correct to: "Exclusion of products.ts (5 intentional Drizzle or()/and() postfix assertions) is via file-list omission from AUDITED_FILES, not regex behavior — the regex itself matches )!."
Bonus minor: the react-submit-event.contract.test.ts header comments reference "§REACT-1 / REMEDIATION_PLAN_v17", not the §16.8 "REACT-8" identifier the diff proposes. If the diff is merged, either update the test header doc string for cross-doc consistency, or relabel §16.8 as REACT-1 to match what's locked in code.
# Todos
[✓] Read full diff to enumerate every verifiable claim
[✓] Verify §16.1 DEP-7
[✓] Verify §16.2 DEP-8
[✓] Verify §16.3 DEP-9
[✓] Verify §16.4 TS-12
[✓] Verify §16.5 TS-13
[✓] Verify §16.6 REACT-7
[✓] Verify §16.7 SECURITY-3
[✓] Verify §16.8 REACT-8
[✓] Verify §17 / §18 patterns
[✓] Compile validation report with discrepancies
Validation complete. Verdict: merge conditionally — the diff is structurally sound and all numeric test-count claims (37, 9, 33, 167, 4, 6, 1) exactly match the codebase, but 6 prose-inaccuracy classes must be patched before a future agent treats this as canonical (most consequential: React.SubmitEvent<HTMLFormElement> doesn't exist and won't compile; "33 tests" actually means "11 packages × 3" not "10 packages"; DEP-7's test doesn't scan src; DEP-8's contract test doesn't run tsc; SECURITY-3 example log strings use wrong console level + prefix). Full per-section findings above.

