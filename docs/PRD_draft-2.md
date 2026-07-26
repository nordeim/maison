### Scandi Haven — Production-Ready E-Commerce Platform

**Version:** 1.0 · **Author:** Product · **Last updated:** 2025 · **Status:** Approved for build

---

### 1. Executive Summary

Scandi Haven is a direct-to-consumer e-commerce brand selling handcrafted Scandinavian furniture, lighting, textiles and ceramics. The current marketing landing page (captured above) communicates the brand but is non-functional: no real checkout, no account, no inventory, no admin.

This PRD defines the requirements to build a **full production e-commerce platform** — customer-facing storefront, headless commerce APIs, admin back-office, and integrations — capable of supporting €5M+ annual GMV across EU + US markets with a four-person operating team.

**North-star metric:** Conversion rate (visitor → paid order) ≥ 2.4% on cold traffic.
**Secondary metrics:** Average order value €420+, repeat-purchase rate ≥ 38% within 12 months, NPS ≥ 70.

---

### 2. Goals & Non-Goals

**Goals**
- Replace the static landing page with a full storefront (PLP, PDP, cart, checkout, account, order management).
- Provide an admin back-office for products, orders, customers, content and promotions usable by a non-technical operator.
- Support multi-region (EU + US + UK) with localized pricing, taxes, shipping and language.
- Be performant (Core Web Vitals "Good" on all key pages), accessible (WCAG 2.2 AA), and SEO-competitive.
- Be commercially extensible (discounts, gift cards, trade program, subscriptions later).

**Non-Goals (v1)**
- Marketplace / third-party sellers.
- Physical retail POS integration.
- Augmented-reality room visualisation.
- Native mobile apps (responsive web only).
- Custom manufacturing / ERP integration (Phase 2).

---

### 3. Target Audience & Personas

**P1 — "The Considered Buyer"** · 35–55, design-literate, urban professional, €80k+ household income. Buys 1–3 major pieces per year. Researches for weeks. Values provenance, materials, longevity. Will pay premium for craft and service.

**P2 — "The New-Home Nestor"** · 28–40, furnishing first or second home, €50k+ income. Mid-funnel via Pinterest/Instagram. Higher category breadth per order. Sensitive to shipping cost and lead-time clarity.

**P3 — "Trade Buyer (B2B)"** · Interior designers, architects, boutique hospitality. Needs trade pricing, lead times, sample ordering, line-of-credit. Represents ~22% of forecasted revenue.

**P4 — "The Gift Buyer"** · Seasonal, lower AOV (€60–€180), ships to third address. Needs gift wrap, gift card, message field, easy returns.

---

### 4. Functional Requirements (by domain)

#### 4.1 Storefront — Navigation & Discovery
- **Global header:** logo, primary nav (Shop, Collections, Our Story, Journal, Contact), search, account, cart. Sticky on scroll. Mobile hamburger drawer.
- **Search:** instant results with product image, name, price; typeahead suggestions for categories and journal entries; supports synonyms ("couch" → "sofa"); typo tolerance; recent searches.
- **Mega-menu:** Shop → Furniture → Seating / Tables / Storage / Beds; each with featured collection thumbnail.
- **Footer:** shop links, about links, help links, showroom addresses, newsletter form, social icons, payment methods, legal links, locale switcher.

#### 4.2 Product Listing Page (PLP)
- Filters: category, sub-category, material, colour, price range, availability, lead time, collection.
- Sort: featured, newest, price asc/desc, best-selling.
- Grid/list toggle. Product card: image (hover-swap), badge (New/Sale/Low-stock), name, material, price (with strikethrough if on sale), quick-add.
- Pagination or infinite scroll (pref: pagination with 24 per page for SEO + shareable URLs).
- SEO-friendly URLs: `/shop/furniture/seating/halden-linen-armchair`.
- Faceted URL params (`?material=oak&color=sand`) that are canonicalized and indexable.
- Empty-state messaging when filters return zero results.

