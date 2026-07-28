# MAISON — Unified Project Requirements Document (PRD) v1.0

**Document Date:** July 26, 2026
**Product Name:** Maison (Scandi Haven Living)
**Document Owner:** Product & Engineering
**Status:** Approved for build
**Companion Documents:** `docs/landing_page_unified.html` (visual reference), `PROJECT-ARCHITECTURE.md` (engineering blueprint), `README.md`, `AGENTS.md`, `CLAUDE.md`
**Architecture Skills Referenced:** `skills/nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth`, `skills/nextjs16-react19-tailwind4-better-auth-monorepo`

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

The current marketing surface (`docs/landing_page_unified.html`) communicates the brand but is non-functional: no real checkout, no account, no inventory, no admin. This PRD defines the requirements to build a **full production e-commerce platform** — customer-facing storefront, headless commerce API, admin back-office, and integrations — capable of supporting $5M+ annual GMV across EU + US markets with a four-person operating team.

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

The unified PRD reconciles currency conflicts (USD primary, EUR/GBP secondary), tech stack conflicts (commits to Next.js 16 + Turborepo + Better Auth + tRPC v11 + Drizzle + Stripe, per the preferred architecture skills), and aligns the design system with the already-built `landing_page_unified.html`.

---

## 2. Goals, Non-Goals & Success Metrics

### 2.1 Goals (v1)

- Replace the static landing page with a full storefront: PLP, PDP, cart, checkout, account, order management.
- Provide an admin back-office for products, orders, customers, content, and promotions usable by a non-technical operator.
- Support multi-region (EU + US + UK) with localised pricing, taxes, shipping, and language.
- Be performant (Core Web Vitals "Good" on all key pages), accessible (WCAG 2.2 AA), and SEO-competitive.
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

> **Source of truth:** `docs/landing_page_unified.html` (already-built unified mockup). The CSS custom properties and typography choices in that file are the canonical design tokens. This section documents them for the engineering build.

### 4.1 Strategic Position (per `skills/avant-garde-design-v4`)

- **Quadrant:** Q1 — The Guardian (institutional clarity, restrained luxury)
- **Aesthetic Direction:** Luxury/Refined + Organic/Natural
- **Anti-generic commitments:** No bento grids, no L/R hero split, no mesh gradients, no glassmorphism, no purple/indigo. Radical departure from generic SaaS blue.

### 4.2 Typography

| Role               | Font Family        | Weights                                         | Usage                                                |
| ------------------ | ------------------ | ----------------------------------------------- | ---------------------------------------------------- |
| Display / Headings | Cormorant Garamond | 300, 400, 500, 600, 700, italic 400, italic 500 | H1–H6, product names, logo, editorial headlines      |
| Body / UI          | Inter              | 300, 400, 500, 600                              | Paragraphs, labels, buttons, navigation, form inputs |

**Pairing rationale:** Cormorant Garamond provides editorial warmth and a humanist, hand-lettered quality that signals craft. Inter provides neutral, high-legibility UI text that doesn't compete with the serif. The contrast between serif display and sans body is a hallmark of editorial commerce (Aesop, Kinfolk, Hay Design).

### 4.3 Color Tokens (CSS Custom Properties)

These tokens are already implemented in `docs/landing_page_unified.html` and must be ported to `packages/ui/src/tokens/colors.css` in the build.

| Token          | Value     | Usage                                    |
| -------------- | --------- | ---------------------------------------- |
| `--bg`         | `#faf8f5` | Page background (warm cream)             |
| `--bg-2`       | `#f3efe8` | Linen section backgrounds                |
| `--bg-3`       | `#ece5d8` | Deeper linen (testimonials, journal)     |
| `--bg-card`    | `#ffffff` | Product cards, modal surfaces            |
| `--bg-dark`    | `#1f1b17` | Footer, newsletter, marquee              |
| `--ink`        | `#1f1b17` | Primary text                             |
| `--ink-2`      | `#4a433b` | Secondary text                           |
| `--muted`      | `#8a8178` | Tertiary text, meta labels               |
| `--line`       | `#e5ddd1` | Borders, dividers                        |
| `--line-soft`  | `#efe9df` | Subtle dividers                          |
| `--clay`       | `#a86b4a` | Primary accent (CTAs, links, badges)     |
| `--clay-dark`  | `#8a5538` | Hover state for clay                     |
| `--clay-light` | `#c17d52` | Secondary clay                           |
| `--gold`       | `#c4a265` | Editorial accent (hero italic, ornament) |
| `--sage`       | `#8b9a82` | Tertiary muted green (Phase 2 badges)    |

