**File:** `docs/MAISON_design_guide_v3.md` 

### Four patches applied

| # | § | Change |
|---|---|---|
| **L-1** | §13.1 | Material icons' `stroke-width: 1.25` exception (vs the universal `1.5`) now documented with rationale — a 1.5 stroke reads too heavy at 48px. |
| **L-2** | §4.2 | Hero H1 row now explicitly notes `letter-spacing: -0.02em` overriding the universal `-0.012em` for tighter display tracking. |
| **L-3** | §6.2 | `scrollHint` row now specifies it's a vertical `translateY` bob on the chevron SVG (not opacity). I also tightened the purpose descriptions for `kenBurns`, `lineUp`, `fadeUp`, `marquee`, `cartBump` while I was in there. |
| **I-1** | §9 + Appendix A | Reconciled the section-count inconsistency: §9 intro now says **"17 page regions (13 content + 4 chrome)"**; Appendix A retitled to **"Page Region Inventory"**, expanded from 16 → 17 rows (added Mobile Nav Drawer as row 3), and each row now tagged `chrome` or `content` for clarity. |

### Structural additions

- Added a **revision-history banner** at the top documenting v1 → v2 → v3 progression
- Added **Appendix C: Change Log (v3)** as a traceable record of what was patched and why
- All 91 previously-verified factual claims (colors, type, spacing, motion, components, interactions, accessibility, image strategy) remain unchanged and continue to match the live source

### Suggested next steps

1. **Sanity-check** the file in a markdown renderer (GitHub, VS Code preview) — the bento ASCII diagrams and CSS code blocks should render cleanly.
2. If you want a **side-by-side diff** of v2 vs v3 to send to reviewers, I can generate one.
3. If the design system grows (new components, new breakpoints, dark-mode variant), this v3 baseline is the right place to fork from.