#### 4.3 Product Detail Page (PDP)
- Image gallery: primary + up to 8 thumbnails, zoom-on-hover, swipe on mobile, video optional.
- Variants: material/colour/size selectors with swatch images and stock state per variant.
- Price display: current price, compare-at price, "save X%" badge, tax-inclusive label per locale.
- **Lead-time badge:** "Made to order — ships in 6–8 weeks" or "In stock — ships in 2–4 days".
- Quantity selector, **Add to cart** primary CTA, **Save to wishlist** secondary.
- Description (rich text), materials & care accordion, dimensions diagram, sustainability notes, shipping & returns accordion.
- Cross-sell: "Pairs well with" (4 products, merchandiser-curated + algorithmic fallback).
- Reviews: star summary, distribution bars, paginated reviews with photos, sort by recency/helpfulness, write-a-review form (post-purchase verified buyers only).
- Sticky mobile add-to-cart bar.
- Structured data: `Product`, `Offer`, `AggregateRating`, `BreadcrumbList`.

#### 4.4 Cart & Checkout
- Slide-out mini-cart drawer (already prototyped in the captured HTML) with line items, qty stepper, remove, subtotal, "Proceed to checkout".
- Full cart page with order summary, shipping estimate by ZIP/postcode, promo code field, gift card field.
- **Checkout:** single-page, 3 steps (Information → Shipping → Payment), express options (Apple Pay, Google Pay, Klarna, PayPal).
- Address autocomplete (Google Places or Loqate).
- Guest checkout supported; account creation offered post-purchase.
- Multi-currency display; charged in customer's currency with locked FX rate at order.
- Tax calculation by destination (Avalara or Stripe Tax).
- Shipping methods: Standard, Express, White-glove (furniture), Pickup-at-showroom.
- Gift options: gift wrap (+€8), gift message, gift receipt (no prices in shipment).
- Order confirmation: on-screen + email + SMS (optional opt-in).

#### 4.5 Customer Account
- Auth: email/password, magic-link, OAuth (Google, Apple).
- Profile: name, email, phone, default addresses, communication preferences.
- Order history with status, tracking link, invoice PDF download.
- Reorder one-click, return-request initiation.
- Saved addresses, payment methods (tokenized via Stripe).
- Wishlist (multiple lists, shareable via URL).
- Reviews written + pending.
- Trade account: separate registration with business verification, trade-only pricing visible when approved.

#### 4.6 Content & Editorial
- **Collections** (curated groups of products with editorial header image, story copy, and product grid).
- **Journal** (blog posts with categories: Craft, Home, People, Sustainability). Rich-text WYSIWYG, hero image, inline product embeds ("shop this post").
- **Static pages:** Our Story, Sustainability, Materials, Showrooms, Trade Program, FAQ, Shipping, Returns, Privacy, Terms, Cookies, Accessibility.
- **Lookbooks** (seasonal, image-led, shoppable hotspots).
- Redirect manager for URL changes.

#### 4.7 Admin / Back-Office

**Dashboard:** revenue today/7d/30d, orders pending fulfilment, low-stock alerts, top products, conversion funnel.

**Catalog management:**
- Product CRUD: title, slug, description (rich text), variants, materials, dimensions, weight, HS code, country of origin, lead time, images (with alt text), collections, tags, SEO meta.
- Inventory per variant per warehouse (Aalborg warehouse + Copenhagen showroom floor stock).
- Pricing: base price per currency, sale price with schedule, trade price tier.
- Bulk import/export (CSV).

**Order management:**
- Order list with filters (status, date, channel, value, country).
- Order detail: line items, customer, addresses, payments, shipments, notes, timeline.
- Actions: capture payment, refund (partial/full), cancel, split-ship, mark shipped, print packing slip, print return label.
- Returns workflow: request → approve → ship → inspect → refund/exchange.
- Fraud review queue (flagged by risk score).

