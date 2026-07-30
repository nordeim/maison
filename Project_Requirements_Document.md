# MAISON — Unified Project Requirements Document (PRD) v1.2

**Document Date:** July 29, 2026 (v1.2 — aligned with three coding skills: Stillwater v3.0.0, tRPC+Drizzle v1.4.0, TypeScript patterns v1.4)
**Product Name:** Maison (Scandi Haven Living)
**Document Owner:** Product & Engineering
**Status:** Approved for build
**Companion Documents:** `docs/maison_landing_page_mockup_v2.zip` (visual reference, extracts to `public/landing.html`), `docs/MAISON_Design_Guide.md` (canonical design system reference — 1,489 lines, 16 top-level sections covering every visual, typographic, motion, and interaction decision), `PROJECT-ARCHITECTURE.md` (engineering blueprint), `README.md`, `AGENTS.md`, `CLAUDE.md`
**Architecture Skills Referenced:** `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth`, `skills/nextjs16-react19-tailwind4-better-auth-monorepo`

> **v1.1 changelog:** Reconciled all design-system, color, typography, motion, component, and section-listing discrepancies against the v2 landing page mockup. Color tokens corrected (`--muted`, `--sage`, added `--sage-soft`). Motion table expanded from 8 to 24 animations. Homepage section list expanded from 15 to 17 (added Statement Ticker + Hero Spotlight Card). Strategic position anti-generic claims revised (v2 permits bento grids for categories, mesh gradients for editorial atmosphere, glassmorphism for sticky chrome). Responsive breakpoints realigned to landing v2 (1024 / 768 / 480). Initial product catalog annotated with homepage-visibility column.
>
> **v1.2 changelog:** Reconciled 15 discrepancies against three coding skills (Stillwater v3.0.0, tRPC+Drizzle v1.4.0, TypeScript patterns v1.4). 5 HIGH-severity fixes: tRPC procedure tiers renamed to public/protected/staff/manager/owner (ADR-008); Stripe switched to Checkout Sessions (ADR-009, **flipped to Payment Intents in v1.2.1 — see REMEDIATION_HISTORY**); 2-layer auth pattern specified — cookie-only proxy + DB-backed layouts (ADR-010); WCAG target raised from AA to AAA (ADR-011); Phase 1 search switched from FTS to `ilike` (ADR-012). 8 MED-severity fixes (ADR-013 through ADR-020): email/password kept as hybrid auth (ADR-013); webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock` (ADR-014); `transpilePackages` + `@maison/source` source resolution (ADR-015); Trigger.dev v4 root import (ADR-016); React 19 `SubmitEvent` + `ClientOnly` (ADR-017); Zod v4 patterns (ADR-018); coverage thresholds aligned (ADR-019); `erasableSyntaxOnly` (ADR-020). 3 LOW-severity fixes: `db:push` production warning, `DATABASE_URL_UNPOOLED` (verified), `ClientOnly` component spec. See `PRD_PAD_Validation_Against_Skills.md` for full audit and `PRD_PAD_Skill_Alignment_Update_Plan_v2.md` for remediation details.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals, Non-Goals & Success Metrics](#2-goals-non-goals--success-metrics)
3. [Target Audience & Personas](#3-target-audience--personas)
4. [Brand Identity & Design System](#4-brand-identity--design-system)
5. [Information Architecture & Sitemap](#5-information-architecture--sitemap)
6. [Page-by-Page Requirements](#6-page-by-page-requirements)
7. [Functional Requirements](#7-functional-requirements)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Architecture](#9-data-architecture)
10. [API Surface (tRPC Router Catalog)](#10-api-surface-trpc-router-catalog)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Security & Compliance](#12-security--compliance)
13. [Third-Party Integrations](#13-third-party-integrations)
14. [Analytics & Tracking](#14-analytics--tracking)
15. [Initial Product Catalog](#15-initial-product-catalog)
16. [Responsive & Accessibility Specifications](#16-responsive--accessibility-specifications)
17. [Testing Strategy](#17-testing-strategy)
18. [Release Plan & Milestones](#18-release-plan--milestones)
19. [Risks & Mitigations](#19-risks--mitigations)
20. [Appendices](#20-appendices)

---

## 1. Executive Summary

### 1.1 Product Vision

Maison is a direct-to-consumer e-commerce platform for curated Scandinavian-inspired home goods — furniture, lighting, textiles, ceramics, and decorative objects. The platform embodies the philosophy of **"considered living"**: offering handcrafted objects that prioritise material integrity, artisan craftsmanship, and timeless design over mass production. Every product carries a maker's story, and every transaction supports independent Nordic craftspeople.

The current marketing surface (`docs/maison_landing_page_mockup_v2.zip`, extracted as `public/landing.html` and documented in `MAISON_Design_Guide.md`) communicates the brand but is non-functional: no real checkout, no account, no inventory, no admin. This PRD defines the requirements to build a **full production e-commerce platform** — customer-facing storefront, headless commerce API, admin back-office, and integrations — capable of supporting $5M+ annual GMV across EU + US markets with a four-person operating team.

### 1.2 North-Star Metrics

| Metric                                     | Target                             | Rationale                                           |
| ------------------------------------------ | ---------------------------------- | --------------------------------------------------- |
| **Conversion rate** (visitor → paid order) | ≥ 2.4% on cold traffic             | Industry benchmark for premium home goods: 1.8–2.2% |
| **Average order value (AOV)**              | ≥ $275 (Phase 1), ≥ $420 (Phase 3) | Premium positioning justifies higher AOV            |
| **Repeat-purchase rate (12-month)**        | ≥ 30% (Phase 1), ≥ 38% (Phase 3)   | Loyalty is the strongest lever for premium DTC      |
| **Cart abandonment rate**                  | ≤ 65%                              | Industry average: 70%                               |
| **NPS**                                    | ≥ 50 (Phase 1), ≥ 70 (Phase 3)     | Word-of-mouth drives premium DTC growth             |

### 1.3 Business Objectives

| Objective              | Metric                 | Target                                       |
| ---------------------- | ---------------------- | -------------------------------------------- |
| Revenue generation     | Monthly GMV            | $50K within 6 months, $250K within 12 months |
| Customer acquisition   | New customers / month  | 500+ (Phase 1), 2,000+ (Phase 3)             |
| Brand engagement       | Newsletter subscribers | 10K within 12 months                         |
| Inventory velocity     | Sell-through rate      | ≥ 75% per quarter                            |
| Operational efficiency | Orders / staff-day     | ≥ 40 (admin tooling must enable this)        |

### 1.4 Relationship to Prior Drafts

This document supersedes and unifies `PRD_draft-1.md` through `PRD_draft-4.md`. Each draft contributed distinct strengths:

| Draft       | Contribution to Unified PRD                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| **Draft 1** | Comprehensive functional requirements, data models, API endpoints, KPI table, release phases       |
| **Draft 2** | Production-ready tone, multi-region (EU/US/UK) scope, €5M GMV target, admin back-office emphasis   |
| **Draft 3** | Detailed personas (Emma the Mindful Minimalist, James & Sarah the Home Curators), content strategy |
| **Draft 4** | Page-by-page requirements, design system tokens, analytics event catalog, competitive references   |

The unified PRD reconciles currency conflicts (USD primary, EUR/GBP secondary), tech stack conflicts (commits to Next.js 16 + Turborepo + Better Auth + tRPC v11 + Drizzle + Stripe, per the preferred architecture skills), and aligns the design system with the v2 landing page mockup (canonical source: `public/landing.html`, fully documented in `MAISON_Design_Guide.md`).

---

## 2. Goals, Non-Goals & Success Metrics

### 2.1 Goals (v1)

- Replace the static landing page with a full storefront: PLP, PDP, cart, checkout, account, order management.
- Provide an admin back-office for products, orders, customers, content, and promotions usable by a non-technical operator.
- Support multi-region (EU + US + UK) with localised pricing, taxes, shipping, and language.
- Be performant (Core Web Vitals "Good" on all key pages), accessible (WCAG 2.2 AAA — stricter than ADA Title II AA requirement per ADR-011), and SEO-competitive.
- Be commercially extensible: discounts, gift cards, trade program, subscriptions (Phase 2+).
- Honour the brand's "considered living" aesthetic in every surface — no generic SaaS UI patterns.

### 2.2 Non-Goals (v1)

- Marketplace / third-party sellers.
- Physical retail POS integration.
- Augmented-reality room visualisation.
- Native mobile apps (responsive web only).
- Custom manufacturing / ERP integration (Phase 2).
- Subscription boxes / recurring physical deliveries (Phase 2).
- B2B wholesale portal (Phase 2).

### 2.3 Success Metrics by Phase

| KPI                  | Phase 1 (MVP, 6 wks) | Phase 2 (Growth, 12 wks) | Phase 3 (Optimisation, 18 wks) |
| -------------------- | -------------------- | ------------------------ | ------------------------------ |
| Monthly revenue      | $15K                 | $50K                     | $250K                          |
| Conversion rate      | 1.5%                 | 2.0%                     | 2.4%+                          |
| AOV                  | $250                 | $275                     | $420                           |
| Cart abandonment     | < 75%                | < 70%                    | < 65%                          |
| Email open rate      | 30%                  | 35%                      | 40%                            |
| Return customer rate | 15%                  | 22%                      | 30%+                           |
| Page load (p95 LCP)  | < 2.5s               | < 2.2s                   | < 2.0s                         |
| NPS                  | 40+                  | 50+                      | 70+                            |

---

## 3. Target Audience & Personas

### 3.1 Primary Persona — Emma, the Mindful Minimalist (32)

- **Demographics:** Urban professional, $80K+ HHI, lives in a city apartment (NYC, London, Copenhagen, Stockholm).
- **Psychographics:** Values quality over quantity, sustainability-conscious, follows interior design influencers (Kinfolk, Cereal, Apartment Therapy), researches extensively before purchasing.
- **Behaviour:** Discovers brands via Instagram + Pinterest, expects editorial-quality product photography, reads materials/care guides, willing to wait 6–12 weeks for made-to-order.
- **Pain points:** Overwhelmed by fast-furniture options, distrusts greenwashing, wants provenance and maker stories.
- **Jobs to be done:** "Help me furnish my home with pieces I'll keep for decades, not seasons."

### 3.2 Secondary Persona — James & Sarah, the Home Curators (40s)

- **Demographics:** Dual-income household, $150K+ HHI, suburban home, two children.
- **Psychographics:** Already invested in 1–2 heirloom pieces, now upgrading room-by-room, value trade pricing for repeat purchases.
- **Behaviour:** Buys in bundles (matching dining set + lighting), uses wishlist to plan multi-quarter purchases, expects saved addresses and order history.
- **Pain points:** Frustrated by inconsistent inventory across retailers, wants a single trusted source for Nordic design.
- **Jobs to be done:** "Help me build a coherent home over years, with a shop that remembers me."

### 3.3 Tertiary Persona — Trade Buyer (Interior Designer, 35)

- **Demographics:** Professional designer with 5–20 active client projects.
- **Psychographics:** Time-poor, expects trade discount (10–20%), needs line sheets and lead times, prefers phone/email support.
- **Behaviour:** Bulk orders, custom finishes, drop-ship to client sites.
- **Pain points:** Generic consumer checkout doesn't support trade workflows.
- **Jobs to be done:** "Let me source for clients efficiently, with trade pricing and project tracking."

### 3.4 Anti-Persona (Explicitly Not Served)

- Bargain hunters expecting IKEA-level pricing.
- Same-day delivery expectation (our lead times are 1–12 weeks by design).
- Bulk wholesale buyers (>50 units per SKU) — refer to B2B portal in Phase 2.

---

## 4. Brand Identity & Design System

> **Source of truth:** `docs/maison_landing_page_mockup_v2.zip` (extracts to `public/landing.html`). The canonical design system reference is `docs/MAISON_Design_Guide.md` — 1,489 lines documenting every visual, typographic, motion, and interaction decision. The CSS custom properties and typography choices in `public/landing.html` are the canonical design tokens. This section documents them for the engineering build.

### 4.1 Strategic Position (per `skills/avant-garde-design-v4`, refined for v2)

- **Quadrant:** Q1 — The Guardian (institutional clarity, restrained luxury)
- **Aesthetic Direction:** Luxury/Refined + Organic/Natural
- **Anti-generic commitments (v2 — revised):** No L/R hero split (hero is full-bleed with floating spotlight card instead), no purple/indigo, no neon accents, no boxed card inputs on light backgrounds. Bento grids are permitted only for category navigation (one per page). Mesh gradients are permitted only as decorative atmosphere behind editorial sections (max one per page). Glassmorphism is permitted only on sticky chrome (header) and floating cards (hero spotlight, bag panel) — never on primary content surfaces. Radical departure from generic SaaS blue.

### 4.2 Typography

| Role               | Font Family        | Weights                                         | Usage                                                |
| ------------------ | ------------------ | ----------------------------------------------- | ---------------------------------------------------- |
| Display / Headings | Cormorant Garamond | 300, 400, 500, 600, 700, italic 400, italic 500 | H1–H6, product names, logo, editorial headlines      |
| Body / UI          | Inter              | 300, 400, 500, 600                              | Paragraphs, labels, buttons, navigation, form inputs |

**Pairing rationale:** Cormorant Garamond provides editorial warmth and a humanist, hand-lettered quality that signals craft. Inter provides neutral, high-legibility UI text that doesn't compete with the serif. The contrast between serif display and sans body is a hallmark of editorial commerce (Aesop, Kinfolk, Hay Design).

**Italic emphasis treatment (signature pattern):** Every section title contains exactly one `<em>` element. On light sections, the italic word shifts to `--clay` with `font-weight: 400`. On dark sections (hero, editorial, newsletter), it shifts to `--gold` with `font-weight: 300`. Never more than one italic emphasis per heading. Examples: *"Objects of Quiet Beauty"*, *"Lighting that casts warmth"*, *"A room is a feeling"*, *"Letters from Maison"*.

**Eyebrow color shift:** The `.eyebrow` element (11px tracked uppercase label opening every section) uses `--clay` on light backgrounds and `--gold` on dark backgrounds. Letter-spacing of `0.22em` is the widest tracking on the page.

**Full type scale (see `MAISON_Design_Guide.md` §4.2 for complete table):**
- Hero H1: `clamp(3rem, 8.5vw, 7.5rem)` Cormorant 400, line-height 0.98, max 16ch
- Section title H2: `clamp(2rem, 4.5vw, 3.4rem)` Cormorant 500
- Featured H2: `clamp(2.25rem, 5vw, 3.75rem)` Cormorant 500
- Editorial H2: `clamp(2.25rem, 5.5vw, 4rem)` Cormorant 500 (white on dark)
- Product name H3: `1.25rem` Cormorant 500 (shifts to clay on hover)
- Category card name H3: `1.5rem` (feature: `2.1rem`) Cormorant 500
- Material title H3: `1.625rem` Cormorant 500
- Journal title H3: `1.5rem` Cormorant 500
- Body: `1rem` Inter 400, line-height 1.65
- Lede: `clamp(1rem, 1.15vw, 1.125rem)` Inter 400, line-height 1.7, max 60ch
- Hero description: `clamp(1rem, 1.2vw, 1.125rem)` Inter 300, line-height 1.7, max 52ch
- Eyebrow: `11px` Inter 500, letter-spacing 0.22em, uppercase
- Button: `13px` Inter 500, letter-spacing 0.14em, uppercase

### 4.3 Color Tokens (CSS Custom Properties)

These **16 color tokens** are implemented in `public/landing.html` and documented in `MAISON_Design_Guide.md` §3. They must be ported to `packages/ui/src/tokens/colors.css` in the build.

| Token          | Value     | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `--bg`         | `#faf8f5` | Page background (warm cream)             |
| `--bg-2`       | `#f3efe8` | Linen section backgrounds                |
| `--bg-3`       | `#ece5d8` | Deeper linen (testimonials, journal)     |
| `--bg-card`    | `#ffffff` | Product cards, modal surfaces            |
| `--bg-dark`    | `#1f1b17` | Footer, newsletter, marquee              |
| `--ink`        | `#1f1b17` | Primary text                             |
| `--ink-2`      | `#4a433b` | Secondary text                           |
| `--muted`      | `#786f66` | Tertiary text, meta labels               |
| `--line`       | `#e5ddd1` | Borders, dividers                        |
| `--line-soft`  | `#efe9df` | Subtle dividers                          |
| `--clay`       | `#a86b4a` | Primary accent (CTAs, links, badges)     |
| `--clay-dark`  | `#8a5538` | Hover state for clay                     |
| `--clay-light` | `#c17d52` | Secondary clay                           |
| `--gold`       | `#c4a265` | Editorial accent (hero italic, ornament) |
| `--sage`       | `#7e8f72` | Secondary accent (linen material card)   |
| `--sage-soft`  | `#dfe4d6` | Mesh-glow background (philosophy)        |

**Color usage rules (v2):**
1. Clay is the only color used for primary CTAs — no green "buy" buttons, no blue "submit" buttons.
2. Gold is reserved for dark backgrounds (hero, marquee, editorial, newsletter) — never on light sections.
3. Sage is used twice only: second material card icon + mesh-glow base.
4. Dark sections use ink (`#1f1b17`), not pure black — keeps warm undertone.
5. White (`#ffffff`) is used only for cards on warm backgrounds — never as page background.
6. `::selection` is clay bg + bg color text.