**WCAG contrast:** All body text combinations meet WCAG AA (≥ 4.5:1). `--muted` on `--bg` (4.6:1) is the minimum acceptable contrast; do not introduce lighter muted variants.

**Dark mode:** Not in v1. The brand's warmth is intrinsic to the cream base. Dark mode would be Phase 3 if requested by ≥ 15% of users.

### 4.4 Spacing & Layout

- **Container widths:** Narrow `760px`, Standard `1280px`, Full-bleed `100vw`
- **Gutter:** `clamp(20px, 5vw, 64px)`
- **Section padding:** `clamp(64px, 9vw, 120px)` vertical
- **Border radius:** `2px` (deliberately minimal — `--radius-sm`), `4px` (`--radius-md`), `8px` (`--radius-lg` only for hero badges)
- **Grid system:** 12-column for collections, 4-column for products (responsive: 1 → 2 → 3 → 4)
- **Base spacing unit:** 4px (Tailwind scale)

### 4.5 Motion & Animation

| Animation              | Duration  | Easing                           | Usage                                           |
| ---------------------- | --------- | -------------------------------- | ----------------------------------------------- |
| Ken Burns (hero)       | 24s       | ease-in-out, alternate infinite  | Hero background image                           |
| Marquee                | 38s       | linear infinite                  | Brand promises strip                            |
| Scroll reveal          | 0.9s      | `cubic-bezier(0.16, 1, 0.3, 1)`  | All `.reveal` elements via IntersectionObserver |
| Image hover scale      | 1.0–1.2s  | ease-out                         | Product cards, category cards                   |
| Button shine/translate | 0.45s     | `cubic-bezier(0.22, 1, 0.36, 1)` | Primary CTA hover                               |
| Link underline         | 0.45s     | ease                             | Nav links, footer links                         |
| Stagger delay          | 0.1s/item | —                                | Grid item reveals (data-delay attribute)        |
| Toast slide-up         | 0.45s     | ease                             | Add-to-cart confirmation                        |

**Reduced motion:** All animations respect `prefers-reduced-motion: reduce` (already implemented in landing page CSS; carry into build).

### 4.6 Component Library (Built on Radix UI + Tailwind v4)

| Component                    | Source                   | Customisation                                                  |
| ---------------------------- | ------------------------ | -------------------------------------------------------------- |
| Button                       | shadcn/ui base, restyled | Clay primary, outline, ghost variants; uppercase 13px tracking |
| Product Card                 | Custom                   | Hover-swap images, wishlist heart, quick-add bar, badge        |
| Category Card                | Custom                   | Image overlay with gradient, name + count, hover scale         |
| Dialog (Cart drawer)         | Radix Dialog             | Slide-in from right, 380px width                               |
| Toast                        | Sonner                   | Bottom-center, ink background, cream text                      |
| Form inputs                  | Radix Label + custom     | Border-bottom only on newsletter; full border on checkout      |
| Dropdown (mega nav)          | Radix Popover            | Phase 2 — full mega-nav with category previews                 |
| Tabs (PDP gallery)           | Radix Tabs               | Thumbnail strip + main image                                   |
| Select (sort, quantity)      | Radix Select             | Minimal, ink-on-cream                                          |
| Calendar (delivery estimate) | Radix Calendar           | Phase 2 — lead-time visualisation                              |

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
- `(admin)` — admin surface, RBAC-gated (roles: `admin`, `staff`), server-session required
- `(account)` — customer dashboard, auth required, server-session required
- `api/` — Route handlers (tRPC, Stripe webhooks, Sanity webhooks, auth callbacks)

---

## 6. Page-by-Page Requirements

### 6.1 Homepage (`/`)

**Sections (in order, matching `docs/landing_page_unified.html`):**