**Customer management:** searchable directory, order history, lifetime value, segment tags, manual notes, GDPR tools (export, anonymize, delete).

**Content management:** journal posts, collections, lookbooks, static pages, redirects, navigation menu editor.

**Promotions:** discount codes (fixed/percent/free shipping), automatic promotions, scheduling, usage limits, per-customer limits, product/category exclusions, BOGO, tiered ("spend €500 get €50 off").

**Gift cards:** digital gift cards, configurable denominations, custom design, scheduled delivery, balance lookup, fraud limits.

**Reporting:** sales by day/week/month, by product, by category, by channel, by country, by discount; export to CSV; scheduled email reports; cohort + repeat-purchase report.

**Settings:** regions enabled, currencies, tax rules, shipping zones & rates, payment providers, team members & roles, webhooks, API keys.

**Roles & permissions:** Owner, Admin, Merchandiser, Customer-service, Warehouse, Read-only.

#### 4.8 Trade / B2B
- Application form with business details + resale certificate upload.
- Manual approval workflow.
- Trade-only pricing visible after login (crossed-out retail + net price).
- Net-30 payment terms for approved accounts (via Stripe Invoicing).
- Bulk order pad (CSV upload of SKUs).
- Dedicated trade concierge contact.

#### 4.9 Post-Purchase
- Order status emails: confirmed, in-production, shipped, out-for-delivery, delivered.
- Tracking page (carrier-agnostic via AfterShip).
- Returns portal: self-service, reason codes, photo upload for damage, label generation, refund status.
- Review request email 21 days post-delivery.

---

### 5. Non-Functional Requirements

| Domain | Requirement |
|---|---|
| **Performance** | LCP < 2.0s on 4G mobile for PDP/PLP; INP < 200ms; CLS < 0.05. Product images served as AVIF/WebP via CDN with responsive `srcset`. |
| **Availability** | 99.95% monthly for storefront; 99.9% for admin. Multi-AZ; DR RTO 4h, RPO 15min. |
| **Scalability** | Support 10× traffic peak (e.g., holiday gift guide press) without degradation. Stateless web tier, horizontally scalable. |
| **Security** | OWASP ASVS L2; PCI DSS via Stripe (no card data on our servers); TLS 1.3; HSTS; CSP; signed S3 image URLs; secrets in vault; pen-test annually. |
| **Accessibility** | WCAG 2.2 AA; axe-core in CI; keyboard navigable; screen-reader tested with NVDA + VoiceOver. |
| **i18n** | English (default), Danish, German, Swedish. Language negotiation by URL prefix (`/de/...`) + Accept-Language. |
| **Browser support** | Last 2 versions of Chrome, Safari, Firefox, Edge; iOS Safari 16+; Android Chrome 110+. |
| **SEO** | Server-rendered HTML; canonical URLs; sitemap.xml; robots.txt; structured data; breadcrumb; OG/Twitter cards; pagination via `rel=next/prev`. |
| **Privacy / Compliance** | GDPR (EU + UK), CCPA, Danish Cookie Order, EU Digital Services Act (DSA). Consent management via OneTrust or Cookiebot. |
| **Observability** | APM (Datadog or Sentry), structured logs, RUM (SpeedCurve or Datadog RUM), error tracking, alerting on SLO breaches. |
| **Backup** | Database PITR + daily snapshots; 30-day retention; quarterly restore drills. |

---

### 6. Information Architecture (Pages & Routes)