**WCAG contrast (AAA target per ADR-011):** All body text combinations meet WCAG AAA (≥ 7:1 for normal text, ≥ 4.5:1 for large text ≥18pt). `--ink` on `--bg` is ~17:1 (AAA ✅); `--ink-2` on `--bg` is ~9.2:1 (AAA ✅); `--muted` `#786f66` on `--bg` is ~4.8:1 (passes AA, **fails AAA for normal text** — use only for meta labels at 11px+ where surrounding context provides 7:1+ contrast, OR darken to `#5a5249` for AAA compliance). Verified via `scripts/contrast-check.ts` in CI. `--gold` and `--sage` are decorative only — never use for text smaller than 18px.

**Dark mode:** Not in v1. The brand's warmth is intrinsic to the cream base. Dark mode would be Phase 3 if requested by ≥ 15% of users.

### 4.4 Spacing & Layout

- **Container widths:** Narrow `760px`, Standard `1280px`, Full-bleed `100vw`
- **Gutter:** `clamp(20px, 5vw, 64px)` (shrinks to `1.25rem` on ≤480px viewports)
- **Section padding:**
  - Default section: `clamp(64px, 9vw, 120px)` vertical
  - Philosophy section: `clamp(80px, 11vw, 140px)` vertical (extra breathing room for manifesto)
  - Statement ticker: `2.75rem 0` (short typographic break)
  - Newsletter: `clamp(64px, 9vw, 110px)` vertical
- **Border radius:** `0px` for cards, buttons, badges, tags (deliberately square — editorial convention); `50%` for icon buttons, social icons, cursor dot/ring only. The page has **no rounded rectangles** except circular icon buttons. This is a deliberate aesthetic — sharp corners reinforce the "considered, not cozy" brand voice.
- **Grid system:** 12-column for collections, 4-column for products (responsive: 1 → 2 → 3 → 4), asymmetric bento for categories (`grid-template-areas`), 3-column for materials/journal, 6-column for instagram, 4-column asymmetric for footer (1.6fr 1fr 1fr 1fr)
- **Base spacing unit:** 4px (Tailwind scale)

**Shadow token system (v2 — new):**

```css
--shadow-sm: 0 1px 3px rgba(31,27,23,0.04);    /* header scrolled */
--shadow-md: 0 8px 24px rgba(31,27,23,0.08);   /* card hover, button hover */
--shadow-lg: 0 24px 60px rgba(31,27,23,0.14);  /* toast, mobile nav */
--shadow-xl: 0 40px 100px rgba(31,27,23,0.20); /* hero spotlight, bag panel */
```

All shadows use warm ink (`rgba(31,27,23,...)`) rather than pure black — keeps the shadow consistent with the page palette.

**Border & divider rules:**
- Visible borders: `1px solid var(--line)` (`#e5ddd1`) — warm, soft, never gray.
- Subtle dividers inside cards: `1px solid var(--line-soft)` (`#efe9df`).
- Card hover states remove the border (`border-color: transparent`) and substitute `box-shadow` so the card appears to lift rather than shift.

### 4.5 Motion & Animation

**Easing & timing tokens:**

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);     /* primary ease-out with subtle entrance */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* stronger ease-out for entrances */
--dur-fast: 0.25s;    /* hover states, color changes */
--dur: 0.45s;         /* standard transitions */
--dur-slow: 0.9s;     /* scroll reveals */
```

Both easing curves are ease-out variants — nothing on the page eases in. The visual impression is that elements arrive and settle, never that they sweep in or fade up.

**Complete animation inventory (27 animations — see `MAISON_Design_Guide.md` §6 and Appendix B for the canonical 27-entry list; the 24 most user-facing animations are documented in the table below, with 3 additional micro-interactions detailed in Appendix B):**

| Animation | Duration | Easing | Usage | Reduced-Motion Fallback |
| --- | --- | --- | --- | --- |
| Ken Burns (hero bg) | 26s | ease-in-out, alternate infinite | Hero background image | Disabled (static image) |
| Hero headline line-up | 1s + 0.15s stagger | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero H1 line-by-line rise | Instant (no transform) |
| Hero fade-up | 0.9s + delays (0.15s/0.65s/0.8s/1.05s) | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero eyebrow, desc, CTAs, spotlight | Instant (opacity 1) |
| Brand marquee | 38s | linear infinite | Brand promises strip | Disabled (static, wraps) |
| Statement ticker | 32s | linear infinite | Italic serif phrases alternating solid/outline | Disabled (static, wraps) |
| Testimonials marquee | 46s | linear infinite (pauses on hover) | Testimonial cards | Disabled (static, wraps) |
| Scroll hint bob | 2.4s | ease-in-out infinite | Hero scroll-down chevron | Disabled |
| Scroll reveal (translate) | 0.9s | `cubic-bezier(0.16, 1, 0.3, 1)` | `.reveal` elements via IntersectionObserver | Instant (no transform) |
| Scroll reveal (scale) | 0.8s | `cubic-bezier(0.16, 1, 0.3, 1)` | `.reveal-pop` elements | Instant (no transform) |
| Stagger delay | 0.08s/step (max 4 steps) | — | Grid item reveals via `data-delay` attribute | Removed |
| Image hover scale | 1.0–1.2s | `cubic-bezier(0.22, 1, 0.36, 1)` | Product cards, category cards, philosophy images | Disabled |
| Image sepia reset | 0.6s | `cubic-bezier(0.22, 1, 0.36, 1)` | All imagery on hover (filter resets to 0) | Disabled |
| Button hover translate | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Primary CTA bg + arrow shift | Color change only |
| Link underline | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Nav links (scaleX 0→1 from left), footer links | Instant |
| Material card lift | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Material cards translateY -4px | Disabled |
| Material top bar scale | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | 3px accent bar scaleX 0→1 | Instant |
| Toast slide-up | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Add-to-cart confirmation (bottom-center) | Instant |
| Bag panel slide-up | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` | Floating bag panel from translateY(140%) | Instant |
| Cart badge bump | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` | Cart count scale 1→1.6→1 (keyframe) | Disabled |
| Scroll progress bar | 0.08s linear update | linear | 2px gradient (clay→gold) bar at top | Still updates (no motion sickness) |
| Custom cursor dot | instant (rAF) | — | 6px clay dot follows mouse | Disabled entirely |
| Custom cursor ring | lerp 0.18 factor (rAF) | — | 34px ring trails dot, expands to 68px on interactive hover | Disabled entirely |
| Magnetic button | rAF, inline style | — | Buttons translate 0.18× X, 0.35× Y of cursor offset | Disabled |
| Hero parallax | rAF, inline style | — | Hero bg translates ±14px based on cursor (scale 1.1) | Disabled |

**Hero entrance choreography (staged sequence):**

```
0.00s   page render
0.15s   eyebrow fades up         (fadeUp 0.9s, delay 0.15s)
0.25s   headline line 1 rises    (lineUp 1s, delay 0.25s)
0.40s   headline line 2 rises    (lineUp 1s, delay 0.40s)
0.65s   description fades up     (fadeUp 0.9s, delay 0.65s)
0.80s   CTAs fade up             (fadeUp 0.9s, delay 0.80s)
1.05s   spotlight card fades up  (fadeUp 0.9s, delay 1.05s)
```

Total runtime ~2s. Each element starts before the previous finishes — a "cascade" rather than a "sequence".

**Reduced motion:** All animations respect `prefers-reduced-motion: reduce` (already implemented in landing page CSS; carry into build). The reduced-motion media query disables all keyframe animations, sets transition-duration to 0.01ms, and hides the custom cursor entirely. JS-gated interactions (cursor, magnetic, parallax) check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before enabling.

### 4.6 Component Library (Built on Radix UI + Tailwind v4)

| Component                    | Source                   | Customisation                                                  |
| ---------------------------- | ------------------------ | -------------------------------------------------------------- |
| Button                       | shadcn/ui base, restyled | Clay primary, outline, ghost variants; uppercase 13px tracking; `.magnetic` class opts into JS magnetic attraction |
| Product Card                 | Custom                   | Hover-swap images, wishlist heart, quick-add bar, badge; sepia filter on images |
| Category Card                | Custom                   | Bento grid placement; image overlay with gradient, name + count, hover scale 1.08 + sepia reset |
| Dialog (Cart drawer)         | Radix Dialog             | Slide-in from right, 380px width                               |
| Toast                        | Sonner                   | Bottom-center, ink background, cream text, 2.8s auto-dismiss   |
| Form inputs                  | Radix Label + custom     | Border-bottom only on newsletter; full border on checkout      |
| Dropdown (mega nav)          | Radix Popover            | Phase 2 — full mega-nav with category previews                 |
| Tabs (PDP gallery)           | Radix Tabs               | Thumbnail strip + main image                                   |
| Select (sort, quantity)      | Radix Select             | Minimal, ink-on-cream                                          |
| Calendar (delivery estimate) | Radix Calendar           | Phase 2 — lead-time visualisation                              |
| **Custom Cursor (v2 — new)** | Custom (vanilla JS + CSS) | Desktop fine-pointer only; 6px clay dot + 34px ring with 0.18 lerp; expands to 68px on interactive hover; ring border shifts to 55% bg opacity on dark sections; disabled under reduced-motion |
| **Magnetic Button Wrapper (v2 — new)** | Custom (vanilla JS) | Applies to `.magnetic` class on buttons; translates 0.18× X-offset, 0.35× Y-offset on mousemove; resets on mouseleave |
| **Scroll Progress Bar (v2 — new)** | Custom (CSS + passive scroll listener) | 2px fixed top; `linear-gradient(90deg, var(--clay), var(--gold))`; z-index 9997; updates width via passive scroll listener |
| **Floating Bag Panel (v2 — new)** | Custom (Radix Dialog base optional) | Fixed bottom-right; `min(320px, calc(100vw - 2rem))`; slides up from `translateY(140%)`; auto-hides after 5s; shows product thumb + name + price + count + "View Bag" link; `aria-live="polite"` |
| **Statement Ticker (v2 — new)** | Custom (CSS marquee) | Italic serif phrases alternating solid clay and outlined (`-webkit-text-stroke: 1px var(--ink-2)`); 32s linear infinite; `aria-hidden="true"` |

**Visual treatments (also documented in `MAISON_Design_Guide.md` §7):**

| Treatment | Implementation | Notes |
| --- | --- | --- |
| Paper Grain Noise | `body::before` fixed overlay; SVG `feTurbulence baseFrequency=0.9 numOctaves=3`; opacity 0.035; z-index 9990; `pointer-events: none` | Gives every surface a paper-like texture — critical to the "oat paper" feel |
| Sepia Photo Filter | All product/category/philosophy/journal images: `filter: sepia(0.22) saturate(1.05) hue-rotate(-6deg)`; resets to `sepia(0) saturate(1)` on hover | Transforms stock imagery into catalog photography; hover reveals "true" image |
| Mesh Glow | `.mesh-glow` absolute-positioned 640px circle; `filter: blur(90px)`; opacity 0.35; sage-soft + gold radial gradients; positioned behind Philosophy section | Decorative atmosphere; max one per page (anti-generic commitment) |
| Hero Overlay Gradient | `linear-gradient(180deg, rgba(24,20,17,0.55) 0%, rgba(24,20,17,0.28) 32%, rgba(24,20,17,0.72) 100%)` | Three-stop vertical; darker top/bottom, lighter middle |
| Editorial Overlay Gradient | `linear-gradient(135deg, rgba(24,20,17,0.7) 0%, rgba(24,20,17,0.38) 60%, rgba(24,20,17,0.55) 100%)` | Diagonal spotlight effect |
| Newsletter Texture | Subtle gold dot pattern (4×4 SVG) at 4% opacity | Faintest grid texture without competing with the form |

---

## 5. Information Architecture & Sitemap

### 5.1 Route Groups (Next.js 16 App Router)

```
/ (Homepage)                                    — route group: (shop)
├── /products                                   — Product Listing Page (PLP)
│   └── /products?collection={slug}             — Filtered PLP
├── /product/{slug}                             — Product Detail Page (PDP)
├── /collections                                — Collections overview
│   └── /collections/{slug}                     — Single collection page
├── /about                                      — Brand story, makers, sustainability
├── /journal                                    — Editorial blog index
│   └── /journal/{slug}                         — Journal article
├── /cart                                       — Shopping bag
├── /checkout                                   — Multi-step checkout
├── /order/{orderNumber}                        — Order confirmation / status
├── /account                                    — Customer dashboard (auth required)
│   ├── /account/orders                         — Order history
│   ├── /account/wishlist                       — Saved items
│   ├── /account/addresses                      — Address book
│   └── /account/settings                        — Profile, password, newsletter prefs
├── /auth/sign-in                               — Better Auth sign-in
├── /auth/sign-up                               — Better Auth registration
├── /auth/forgot-password                       — Password reset flow
├── /auth/callback                              — OAuth callback
├── /contact                                    — Contact form
├── /faq                                        — Frequently asked questions
├── /shipping-returns                           — Shipping & returns policy
├── /care-guide                                 — Product care guide
├── /privacy-policy                             — Privacy policy
├── /terms-of-service                           — Terms of service
└── /cookie-policy                              — Cookie policy