1. **Announcement bar** — Free shipping threshold, gift wrapping, 30-day returns
2. **Sticky header** — Logo, nav (Shop All, Collections, Our Story, Journal, Contact), search/account/cart icons, mobile drawer
3. **Hero** — Full-bleed (92vh), Ken Burns image, eyebrow + serif headline ("Objects of Quiet Beauty"), description, dual CTA (Shop the Collection / Our Craft), scroll indicator
4. **Marquee** — Brand promises (Handcrafted in Scandinavia, FSC-certified Oak, Carbon-neutral Delivery, 10-year Guarantee, Plant-based Textiles)
5. **Featured Collection** — Editorial split (image 4:5 left, text right), highlights Lighting collection with stats (28 pieces, 9 makers, materials)
6. **Categories** — 4-column grid of image cards with overlay (Furniture, Lighting, Textiles, Ceramics)
7. **Featured Products** — 4-column grid, hover-swap, badges (New/Bestseller/Featured), wishlist, quick-add
8. **Philosophy** — Asymmetric editorial (3-image collage left, headline + body + ornament + stats + CTA right)
9. **Materials** — 3-column grid (FSC Oak, European Linen, Hand-thrown Clay) with custom SVG icons and origin metadata
10. **Hygge Edit** — Full-bleed editorial image with overlay text and CTA (seasonal collection)
11. **Testimonials** — 3-column quote cards with star ratings and customer attribution
12. **Journal** — 3-column article cards with category, read time, image, headline, excerpt
13. **Instagram** — 6-column square grid with hover overlay (Instagram icon)
14. **Newsletter** — Dark section ("Letters from Maison"), email capture, privacy note
15. **Footer** — 4-column (brand + socials, Shop, About, Help) + bottom bar (copyright, legal links)

**Implementation notes:**

- Hero image: `next/image` with `fetchpriority="high"`, `sizes="100vw"`, AVIF/WebP fallbacks
- All below-the-fold images: `loading="lazy"` via `next/image` default
- Marquee: pure CSS animation (no JS) for performance
- Scroll reveal: `IntersectionObserver` hook (`useScrollReveal`), respects `prefers-reduced-motion`
- Product grid: SSR-rendered from tRPC `products.list` query, hydrated with client-side cart mutations

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
- **Step 2 — Payment:** Stripe Elements (card, Apple Pay, Google Pay), billing address (checkbox: same as shipping), promo code application
- **Step 3 — Review:** Order summary with line items, totals, shipping, tax; "Place Order" button
- **Step 4 — Confirmation:** Order number, summary, "what happens next" timeline, email confirmation sent indicator
- Guest checkout supported (no account required); post-purchase prompt to create account
- Stripe Payment Intent created server-side, client confirms with payment method
- Idempotency: order creation guarded by Stripe idempotency key (per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill §"Stripe webhook idempotency")

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
| CK-012 | Stripe webhook handling (payment_intent.succeeded, checkout.session.completed) | P0       |

### 7.5 User Accounts & Authentication

| ID    | Requirement                                                               | Priority |
| ----- | ------------------------------------------------------------------------- | -------- |
| U-001 | Email/password registration & login (Better Auth)                         | P0       |
| U-002 | OAuth login (Google, Apple)                                               | P1       |
| U-003 | Magic link sign-in (email-only)                                           | P2       |
| U-004 | Order history with status tracking                                        | P1       |
| U-005 | Saved addresses CRUD                                                      | P1       |
| U-006 | Wishlist persistence                                                      | P1       |
| U-007 | Password reset flow (email-based, time-limited token)                     | P0       |
| U-008 | Email verification on registration                                        | P1       |
| U-009 | Account deletion (GDPR right to erasure)                                  | P1       |
| U-010 | Session management (httpOnly cookies, 30-day expiry, refresh on activity) | P0       |
| U-011 | Admin RBAC (roles: `customer`, `staff`, `admin`)                          | P0       |

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
| S-005 | Algolia or Meilisearch integration (Phase 2 if Postgres FTS insufficient) | P2       |
| S-006 | "No results" state with suggested collections                             | P1       |

---

## 8. Technical Architecture

### 8.1 Technology Stack (Locked)

Per the preferred architecture skills (`nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` and `nextjs16-react19-tailwind4-better-auth-monorepo`), and validated against the Stillwater production codebase:

| Layer                | Technology             | Pinned Version                      | Rationale                                                           |
| -------------------- | ---------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| **Monorepo tooling** | Turborepo              | ≥2.10.4                             | Task orchestration, caching, incremental builds                     |
| **Package manager**  | pnpm                   | 11.9.0 (via `packageManager` field) | Workspace protocol, supply-chain guardrails (`minimumReleaseAge`)   |
| **Runtime**          | Node.js                | ≥22.0.0                             | LTS required by Next.js 16                                          |
| **Meta-framework**   | Next.js                | 16.2.x                              | App Router, RSC, `proxy.ts` (replaces `middleware.ts`), Turbopack   |
| **UI runtime**       | React                  | 19.2.x                              | React Compiler, async params, `use()` hook                          |
| **Language**         | TypeScript             | 5.9.x                               | Strict mode, `noUnusedLocals`, `erasableSyntaxOnly`                 |
| **Styling**          | Tailwind CSS           | v4.3.x                              | CSS-first `@theme` config, no `tailwind.config.js`                  |
| **API layer**        | tRPC                   | v11.18.x                            | End-to-end type safety, server-side caller, React Query integration |
| **ORM**              | Drizzle ORM            | 0.45.x                              | Type-safe SQL, migration system, no runtime overhead                |
| **Database**         | PostgreSQL             | 17 (Neon in prod, Docker locally)   | Relational integrity, JSONB for flexible content, FTS for search    |
| **Authentication**   | Better Auth            | 1.6.23                              | Replaces Auth.js v5 — better OAuth, magic links, session control    |
| **Payments**         | Stripe                 | 22.3.x (Dahlia)                     | Payment Intents, Checkout, Webhooks, Stripe Tax                     |
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

1. **Five-layer separation** (per `nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth` skill):
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

7. **Anti-generic UI.** Per `skills/avant-garde-design-v4`: no bento grids, no L/R hero split, no mesh gradients, no glassmorphism, no purple/indigo. Every section earns its place.

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

#### `users` (Better Auth managed)

- `id` text PK
- `email` text unique not null
- `email_verified` boolean default false
- `name` text
- `image` text (avatar URL)
- `role` enum('customer', 'staff', 'admin') default 'customer'
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

#### `sessions` (Better Auth managed)

- `id` text PK
- `user_id` text FK → users
- `expires_at` timestamptz
- `ip_address` text
- `user_agent` text

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
- `status` enum('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')
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
- `stripe_payment_intent_id` text
- `stripe_idempotency_key` text unique (prevents duplicate order creation)
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
- `type` enum('percentage', 'fixed', 'free_shipping')
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

### 9.3 Persistence Strategy

- **Connection pooling:** Neon serverless pooler for application queries (`DATABASE_URL`); direct connection for migrations (`DATABASE_URL_UNPOOLED`) — PgBouncer breaks prepared statements in migration scripts.
- **Migrations:** Drizzle Kit `generate` (create SQL from schema diff) → `migrate` (apply). Migrations are version-controlled in `packages/db/drizzle/migrations/` with a `_journal.json` manifest.
- **Indexing:** GIN index on `products.slug`, `collections.slug`, `orders.order_number`. B-tree on foreign keys. Full-text search index on `products.name` + `products.short_description` + `products.materials` (Phase 1 search).
- **Soft deletes:** Products use `is_active = false` (never hard-delete — preserve order line item integrity). Orders are never deleted; cancelled orders retain `status = 'cancelled'`.

---

## 10. API Surface (tRPC Router Catalog)

tRPC v11 routers live in `packages/api/src/routers/`. Each router is mounted in `packages/api/src/root.ts`.

### 10.1 Public Routers (no auth)

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

### 10.2 Customer Routers (auth required)

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
| `wishlist.list`                | query    | —                                             | `Product[]`                 | Wishlist contents                           |
| `wishlist.toggle`              | mutation | `{ productId }`                               | `{ isWishlisted }`          | Add/remove wishlist item                    |
| `checkout.createPaymentIntent` | mutation | `{ cartId, shippingAddress, shippingMethod }` | `{ clientSecret, orderId }` | Create Stripe PaymentIntent + pending order |
| `checkout.confirmOrder`        | mutation | `{ orderId, paymentIntentId }`                | `{ orderNumber }`           | Confirm order after Stripe confirmation     |
| `checkout.applyDiscount`       | mutation | `{ cartId, code }`                            | `Cart`                      | Apply promo code                            |