```
/                            Homepage
/shop                        All products
/shop/{category}             Category PLP (furniture, lighting, textiles, ceramics)
/shop/{category}/{sub}       Sub-category PLP
/collections                 All collections
/collections/{slug}          Single collection
/products/{slug}             PDP (canonical URL pattern; /shop/.../slug redirects here)
/journal                     Journal index
/journal/{category}/{slug}   Article
/lookbooks/{slug}            Lookbook
/our-story, /sustainability, /materials, /showrooms, /trade, /faq,
/shipping, /returns, /privacy, /terms, /cookies, /accessibility
/cart                        Full cart
/checkout                    Checkout
/account                     Account dashboard (auth required)
/account/orders, /account/addresses, /account/wishlists, /account/reviews,
/account/returns, /account/settings
/trade/apply                 Trade application
/search?q=                   Search results
/404, /500
```

Admin:
```
/admin                       Dashboard
/admin/catalog/products      Product list
/admin/catalog/products/new  Product editor
/admin/catalog/inventory     Inventory
/admin/orders                Order list
/admin/orders/{id}           Order detail
/admin/customers             Customer list
/admin/customers/{id}        Customer detail
/admin/content/{journal,collections,pages,lookbooks}
/admin/marketing/{promotions,gift-cards,email}
/admin/reports
/admin/settings/{regions,shipping,taxes,payments,team}
```

---

### 7. User Flows (illustrative)

**Flow A — First-time buyer (cold traffic → first order):**
1. Lands on homepage from Instagram ad.
2. Browses "Autumn Collection".
3. Opens Halden Armchair PDP.
4. Selects variant, adds to cart → cart drawer opens.
5. Clicks "Checkout".
6. Enters email + shipping address (autocomplete).
7. Selects standard shipping, sees lead time.
8. Pays with Apple Pay.
9. Sees confirmation, receives email.
10. 21 days post-delivery: review request email.
11. 30 days later: win-back email with €50 off next order.

**Flow B — Trade buyer:**
1. Lands via Google search "trade furniture suppliers Denmark".
2. Visits /trade, applies with CVR + resale cert.
3. Admin reviews within 48h, approves.
4. Buyer receives welcome email with login.
5. Logs in, sees trade prices.
6. Uploads CSV of SKUs to order pad.
7. Selects Net-30 terms.
8. Invoice generated via Stripe Invoicing, sent to AP email.

**Flow C — Return:**
1. Customer logs into /account/orders.
2. Clicks "Return item" on order.
3. Selects reason, uploads damage photo.
4. Receives prepaid return label by email.
5. Ships item; warehouse receives, inspects.
6. Admin approves refund; Stripe refunds original payment.
7. Customer receives refund-confirmation email.

---

### 8. Page-by-Page Specifications (key pages)

#### 8.1 Homepage
Sections (in order):
1. Announcement bar (rotating, dismissible, content-managed).
2. Hero — editorial split (image + headline + CTAs), content-managed, can be swapped per season.
3. Trust marquee (handcrafted, FSC oak, carbon-neutral, 10-year guarantee).
4. Featured categories (4 tiles, merchandiser-curated).
5. New arrivals (8 products, automated from `is_new=true`).
6. Brand story teaser (image + copy + stats + CTA).
7. Materials section (3 material cards).
8. Editorial collection block ("Hygge Edit") — dark background.
9. Testimonials (3-up, randomized from approved reviews).
10. Journal preview (3 latest posts).
11. Newsletter signup.
12. Footer.

#### 8.2 Product Detail Page
Specs in section 4.3. Additional:
- Breadcrumb (Home > Shop > Category > Product).
- Mobile sticky add-to-cart.
- Out-of-stock variant: disabled swatch + "Notify me" form (Klaviyo back-in-stock).
- Pre-order support: distinct badge + estimated ship date.

#### 8.3 Checkout
- Single-page accordion layout.
- Express pay buttons at top (Apple/Google/PayPal).
- Email → shipping → shipping method → payment → review.
- Trust badges, secure-checkout indicator.
- Inline validation, no page reloads.
- Error recovery: if payment fails, preserve form data, show clear error.
- abandonment: email triggered at 30min, 24h.

---

### 9. Data Model (high-level)

**Core entities:**