/admin                                          — route group: (admin), RBAC-gated
├── /admin                                      — Dashboard (KPIs, recent orders)
├── /admin/products                             — Product CRUD
│   └── /admin/products/new                     — Create product
│   └── /admin/products/{id}                    — Edit product
├── /admin/collections                          — Collection management
├── /admin/orders                               — Order list
│   └── /admin/orders/{id}                      — Order detail, fulfillment
├── /admin/customers                            — Customer list
│   └── /admin/customers/{id}                   — Customer detail
├── /admin/inventory                            — Stock levels, low-stock alerts
├── /admin/discounts                            — Promo code management (Phase 2)
├── /admin/content                              — Sanity CMS deep-link (Phase 2)
├── /admin/settings                             — Store settings (shipping, tax, regions)
└── /admin/audit-log                            — Admin action audit trail
```

### 5.2 Route Group Conventions (per Stillwater reference)

- `(shop)` — public storefront, SSR + ISR, no auth
- `(admin)` — admin surface, RBAC-gated (roles: `staff`, `manager`, `owner`), server-session required
- `(account)` — customer dashboard, auth required, server-session required
- `api/` — Route handlers (tRPC, Stripe webhooks, Sanity webhooks, auth callbacks)

---

## 6. Page-by-Page Requirements

### 6.1 Homepage (`/`)

**Sections (in order, matching `public/landing.html` — 17 sections total):**

1. **Announcement bar** — ink bg, 11px tracked uppercase, gold `$150` highlight, free shipping + gift wrap + 30-day returns
2. **Sticky header** — Logo (M<em>a</em>ison), nav (Shop All, Collections, Our Story, Journal, Contact), search/account/cart icons (40px circles), cart badge with bump animation, mobile hamburger → X
3. **Hero** — Full-bleed `94vh` (min 660px, max 960px), Ken Burns image (26s alternate infinite), 3-stop dark gradient overlay, eyebrow (gold) + 2-line H1 ("Objects of *Quiet Beauty*" — italic gold) + description + dual CTA (Shop the Collection / Our Craft), mousemove parallax (±14px), scroll indicator (animated chevron, 2.4s ease-in-out infinite)
4. **Hero Spotlight Card** — Floating bottom-right product card (`min(240px, 32vw)`), glass bg `rgba(250,248,245,0.94)` + `backdrop-filter: blur(6px)`, thumbnail + signature piece name + price, fades up last in hero choreography (1.05s delay)
5. **Brand marquee** — ink bg, 5 brand promises duplicated for seamless loop (Handcrafted in Scandinavia, FSC-certified Oak, Carbon-neutral Delivery, 10-year Guarantee, Plant-based Textiles), gold diamonds (◆), 38s linear infinite
6. **Featured Collection** — bg-2, 2-col asymmetric (1.1fr image | 1fr text), 4:5 image with "Featured" tag, stats row (28 pieces, 9 makers, Brass · Glass · Clay), outline CTA "Shop Lighting"
7. **Categories** — bento grid 4×2 with `grid-template-areas: "feature feature wide wide" / "feature feature small1 small2"`, 4 cards (Furniture 42, Lighting 28, Textiles 36, Ceramics 24), gradient overlays, hover scale 1.08 + sepia reset, → arrow on hover
8. **Statement Ticker** — bg-2, 2.75rem padding, 3 italic serif phrases (Slow-made solid clay, Honest materials outlined, Made to last outlined), gold star (✶) separators, 32s linear infinite, `aria-hidden="true"`
9. **Featured Products** — 4-col grid, 8 products populated via JS, hover-swap alt image, badges (New/Bestseller/Featured), wishlist heart (hover-revealed desktop, always visible mobile), quick-add bar (hover-revealed desktop, always visible mobile), sepia filter `sepia(0.22) saturate(1.05) hue-rotate(-6deg)`, staggered `.reveal-pop` with `data-delay` 1–4 cycling
10. **Philosophy** — bg-2, extra padding `clamp(80px, 11vw, 140px)`, mesh-glow top-left (640px blurred sage-soft + gold radial gradient), 2-col (1.05fr image collage | 1fr text), 3-image collage (1 tall spanning 2 rows + 2 stacked), H2 with 2 italic emphasis words ("Objects made with *care*, materials that age *gracefully*"), ornament divider (gold star + 60px lines), 3 stats (27 years, 14 makers, 100% FSC), outline CTA
11. **Materials** — 3-col grid, 3 cards color-coded (FSC Oak=clay, European Linen=sage, Hand-thrown Clay=gold), 48px line SVG icons, 3px top accent bar (scaleX 0→1 on hover), origin metadata footer (Småland, Normandy & Flanders, Gothenburg)
12. **Editorial (Hygge Edit)** — full-bleed `min-height: 82vh`, dark image with 135° diagonal gradient overlay, gold eyebrow + H2 ("A room is a *feeling*."), gold primary CTA "Shop the Hygge Edit"
13. **Testimonials** — horizontal marquee (NOT 3-column grid), 5 testimonial cards, 46s linear infinite (pauses on hover), each card: 4rem clay quote mark (30% opacity), gold stars, italic serif blockquote, 24px clay line + name + tracked location
14. **Journal** — bg-2, 3-col grid, 3 article cards, 4:3 image, meta line (category · read time), serif H3 (clay on hover), excerpt
15. **Instagram** — 6-col square grid (populated via JS), hover: image scale 1.1 + 40% clay overlay + Instagram icon scale-in, centered section head with handle "@maison*living*"
16. **Newsletter** — ink bg with gold dot pattern texture, centered narrow (760px), gold eyebrow + H2 ("Letters from *Maison*."), borderless form (border-bottom only, gold on focus-within), privacy note
17. **Footer** — 4-col grid (1.6fr brand | 1fr Shop | 1fr About | 1fr Help), wordmark + tagline + 3 social icons (Instagram, Pinterest, YouTube), bottom row (copyright with dynamic year + 3 legal links)

**Implementation notes:**

- Hero image: `next/image` with `fetchpriority="high"`, `sizes="100vw"`, AVIF/WebP fallbacks
- All below-the-fold images: `loading="lazy"` via `next/image` default
- Marquees (brand, statement, testimonials): pure CSS animation (no JS) for performance; content duplicated in DOM for seamless loop; `aria-hidden="true"` on brand marquee and statement ticker (decorative); testimonials remain semantic (real quotes)
- Scroll reveal: `IntersectionObserver` hook (`useScrollReveal`), `threshold: 0.12`, `rootMargin: '0px 0px -60px 0px'`, respects `prefers-reduced-motion`
- Product grid: SSR-rendered from tRPC `products.list` query, hydrated with client-side cart mutations
- Custom cursor + magnetic buttons + hero parallax: JS-gated, only enabled when `(hover: hover) and (pointer: fine)` matches AND `prefers-reduced-motion: reduce` does NOT match
- Hero spotlight card: repositions to bottom-center on mobile (≤768px) via `left: 50%; transform: translateX(-50%)`

### 6.2 Product Listing Page (`/products`)

- URL-driven state via `nuqs` (sort, page, filters) — shareable + bookmarkable
- Sort options: Featured (default), Newest, Price ↑, Price ↓
- Filter pills by collection (All, Lighting, Furniture, Textiles, Ceramics, Objects, Seasonal, New Arrivals, Gifts)
- Grid: 1 col (mobile) → 2 col (tablet) → 3 col (desktop) → 4 col (wide)
- Product count display: "Showing 24 of 142 pieces"
- Pagination (24 per page) with infinite scroll as enhancement (Phase 2)
- Collection hero banner when `?collection={slug}` present
- Empty state: "No pieces match this filter — try clearing filters" with CTA
- SEO: SSR-rendered, canonical URL, JSON-LD `ItemList` structured data

### 6.3 Product Detail Page (`/product/{slug}`)

- Image gallery: main image (16:11) + thumbnail strip (Radix Tabs), 2–6 images per product
- Product name (serif H1), price, collection tag (eyebrow)
- Long description (rich text from Sanity)
- Materials & dimensions table
- Quantity selector, "Add to Bag" (primary), "Save to Wishlist" (icon button)
- Stock indicator: "In stock" / "Only 3 left" / "Made to order — 6–8 weeks"
- Trust badges: Free shipping over $150, 30-day returns, 10-year guarantee
- Accordion: Shipping & Returns, Materials & Care, Maker Story
- Related products (same collection, max 4) — "You may also live with"
- Breadcrumb: Home / Collection / Product
- SEO: JSON-LD `Product` with `offers`, `aggregateRating` (Phase 2), breadcrumbs

### 6.4 Shopping Bag (`/cart`)

- Line items: thumbnail, name, collection, price, quantity selector (1–99), remove button
- Subtotal, estimated shipping (calculated by region), estimated tax
- Free shipping progress bar ("Spend $X more for free shipping")
- Promo code field (Phase 2)
- "Proceed to Checkout" (primary CTA), "Continue Shopping" (ghost link)
- Empty state: "Your bag is empty" + "Shop the Collection" CTA
- Cart persisted: anonymous users via `cart_id` cookie + DB row; authenticated users via `customer_id` FK

### 6.5 Checkout (`/checkout`)

- **Step 1 — Contact & Shipping:** Email (or sign in), shipping address (autocomplete via Google Places API), shipping method (Standard 5–7 days / Express 2–3 days / White Gloove 2 weeks)
- **Step 2 — Payment:** Stripe Payment Intents via Stripe Elements (in-page card form, server-side confirmation via `stripe.confirmPayment({ clientSecret })`). Supports cards, Apple Pay, Google Pay via `paymentMethodTypes`, and Stripe Tax via `automatic_tax: { enabled: true }`. Billing address (checkbox: same as shipping), promo code application. PCI SAQ-A scope (card data never touches our servers per ADR-009).
- **Step 3 — Review:** Order summary with line items, totals, shipping, tax; "Place Order" button
- **Step 4 — Confirmation:** Order number, summary, "what happens next" timeline, email confirmation sent indicator
- Guest checkout supported (no account required); post-purchase prompt to create account
- Stripe Payment Intent created server-side via `createPaymentIntent({ amount, currency, paymentMethodTypes, automatic_tax })`; client confirms via Stripe Elements (`stripe.confirmPayment({ clientSecret, ... })`); on success, the `checkout.confirmOrder` mutation finalises the order and routes to `/order/{orderNumber}` (no Stripe-hosted redirect — client-side confirmation keeps the user on-site for the 3-step Maison checkout UX)
- Idempotency: webhook handler guarded by dual-defense pattern — `payment_events.stripe_event_id` UNIQUE INDEX + `pg_advisory_xact_lock` (transaction-scoped) per ADR-014. Fast-path check outside transaction; double-check after lock acquisition.

### 6.6 About Page (`/about`)

- Brand story narrative (long-form, serif body, editorial layout)
- Founder/maker profiles (cards with portrait, name, role, quote)
- Sustainability commitments (3-column: materials, packaging, carbon)
- Behind-the-scenes imagery (full-bleed gallery)
- Values section (numbered list: 01 Material integrity, 02 Maker dignity, 03 Slow design, 04 Repair over replace)
- CTA: "Shop the Collection" / "Read the Journal"

### 6.7 Customer Account (`/account/*`)

- **Dashboard:** Recent order summary, wishlist count, saved addresses count
- **Orders:** Chronological list with status badges (Processing, Shipped, Delivered, Cancelled); click into detail with tracking link
- **Wishlist:** Grid of saved products with "Move to Bag" action
- **Addresses:** CRUD for shipping addresses, default address selection
- **Settings:** Profile (name, email), password change, newsletter subscription toggle, account deletion (GDPR)

### 6.8 Admin Dashboard (`/admin`)

- **Overview:** KPI cards (today's revenue, orders, AOV, conversion), revenue chart (Recharts), recent orders table, low-stock alerts
- **Products:** Table (name, SKU, collection, price, stock, status) with inline edit, bulk actions (archive, restock), search, filter by collection
- **Collections:** Drag-and-drop reorder, add/edit/delete, product count display
- **Orders:** Filterable by status/date, order detail with fulfillment actions (mark shipped, add tracking, refund)
- **Customers:** List with order count, total spend, last order date; detail view with full history
- **Inventory:** Stock levels by SKU, low-stock threshold alerts, bulk import (CSV) in Phase 2
- **Settings:** Shipping zones & rates, tax rates by region, store name/domain, payment settings (Stripe connection)

---

## 7. Functional Requirements

### 7.1 Product Catalog

| ID    | Requirement                                                                   | Priority |
| ----- | ----------------------------------------------------------------------------- | -------- |
| P-001 | Display products with name, price, description, images, materials, dimensions | P0       |
| P-002 | Support multiple images per product with hover-swap on cards                  | P0       |
| P-003 | Tag products as "New", "Featured", or "Bestseller" with visual badges         | P0       |
| P-004 | Associate products with collections (one-to-many)                             | P0       |
| P-005 | Filter products by collection via URL query params                            | P0       |
| P-006 | Sort products by featured, newest, price ascending/descending                 | P1       |
| P-007 | Related products recommendation (same collection, max 4)                      | P1       |
| P-008 | Product search with autocomplete (cmdk)                                       | P2       |
| P-009 | Quick view modal from listing page                                            | P2       |
| P-010 | Variant support (size, finish, material) per product                          | P1       |
| P-011 | Inventory tracking with stock quantity and "made to order" lead times         | P0       |
| P-012 | SEO metadata per product (title, description, OG image)                       | P0       |

### 7.2 Shopping Cart

| ID    | Requirement                                                                   | Priority |
| ----- | ----------------------------------------------------------------------------- | -------- |
| C-001 | Add/remove items to cart                                                      | P0       |
| C-002 | Adjust item quantities (1–99)                                                 | P0       |
| C-003 | Real-time subtotal calculation                                                | P0       |
| C-004 | Cart badge count in header                                                    | P0       |
| C-005 | Persist cart across sessions (DB-backed for both anonymous and authenticated) | P0       |
| C-006 | Cart drawer (slide-out from right) accessible from any page                   | P1       |
| C-007 | Free shipping threshold progress indicator                                    | P1       |
| C-008 | Cart merge on login (anonymous cart → authenticated cart)                     | P1       |
| C-009 | Stock validation on add-to-cart (prevent overselling)                         | P0       |

### 7.3 Wishlist

| ID    | Requirement                                                  | Priority |
| ----- | ------------------------------------------------------------ | -------- |
| W-001 | Toggle products in/out of wishlist from product card and PDP | P0       |
| W-002 | Wishlist badge count in header (authenticated users)         | P1       |
| W-003 | Wishlist page (`/account/wishlist`) with grid view           | P1       |
| W-004 | Move wishlist item to cart                                   | P1       |
| W-005 | Persist wishlist for authenticated users (DB-backed)         | P1       |
| W-006 | Anonymous wishlist via localStorage, merge on login          | P2       |

### 7.4 Checkout & Payments

| ID     | Requirement                                                                    | Priority |
| ------ | ------------------------------------------------------------------------------ | -------- |
| CK-001 | Multi-step checkout (Contact/Shipping → Payment → Review → Confirmation)       | P0       |
| CK-002 | Stripe payment integration (cards, Apple Pay, Google Pay)                      | P0       |
| CK-003 | Order confirmation page with order number                                      | P0       |
| CK-004 | Email confirmation sent on order placement (React Email + Resend)              | P0       |
| CK-005 | Guest checkout support                                                         | P0       |
| CK-006 | Promo/discount code application                                                | P1       |
| CK-007 | Shipping method selection (Standard / Express / White Glove)                   | P1       |
| CK-008 | Tax calculation by region (Stripe Tax or manual rates)                         | P1       |
| CK-009 | Address book for returning customers                                           | P2       |
| CK-010 | Idempotent order creation (Stripe idempotency key)                             | P0       |
| CK-011 | Inventory reservation on checkout begin, release on timeout (15 min)           | P1       |
| CK-012 | Stripe webhook handling (payment_intent.succeeded, charge.refunded) | P0       |

### 7.5 User Accounts & Authentication

| ID    | Requirement                                                               | Priority |
| ----- | ------------------------------------------------------------------------- | -------- |
| U-001 | Hybrid auth: email/password + Magic Link + Google OAuth (Better Auth, ADR-013) | P0       |
| U-002 | OAuth login (Google, Apple)                                               | P1       |
| U-003 | Magic link sign-in (email-only)                                           | P2       |
| U-004 | Order history with status tracking                                        | P1       |
| U-005 | Saved addresses CRUD                                                      | P1       |
| U-006 | Wishlist persistence                                                      | P1       |
| U-007 | Password reset flow (email-based, time-limited token)                     | P0       |
| U-008 | Email verification on registration                                        | P1       |
| U-009 | Account deletion (GDPR right to erasure)                                  | P1       |
| U-010 | Session management (httpOnly cookies, 30-day expiry, refresh on activity) | P0       |
| U-011 | Admin RBAC (roles: `customer`, `staff`, `manager`, `owner`)                          | P0       |

### 7.6 CMS & Content

| ID      | Requirement                                                                | Priority |
| ------- | -------------------------------------------------------------------------- | -------- |
| CMS-001 | Sanity Studio for product content (descriptions, materials, maker stories) | P0       |
| CMS-002 | Collection management in Sanity (name, slug, hero image, description)      | P0       |
| CMS-003 | Homepage section management (featured collection, editorial) via Sanity    | P1       |
| CMS-004 | Journal/blog content management (Sanity blogPost schema)                   | P1       |
| CMS-005 | Image upload with automatic optimization (Cloudflare Images or Sanity CDN) | P0       |
| CMS-006 | SEO metadata management per page (title, description, OG image)            | P0       |
| CMS-007 | Sanity webhook → Next.js ISR revalidation on content publish               | P0       |
| CMS-008 | Preview mode for draft content (Sanity Live Preview)                       | P1       |

### 7.7 Newsletter & Marketing

| ID    | Requirement                                                                    | Priority |
| ----- | ------------------------------------------------------------------------------ | -------- |
| M-001 | Email capture form in footer and dedicated newsletter section                  | P0       |
| M-002 | Integration with Klaviyo (marketing email)                                     | P1       |
| M-003 | Welcome email sequence for new subscribers (3 emails over 7 days)              | P2       |
| M-004 | Abandoned cart email flow (1 hour / 24 hour / 72 hour)                         | P2       |
| M-005 | Instagram feed integration (static grid, Phase 2 dynamic)                      | P1       |
| M-006 | Transactional emails via Resend (order confirmation, shipping, password reset) | P0       |

### 7.8 Search

| ID    | Requirement                                                               | Priority |
| ----- | ------------------------------------------------------------------------- | -------- |
| S-001 | Search bar in header with cmdk-powered modal                              | P1       |
| S-002 | Full-text search across product name, description, materials              | P1       |
| S-003 | Autocomplete suggestions (debounced 200ms)                                | P2       |
| S-004 | Search results page with filter sidebar                                   | P1       |
| S-005 | Algolia or Meilisearch integration (Phase 2 if `ilike` search insufficient per ADR-012) | P2       |
| S-006 | "No results" state with suggested collections                             | P1       |

---

## 8. Technical Architecture

### 8.1 Technology Stack (Locked)

Per the preferred architecture skills (`nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` and `nextjs16-react19-tailwind4-better-auth-monorepo`), and validated against the Stillwater production codebase:

| Layer                | Technology             | Pinned Version                      | Rationale                                                           |
| -------------------- | ---------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| **Monorepo tooling** | Turborepo              | ≥2.10.4                             | Task orchestration, caching, incremental builds                     |
| **Package manager**  | pnpm                   | 11.17.0 (via `packageManager` field) | Workspace protocol, supply-chain guardrails (`minimumReleaseAge`)   |
| **Runtime**          | Node.js                | ≥22.0.0                             | LTS required by Next.js 16                                          |
| **Meta-framework**   | Next.js                | 16.2.x                              | App Router, RSC, `proxy.ts` (replaces `middleware.ts`), Turbopack   |
| **UI runtime**       | React                  | 19.2.x (≥ 19.2.3 for CVE-2025-55182 floor) | React Compiler, async params, `use()` hook, ref-as-prop (no `forwardRef`), `SubmitEvent` (not `FormEvent`), `ClientOnly` boundary for SSR-safe hooks (ADR-017) |
| **Language**         | TypeScript             | 5.9.x                               | Strict mode, `noUnusedLocals`, `erasableSyntaxOnly` (forbids `enum`/`namespace` — use `pgEnum` + string unions, ADR-020), `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `useUnknownInCatchVariables`, `verbatimModuleSyntax` |
| **Styling**          | Tailwind CSS           | v4.3.x                              | CSS-first `@theme` config, no `tailwind.config.js`                  |
| **API layer**        | tRPC                   | v11.18.x                            | End-to-end type safety, server-side caller for RSC, React Query integration. 5 procedure tiers: public/protected/staff/manager/owner (ADR-008) |
| **Validation**       | Zod                    | ^4.4.0                              | Input validation (env, Server Actions, tRPC procedures). Use `z.email()` (NOT `z.string().email()`), `z.url({ protocol: /^https:$/ })` (NOT `z.string().url()`) per ADR-018 |
| **ORM**              | Drizzle ORM            | 0.45.x                              | Type-safe SQL, migration system, no runtime overhead                |
| **Database**         | PostgreSQL             | 17 (Neon in prod, Docker locally)   | Relational integrity, JSONB for flexible content, `ilike` for Phase 1 search (ADR-012), `pg_advisory_xact_lock` for webhook idempotency (ADR-014) |
| **Authentication**   | Better Auth            | 1.6.23                              | Replaces Auth.js v5 — better OAuth, magic links, session control    |
| **Payments**         | Stripe                 | 22.3.x (Dahlia)                     | Payment Intents (ADR-009), Webhooks (idempotent via ADR-014), Stripe Tax via `automatic_tax` |
| **Background jobs**  | Trigger.dev            | v4                                  | Webhook processing, abandoned cart emails, digest emails            |
| **CMS**              | Sanity                 | v6 (Studio) + v7 client             | Headless, real-time, Live Preview, GROQ queries                     |
| **Email**            | Resend + React Email   | 6.17 / 6.6                          | Transactional emails, type-safe templates                           |
| **Image CDN**        | Cloudflare Images + R2 | —                                   | On-the-fly optimization, variants, cost-effective storage           |
| **Error tracking**   | Sentry                 | 10.63.x                             | Next.js integration, source maps, performance monitoring            |
| **Analytics**        | PostHog                | 1.396.x                             | Privacy-friendly, session replay, feature flags                     |
| **Logging**          | Axiom                  | —                                   | Structured logs, OpenTelemetry-compatible                           |
| **Hosting**          | Vercel                 | —                                   | Next.js optimised, edge functions, ISR                              |
| **Database hosting** | Neon                   | —                                   | Serverless Postgres, branching, point-in-time recovery              |
| **Rate limiting**    | Upstash Redis          | —                                   | Serverless Redis, sliding window, fail-open pattern                 |

### 8.2 Monorepo Structure (Turborepo)

Adapted from Stillwater's battle-tested layout:

```
maison/
├── apps/
│   ├── web/                          # Next.js 16 storefront + admin (single app, route groups)
│   │   ├── src/app/
│   │   │   ├── (shop)/               # Public storefront
│   │   │   ├── (account)/            # Customer dashboard (auth required)
│   │   │   ├── (admin)/              # Admin surface (RBAC-gated)
│   │   │   ├── api/                  # Route handlers (tRPC, webhooks, auth)
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── globals.css           # Tailwind v4 @theme + base styles
│   │   │   ├── sitemap.ts            # Dynamic sitemap
│   │   │   ├── robots.ts             # robots.txt
│   │   │   └── manifest.ts           # PWA manifest
│   │   ├── src/components/           # App-specific components
│   │   ├── src/lib/                  # App-specific lib (trpc, sanity, stripe)
│   │   ├── src/hooks/                # React hooks
│   │   ├── proxy.ts                  # Auth + locale middleware (Next.js 16)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts        # Minimal (v4 CSS-first)
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── studio/                       # Sanity Studio (CMS admin)
│       ├── schemas/                  # Content schemas
│       ├── sanity.config.ts
│       └── package.json
├── packages/
│   ├── auth/                         # @maison/auth — Better Auth config, RBAC
│   ├── db/                           # @maison/db — Drizzle schema, migrations, seed
│   │   ├── src/schema/               # Table definitions (one file per entity)
│   │   ├── drizzle/migrations/       # Generated SQL migrations
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   ├── api/                          # @maison/api — tRPC routers (product, cart, order, admin)
│   │   ├── src/routers/              # One file per router
│   │   ├── src/middleware/           # Rate limiting, auth checks
│   │   ├── src/trpc.ts               # tRPC init
│   │   └── package.json
│   ├── payments/                     # @maison/payments — Stripe client, webhook handlers
│   ├── ui/                           # @maison/ui — Design tokens, shared components
│   │   ├── src/tokens/               # colors.css, typography.css, motion.css, spacing.css
│   │   ├── src/fonts/                # Self-hosted Cormorant Garamond + Inter woff2
│   │   └── package.json
│   ├── email/                        # @maison/email — React Email templates
│   │   ├── src/templates/            # OrderConfirmation, ShippingUpdate, etc.
│   │   └── package.json
│   └── config/                       # @maison/config — Shared env, site config, env-validator
├── services/
│   └── workers/                      # Trigger.dev v4 background jobs
│       ├── src/                      # Job definitions (one file per job)
│       └── package.json
├── tooling/
│   ├── eslint-config/                # Shared ESLint flat config
│   ├── typescript-config/            # Shared tsconfig bases
│   └── tailwind-config/              # Shared Tailwind preset
├── infrastructure/
│   └── postgres/
│       └── init/                     # Docker init scripts (extensions, etc.)
├── e2e/                              # Playwright E2E tests
├── docs/                             # PRD, PAD, skill docs, design references
├── skills/                           # ClawHub skills (already present)
├── .env.example                      # Environment variable template
├── docker-compose.yml                # Local Postgres + Redis
├── pnpm-workspace.yaml               # Workspace config + supply chain guardrails
├── turbo.json                        # Task pipeline definition
├── package.json                      # Root scripts (dev, build, test, db:*)
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── PROJECT-ARCHITECTURE.md
└── .gitignore
```

### 8.3 Architectural Principles

1. **Five-layer separation + 2-layer auth** (per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill + ADR-010):
   - Layer 0: `packages/db` — raw schema, no business logic
   - Layer 1: `packages/api` — tRPC routers, business logic, calls Layer 0
   - Layer 2: `apps/web/src/lib` — server-side callers (tRPC server caller, Stripe client, Sanity client)
   - Layer 3: `apps/web/src/components` — React Server Components (call Layer 2)
   - Layer 4: `apps/web/src/components` ("use client") — Client Components (call Layer 1 via tRPC client)

2. **Server-first by default.** Every page is a React Server Component unless it explicitly needs interactivity. Client Components are isolated and marked with `"use client"`.

3. **Type safety end-to-end.** Drizzle schema → tRPC input/output schemas (Zod) → React component props. No `any` types in production code.

4. **URL-driven state.** Filters, sort, pagination, and modal state live in the URL (via `nuqs`). State is shareable, bookmarkable, and survives refresh.

5. **Idempotent mutations.** Every mutating tRPC procedure that touches payments or inventory accepts an idempotency key. Retries are safe.

6. **Fail-open on rate limiting.** If Upstash Redis is unavailable, rate limiting fails open (allows the request) rather than blocking legitimate users. Logged for review.

7. **Anti-generic UI.** Per `skills/avant-garde-design-v4` (refined for v2 — see §4.1): no L/R hero split, no purple/indigo, no neon accents. Bento grids permitted only for category navigation (one per page). Mesh gradients permitted only as decorative atmosphere behind editorial sections (max one per page). Glassmorphism permitted only on sticky chrome and floating cards. Every section earns its place.
8. **2-layer auth pattern** (per ADR-010). Layer 1 (`proxy.ts`): `getSessionCookie(request)` — cookie-existence-only, NO DB, NO RBAC, Edge-compatible. Layer 2 (Server Component layouts): `auth.api.getSession({ headers: await headers() })` + `requireRole(...roles)` — full validation, DB-backed. Anti-pattern: calling `auth.api.getSession()` inside `proxy.ts` (verified by `rg 'auth\.api\.getSession' apps/web/proxy.ts` → MUST return zero matches).

### 8.4 Architectural Decision Records (ADRs)

> Full ADRs are documented in `PROJECT-ARCHITECTURE.md` §1.3. Summary here:

| ADR     | Decision                                    | Rationale                                                                                     |
| ------- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ADR-001 | Turborepo monorepo over single-app          | Shared packages (db, auth, ui) across web + studio + workers; proven in Stillwater            |
| ADR-002 | Better Auth over Auth.js v5                 | Better OAuth reliability, magic links built-in, simpler session model; per Stillwater lessons |
| ADR-003 | tRPC v11 over REST/GraphQL                  | End-to-end type safety without codegen; server-side caller for RSC; React Query integration   |
| ADR-004 | Drizzle ORM over Prisma                     | SQL-first, smaller bundle, no Rust binary, better edge runtime support                        |
| ADR-005 | Sanity CMS over Strapi/Contentful           | Real-time preview, GROQ queries, excellent Next.js integration; proven in Stillwater          |
| ADR-006 | `proxy.ts` over `middleware.ts`             | Next.js 16 breaking change — `proxy.ts` is the new convention; supports async                 |
| ADR-007 | Self-hosted fonts (woff2) over Google Fonts | Privacy, performance (no third-party connection), layout stability                            |
| ADR-008 | tRPC procedure tiers: public/protected/staff/manager/owner | Aligns with Stillwater v3.0.0 §15.17; `admin`/`adminWrite` are not valid tRPC v11 tier names |
| ADR-009 | Stripe Payment Intents (chosen implementation) | Supports Stripe Elements, server-side confirmation, Apple Pay/Google Pay via `paymentMethodTypes`. Checkout Sessions rejected because the codebase needs granular control over the payment flow for the 3-step Maison checkout UX. PCI SAQ-A scope retained (card data never touches our servers). |
| ADR-010 | 2-layer auth pattern (cookie-only proxy + DB-backed layouts) | Performance (no DB query per request in proxy); aligns with Stillwater ADR-009 |
| ADR-011 | WCAG 2.2 AAA target (stricter than ADA Title II AA) | Aligns with Stillwater §8; 7:1 contrast, 44×44px targets, 3px focus rings |
| ADR-012 | Phase 1 search via Drizzle `ilike` (not FTS) | 13 v1 SKUs (now 20) doesn't justify FTS; aligns with Stillwater Lesson 80 |
| ADR-013 | Email/password enabled (hybrid auth) | E-commerce conversion research; diverges from Stillwater passwordless — documented tradeoff |
| ADR-014 | Webhook idempotency via UNIQUE INDEX + `pg_advisory_xact_lock` | Dual-defense pattern; aligns with Stillwater ADR-004 |
| ADR-015 | Source resolution via `transpilePackages` + `@maison/source` | No `tsc --build` before `next build`; aligns with Stillwater ADR-011 |
| ADR-016 | Trigger.dev v4 root SDK import (`@trigger.dev/sdk`) | v3 deprecated April 1, 2026; `/v4` subpath doesn't exist |
| ADR-017 | React 19 `SubmitEvent` + `ClientOnly` boundary | `FormEvent` deprecated; `useSession()` crashes SSR without `ClientOnly` |
| ADR-018 | Zod v4 input validation patterns | `z.email()` not `z.string().email()`; `z.url({ protocol })` not `z.string().url()` |
| ADR-019 | Coverage thresholds aligned to Stillwater | api 90 / payments 95 / db 80 / web 70 / workers 85 |
| ADR-020 | `erasableSyntaxOnly` — no `enum`/`namespace` | Use `pgEnum()` + string unions; aligns with Stillwater §2.1 |

---

## 9. Data Architecture

### 9.1 Database Schema Overview

PostgreSQL 17 with Drizzle ORM. Schema lives in `packages/db/src/schema/` (one file per entity, re-exported from `index.ts`).

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ accounts : has
    users ||--|| customers : is
    customers ||--o{ orders : places
    customers ||--o{ addresses : has
    customers ||--o{ wishlist_items : saves
    orders ||--{ line_items : contains
    orders ||--|| addresses : ships_to
    line_items }o--|| products : references
    products }o--|| collections : belongs_to
    products ||--o{ product_images : has
    products ||--o{ product_variants : has
    carts ||--o{ cart_items : contains
    cart_items }o--|| products : references
    carts }o--|| customers : owned_by_optional
```

### 9.2 Key Tables

> **Total: 24 tables.** The Phase 1 schema includes 15 tables (users, sessions, accounts, verifications, customers, addresses, collections, products, product_variants, product_images, carts, cart_items, orders, line_items, audit_log) plus `wishlist_items` and `discounts` (Phase 2) and the Phase 3 additions: `product_reviews`, `gift_cards`, `gift_card_redemptions`, `trade_applications`, `loyalty_accounts`, `loyalty_transactions`. Idempotency is enforced via the `payment_events` table (ADR-014). The `accounts` + `verifications` tables are Better Auth managed (were implicit in v1.1, now documented explicitly per the actual `packages/db/src/schema/` listing). All `enum(...)` syntax in this section reflects Drizzle `pgEnum(...)` usage per ADR-020 (no TypeScript `enum` keyword).

#### `users` (Better Auth managed)

- `id` text PK
- `email` text unique not null
- `email_verified` boolean default false
- `name` text
- `image` text (avatar URL)
- `role` pgEnum('user_role', ['customer', 'staff', 'manager', 'owner']) default 'customer' (per ADR-008 + ADR-020 — no TS `enum`; matches the actual `packages/db/src/schema/users.ts`)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `sessions` (Better Auth managed)

- `id` text PK
- `user_id` text FK → users
- `expires_at` timestamptz
- `ip_address` text
- `user_agent` text

#### `accounts` (Better Auth managed — OAuth/magic-link credential linkage)

- `id` text PK
- `user_id` text FK → users
- `account_id` text (provider-scoped account identifier)
- `provider_id` text (e.g., `google`, `apple`, `magic_link`, `credential`)
- `access_token` text (encrypted at rest)
- `refresh_token` text (encrypted at rest)
- `access_token_expires_at` timestamptz
- `refresh_token_expires_at` timestamptz
- `scope` text
- `id_token` text (encrypted at rest, for OIDC providers)
- `password` text (Better Auth hash — only populated for `credential` provider accounts per ADR-013)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `verifications` (Better Auth managed — email/reset tokens)

- `id` text PK
- `identifier` text (email address or other identifier)
- `value` text (the verification token / hash)
- `expires_at` timestamptz
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `customers`

- `id` uuid PK default gen_random_uuid()
- `user_id` text FK → users (one-to-one)
- `first_name` text
- `last_name` text
- `phone` text
- `newsletter_subscribed` boolean default false
- `notes` text (admin-visible only)
- `created_at` timestamptz

#### `addresses`

- `id` uuid PK
- `customer_id` uuid FK → customers
- `label` text (Home, Work, etc.)
- `line1` text not null
- `line2` text
- `city` text not null
- `region` text (state/county)
- `postal_code` text not null
- `country` text not null (ISO 3166-1 alpha-2)
- `is_default_shipping` boolean default false
- `is_default_billing` boolean default false

#### `collections`

- `id` uuid PK
- `slug` text unique not null
- `name` text not null
- `description` text
- `hero_image_url` text
- `hero_image_alt` text
- `sort_order` integer default 0
- `is_active` boolean default true
- `seo_title` text
- `seo_description` text
- `created_at` timestamptz
- `updated_at` timestamptz

#### `products`

- `id` uuid PK
- `slug` text unique not null
- `name` text not null
- `collection_id` uuid FK → collections
- `price_cents` integer not null (stored in cents, not dollars)
- `compare_at_price_cents` integer (for sale display)
- `currency` char(3) default 'USD'
- `short_description` text (card display)
- `long_description` text (PDP, rich text from Sanity)
- `materials` text
- `dimensions` text
- `weight_grams` integer (for shipping)
- `featured` boolean default false
- `is_new` boolean default false
- `is_bestseller` boolean default false
- `is_active` boolean default true
- `seo_title` text
- `seo_description` text
- `og_image_url` text
- `created_at` timestamptz
- `updated_at` timestamptz

#### `product_variants`

- `id` uuid PK
- `product_id` uuid FK → products
- `sku` text unique not null
- `name` text (e.g., "Sand", "Oak / Natural")
- `price_cents` integer (override of product price, nullable)
- `stock_quantity` integer default 0
- `lead_time_days` integer (0 if in stock, >0 if made-to-order)
- `is_active` boolean default true

#### `product_images`

- `id` uuid PK
- `product_id` uuid FK → products
- `url` text not null
- `alt_text` text
- `sort_order` integer default 0

#### `carts`

- `id` uuid PK
- `customer_id` uuid FK → customers (nullable for anonymous carts)
- `anonymous_id` text (cookie ID, nullable)
- `currency` char(3) default 'USD'
- `created_at` timestamptz
- `updated_at` timestamptz

#### `cart_items`

- `id` uuid PK
- `cart_id` uuid FK → carts
- `product_id` uuid FK → products
- `variant_id` uuid FK → product_variants (nullable)
- `quantity` integer not null check (quantity > 0 and quantity < 100)
- `created_at` timestamptz

#### `orders`

- `id` uuid PK
- `order_number` text unique not null (human-readable, e.g., "MAI-2026-00142")
- `customer_id` uuid FK → customers (nullable for guest orders)
- `email` text not null (snapshot at order time)
- `status` pgEnum('order_status', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
- `subtotal_cents` integer not null
- `shipping_cost_cents` integer not null
- `tax_cents` integer not null
- `discount_cents` integer default 0
- `total_cents` integer not null
- `currency` char(3) default 'USD'
- `shipping_address` jsonb (snapshot)
- `billing_address` jsonb (snapshot)
- `shipping_method` text
- `tracking_number` text
- `tracking_url` text
- `stripe_payment_intent_id` text (Stripe Payment Intent ID — per ADR-009 Payment Intents implementation)
- `placed_at` timestamptz
- `shipped_at` timestamptz
- `delivered_at` timestamptz
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `line_items`

- `id` uuid PK
- `order_id` uuid FK → orders
- `product_id` uuid FK → products (snapshot reference)
- `variant_id` uuid FK → product_variants (nullable)
- `product_name` text (snapshot at order time)
- `variant_name` text (snapshot)
- `price_cents` integer (snapshot)
- `quantity` integer
- `image_url` text (snapshot)

#### `wishlist_items`

- `id` uuid PK
- `customer_id` uuid FK → customers
- `product_id` uuid FK → products
- `created_at` timestamptz
- Unique constraint on (customer_id, product_id)

#### `discounts` (Phase 2)

- `id` uuid PK
- `code` text unique not null
- `type` pgEnum('discount_type', ['percentage', 'fixed', 'free_shipping'])
- `value` integer (percentage 0–100 or cents)
- `min_order_cents` integer
- `max_uses` integer
- `uses_count` integer default 0
- `starts_at` timestamptz
- `ends_at` timestamptz
- `is_active` boolean default true

#### `audit_log` (admin actions)

- `id` uuid PK
- `actor_user_id` text FK → users
- `action` text (e.g., 'product.update', 'order.refund')
- `entity_type` text
- `entity_id` text
- `diff` jsonb (before/after)
- `ip_address` text
- `user_agent` text
- `created_at` timestamptz default now()

#### `payment_events` (Stripe webhook idempotency — ADR-014)

- `id` uuid PK default gen_random_uuid()
- `stripe_event_id` text unique not null (Stripe's `evt_...` ID — UNIQUE INDEX enforces idempotency)
- `event_type` text (e.g., `payment_intent.succeeded`, `charge.refunded`)
- `resource_id` text (Stripe object ID, e.g., `pi_...`, `ch_...`)
- `payload` jsonb (raw Stripe event body for replay/debug)
- `processed_at` timestamptz default now()
- `status` text (`processed` / `failed` / `ignored`)
- `error` text (failure reason, nullable)
- `created_at` timestamptz default now()
- Note: dual-defense pattern — fast-path `stripe_event_id` lookup outside the transaction, then `pg_advisory_xact_lock` + double-check inside the transaction per ADR-014

#### `product_reviews` (Phase 3)

- `id` uuid PK default gen_random_uuid()
- `product_id` uuid FK → products
- `customer_id` uuid FK → customers
- `order_id` uuid FK → orders (verified-purchase gating)
- `rating` integer not null check (rating >= 1 and rating <= 5)
- `title` text
- `body` text not null
- `photo_urls` text[] (optional customer-uploaded photos)
- `is_published` boolean default false (moderation queue)
- `published_at` timestamptz
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()
- Unique constraint on (customer_id, product_id) — one review per customer per product

#### `gift_cards` (Phase 3)

- `id` uuid PK default gen_random_uuid()
- `code` text unique not null (customer-facing gift-card code)
- `initial_balance_cents` integer not null
- `remaining_balance_cents` integer not null
- `currency` char(3) default 'USD'
- `purchaser_order_id` uuid FK → orders (the order that bought the gift card)
- `recipient_email` text
- `recipient_name` text
- `message` text (gift message)
- `expires_at` timestamptz (nullable — no expiry if null)
- `is_active` boolean default true
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `gift_card_redemptions` (Phase 3)

- `id` uuid PK default gen_random_uuid()
- `gift_card_id` uuid FK → gift_cards
- `order_id` uuid FK → orders (the order that redeemed the gift card)
- `amount_cents` integer not null
- `currency` char(3) default 'USD'
- `redeemed_at` timestamptz default now()

#### `trade_applications` (Phase 3)

- `id` uuid PK default gen_random_uuid()
- `customer_id` uuid FK → customers (nullable until approved)
- `applicant_name` text not null
- `applicant_email` text not null
- `business_name` text
- `business_type` text (e.g., 'interior_designer', 'architect', 'trade_buyer')
- `website_url` text
- `linkedin_url` text
- `tax_id` text (resale certificate / VAT ID)
- `status` pgEnum('trade_application_status', ['pending', 'approved', 'rejected', 'revoked']) default 'pending'
- `discount_percent` integer (approved tier discount — 10/15/20)
- `reviewer_user_id` text FK → users (admin who approved/rejected)
- `reviewed_at` timestamptz
- `notes` text (internal admin notes)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `loyalty_accounts` (Phase 3)

- `id` uuid PK default gen_random_uuid()
- `customer_id` uuid FK → customers unique
- `points_balance` integer default 0
- `lifetime_points` integer default 0
- `tier` pgEnum('loyalty_tier', ['bronze', 'silver', 'gold', 'platinum']) default 'bronze'
- `tier_reached_at` timestamptz
- `enrolled_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `loyalty_transactions` (Phase 3)

- `id` uuid PK default gen_random_uuid()
- `loyalty_account_id` uuid FK → loyalty_accounts
- `order_id` uuid FK → orders (nullable for non-order adjustments)
- `type` pgEnum('loyalty_tx_type', ['earn', 'redeem', 'adjust', 'expire'])
- `points` integer not null (positive for earn, negative for redeem/expire)
- `reason` text (e.g., 'order_purchase', 'redemption', 'tier_bonus', 'manual_adjustment')
- `actor_user_id` text FK → users (admin who performed manual adjustment, nullable)
- `created_at` timestamptz default now()

### 9.3 Persistence Strategy

- **Connection pooling:** Neon serverless pooler for application queries (`DATABASE_URL`); direct connection for migrations (`DATABASE_URL_UNPOOLED`) — PgBouncer breaks prepared statements in migration scripts.
- **Migrations:** Drizzle Kit `generate` (create SQL from schema diff) → `migrate` (apply). Migrations are version-controlled in `packages/db/drizzle/migrations/` with a `_journal.json` manifest.
- **Indexing:** GIN index on `products.slug`, `collections.slug`, `orders.order_number`. B-tree on foreign keys. Phase 1 search uses Drizzle `ilike` queries (per ADR-012). FTS via `tsvector`/GIN is deferred to Phase 2 if `ilike` proves insufficient.
- **Soft deletes:** Products use `is_active = false` (never hard-delete — preserve order line item integrity). Orders are never deleted; cancelled orders retain `status = 'cancelled'`.

---

## 10. API Surface (tRPC Router Catalog)

tRPC v11 routers live in `packages/api/src/routers/`. Each router is mounted in `packages/api/src/root.ts`.

> **Total: 13 routers.** Public (5): `products`, `collections`, `cart`, `newsletter`, `contact`. Customer (2): `account` (wishlist operations merged in here), `checkout`. Admin (6): `admin` (consolidates products/collections/orders/customers/inventory/auditLog sub-namespaces), `discounts`, `reviews`, `trade`, `gift-cards`, `loyalty`. The deprecated `adminProcedure` / `adminWriteProcedure` aliases have been removed from code; use the 5 procedure tiers (`publicProcedure` / `protectedProcedure` / `staffProcedure` / `managerProcedure` / `ownerProcedure`) per ADR-008.

### 10.1 Public Routers (no auth — 5 routers: `products`, `collections`, `cart`, `newsletter`, `contact`)

| Procedure               | Type     | Input                                          | Output                      | Purpose                                          |
| ----------------------- | -------- | ---------------------------------------------- | --------------------------- | ------------------------------------------------ |
| `products.list`         | query    | `{ collection?, sort?, cursor?, limit? }`      | `{ items[], nextCursor? }`  | Paginated product listing                        |
| `products.getBySlug`    | query    | `{ slug }`                                     | `Product`                   | Single product for PDP                           |
| `products.getRelated`   | query    | `{ productId, limit? }`                        | `Product[]`                 | Related products (same collection)               |
| `products.search`       | query    | `{ q, limit? }`                                | `Product[]`                 | Full-text search                                 |
| `collections.list`      | query    | —                                              | `Collection[]`              | All active collections                           |
| `collections.getBySlug` | query    | `{ slug }`                                     | `Collection & { products }` | Collection + its products                        |
| `cart.get`              | query    | `{ cartId? }`                                  | `Cart & { items }`          | Current cart contents                            |
| `cart.addItem`          | mutation | `{ cartId?, productId, variantId?, quantity }` | `{ cartId, cart }`          | Add to cart (creates cart if none)               |
| `cart.updateItem`       | mutation | `{ cartId, itemId, quantity }`                 | `Cart`                      | Update quantity or remove (qty=0)                |
| `cart.merge`            | mutation | `{ anonymousCartId, customerCartId }`          | `Cart`                      | Merge anonymous cart into customer cart on login |
| `newsletter.subscribe`  | mutation | `{ email, source? }`                           | `{ success }`               | Subscribe to newsletter (syncs to Klaviyo)       |
| `contact.submit`        | mutation | `{ name, email, message }`                     | `{ success }`               | Contact form (sends email via Resend)            |

### 10.2 Customer Routers (auth required — 2 routers: `account`, `checkout`)

> Note: wishlist operations were merged into the `account` router (no standalone `wishlist` router exists). `wishlist.list` → `account.listWishlist`, `wishlist.toggle` → `account.toggleWishlist`.

| Procedure                      | Type     | Input                                         | Output                      | Purpose                                     |
| ------------------------------ | -------- | --------------------------------------------- | --------------------------- | ------------------------------------------- |
| `account.getProfile`           | query    | —                                             | `Customer`                  | Current customer profile                    |
| `account.updateProfile`        | mutation | `{ firstName?, lastName?, phone? }`           | `Customer`                  | Update profile                              |
| `account.deleteAccount`        | mutation | `{ confirmEmail }`                            | `{ success }`               | GDPR right to erasure                       |
| `account.listOrders`           | query    | `{ cursor? }`                                 | `{ items[], nextCursor? }`  | Order history                               |
| `account.getOrder`             | query    | `{ orderNumber }`                             | `Order & { lineItems }`     | Order detail                                |
| `account.listAddresses`        | query    | —                                             | `Address[]`                 | Saved addresses                             |
| `account.upsertAddress`        | mutation | `AddressInput`                                | `Address`                   | Create/update address                       |
| `account.deleteAddress`        | mutation | `{ addressId }`                               | `{ success }`               | Delete address                              |
| `account.listWishlist`         | query    | —                                             | `Product[]`                 | Wishlist contents (merged from `wishlist` router) |
| `account.toggleWishlist`       | mutation | `{ productId }`                               | `{ isWishlisted }`          | Add/remove wishlist item (merged from `wishlist` router) |
| `checkout.createPaymentIntent` | mutation | `{ cartId, shippingAddress, shippingMethod }` | `{ clientSecret, orderId }` | Create Stripe PaymentIntent + pending order (per flipped ADR-009) |
| `checkout.confirmOrder`        | mutation | `{ orderId, paymentIntentId }`                | `{ orderNumber }`           | Confirm order after Stripe confirmation     |
| `checkout.applyDiscount`       | mutation | `{ cartId, code }`                            | `Cart`                      | Apply promo code                            |

### 10.3 Admin Routers (RBAC: `staff`, `manager`, or `owner` via `staffProcedure` / `managerProcedure` / `ownerProcedure` per ADR-008 — 6 routers: `admin`, `discounts`, `reviews`, `trade`, `gift-cards`, `loyalty`)

> The consolidated `admin` router contains all admin operations on products/collections/orders/customers/inventory/auditLog (the previous separation into 7 sub-routers was collapsed into a single `admin` router with sub-namespaces like `admin.products.*`, `admin.orders.*`). The `discounts`, `reviews`, `trade`, `gift-cards`, and `loyalty` routers are separate top-level routers (Phase 2/3 features). The deprecated `adminProcedure` / `adminWriteProcedure` aliases have been removed; use `staffProcedure` / `managerProcedure` / `ownerProcedure`.

| Procedure                   | Type     | Input                               | Output                  | Purpose                              |
| --------------------------- | -------- | ----------------------------------- | ----------------------- | ------------------------------------ |
| `admin.products.list`       | query    | `{ search?, collection?, status? }` | `Product[]`             | Admin product table                  |
| `admin.products.create`     | mutation | `ProductInput`                      | `Product`               | Create product                       |
| `admin.products.update`     | mutation | `{ id, ...fields }`                 | `Product`               | Update product                       |
| `admin.products.delete`     | mutation | `{ id }`                            | `{ success }`           | Soft-delete (is_active = false)      |
| `admin.collections.*`       | —        | —                                   | —                       | Collection CRUD (mirror of products) |
| `admin.orders.list`         | query    | `{ status?, dateRange? }`           | `Order[]`               | Admin order list                     |
| `admin.orders.updateStatus` | mutation | `{ id, status, trackingNumber? }`   | `Order`                 | Fulfillment actions                  |
| `admin.orders.refund`       | mutation | `{ id, amountCents?, reason }`      | `Order`                 | Stripe refund (admin only)           |
| `admin.customers.list`      | query    | `{ search? }`                       | `Customer[]`            | Customer directory                   |
| `admin.customers.get`       | query    | `{ id }`                            | `Customer & { orders }` | Customer detail                      |
| `admin.inventory.list`      | query    | `{ lowStockOnly? }`                 | `Variant[]`             | Stock levels                         |
| `admin.inventory.update`    | mutation | `{ variantId, stockQuantity }`      | `Variant`               | Restock                              |
| `admin.discounts.*`         | —        | —                                   | —                       | Discount CRUD (Phase 2)              |
| `admin.auditLog.list`       | query    | `{ actorId?, action?, dateRange? }` | `AuditLog[]`            | Admin action history                 |

### 10.4 Webhook Endpoints (Route Handlers, not tRPC)

| Endpoint                    | Source      | Purpose                                                                     |
| --------------------------- | ----------- | --------------------------------------------------------------------------- |
| `POST /api/webhooks/stripe` | Stripe      | `payment_intent.succeeded`, `charge.refunded` |
| `POST /api/webhooks/sanity` | Sanity      | Content publish → ISR revalidation                                          |
| `POST /api/auth/[...all]`   | Better Auth | Auth callbacks (sign-in, sign-out, OAuth)                                   |
| `GET /api/og/[...slug]`     | Internal    | Dynamic OpenGraph image generation (`@vercel/og`)                           |

---

## 11. Non-Functional Requirements

### 11.1 Performance

| Metric                          | Target                                        | Measurement                     |
| ------------------------------- | --------------------------------------------- | ------------------------------- |
| LCP (Largest Contentful Paint)  | < 2.0s (p75)                                  | Lighthouse CI, Vercel Analytics |
| INP (Interaction to Next Paint) | < 200ms                                       | Web Vitals                      |
| CLS (Cumulative Layout Shift)   | < 0.1                                         | Web Vitals                      |
| TTFB (Time to First Byte)       | < 600ms                                       | Vercel Edge                     |
| Lighthouse Performance score    | ≥ 90                                          | Lighthouse CI in PR checks      |
| JS bundle (initial route)       | < 200KB gzipped                               | `@next/bundle-analyzer`         |
| Image format                    | AVIF (primary), WebP (fallback), JPG (legacy) | `next/image` defaults           |
| Font loading                    | Self-hosted woff2 with `font-display: swap`   | No third-party font CDN         |

### 11.2 SEO

- Server-side rendering for all public pages (RSC + ISR where appropriate)
- Structured data (JSON-LD): `Product`, `ItemList`, `BreadcrumbList`, `Organization`, `WebSite`, `BlogPosting`
- Dynamic meta tags per page (via `generateMetadata`)
- XML sitemap auto-generated at `/sitemap.xml` (includes products, collections, journal)
- Canonical URLs on all pages
- Open Graph + Twitter Card meta tags
- Image alt text and descriptive filenames
- `robots.txt` allowing all public routes, blocking `/admin`, `/account`, `/api`
- Core Web Vitals optimisation (image sizing, font preloading, minimal client JS)

### 11.3 Internationalisation (Phase 2)

- Multi-region: US (default), EU, UK
- Localised pricing: stored in `price_cents` + `currency` per product; displayed via region detection
- Localised shipping & tax: Stripe Tax via `automatic_tax: { enabled: true }` in Payment Intent params (already available in v1 via ADR-009 — Phase 3 adds multi-region tax rules)
- Language: English only in v1; German, French, Danish in Phase 2
- URL strategy: `/{region}/products` (e.g., `/eu/products`, `/uk/products`); default region rootless

### 11.4 Scalability

- CDN for all static assets and images (Vercel Edge + Cloudflare Images)
- Edge caching for product listings (ISR with `revalidate: 60`)
- Database connection pooling (Neon serverless pooler)
- Horizontal scaling readiness (stateless app servers, Redis for sessions if needed)
- Support for 10K+ concurrent users at peak (holiday season)
- Image lazy loading and responsive `srcset` via `next/image`

---

## 12. Security & Compliance

### 12.1 Security Posture (OWASP 2025 Top 10)

| Threat                          | Mitigation                                                                            | Enforcement                               |
| ------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| A01 — Broken Access Control     | Better Auth sessions, RBAC roles, `proxy.ts` route protection                         | tRPC middleware + `proxy.ts`              |
| A02 — Cryptographic Failures    | TLS 1.3, AES-256 at rest (Neon), no plaintext secrets                                 | Vercel auto-TLS, Neon encryption          |
| A03 — Injection                 | Drizzle parameterised queries, Zod input validation                                   | tRPC input parsers, ESLint rules          |
| A04 — Insecure Design           | Threat modelling per feature, secure-by-default patterns                              | Pre-PR review checklist                   |
| A05 — Security Misconfiguration | `next.config.ts` CSP headers, `proxy.ts` security headers                             | CI gate (CSP verify test, per Stillwater) |
| A06 — Vulnerable Components     | `pnpm audit --audit-level=high` in CI, `minimumReleaseAge: 1440` (supply-chain guard) | `pnpm-workspace.yaml`, CI workflow        |
| A07 — Auth Failures             | Better Auth, rate-limited login, account lockout after 5 failed attempts              | Better Auth config + Upstash rate limit   |
| A08 — Data Integrity Failures   | Signed Sanity webhooks, Stripe webhook signature verification                         | Webhook route handlers                    |
| A09 — Logging Failures          | Structured logs to Axiom, Sentry for errors, audit log for admin actions              | `packages/api/src/middleware`             |
| A10 — SSRF                      | Egress allowlist on server-side fetches (Stripe, Sanity, Resend only)                 | `next.config.ts` + runtime checks         |

### 12.2 PCI DSS

- Stripe handles all card data — no card numbers ever touch our servers (PCI SAQ-A scope)
- Stripe Payment Intents (not Checkout Sessions — per ADR-009) for all checkouts
- Webhook signature verification on all Stripe events
- Idempotency keys on order creation to prevent duplicate charges

### 12.3 GDPR / CCPA

- Cookie consent banner (Phase 2 — needed before analytics)
- Right to erasure: `account.deleteAccount` procedure cascades to customer data, addresses, wishlist; orders retained for 7 years (tax law) with PII stripped
- Data export: `account.exportData` returns JSON of all customer data (Phase 2)
- Privacy policy, terms of service, cookie policy pages (SSR-rendered, SEO-indexed)
- Newsletter: double opt-in, unsubscribe link in every email

### 12.4 Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.sanity.io;
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://api.stripe.com https://api.sanity.io https://api.posthog.com https://api.resend.com;
frame-src https://js.stripe.com https://hooks.stripe.com;
base-uri 'self';
form-action 'self' https://api.stripe.com;
```

Enforced via `next.config.ts` headers + verified by CI test (per Stillwater pattern).

---

## 13. Third-Party Integrations

| Service                    | Purpose                                                         | Tier      | Phase |
| -------------------------- | --------------------------------------------------------------- | --------- | ----- |
| **Stripe**                 | Payment Intents + Stripe Elements (cards, Apple Pay, Google Pay, Tax), Webhooks (idempotent via ADR-014) | Essential | 1     |
| **Vercel**                 | Hosting, Edge functions, ISR, Analytics                         | Essential | 1     |
| **Neon**                   | Serverless PostgreSQL 17                                        | Essential | 1     |
| **Sanity**                 | Headless CMS (products, collections, journal, homepage content) | Essential | 1     |
| **Cloudflare Images + R2** | Image CDN, media storage                                        | Essential | 1     |
| **Resend**                 | Transactional email (order confirmations, password reset)       | Essential | 1     |
| **React Email**            | Type-safe email templates                                       | Essential | 1     |
| **Better Auth**            | Authentication (email/password + Magic Link + Google OAuth — hybrid per ADR-013, sessions) | Essential | 1     |
| **Upstash Redis**          | Rate limiting, idempotency keys                                 | Essential | 1     |
| **Trigger.dev**            | Background jobs (abandoned cart, digests)                       | Essential | 1     |
| **Sentry**                 | Error tracking, performance monitoring                          | Essential | 1     |
| **PostHog**                | Product analytics, session replay, feature flags                | Essential | 1     |
| **Axiom**                  | Structured log aggregation                                      | Essential | 1     |
| **Klaviyo**                | Marketing email (newsletter, abandoned cart)                    | Growth    | 2     |
| **Algolia**                | Faceted product search (if `ilike` insufficient per ADR-012)    | Growth    | 2     |
| **Google Places API**      | Address autocomplete at checkout                                | Growth    | 2     |

---

## 14. Analytics & Tracking

### 14.1 Events Catalog (PostHog)

| Event               | Trigger                    | Properties                                                                           |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `page_view`         | Any page load (RSC render) | `path`, `referrer`, `utm_params`                                                     |
| `product_view`      | PDP loaded                 | `product_id`, `collection`, `price_cents`                                            |
| `product_list_view` | PLP loaded                 | `collection`, `sort`, `filters`, `result_count`                                      |
| `search`            | Search performed           | `query`, `results_count`                                                             |
| `add_to_cart`       | Add to bag clicked         | `product_id`, `variant_id`, `price_cents`, `quantity`, `source` (card/pdp/quickview) |
| `remove_from_cart`  | Item removed               | `product_id`, `quantity`                                                             |
| `begin_checkout`    | Checkout step 1 reached    | `cart_value_cents`, `item_count`                                                     |
| `add_shipping_info` | Shipping step completed    | `shipping_method`, `shipping_cost_cents`                                             |
| `add_payment_info`  | Payment step completed     | `payment_method` (card/apple_pay/google_pay)                                         |
| `purchase`          | Order confirmed            | `order_id`, `order_number`, `total_cents`, `items`, `coupon`                         |
| `wishlist_add`      | Heart clicked              | `product_id`, `source`                                                               |
| `wishlist_remove`   | Heart unclicked            | `product_id`                                                                         |
| `newsletter_signup` | Subscribe form submitted   | `source` (footer/newsletter_section/popup)                                           |
| `collection_view`   | Collection page loaded     | `collection_slug`                                                                    |
| `journal_view`      | Journal article loaded     | `article_slug`, `category`, `read_time`                                              |
| `contact_submit`    | Contact form submitted     | —                                                                                    |
| `account_created`   | Registration completed     | `method` (email/google/apple)                                                        |
| `account_signed_in` | Sign-in completed          | `method`                                                                             |
| `refund_processed`  | Admin refunds order        | `order_id`, `amount_cents` (admin event)                                             |

### 14.2 Dashboards

- **Real-time revenue** — today's GMV, order count, AOV (admin dashboard)
- **Conversion funnel** — view → cart → checkout → purchase (PostHog)
- **Top products** — by revenue, by views, by add-to-cart rate (admin dashboard)
- **Traffic sources** — UTM breakdown, organic vs paid, referrers (PostHog)
- **Customer cohorts** — retention by signup month (Phase 2)
- **Cart abandonment** — funnel drop-off by step (PostHog)
- **Search analytics** — top queries, zero-result rate (Phase 2)

---

## 15. Initial Product Catalog

### 15.1 Collections (8)

| Collection          | Slug           | Description                                   | Product Count |
| ------------------- | -------------- | --------------------------------------------- | ------------- |
| Lighting            | `lighting`     | Sculptural forms that cast warmth and shadow  | 28            |
| Ceramics            | `ceramics`     | Handcrafted vessels shaped by patient hands   | 24            |
| Furniture           | `furniture`    | Timeless pieces built for generations         | 42            |
| Textiles            | `textiles`     | Natural fibers woven with intention           | 36            |
| Objects & Vases     | `objects`      | Curated details that complete a space         | 18            |
| Seasonal Collection | `seasonal`     | Limited pieces inspired by the changing light | 12            |
| New Arrivals        | `new-arrivals` | The latest additions to our collection        | 15            |
| Curated Gifts       | `gifts`        | Thoughtfully selected pieces for giving       | 22            |

### 15.2 Initial Products (20 products: 13 original + 7 UAT additions, seeding data)

| Product                  | Collection | Price  | Materials                                | Badges     | On Homepage |
| ------------------------ | ---------- | ------ | ---------------------------------------- | ---------- | ----------- |
| Arc Pendant Light        | Lighting   | $485   | Solid brass, natural Belgian linen       | Featured   | ✅          |
| Orb Table Lamp           | Lighting   | $295   | Mouth-blown glass, solid bronze          | New        | ✅          |
| Berg Floor Lamp          | Lighting   | $620   | Aged brass, rice paper shade             | —          | ✅          |
| Large Sculptural Vessel  | Ceramics   | $320   | High-fire stoneware, natural ash glaze   | New        | ✅          |
| Everyday Serving Bowl    | Ceramics   | $145   | Stoneware, food-safe glaze               | —          | ✅          |
| Harvest Dining Table     | Furniture  | $2,850 | Solid white oak, natural oil finish      | Featured   | —           |
| Halden Linen Armchair    | Furniture  | $890   | Solid oak, washed linen (sand)           | Bestseller | ✅          |
| SolSide Oak Table        | Furniture  | $540   | Solid FSC oak, linseed finish            | —          | ✅          |
| Washed Linen Throw       | Textiles   | $195   | 100% washed European linen               | Bestseller | ✅          |
| Hand-Felted Wool Cushion | Textiles   | $165   | 100% New Zealand wool, linen back        | —          | —           |
| Sculptural Bud Vase      | Objects    | $85    | Stoneware, matte white glaze             | —          | —           |
| Winter Hearth Candle     | Seasonal   | $65    | Soy wax, cotton wick, stoneware vessel   | —          | —           |
| Curated Gift Box         | Gifts      | $225   | Stoneware, soy candle, linen, wooden box | —          | —           |

These products are seeded via `packages/db/src/seed/index.ts`. The 8 products marked ✅ are rendered on the homepage Featured Products section (matching `public/landing.html`), and the Arc Pendant Light additionally appears in the Hero Spotlight Card. The remaining 5 products are seeded for the PLP `/products` page launch and are not shown on the homepage. The `MAISON_Design_Guide.md` §9.9 documents the exact 8-product order and the per-product alt-image pairs used for hover-swap.

---

## 16. Responsive & Accessibility Specifications

### 16.1 Responsive Breakpoints

Aligned with the v2 landing page CSS media queries (`max-width: 1024px`, `768px`, `480px`):

| Breakpoint | Width       | Layout Changes                                                      |
| ---------- | ----------- | ------------------------------------------------------------------- |
| Mobile (small) | ≤ 480px     | Single column products, hamburger drawer, `1.25rem` gutter, announcement font shrinks to 10px |
| Mobile     | 481–768px   | 2-col product grid, hero 90vh (min 560px), hero spotlight centered, journal 1-col, stats 1-col, footer 1-col |
| Tablet     | 769–1024px  | 3-col product grid, materials 1-col, journal 2-col, instagram 3-col, footer 2-col, featured/philosophy collapse to 1-col, categories 2-col with redefined bento areas |
| Desktop    | 1025–1439px | Full 4-col products, 4-col bento categories, 3-col materials/journal, 6-col instagram, 4-col footer, asymmetric featured/philosophy |
| Wide       | ≥ 1440px    | Container capped at 1280px, section padding maxes at 120px (140px for philosophy) |

### 16.2 Key Responsive Behaviours (matching landing page v2)

- **Header:** Logo + hamburger (mobile) → Logo + full nav + icons (desktop ≥ 1025px). Search and account icons hidden on ≤ 768px (only cart + hamburger visible).
- **Hero:** Stacked text, full-bleed image, 94vh desktop / 90vh mobile (min 560px). Mousemove parallax disabled on touch.
- **Hero spotlight card:** Desktop = bottom-right floating; Mobile (≤768px) = bottom-center via `left: 50%; transform: translateX(-50%)`, `bottom: 4.5rem`.
- **Products:** 1-col (≤480px) → 2-col (≤768px) → 3-col (≤1024px) → 4-col (≥1025px).
- **Product card hover elements:** Desktop = hover-revealed wishlist + quick-add; Mobile (≤768px) = always visible (touch can't hover), quick-add bar shrinks to `padding: 0.6rem; font-size: 10px`.
- **Categories bento re-flow:**
  - Desktop (≥1025px): `"feature feature wide wide" / "feature feature small1 small2"`
  - Tablet (≤1024px): `"feature feature" / "wide wide" / "small1 small2"` (3 rows)
  - Mobile (≤768px): `"feature" / "wide" / "small1" / "small2"` (4 stacked rows)
- **Philosophy:** Stacked (mobile) → 2-col asymmetric (desktop). Philosophy images aspect ratio shifts to 4:5 on mobile.
- **Instagram:** 3-col (mobile) → 6-col (desktop).
- **Footer:** Stacked 1-col (mobile) → 2-col (tablet) → 4-col asymmetric (desktop). Bottom row stacks on mobile.
- **Cart drawer:** Full-width minus 2rem margin (mobile) → 380px slide-in (desktop).
- **Statement ticker & testimonials marquee:** Run on all viewports (no static fallback for mobile). Testimonials pause on hover (desktop) or tap-hold (mobile).
- **Custom cursor + magnetic buttons + hero parallax:** Disabled on touch via `(hover: hover) and (pointer: fine)` media query check in JS.
- **Stats (philosophy):** 3-col (desktop) → 1-col (mobile).
- **Featured detail row:** Wraps on mobile (`flex-wrap: wrap; gap: 1.5rem`).

### 16.3 Accessibility (WCAG 2.2 AAA per ADR-011)

- Semantic HTML throughout (`<main>`, `<nav>`, `<article>`, `<aside>`, `<footer>`, `<section>`, `<blockquote>`, `<cite>`)
- ARIA labels on all icon-only buttons (search, cart, wishlist, menu, close, social icons)
- `aria-hidden="true"` on all decorative animated elements (brand marquee, statement ticker, scroll hint, mesh glow, quote marks, ornament dividers)
- `aria-live="polite"` on toast and floating bag panel (announces cart additions to screen readers)
- `aria-label="5 out of 5 stars"` on testimonial star ratings
- Keyboard navigable: focus management, skip link, focus-visible outlines
- Focus-visible outline: `3px solid var(--clay)` with `2px offset` (AAA standard per ADR-011 — was 2px/3px in v1.1) — only `:focus-visible` (not `:focus`) is styled so mouse clicks don't show rings
- Colour contrast ratio ≥ 7:1 for body text (AAA), ≥ 4.5:1 for large text (≥18pt). Verified via `scripts/contrast-check.ts` in CI. See §4.3 for token-by-token ratios.
- Alt text on all product images (descriptive, not keyword-stuffed); empty `alt=""` on decorative duplicates (alt images used for hover-swap)
- Reduced motion support (`prefers-reduced-motion: reduce`) — disables all keyframe animations, sets transition-duration to 0.01ms, hides custom cursor entirely
- Custom cursor is decorative only — native cursor remains visible; cursor disabled entirely under reduced-motion
- Screen reader compatible cart/checkout flow (aria-live regions for cart updates)
- Form labels associated via `<label for>` or wrapping
- Error messages announced via `aria-live="assertive"`
- Mobile nav drawer: focus trap when open, focus restored to trigger button on close, ESC key closes
- Statement ticker and brand marquee content is duplicated in DOM for seamless loop — both copies are `aria-hidden`
- Playwright `@axe-core/playwright` in E2E suite to catch regressions
- Target Size (WCAG 2.2 §2.5.5): All interactive elements ≥ 44×44 CSS pixels (`min-h-[44px] min-w-[44px]`)
- Skip-to-content link: first element in `<body>`, `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50`; `<main id="main-content">`
- axe-core dev mode: `@axe-core/react` wired in `app/layout.tsx` for development (1000ms check interval); WCAG 2.2 AAA ruleset
- Lighthouse Accessibility — Target = 100; CI gate threshold = 95 (CI Gate 7 per §17.4)
- Reduced motion duration: `0.01ms` (NOT `0ms` — some browsers treat `0ms` as default)

---

## 17. Testing Strategy

### 17.1 Test Distribution

| Category                                      | Framework                | Location                                    | Target Coverage     |
| --------------------------------------------- | ------------------------ | ------------------------------------------- | ------------------- |
| Unit tests (business logic)                   | Vitest                   | `packages/*/src/**/*.test.ts`               | 80%                 |
| Component tests                               | Vitest + Testing Library | `apps/web/src/components/**/*.test.tsx`     | 70%                 |
| Integration tests (tRPC routers with test DB) | Vitest + testcontainers  | `packages/api/src/**/*.integration.test.ts` | Critical paths      |
| E2E tests (user journeys)                     | Playwright               | `e2e/*.spec.ts`                             | All P0 user stories |
| Accessibility tests                           | `@axe-core/playwright`   | `e2e/accessibility.spec.ts`                 | All pages           |
| Visual regression                             | Playwright screenshots   | `e2e/visual/*.spec.ts`                      | Key pages           |

### 17.2 Critical E2E Scenarios

1. Browse homepage → click product → add to cart → checkout → order confirmation
2. Search product → filter by collection → add to cart → checkout
3. Sign in → view order history → reorder
4. Sign in → add to wishlist → move to cart → checkout
5. Admin: create product → appears on storefront → customer orders → admin fulfills
6. Admin: refund order → customer receives email
7. Guest checkout → create account post-purchase → order appears in history
8. Mobile: hamburger nav → browse → cart drawer → checkout
9. Stripe webhook → order status updates
10. Sanity content change → ISR revalidation → storefront updates

### 17.3 Coverage Gates (CI)

- `packages/db`: 80% (schema integrity critical)
- `packages/api`: 90% (business logic critical — was 85% in v1.1, aligned to Stillwater per ADR-019)
- `packages/payments`: 95% (money-critical — ADR-019)
- `packages/auth`: 90% (security critical — ADR-019)
- `apps/web`: 70% (UI coverage — ADR-019)
- `services/workers`: 85% (background job reliability — ADR-019)
- `apps/web/src/lib`: 75%
- `apps/web/src/components`: 60% (visual components, hard to unit test)
- E2E: all P0 user stories must have a passing test

### 17.4 Pre-Ship Checklist (8-Gate)

Per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill §"8-gate CI/CD":

1. ✅ `pnpm check-types` — no TypeScript errors
2. ✅ `pnpm lint` — no ESLint errors
3. ✅ `pnpm test` — all unit/integration tests pass
4. ✅ `pnpm test:e2e` — all E2E tests pass
5. ✅ `pnpm build` — production build succeeds
6. ✅ `pnpm audit --audit-level=high` — no high/critical vulnerabilities
7. ✅ Lighthouse CI — Performance ≥ 90, Accessibility ≥ 95
8. ✅ Bundle size check — initial JS < 200KB gzipped

---

## 18. Release Plan & Milestones

### Phase 0 — Foundation (Weeks 1–2)

- [ ] Turborepo monorepo scaffold (apps/web, apps/studio, packages/_, services/workers, tooling/_)
- [ ] `packages/db` — Drizzle schema, migrations, seed (8 collections, 20 products — 13 original + 7 UAT additions)
- [ ] `packages/auth` — Better Auth config (email/password + Magic Link + Google OAuth per ADR-013, sessions, RBAC with 5 procedure tiers per ADR-008)
- [ ] `packages/ui` — Design tokens (colors.css, typography.css), self-hosted fonts
- [ ] `apps/web` — Next.js 16 scaffold, `proxy.ts`, `globals.css` with Tailwind v4 `@theme`
- [ ] `.env.example`, `docker-compose.yml` (Postgres + Redis), `pnpm-workspace.yaml`
- [ ] CI/CD pipeline (GitHub Actions: lint → typecheck → test → build → deploy preview)
- [ ] Vercel + Neon + Stripe (test mode) accounts wired

### Phase 1 — MVP (Weeks 3–6)

- [ ] Homepage (all 17 sections from `public/landing.html` — see §6.1)
- [ ] Product listing (`/products`) with collection filter + sort
- [ ] Product detail (`/product/{slug}`) with gallery, related products
- [ ] Shopping cart (DB-backed, anonymous + authenticated)
- [ ] Checkout (Stripe Payment Intents per ADR-009, 3-step flow)
- [ ] Order confirmation + email (Resend + React Email)
- [ ] Contact form (functional, wired to Resend via tRPC `contact.submit` mutation — Server Component wrapper + Client Component child pattern)
- [ ] Customer account (sign-in, sign-up, order history, wishlist)
- [ ] Admin dashboard (overview, products CRUD, orders list, fulfillment)
- [ ] Responsive design (all breakpoints)
- [ ] SEO (meta tags, sitemap, JSON-LD, robots.txt)
- [ ] Analytics (PostHog events)
- [ ] Error tracking (Sentry)
- [ ] E2E test suite (30 E2E tests — 22 smoke + 8 accessibility — covering the 10 critical scenarios below)
- [ ] Lighthouse Performance ≥ 90

### Phase 2 — Growth (Weeks 7–12)

- [ ] OAuth login (Google, Apple)
- [ ] Magic link sign-in
- [ ] Wishlist persistence (anonymous → authenticated merge)
- [ ] Address book with autocomplete (Google Places)
- [ ] Sanity CMS full integration (homepage sections, journal, maker profiles)
- [ ] Newsletter integration (Klaviyo, double opt-in)
- [ ] Product search (Postgres `ilike` → Algolia if insufficient per ADR-012)
- [ ] Promo codes
- [ ] Shipping calculator (multi-region)
- [ ] About page + journal (editorial content)
- [ ] Instagram feed integration
- [ ] Multi-region (US/EU/UK) pricing + shipping + tax
- [ ] Abandoned cart emails (Trigger.dev + Klaviyo)

### Phase 3 — Optimisation (Weeks 13–18)

- [ ] Product reviews (with photo uploads)
- [ ] Advanced analytics dashboards (cohort retention, LTV)
- [ ] A/B testing framework (PostHog Experiments)
- [ ] Performance optimisation (edge caching, RSC streaming)
- [ ] Multi-currency display (Phase 2 backend, Phase 3 UI)
- [ ] Trade program (designer tier with discount)
- [ ] Gift cards
- [ ] Loyalty/rewards program
- [ ] Instagram Shop integration
- [ ] Mobile PWA (installable, offline product browsing)

---

## 19. Risks & Mitigations

| Risk                                      | Impact | Likelihood | Mitigation                                                                                                          |
| ----------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Low initial traffic                       | High   | High       | SEO investment, paid social (Instagram/Pinterest), influencer partnerships with design bloggers                     |
| Payment processing issues                 | High   | Low        | Stripe fallback (no single point of failure), thorough E2E test coverage of checkout, idempotency keys              |
| Image loading performance                 | Medium | Medium     | Cloudflare Images (AVIF/WebP), `next/image` responsive srcset, lazy loading, blur placeholders                      |
| Inventory sync issues (overselling)       | High   | Medium     | PostgreSQL advisory locks on checkout (per Stillwater pattern), real-time stock checks, 15-min reservation timeout  |
| Scope creep                               | Medium | High       | Strict phase gating, MVP-first mindset, non-goals explicitly documented in §2.2                                     |
| Mobile UX gaps                            | Medium | Medium     | Mobile-first design, device testing matrix (iPhone SE → iPad Pro), Playwright mobile viewport tests                 |
| Supply chain delays (maker lead times)    | Medium | Medium     | Lead time displayed on PDP, "made to order" badge, order status transparency, Trigger.dev delay notification emails |
| Better Auth maturity (newer than Auth.js) | Low    | Low        | Comprehensive E2E auth tests, Stillwater production validation, fallback to Auth.js v5 if critical bug              |
| Sanity pricing at scale                   | Low    | Low        | Monitor usage, fallback to Strapi self-hosted if needed                                                             |
| Supply chain attack (npm package)         | High   | Low        | `minimumReleaseAge: 1440` in `pnpm-workspace.yaml`, `pnpm audit` in CI, dependabot alerts                           |

---

## REMEDIATION_HISTORY (v1.2.1 — July 30, 2026)

> **v1.2.1** reconciled this PRD with the actual remediated codebase per `docs/REMEDIATION_PLAN_v4.md`. The codebase is the source of truth; this section documents the divergences corrected and supersedes any contradictory earlier text in this document.

### Key changes reconciled in v1.2.1

1. **ADR-009 flipped to Payment Intents.** The v1.2 decision to use Stripe Checkout Sessions was reversed. The actual codebase uses Stripe Payment Intents + Stripe Elements with server-side confirmation via `stripe.confirmPayment({ clientSecret })`. Rationale: the 3-step Maison checkout UX needs granular control over the payment flow that Checkout Sessions' hosted redirect does not provide. PCI SAQ-A scope is retained. Webhook event list updated to `payment_intent.succeeded` + `charge.refunded` (`checkout.session.completed` removed). The `orders.stripe_checkout_session_id` field was removed from the schema; `orders.stripe_payment_intent_id` is the canonical Stripe reference.

2. **24 tables documented (was 15).** §9.2 now explicitly lists all 24 tables in the actual `packages/db/src/schema/` directory: the 15 Phase 1 tables (including the previously-implicit Better Auth `accounts` and `verifications` tables), `wishlist_items` + `discounts` (Phase 2), the `payment_events` idempotency table (ADR-014), and the 6 Phase 3 tables (`product_reviews`, `gift_cards`, `gift_card_redemptions`, `trade_applications`, `loyalty_accounts`, `loyalty_transactions`).

3. **13 tRPC routers documented (was 15).** §10 now reflects the actual `packages/api/src/routers/` listing: 5 public (`products`, `collections`, `cart`, `newsletter`, `contact`), 2 customer (`account` with wishlist merged in, `checkout`), and 6 admin (`admin` consolidating products/collections/orders/customers/inventory/auditLog, plus `discounts`, `reviews`, `trade`, `gift-cards`, `loyalty`). The `wishlist` router was merged into `account` (`account.listWishlist` / `account.toggleWishlist`).

4. **Deprecated procedure tier aliases removed.** The codebase no longer exports `adminProcedure` or `adminWriteProcedure`. Use the 5 canonical tiers per ADR-008: `publicProcedure`, `protectedProcedure`, `staffProcedure`, `managerProcedure`, `ownerProcedure`. RBAC role enum is `pgEnum('user_role', ['customer', 'staff', 'manager', 'owner'])` per ADR-008 + ADR-020 (no TypeScript `enum` keyword — `erasableSyntaxOnly` enforces this). All `enum(...)` syntax in §9.2 reflects Drizzle `pgEnum(...)` usage.

5. **Coverage thresholds enforced via ADR-019.** §17.3 de-duplicated: `packages/db=80`, `packages/api=90`, `packages/payments=95`, `packages/auth=90`, `apps/web=70`, `services/workers=85`. The duplicate `packages/payments: 90%` entry was removed; 95% (per ADR-019) is canonical for the money-critical package.

6. **Lighthouse a11y gate clarified.** Target = 100 (aspirational); CI gate threshold = 95 (per §17.4 gate 7). Both numbers coexist — they are not contradictory.

7. **Phase 1 search uses `ilike` (not FTS).** §9.3 indexing note corrected to reference ADR-012 (`ilike` for Phase 1; FTS via `tsvector`/GIN deferred to Phase 2).

8. **Misc counts corrected.** Animations: 24 → 27 (per `MAISON_Design_Guide.md` Appendix B). Color tokens: explicit count of 16 (was implicit). pnpm version: 11.9.0 → 11.17.0 (matches actual `package.json`). E2E test count: "10 critical scenarios" → "30 E2E tests (22 smoke + 8 accessibility) covering the 10 critical scenarios". v1.2 changelog: "7 MED-severity fixes" → "8 MED-severity fixes (ADR-013 through ADR-020)".

9. **Sitemap cleanup.** `/checkout/success` and `/checkout/cancel` removed from §6.5 — these were Checkout Sessions routes; Payment Intents uses client-side confirmation (no Stripe-hosted redirect).

### v1.2.2 (July 30, 2026) — E2E Remediation

Bug fixes identified via agent-browser E2E testing of the live site
https://maison.jesspete.shop/ (see docs/REMEDIATION_PLAN_v5.md):

- F1: Removed stray-space-before-punctuation in 8 italicized heading sites
  across 7 section components (FeaturedCollection, ProductGrid, Philosophy
  ×2, Materials, HyggeEdit, JournalSection, CategoryGrid).
- F2: Fixed CategoryGrid accessible name triple-counting (set <img alt="">
  + added aria-label to <a>).
- F3: Fixed About page H1 missing space ("care,materials" → "care, materials").
- F4: Split 4 Client Component pages (/gift-cards, /trade, /cart, /checkout)
  into Server Component wrapper + Client Component child to enable metadata
  export. Page titles now show "Gift Cards — Maison" / "Trade Program — Maison"
  / "Shopping Bag — Maison" / "Checkout — Maison" instead of the homepage default.
- F5: Fixed Hero H1 missing space ("Objects ofQuiet Beauty" → "Objects of Quiet Beauty").
- F6: Bumped styled-components ^6.1.13 → ^6.1.15 to resolve Sanity peer dep warning.
- F7: Updated product count documentation from "13 products" → "20 products
  (13 original + 7 UAT additions)" to match the actual seed.

Added 3 new contract tests (25 assertions): headings.contract.test.ts,
category-grid.contract.test.ts, page-metadata.contract.test.ts.
Total @maison/web contract tests: 7 files, 90 tests.

### v1.2.3 (July 31, 2026) — v6 Remediation (G1/G2/G3)

Functional + doc-drift fixes identified by the v6 remediation audit (see
`docs/REMEDIATION_PLAN_v6.md`). This subsection documents the requirements-relevant
changes from v1.2.3:

- **G1 — Contact form wired to tRPC + Resend (was a non-functional stub).** The
  `/contact` page was a plain HTML `<form>` with no `onSubmit` handler, no tRPC
  call, and the `contact.submit` mutation only `console.log`-ed the payload (no
  email was ever sent). Fixed by:
  - Creating `apps/web/src/components/shop/ContactForm.tsx` (Client Component
    with `'use client'` + `trpc.contact.submit.useMutation()`).
  - Rewriting `apps/web/src/app/(shop)/contact/page.tsx` as a Server Component
    wrapper that exports `metadata` (page title "Contact — Maison") and renders
    `<ContactForm />`. This applies the v1.2.2 F4 Server/Client page-split
    pattern to `/contact`.
  - Updating `packages/api/src/routers/contact.ts` to actually send email via
    `sendEmail` from `@maison/email` (was `console.log` only). The notification
    is sent to `hello@maison-living.com`.
  - Creating `packages/email/src/templates/ContactNotification.tsx` (new email
    template) and exporting `ContactNotificationEmail` from
    `packages/email/src/index.ts`.
  - Adding `@maison/email` as a `workspace:*` dependency of `@maison/api`
    (`packages/api/package.json`).
  PRD §10.1 already documented `contact.submit` as "sends email via Resend" —
  v1.2.3 makes the codebase match that contract.

- **G2 — Design guide v4 canonicalized.** The `docs/MAISON_Design_Guide.md` file
  has been REPLACED with v4 content (1,489 lines, 16 sections). v4 is a strict
  superset of the v1.2.1 baseline (see v4's Appendix C). The v4-specific file
  (`docs/MAISON_Design_Guide_v4.md`), the rejected v3 wholesale-replacement
  file (`docs/MAISON_design_guide_v3.md`), and `docs/design_guide_v3_changelog.md`
  were DELETED — the canonical path `docs/MAISON_Design_Guide.md` is preserved,
  so all 18 in-repo references remain valid without churn. The rejected v3 is
  preserved verbatim in v4's Appendix C.

- **G3 — v3 design guide + changelog archived/removed.** The v3 file and its
  changelog were removed as part of the v4 canonicalization (G2). v3's content
  (and the rationale for its wholesale rejection) is preserved in v4's
  Appendix C — "This revision supersedes the rejected v3 wholesale-replacement
  attempt. v3 was built from a pre-remediation v2 source artifact and silently
  regressed 12 v1.2.1 corrections."

- **Contract test count updates.** `apps/web/src/lib/__tests__/page-metadata.contract.test.ts`
  was extended with `/contact` page-split assertions (now 15 tests, was 12).
  A new `packages/api/src/routers/contact.contract.test.ts` (3 tests) asserts
  the contact router calls `sendEmail` to `hello@maison-living.com`.
  Total @maison/web contract tests: 7 files, 97 tests (was 90).
  Total @maison/api tests: 3 files, 14 tests (was 11).

### v1.2.4 (July 31, 2026) — v7 Remediation (H1–H6)

Skills-compliance + a11y fixes identified by the v7 remediation audit (see
`docs/REMEDIATION_PLAN_v7.md`). All changes are TDD-driven (contract tests
written first); the codebase remains the source of truth. This subsection
documents the requirements-relevant changes from v1.2.4:

- **H1 — Zod v4 `z.email()` top-level string format (ADR-018).** Replaced 4
  instances of the deprecated `z.string().email()` chaining form with the
  Zod v4 top-level string format `z.email()`:
  - `packages/api/src/routers/contact.ts:24`
  - `packages/api/src/routers/newsletter.ts:17`
  - `packages/api/src/routers/gift-cards.ts:73`
  - `packages/config/src/env.ts:86` (`EMAIL_FROM` env var)
  Locked in by a new contract test
  `packages/api/src/routers/zod-email.contract.test.ts` (4 tests).

- **H2 — Tailwind v4 `@source` directives (Skill 2 §13.6).** Added three
  `@source` directives to `apps/web/src/app/globals.css` immediately after
  `@import 'tailwindcss';`:
  - `@source "../components/**/*.{ts,tsx}";`
  - `@source "../lib/**/*.{ts,tsx}";`
  - `@source "../../../../packages/ui/src/**/*.{ts,tsx}";`
  This is the #1 cause of "Tailwind classes not applying in production"
  per Skill 2 §13.6 — Tailwind v4's automatic content detection misses
  classes used in monorepo sibling packages without explicit `@source`
  declarations.