### 10.3 Admin Routers (RBAC: `staff` or `admin`)

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
| `POST /api/webhooks/stripe` | Stripe      | `payment_intent.succeeded`, `checkout.session.completed`, `charge.refunded` |
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
- Localised shipping & tax: Stripe Tax integration
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
- Stripe Payment Intents (not legacy Tokens) for all checkouts
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
| **Stripe**                 | Payments (cards, Apple Pay, Google Pay), Tax, Webhooks          | Essential | 1     |
| **Vercel**                 | Hosting, Edge functions, ISR, Analytics                         | Essential | 1     |
| **Neon**                   | Serverless PostgreSQL 17                                        | Essential | 1     |
| **Sanity**                 | Headless CMS (products, collections, journal, homepage content) | Essential | 1     |
| **Cloudflare Images + R2** | Image CDN, media storage                                        | Essential | 1     |
| **Resend**                 | Transactional email (order confirmations, password reset)       | Essential | 1     |
| **React Email**            | Type-safe email templates                                       | Essential | 1     |
| **Better Auth**            | Authentication (email/password, OAuth, sessions)                | Essential | 1     |
| **Upstash Redis**          | Rate limiting, idempotency keys                                 | Essential | 1     |
| **Trigger.dev**            | Background jobs (abandoned cart, digests)                       | Essential | 1     |
| **Sentry**                 | Error tracking, performance monitoring                          | Essential | 1     |
| **PostHog**                | Product analytics, session replay, feature flags                | Essential | 1     |
| **Axiom**                  | Structured log aggregation                                      | Essential | 1     |
| **Klaviyo**                | Marketing email (newsletter, abandoned cart)                    | Growth    | 2     |
| **Algolia**                | Faceted product search (if Postgres FTS insufficient)           | Growth    | 2     |
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

### 15.2 Initial Products (13 SKUs, seeding data)

| Product                  | Collection | Price  | Materials                                | Badges     |
| ------------------------ | ---------- | ------ | ---------------------------------------- | ---------- |
| Arc Pendant Light        | Lighting   | $485   | Solid brass, natural Belgian linen       | Featured   |
| Orb Table Lamp           | Lighting   | $295   | Mouth-blown glass, solid bronze          | New        |
| Berg Floor Lamp          | Lighting   | $620   | Aged brass, rice paper shade             | —          |
| Large Sculptural Vessel  | Ceramics   | $320   | High-fire stoneware, natural ash glaze   | Featured   |
| Everyday Serving Bowl    | Ceramics   | $145   | Stoneware, food-safe glaze               | —          |
| Harvest Dining Table     | Furniture  | $2,850 | Solid white oak, natural oil finish      | Featured   |
| Halden Linen Armchair    | Furniture  | $890   | Solid oak, washed linen (sand)           | Bestseller |
| SolSide Oak Table        | Furniture  | $540   | Solid FSC oak, linseed finish            | —          |
| Washed Linen Throw       | Textiles   | $195   | 100% washed European linen               | Bestseller |
| Hand-Felted Wool Cushion | Textiles   | $165   | 100% New Zealand wool, linen back        | —          |
| Sculptural Bud Vase      | Objects    | $85    | Stoneware, matte white glaze             | —          |
| Winter Hearth Candle     | Seasonal   | $65    | Soy wax, cotton wick, stoneware vessel   | —          |
| Curated Gift Box         | Gifts      | $225   | Stoneware, soy candle, linen, wooden box | —          |

These products are seeded via `packages/db/src/seed/index.ts` and match the products rendered in `docs/landing_page_unified.html`.

---

## 16. Responsive & Accessibility Specifications

### 16.1 Responsive Breakpoints

| Breakpoint | Width       | Layout Changes                                                      |
| ---------- | ----------- | ------------------------------------------------------------------- |
| Mobile     | < 640px     | Single column, hamburger drawer, stacked grids, swipeable carousels |
| Tablet     | 640–1023px  | 2-column product grid, side-by-side featured, condensed nav         |
| Desktop    | 1024–1439px | 4-column products, full nav, 12-col asymmetric collections          |
| Wide       | ≥ 1440px    | Max-width containers (1280px), increased section padding            |

### 16.2 Key Responsive Behaviours (matching landing page)