```
Product
  id, slug, title, description, status (draft/active/archived),
  category_id, brand, country_of_origin, hs_code,
  lead_time_days, is_new, is_preorder, created_at, updated_at

ProductVariant
  id, product_id, sku, material, color, size,
  weight_g, dimensions_cm, price_cents (multi-currency), compare_at_cents,
  inventory[{warehouse_id, qty, safety_stock}], images[]

Collection
  id, slug, title, hero_image, story_copy, product_ids[], sort

Order
  id, number, customer_id, status, currency,
  subtotal_cents, discount_cents, shipping_cents, tax_cents, total_cents,
  billing_address, shipping_address, shipments[], payments[],
  placed_at, fulfilled_at, refunded_at, source

OrderLine
  id, order_id, product_variant_id, qty, unit_price_cents, totals

Customer
  id, email, name, phone, addresses[], is_trade, trade_tier,
  lifetime_value_cents, segment_tags[], created_at

Promotion
  id, code, type (fixed/percent/freeship/boGO), value, conditions,
  schedule, usage_count, usage_limit, customer_limit

GiftCard
  id, code, balance_cents, purchaser_customer_id, recipient_email,
  expires_at, transactions[]

JournalPost
  id, slug, title, hero_image, body_html, category, published_at,
  author, related_product_ids[]

Review
  id, product_id, customer_id, order_id, rating, body, photos[],
  approved, created_at
```

Multi-currency: prices stored in EUR base; rates table updated daily; pricing overrides allowed per currency.

---

### 10. Technical Architecture

**Stack recommendation:**

- **Storefront:** Next.js 14 (App Router, RSC) on Vercel. Server-rendered for SEO, streaming for performance.
- **Styling:** Tailwind CSS + CSS variables for the design tokens (matches the captured palette).
- **Commerce backend:** **Medusa.js v2** (open-source, Node, self-hosted on AWS Fargate) OR **Shopify Plus** (faster TTM, higher licensing cost). Recommendation: **Medusa.js** for control over multi-warehouse, made-to-order lead times and trade pricing — requirements that are awkward in Shopify.
- **Database:** PostgreSQL 16 (RDS Aurora Serverless v2) + Redis (cache, sessions, rate-limit).
- **Search:** Algolia or Meilisearch (self-hosted). Index products + journal.
- **Image CDN:** Cloudinary or Cloudflare Images (AVIF/WebP, responsive variants, signed URLs for trade-only assets).
- **Email:** Resend (transactional) + Klaviyo (marketing).
- **Payments:** Stripe (cards, Apple/Google Pay), Klarna (BNPL), PayPal.
- **Tax:** Stripe Tax or Avalara AvaTax.
- **Shipping:** ShipStation or Shippo (rates + labels), AfterShip (tracking).
- **Analytics:** GA4 + Segment + Hotjar + Meta Pixel + Google Tag Manager.
- **Auth:** Auth0 or Clerk (email/password, magic link, OAuth).
- **CMS for journal:** Built-in (rich-text WYSIWYG in admin) or Sanity for editorial team.
- **Hosting:** Vercel (storefront), AWS Fargate (Medusa), RDS (DB), ElastiCache (Redis), S3 (assets).
- **CI/CD:** GitHub Actions → Vercel preview deploys + ECS Fargate blue/green.
- **IaC:** Terraform for AWS resources.

---

### 11. API Specification (key endpoints)

REST or GraphQL (recommend REST for v1 simplicity; Medusa already provides these):

```
GET    /store/products?category=&limit=&cursor=    List products
GET    /store/products/{slug}                       Product detail
POST   /store/carts                                 Create cart
GET    /store/carts/{id}                            Get cart
POST   /store/carts/{id}/line-items                 Add to cart
PUT    /store/carts/{id}/line-items/{lid}           Update qty
DELETE /store/carts/{id}/line-items/{lid}           Remove line
POST   /store/carts/{id}/promotions                 Apply promo
POST   /store/carts/{id}/complete                   Place order → returns order_id
GET    /store/orders/{id}                           Order detail (auth)
POST   /store/orders/{id}/returns                   Initiate return
GET    /store/customers/me                          Profile
POST   /store/customers/me/addresses                Add address
GET    /store/collections/{slug}                    Collection + products
POST   /store/newsletter/subscribe                  Newsletter signup
POST   /store/reviews                               Submit review
POST   /store/back-in-stock                         Notify me
```