- **H3 — Tailwind v4 `@utility` directive (Skill 2).** Migrated the
  `@layer utilities { ... }` block in `globals.css` to the Tailwind v4
  `@utility` directive (6 utilities: `eyebrow`, `container-maison`,
  `container-narrow`, `section-padding`, `reveal`, plus the `.reveal.visible`
  state which moved to plain CSS as a compound selector). Per Skill 2,
  `@layer utilities { ... }` is the legacy Tailwind v3 syntax; the v4
  equivalent is one `@utility <name> { ... }` declaration per utility.

- **H4 — PDP thumbnail alt text (a11y).** Product Detail Page thumbnail
  images at `apps/web/src/app/(shop)/products/[slug]/page.tsx:203` now have
  `alt={img.altText ?? \`${product.name} — view ${String(i + 1)}\`}`
  (was `alt=""`). Decorative `alt=""` is correct only when a screen reader
  has access to the same information elsewhere; the PDP gallery thumbnails
  are navigational (click-to-change-main-image) and need non-empty alt.
  Locked in by a new contract test
  `apps/web/src/lib/__tests__/pdp-thumbnail-alt.contract.test.ts` (2 tests).

- **H5 — Removed `as unknown as Record<string, unknown>` cast (Skill 2).**
  `packages/payments/src/webhooks.ts:86` previously cast the `Stripe.Event`
  payload to `Record<string, unknown>` before persisting to the
  `payment_events` Drizzle table. The cast is removed; the column is
  declared `jsonb().notNull()` whose Drizzle inference is `unknown`, and
  `Stripe.Event` is assignable to `unknown`.