- **Header:** Logo + hamburger (mobile) → Logo + full nav + icons (desktop ≥ 1024px)
- **Hero:** Stacked text, full-bleed image (mobile) → Bottom-left aligned text (desktop)
- **Products:** 1-col → 2-col → 3-col → 4-col
- **Categories:** 1-col → 2-col → 4-col
- **Philosophy:** Stacked → 2-col asymmetric
- **Instagram:** 3-col → 6-col
- **Footer:** Stacked → 4-column grid
- **Cart drawer:** Full-width (mobile) → 380px slide-in (desktop)

### 16.3 Accessibility (WCAG 2.2 AA)

- Semantic HTML throughout (`<main>`, `<nav>`, `<article>`, `<aside>`, `<footer>`)
- ARIA labels on all icon-only buttons (search, cart, wishlist, menu)
- Keyboard navigable: focus management, skip link, focus-visible outlines
- Colour contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text
- Alt text on all product images (descriptive, not keyword-stuffed)
- Reduced motion support (`prefers-reduced-motion: reduce`)
- Screen reader compatible cart/checkout flow (aria-live regions for cart updates)
- Form labels associated via `<label for>` or wrapping
- Error messages announced via `aria-live="assertive"`
- Mobile nav drawer: focus trap when open, restored on close
- Playwright `@axe-core/playwright` in E2E suite to catch regressions

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
- `packages/api`: 85% (business logic critical)
- `packages/auth`: 90% (security critical)
- `packages/payments`: 90% (money critical)
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
- [ ] `packages/db` — Drizzle schema, migrations, seed (8 collections, 13 products)
- [ ] `packages/auth` — Better Auth config (email/password, sessions, RBAC)
- [ ] `packages/ui` — Design tokens (colors.css, typography.css), self-hosted fonts
- [ ] `apps/web` — Next.js 16 scaffold, `proxy.ts`, `globals.css` with Tailwind v4 `@theme`
- [ ] `.env.example`, `docker-compose.yml` (Postgres + Redis), `pnpm-workspace.yaml`
- [ ] CI/CD pipeline (GitHub Actions: lint → typecheck → test → build → deploy preview)
- [ ] Vercel + Neon + Stripe (test mode) accounts wired

### Phase 1 — MVP (Weeks 3–6)

- [ ] Homepage (all 15 sections from `docs/landing_page_unified.html`)
- [ ] Product listing (`/products`) with collection filter + sort
- [ ] Product detail (`/product/{slug}`) with gallery, related products
- [ ] Shopping cart (DB-backed, anonymous + authenticated)
- [ ] Checkout (Stripe Payment Intents, 3-step flow)
- [ ] Order confirmation + email (Resend + React Email)
- [ ] Customer account (sign-in, sign-up, order history, wishlist)
- [ ] Admin dashboard (overview, products CRUD, orders list, fulfillment)
- [ ] Responsive design (all breakpoints)
- [ ] SEO (meta tags, sitemap, JSON-LD, robots.txt)
- [ ] Analytics (PostHog events)
- [ ] Error tracking (Sentry)
- [ ] E2E test suite (10 critical scenarios)
- [ ] Lighthouse Performance ≥ 90

### Phase 2 — Growth (Weeks 7–12)

- [ ] OAuth login (Google, Apple)
- [ ] Magic link sign-in
- [ ] Wishlist persistence (anonymous → authenticated merge)
- [ ] Address book with autocomplete (Google Places)
- [ ] Sanity CMS full integration (homepage sections, journal, maker profiles)
- [ ] Newsletter integration (Klaviyo, double opt-in)
- [ ] Product search (Postgres FTS → Algolia if insufficient)
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
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`        | Yes      | Client-side Stripe Elements                      |
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
| **PDP**                  | Product Detail Page (`/product/{slug}`)                                          |
| **PLP**                  | Product Listing Page (`/products`)                                               |
| **RSC**                  | React Server Component — renders on server, ships zero JS                        |
| **RBAC**                 | Role-Based Access Control — `customer` / `staff` / `admin` roles                 |
| **Trade program**        | Phase 3 feature: designer tier with 10–20% discount                              |
| **White Glove delivery** | Premium shipping: in-home setup, packaging removal (2-week lead time)            |

---

_End of Unified PRD v1.0. For the engineering blueprint, see `PROJECT-ARCHITECTURE.md`. For developer onboarding, see `README.md` and `AGENTS.md`. For AI agent instructions, see `CLAUDE.md`._