Admin API (key-only):
```
GET/POST/PUT/DELETE /admin/products
GET/POST/PUT        /admin/orders/{id}
POST                /admin/orders/{id}/refund
POST                /admin/orders/{id}/ship
GET/POST            /admin/customers
GET/POST            /admin/promotions
GET/POST            /admin/gift-cards
GET                 /admin/reports/sales
```

Webhooks:
- `order.placed` → Klaviyo, ShipStation, Slack
- `order.shipped` → AfterShip, Klaviyo
- `order.delivered` → review request scheduled
- `inventory.updated` → back-in-stock notifier
- `return.requested` → admin Slack

---

### 12. Third-Party Integrations

| Purpose | Vendor | Notes |
|---|---|---|
| Payments | Stripe | EU + US, 3DS SCA compliant |
| BNPL | Klarna | DE/SE/DK/UK |
| Tax | Stripe Tax | Real-time by destination |
| Shipping rates & labels | Shippo | Multi-carrier |
| Tracking | AfterShip | Customer-facing tracking page |
| Email (transactional) | Resend | Order confirmations, shipping updates |
| Email (marketing) | Klaviyo | Newsletters, abandoned cart, flows |
| Reviews | Yotpo or Junip | Photo reviews, verified buyer |
| Search | Algolia | Faceted, typo-tolerant |
| CMS (journal) | Built-in or Sanity | Depends on editorial workflow |
| Auth | Clerk | Magic link, OAuth |
| Analytics | GA4 + Segment | Single event source |
| Error tracking | Sentry | Frontend + backend |
| APM | Datadog | Backend services |
| CDN | Cloudflare | WAF + image resizing |
| Consent | Cookiebot | GDPR/CCPA |

---

### 13. Design System

**Tokens (matching the captured landing page):**
- Background: `#FAF7F2` (warm off-white), `#F0EAE0` (cream), `#E8E0D2` (sand)
- Ink: `#1F1B17` (warm near-black), `#4A433B` (warm gray), `#8A8178` (muted)
- Accent: `#C97B5E` (terracotta), `#B06548` (deep terracotta)
- Secondary: `#8B9A82` (sage), `#C9A876` (wood)
- Line: `#E5DDD1`
- Display typeface: **Fraunces** (variable, opsz 9–144, weights 300–500, italic)
- UI typeface: **Inter** (weights 300–600)
- Type scale: 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64 / 96
- Radii: 2px (cards), 999px (pills), 0 (images — sharp editorial)
- Spacing scale: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 80 / 120
- Motion: `cubic-bezier(0.22, 1, 0.36, 1)`, durations 200/300/400/800ms
- Elevation: minimal; use hairlines and warm backgrounds rather than drop shadows

**Components library:** build in Storybook — Button (primary/ghost/icon), Badge, ProductCard, CartDrawer, Drawer, Modal, Toast, Input, Select, Swatch, QuantityStepper, Accordion, Tabs, Pagination, Breadcrumb, Rating, Table, etc.

---

### 14. SEO Requirements

- Server-rendered HTML on all indexable pages.
- Per-page editable: `title`, `meta description`, `og:image`, `canonical`.
- Sitemap.xml generated daily, includes PLPs, PDPs, collections, journal, static pages.
- Robots.txt blocks `/admin`, `/account`, `/cart`, `/checkout`, `/search`.
- Structured data: `Product`, `Offer`, `AggregateRating`, `BreadcrumbList`, `Article`, `Organization`, `WebSite` with SearchAction.
- Image sitemap; descriptive alt text required at CMS field level.
- Pagination via `rel=next/prev` and `?page=N` (not infinite scroll) for indexable PLPs.
- Hreflang tags for EN/DA/DE/SV.
- 301 redirect manager in admin.
- Core Web Vitals "Good" on PDP, PLP, homepage.