- **H6 — Removed 4 deprecated RBAC aliases (ADR-008).** Per ADR-008, the
  RBAC API exposes 5 canonical procedure tiers
  (`publicProcedure` / `protectedProcedure` / `staffProcedure` /
  `managerProcedure` / `ownerProcedure`) and canonical role constants
  (`STAFF_ROLES`, `MANAGER_ROLES`, `OWNER_ROLES`). The following 4 deprecated
  aliases (kept around since v1.2 for backwards compatibility) were removed
  from `packages/auth/src/rbac.ts`, from `packages/auth/src/index.ts`
  re-exports, and from the 2 deprecated `describe` blocks in
  `packages/auth/src/rbac.test.ts`:
  - `canReadAdmin` (was alias for `canAccessStaff`)
  - `canWriteAdmin` (was alias for `canAccessOwner`)
  - `ADMIN_ROLES` (was alias for `STAFF_ROLES`)
  - `ADMIN_WRITE_ROLES` (was alias for `OWNER_ROLES`)
  Locked in by a new contract test
  `packages/auth/src/rbac-aliases.contract.test.ts` (6 tests).

- **Contract test count updates.** New contract tests:
  - `packages/api/src/routers/zod-email.contract.test.ts` (H1 — 4 tests)
  - `apps/web/src/lib/__tests__/pdp-thumbnail-alt.contract.test.ts`
    (H4 — 2 tests)
  - `packages/auth/src/rbac-aliases.contract.test.ts` (H6 — 6 tests)
  Updated: `packages/auth/src/rbac.test.ts` lost 2 deprecated describe
  blocks (`canReadAdmin`, `canWriteAdmin`) — now 29 tests (was 31).
  Total @maison/web tests: 8 files, 99 tests (was 7 files, 97 tests).
  Total @maison/api tests: 5 files, 22 tests (was 4 files, 18 tests).
  Total @maison/auth tests: 3 files, 45 tests (was 3 files, 41 tests).
  @maison/payments tests: 3 files, 18 tests (unchanged).

### v1.2.5 (July 31, 2026) — v8 Remediation (N1–N8)

Skills-compliance + dead-code-removal fixes identified by the v8 remediation
audit (see `docs/REMEDIATION_PLAN_v8.md`). All changes are TDD-driven (the new
`no-unknown-cast.contract.test.ts` was written first); the codebase remains the
source of truth. This subsection documents the requirements-relevant changes
from v1.2.5:

- **N1 / N9 — Removed 7 `as unknown as` casts (Skill 2 §9.2).** Per Skill 2,
  `as unknown as` is the most dangerous TypeScript escape hatch and is banned
  in production code. Removed 7 of 9 instances; the 2 remaining casts in
  `packages/db/src/index.ts` are structurally required (Drizzle's
  `NeonHttpDatabase | NodePgDatabase` union is non-unifiable due to diverging
  `*QueryResultHKT` type params) and are documented as exceptions in the new
  contract test's `ALLOWED_FILES` set. Concrete fixes:
  - `packages/auth/src/resend-client.ts` — replaced
    `as unknown as Resend` with a `ResendClient = Resend | ResendStub` type
    union + `satisfies ResendStub` for the test double.
  - `packages/email/src/send.ts` — same pattern (consolidated the duplicate
    stub into the type union).
  - `packages/api/src/routers/reviews.ts` — replaced 2 raw SQL string casts
    with the typed Drizzle query builder
    (`.select().from().innerJoin().where()`).
  - `packages/api/src/routers/admin.ts` — replaced 3 raw SQL casts with
    typed row mappers (`(result?.rows ?? []).map((row) => ({...}))`).
  Locked in by a new contract test
  `packages/api/src/routers/no-unknown-cast.contract.test.ts` (1 test).