---

### 15. Analytics & Event Tracking

**GA4 events** (via Segment):
- `page_viewed`
- `product_viewed` (with product_id, variant, price)
- `product_list_viewed` (PLP, with list_id)
- `product_added_to_cart`, `product_removed_from_cart`
- `cart_viewed`, `checkout_started`, `checkout_step_completed`
- `payment_info_entered`, `order_completed` (revenue, currency, items)
- `wishlist_added`, `wishlist_removed`
- `review_submitted`
- `newsletter_subscribed`
- `search_performed` (with query)
- `promotion_applied` (with code)

**Conversions:** Purchase (primary), Add-to-cart, Begin-checkout, Email-subscribe.

**Dashboards:** Revenue (daily/weekly/monthly), Conversion rate by channel, AOV, Top products, Funnel (view → add → checkout → purchase), Cohort retention, Abandoned-cart recovery rate.

---

### 16. Security & Compliance

- **PCI DSS:** Use Stripe Elements + Payment Intents; never touch PAN. SAQ-A scope.
- **GDPR:** Cookie consent banner (Cookiebot), DSR (data subject request) workflow in admin (export + delete), data-retention policy (raw order data 7y for tax; customer profile deletable on request with order anonymized).
- **CCPA:** "Do Not Sell My Personal Information" link in footer.
- **EU DSA:** Trader identification on product pages, clear reporting channel for illegal content.
- **Danish Cookie Order:** Consent banner reflects local requirements.
- **Security:** WAF (Cloudflare), DDoS protection, rate-limiting on auth + checkout, bot detection (Cloudflare Bot Management), 2FA required for all admin users, audit log for all admin actions, secrets in AWS Secrets Manager, dependency scanning (Snyk) in CI.
- **Pen-test:** Annual third-party; quarterly internal review.

---

### 17. Performance Budget

| Page | LCP | INP | CLS | JS transferred |
|---|---|---|---|---|
| Homepage | < 2.0s | < 200ms | < 0.05 | < 180 KB |
| PLP | < 2.0s | < 200ms | < 0.05 | < 200 KB |
| PDP | < 2.0s | < 200ms | < 0.05 | < 220 KB |
| Checkout | < 1.5s | < 100ms | < 0.02 | < 250 KB |

Image strategy: AVIF first, WebP fallback; responsive `srcset`; lazy-load below the fold; CMS enforces max 200KB per hero, 80KB per product image.

---

### 18. Accessibility Requirements

- WCAG 2.2 AA.
- All interactive elements keyboard accessible; visible focus rings.
- Skip-to-content link.
- Semantic landmarks (`header`, `nav`, `main`, `footer`).
- ARIA on dynamic regions (cart drawer, mobile menu, toast).
- Form labels explicit; error messaging via `aria-describedby` + `role="alert"`.
- Color contrast ≥ 4.5:1 body, ≥ 3:1 large text.
- Alt text required on all product images at upload.
- axe-core in CI; quarterly audit with screen-reader users.

---

### 19. Testing Strategy

- **Unit:** Jest / Vitest for business logic (pricing, tax, shipping).
- **Component:** React Testing Library on Storybook stories.
- **E2E:** Playwright covering critical paths (browse → add → checkout → order), running on every PR + hourly smoke in prod.
- **Visual regression:** Chromatic on Storybook.
- **Load:** k6 simulating 10× peak traffic on PLP + checkout.
- **Accessibility:** axe-core in CI + manual NVDA/VoiceOver sweeps per release.
- **Security:** Snyk (deps), OWASP ZAP (DAST), GitHub CodeQL (SAST).
- **UAT:** Pre-release checklist with merchandiser + customer-service.