- **N2 — Removed `isAdmin` + `isStaffOrAdmin` dead code (ADR-008).** Per
  ADR-008, "admin" terminology is banned from the RBAC API in favour of the
  canonical `canAccessStaff` / `canAccessOwner` predicates. The two deprecated
  helpers in `packages/auth/src/types.ts` (which used the banned terminology)
  were removed. Deleted `packages/auth/src/types.test.ts` (was 10 tests — only
  exercised the removed helpers). Updated `packages/auth/src/index.ts` to
  remove the dead re-exports. The `SessionUser` / `Session` interfaces in
  `types.ts` are preserved (they are live types used by the API context).

- **N3 — Replaced `require('node:crypto')` with ESM import (Skill 3).** Per
  Skill 3, the `verbatimModuleSyntax: true` tsconfig flag forbids CommonJS
  `require()` in ESM modules. `packages/auth/src/config.ts:153` previously
  used `require('node:crypto')` for `randomBytes` (password-reset tokens).
  Replaced with a top-of-file `import { randomBytes } from 'node:crypto'`
  statement.

- **N4 — Wired webhook secrets through `@maison/config/env` (Skill 2 §13.5).**
  Per Skill 2 §13.5, all env access must go through the validated
  `@maison/config` `env` object (not `process.env` direct access). Two webhook
  route handlers were using direct `process.env`:
  - `apps/web/src/app/api/webhooks/stripe/route.ts` — now imports `env` from
    `@maison/config` and reads `env.STRIPE_WEBHOOK_SECRET`.
  - `apps/web/src/app/api/webhooks/sanity/route.ts` — same pattern with
    `env.SANITY_WEBHOOK_SECRET`.

- **N5 — Removed `managerProcedure` dead code (ADR-008).** `managerProcedure`
  was defined per ADR-008 but never wired into any router — admin mutations
  use `ownerProcedure`. Removed from `packages/api/src/trpc.ts`. Updated
  `packages/api/src/index.ts` to remove the re-export. Updated
  `packages/api/src/trpc.test.ts`: renamed "exports 5 procedure tiers" →
  "exports 4 procedure tiers", removed the
  `expect(trpc.managerProcedure).toBeDefined()` assertion, and added a new
  test "does NOT export managerProcedure (removed in v8 — dead code)". The
  codebase now exposes **4 canonical procedure tiers** (was 5):
  `publicProcedure` / `protectedProcedure` / `staffProcedure` /
  `ownerProcedure`.

- **N6 — Pinned Stripe `apiVersion: '2026-06-24.dahlia'` (Skill 2 §9.9).**
  Per Skill 2 §9.9, the Stripe API version must be pinned (not left to the
  SDK default, which can drift on upgrade and silently change wire formats).
  `packages/payments/src/client.ts` now sets
  `apiVersion: '2026-06-24.dahlia'` explicitly.

- **N8 — Trimmed `tooling/tailwind/base.ts` (Skill 2 §9.5 / §13.6).** Per
  Skill 2, Tailwind v4 is CSS-first — the canonical design tokens live in
  `apps/web/src/app/globals.css` `@theme`, not in a JS config. Removed the
  duplicate `theme.extend` block (colors, spacing, fontSize, borderRadius,
  transitions, keyframes, animation) which was drifting away from the
  CSS-first source of truth. File trimmed from 152 lines to ~30 lines. Kept
  only `fontFamily` as a JS reference for non-CSS consumers (Storybook, tests).

- **Contract test count updates.** New contract test:
  - `packages/api/src/routers/no-unknown-cast.contract.test.ts` (N1 — 1 test)
  Updated: `packages/api/src/trpc.test.ts` renamed "5 procedure tiers" →
  "4 procedure tiers" + added "does NOT export managerProcedure" test (net
  +1 test). Deleted `packages/auth/src/types.test.ts` (10 tests — only
  exercised the removed `isAdmin` / `isStaffOrAdmin` helpers).
  Total @maison/web tests: 8 files, 99 tests (unchanged from v1.2.4).
  Total @maison/api tests: 6 files, 20 tests (was 5 files, 22 tests).
  Total @maison/auth tests: 2 files, 35 tests (was 3 files, 45 tests —
  `types.test.ts` deleted).
  @maison/payments tests: 3 files, 18 tests (unchanged).

### v1.2.6 (July 31, 2026) — v9 Remediation (V9-1 through V9-5)

Skills-compliance fixes identified by the v9 remediation audit (see
`docs/REMEDIATION_PLAN_v9.md`). All v8 fixes (N1–N8) were re-verified working;
the codebase remains the source of truth. This subsection documents the
requirements-relevant changes from v1.2.6:

- **V9-1 — Removed PII logging from tRPC routers (HIGH, Skill 2 §13.10).**
  Per Skill 2 §13.10, the same PII principle that bans logging Stripe webhook
  payloads also bans logging user-supplied PII. Two routers were logging PII
  via `console.log`:
  - `packages/api/src/routers/contact.ts` — was logging `input.name`,
    `input.email`, and the first 100 chars of `input.message`. Replaced with
    `'[contact] Submission received (PII redacted)'`.
  - `packages/api/src/routers/newsletter.ts` — was logging `input.email`.
    Replaced with `'[newsletter] New subscriber from ${source} (PII redacted)'`.

- **V9-2 — Replaced `process.env` with `env` module in `webhooks.ts` (MEDIUM,
  Skill 2 §13.5).** Per Skill 2 §13.5, all env access must go through the
  validated `@maison/config` `env` object (not `process.env` direct access).
  v8 (N4) wired webhook secrets through `env` but missed
  `packages/payments/src/webhooks.ts:178`, which read
  `process.env['NEXT_PUBLIC_APP_URL']` directly. Replaced with
  `env.NEXT_PUBLIC_APP_URL` from `@maison/config`; added `@maison/config`
  dependency to `packages/payments/package.json`.

- **V9-3 — Updated stale `managerProcedure` comments in `rbac.ts` (LOW).**
  v8 (N5) removed the dead `managerProcedure` from `packages/api/src/trpc.ts`
  but left docstring comments in `packages/auth/src/rbac.ts:7,14` still
  referencing it as if it existed. Updated to reflect the 4 canonical
  procedure tiers (`publicProcedure` / `protectedProcedure` / `staffProcedure`
  / `ownerProcedure`).

- **V9-4 — Removed non-null assertion in `jobs-client.ts` (LOW, Skill 3 §6.3).**
  Per Skill 3 §6.3, non-null assertions (`!`) should be avoided.
  `packages/config/src/jobs-client.ts:61` previously used
  `process.env['TRIGGER_SECRET_KEY']!` when constructing `TriggerClient`.
  Replaced with an explicit `if (!accessToken) throw new Error(...)` null
  guard before construction.

- **V9-5 — Extended `no-unknown-cast.contract.test.ts` to scan `.tsx` files
  (LOW, Skill 3 §5.3).** The contract test (added in v1.2.5 N1) was only
  scanning `.ts` files for `as unknown as` casts — production `.tsx` files
  were not covered. Extended the file-list predicate to also match `.tsx`.
  Manually verified no `.tsx` files currently contain these casts; this
  closes the coverage gap so future regressions are caught.

- **Contract test count updates.** No new contract test files; one existing
  contract test (`packages/api/src/routers/no-unknown-cast.contract.test.ts`)
  was extended in scope (V9-5). Test counts unchanged:
  Total @maison/web tests: 8 files, 99 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

### v1.2.7 (July 31, 2026) — v10 Remediation (V10-1 + V10-2)

Skills-compliance fixes identified by the v10 remediation audit (re-validation
pass that caught two PII-logging issues v9 missed in adjacent files). All v9
fixes (V9-1..V9-5) were re-verified working; the codebase remains the source of
truth. This subsection documents the requirements-relevant changes from v1.2.7:

- **V10-1 — Removed PII logging from `webhooks.ts` (HIGH, Skill 2 §13.10).**
  Per Skill 2 §13.10, the same PII principle that bans logging Stripe webhook
  payloads also bans logging customer PII. `packages/payments/src/webhooks.ts:183`
  was logging `order.email` via
  `console.log('[stripe] Order ${order.orderNumber} confirmed + email sent to ${order.email}')`
  in the production webhook handler (fired on every successful Stripe Payment
  Intent confirmation). Replaced with
  `'[stripe] Order ${order.orderNumber} confirmed + email sent (PII redacted)'` —
  same redaction pattern V9-1 applied to `contact.ts` + `newsletter.ts`. v9's V9-2
  fixed the `process.env['NEXT_PUBLIC_APP_URL']` access four lines above (line
  179) but missed the PII log on line 183 in the same file.

- **V10-2 — Redacted stub-mode email payload logging (LOW, Skill 2 §13.10).**
  Per Skill 2 §13.10, never log full email payloads. Two stub-mode senders were
  logging the full `payload` object (which includes `to` (recipient email =
  customer PII) and `react` (email body, may contain contact-form PII)) via
  `console.log('[email] (stub) Would send:', payload)`:
  - `packages/email/src/send.ts:35` — stub branch of the `sendEmail` helper.
  - `packages/auth/src/resend-client.ts:41` — stub branch of the auth email
    client (verification + password-reset emails).
  Both replaced with metadata-only logs:
  `console.log('[email] (stub) Would send email: subject="${meta.subject ?? '(unknown)'}"')`
  — logs only the subject, never `to` or `react`. Stub-mode only fires when
  `RESEND_API_KEY` is unset (dev/test/preview envs), so severity is LOW, but the
  same V9-1 PII principle applies.

- **Contract test count updates.** No new contract test files; no existing
  contract tests extended in scope. Test counts unchanged:
  Total @maison/web tests: 8 files, 99 tests.
  Total @maison/api tests: 6 files, 20 tests.
  Total @maison/auth tests: 2 files, 35 tests.
  @maison/payments tests: 3 files, 18 tests.

---

## 20. Appendices

### A. Competitive References

- **Hay Design** (hay.dk) — Playful Scandinavian, strong product photography
- **Muuto** (muuto.com) — Modern Nordic, clean PDP layout
- **Ferm Living** (fermliving.com) — Editorial commerce, strong journal
- **Aesop** (aesop.com) — Brand storytelling, tactile design language
- **Kinfolk Shop** — Editorial commerce, slow-living aesthetic
- **Skagerak** (skagerak.com) — Maker stories, sustainability focus
- **Frama** (frama.com) — Minimalist, restrained palette

### B. Browser Support Matrix

| Browser             | Minimum Version             |
| ------------------- | --------------------------- |
| Chrome              | Last 2 versions             |
| Firefox             | Last 2 versions             |
| Safari              | 16+ (for `:has()` selector) |
| Edge                | Last 2 versions             |
| Mobile Safari (iOS) | 16+                         |
| Chrome for Android  | Last 2 versions             |

### C. Environment Variables Summary

> Full documentation in `PROJECT-ARCHITECTURE.md` §9.2 and `.env.example` at repo root.

| Variable                                    | Required | Purpose                                          |
| ------------------------------------------- | -------- | ------------------------------------------------ |
| `DATABASE_URL`                              | Yes      | Pooled Postgres connection (app queries)         |
| `DATABASE_URL_UNPOOLED`                     | Yes      | Direct Postgres connection (migrations only)     |
| `BETTER_AUTH_SECRET`                        | Yes      | Auth session signing (min 32 chars)              |
| `BETTER_AUTH_URL`                           | Yes      | App URL for auth callbacks                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Phase 2  | Google OAuth                                     |
| `STRIPE_SECRET_KEY`                         | Yes      | Server-side Stripe API                           |
| `STRIPE_WEBHOOK_SECRET`                     | Yes      | Stripe webhook signature verification            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`        | Yes      | Stripe Elements + Payment Intents (client-side `stripe.confirmPayment({ clientSecret })`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`             | Yes      | Sanity project ID                                |
| `NEXT_PUBLIC_SANITY_DATASET`                | Yes      | Sanity dataset (usually `production`)            |
| `SANITY_API_TOKEN`                          | Yes      | Server-side Sanity read token                    |
| `SANITY_WEBHOOK_SECRET`                     | Yes      | Sanity webhook signature verification            |
| `RESEND_API_KEY`                            | Yes      | Transactional email                              |
| `EMAIL_FROM`                                | Yes      | From address for transactional emails            |
| `TRIGGER_SECRET_KEY`                        | Yes      | Trigger.dev background jobs                      |
| `UPSTASH_REDIS_REST_URL`                    | Yes      | Rate limiting, idempotency                       |
| `UPSTASH_REDIS_REST_TOKEN`                  | Yes      | Upstash auth                                     |
| `SENTRY_DSN`                                | Optional | Error tracking (app runs without if unset)       |
| `NEXT_PUBLIC_POSTHOG_KEY`                   | Yes      | Product analytics                                |
| `NEXT_PUBLIC_POSTHOG_HOST`                  | Yes      | PostHog host (usually `https://app.posthog.com`) |
| `AXIOM_TOKEN`                               | Optional | Structured logging                               |
| `CLOUDFLARE_ACCOUNT_ID`                     | Yes      | Image CDN                                        |
| `CLOUDFLARE_IMAGES_TOKEN`                   | Yes      | Cloudflare Images API                            |
| `CLOUDFLARE_R2_*`                           | Yes      | Media storage                                    |
| `NEXT_PUBLIC_APP_URL`                       | Yes      | Canonical app URL                                |

### D. Glossary

| Term                     | Definition                                                                       |
| ------------------------ | -------------------------------------------------------------------------------- |
| **AOV**                  | Average Order Value — total revenue / order count                                |
| **Considered living**    | Brand philosophy: intentional, slow, quality-over-quantity consumption           |
| **GMV**                  | Gross Merchandise Value — total order value before fees/refunds                  |
| **Hygge**                | Danish concept of coziness, contentment, and warm simplicity                     |
| **ISR**                  | Incremental Static Regeneration — Next.js feature for periodic page re-rendering |
| **Ken Burns**            | Slow zoom-and-pan effect on a static image. Used on hero bg (26s alternate infinite). |
| **Lerp**                 | Linear interpolation. `value += (target - value) * factor`. Used for cursor ring trailing effect (factor 0.18). |
| **Magnetic button**      | Button that translates slightly toward the cursor on mousemove. Damped at 0.18× X, 0.35× Y. |
| **Mesh glow**            | Blurred radial gradient(s) used as decorative atmosphere. Sage-soft + gold blend at 35% opacity, blurred 90px. |
| **Paper grain**          | SVG fractalNoise texture overlaid at 3.5% opacity to give digital surfaces a paper-like feel. |
| **PDP**                  | Product Detail Page (`/product/{slug}`)                                          |
| **PLP**                  | Product Listing Page (`/products`)                                               |
| **RSC**                  | React Server Component — renders on server, ships zero JS                        |
| **RBAC**                 | Role-Based Access Control — `customer` / `staff` / `manager` / `owner` roles (per ADR-008 + ADR-020)                 |
| **Sepia reset**          | Image filter `sepia(0.22) saturate(1.05) hue-rotate(-6deg)` that drops to `sepia(0) saturate(1)` on hover. |
| **Spotlight card**       | Floating product card overlapping the hero. Uses glass bg + blur(6px). |
| **Statement ticker**     | Horizontal marquee of italic serif phrases alternating solid clay and outlined. 32s linear infinite. |
| **Trade program**        | Phase 3 feature: designer tier with 10–20% discount                              |
| **White Glove delivery** | Premium shipping: in-home setup, packaging removal (2-week lead time)            |

---

_End of Unified PRD v1.2. For the engineering blueprint, see `PROJECT-ARCHITECTURE.md` (v1.2). For the canonical design system reference, see `docs/MAISON_Design_Guide.md`. For skill-alignment validation, see `docs/PRD_PAD_Validation_Against_Skills.md`. For developer onboarding, see `README.md` and `AGENTS.md`. For AI agent instructions, see `CLAUDE.md`._