---

### 20. Release & Rollout Plan

**Phase 0 — Foundations (4 weeks):**
- Repo setup, CI/CD, design system in Storybook, auth scaffold, Medusa deploy, Stripe connect, basic catalog import.

**Phase 1 — MVP Storefront (6 weeks):**
- Homepage, PLP, PDP, cart, checkout, order confirmation, customer account, search, basic admin (catalog + orders). Launch to staging.

**Phase 2 — Pre-launch polish (3 weeks):**
- Performance pass, accessibility audit, SEO setup, analytics, email flows, returns portal, reviews.

**Phase 3 — Soft launch (2 weeks):**
- Invite-only to existing newsletter; monitor; fix; refine.

**Phase 4 — Public launch:**
- DNS cutover, redirect legacy URLs, press kit, paid social.
- Rollback plan: feature flags on all major surfaces; instant rollback via Vercel + ECS.

**Phase 5 — Post-launch (ongoing):**
- Trade program (4 weeks post-launch), gift cards (6 weeks), subscriptions on consumables (Q+2), AR visualizer (Q+3).

---

### 21. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Long lead times (made-to-order) hurt conversion | High | High | Clear lead-time badges; "in-stock" filter; safety stock for hero SKUs |
| Cross-border tax complexity (EU OSS + US nexus) | Med | High | Use Stripe Tax from day 1; quarterly tax review |
| Carrier damage on large furniture | Med | Med | White-glove option for >30kg; packaging spec; damage-claim SOP |
| Image bloat hurts performance | High | Med | Hard limits in CMS; AVIF; CDN resizing |
| Trade program abuse (resale) | Low | Med | Manual approval; resale cert required; order limits |
| Single-supplier concentration (oak from SE) | Low | High | Qualify second supplier in PL; safety stock |
| SEO migration from current site | Med | High | 301 map; preserve high-traffic URLs; monitor 404s weekly |

---

### 22. Success Metrics (12-month targets)

| Metric | Target |
|---|---|
| Conversion rate (cold traffic) | ≥ 2.4% |
| AOV | ≥ €420 |
| Repeat purchase rate (12m) | ≥ 38% |
| NPS | ≥ 70 |
| Return rate | ≤ 6% |
| Order-to-ship lead (in-stock) | ≤ 3 business days |
| Customer-service first response | ≤ 4 business hours |
| Core Web Vitals "Good" | 100% of key pages |
| Uptime | ≥ 99.95% |
| Trade accounts active | ≥ 250 by month 12 |

---

### 23. Future Roadmap (post-launch)

- **Q+1:** Trade portal v2 (line-of-credit, bulk order pad, custom finishes).
- **Q+2:** Subscriptions on ceramics restocks + linens refills.
- **Q+3:** AR room visualizer (3D models per product).
- **Q+4:** Marketplace expansion (Norway, Finland, Netherlands).
- **Q+5:** Showroom booking system; in-store pickup expansion.
- **Q+6:** Sustainability impact dashboard per order (kg CO₂e, materials origin map).
- **Year 2:** Custom upholstery configurator; B2B contract pricing engine.

---

### 24. Appendices

**A. Glossary** — AOV, GMV, DSA, OSS, BNPL, PLP, PDP, RTO, RPO, SLO, CWV.

**B. Open questions for stakeholder review**
1. Final currency list at launch? (proposed: EUR, DKK, SEK, USD, GBP)
2. Net-30 trade credit — in-house or via Stripe Invoicing?
3. Warehouse strategy: single Aalborg vs. add EU 3PL for Southern Europe?
4. Editorial CMS: in-house WYSIWYG vs. Sanity — depends on editorial workflow.

**C. Sign-off**
- Product: ___ · Engineering: ___ · Design: ___ · Operations: ___ · Legal: ___
