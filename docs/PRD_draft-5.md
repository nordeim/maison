# Product Requirements Document
## Maison — Curated Home Goods E-Commerce Platform
### (Reverse-engineered from `https://scandi-haven-shop.lovable.app/`)

**Document version:** 1.0
**Author:** Engineering (extracted & specified from live site analysis)
**Status:** Draft for production build

---

## 1. Executive Summary

Maison is a boutique e-commerce storefront for handcrafted, Scandinavian-inspired home goods (lighting, ceramics, furniture, textiles, decorative objects, seasonal items, and curated gifts). The current live implementation (Lovable/Vite/React SPA) is a **front-end-only marketing + browsing experience** with client-side cart/wishlist state and a **"request to order" checkout** (no live payment processing — an order-request email/notification flow instead).

This PRD specifies the requirements to rebuild Maison as a **fully functioning, production-ready, full-stack web application**, preserving the existing design language and UX while adding the real backend, persistence, payments, and operational capabilities needed for a production launch.

---

## 2. Goals & Non-Goals

### 2.1 Goals
- Reproduce and productionize the existing storefront experience (home, collections, PDP, cart, checkout, about).
- Replace mocked/client-only state (cart, wishlist, product catalog) with a real backend, database, and APIs.
- Implement real payment collection (Stripe) and order management (replacing the "we'll contact you" placeholder).
- Add authentication, order history, and account management.
- Add an admin/back-office for catalog, inventory, and order operations.
- Ensure production-grade performance, SEO, accessibility, and observability.

### 2.2 Non-Goals (Phase 1)
- Multi-vendor marketplace functionality.
- Native mobile apps.
- Complex ERP/ warehouse integrations (only a simple inventory count is required initially).
- Multi-currency/localization (English/USD only in Phase 1; architecture should not block future i18n).

---

## 3. Brand & Design System (extracted from live site)

| Token | Value | Notes |
|---|---|---|
| Brand name | **Maison** | Serif wordmark, no icon |
| Typeface (display/headings) | `Cormorant Garamond` (400–700, italic variants) | Elegant serif, used for all H1–H4 |
| Typeface (body/UI) | `Inter` (300–600) | Sans-serif for body copy, nav, buttons |
| Background | `hsl(40 33% 97%)` (warm cream) | |
| Foreground/text | `hsl(30 10% 15%)` (charcoal) | |
| Primary/accent | `hsl(18 45% 45%)` (terracotta) | CTAs, kicker labels, active states |
| Linen (section bg) | `hsl(35 25% 93%)` | Alternating section background |
| Border | `hsl(30 15% 88%)` | |
| Radius | `0.25rem` default; **buttons/cards use square corners (`rounded-none`)** for an editorial look | |
| Dark mode | Defined CSS variables exist (`.dark`) but are unused in current UI | Should still be implemented as a stretch goal |

**Visual language:** generous whitespace, large full-bleed imagery, uppercase tracked micro-labels (`kicker` text, e.g. "Curated for Considered Living"), italic serif accents inside headlines, subtle scroll-reveal and Ken Burns hero animation, minimal iconography (Lucide-style line icons), editorial 4-column product grids, asymmetric collection masonry.

---

## 4. Information Architecture / Sitemap

```
/                       Home
/products               Product listing (filter by ?collection=, sort, search)
/product/:slug          Product detail page (PDP)
/about                  Brand story / About Us
/cart                   Shopping bag
/checkout               Checkout (contact, shipping, notes, order submission)
/account                Customer account (NEW — login, order history, addresses, wishlist)
/account/orders/:id     Order detail / tracking (NEW)
/wishlist               Saved items (NEW, currently only a header dropdown preview)
/search                 Global search results (NEW)
/legal/privacy, /legal/terms, /legal/cookies   Legal pages (currently placeholder links)
/faq, /shipping-returns, /care-guide           Support content (currently placeholder links)
--- Admin (NEW, gated) ---
/admin                  Dashboard (orders, revenue, low stock)
/admin/products         Product CRUD
/admin/collections      Collection CRUD
/admin/orders           Order management, status updates, fulfillment
/admin/customers        Customer list & detail
```

---

## 5. Page-by-Page Functional Requirements

### 5.1 Global Header
- Sticky header; transitions from translucent to solid+shadow after 50px scroll.
- Logo "Maison" (serif) links home.
- Desktop nav: **Collections** (hover/focus mega-dropdown listing all collections with name + description, 2-column layout), **Shop All** (→ `/products`), **About** (→ `/about`).
- Right icon cluster: **Wishlist** (heart icon, badge count, hover popover previewing up to 3 saved items), **Cart/Bag** (bag icon, badge count), **Mobile menu toggle** (hamburger/X, <768px only).
- Mobile menu: animated collapsible panel with collections list, Shop All / About / Shopping Bag links.
- **Production requirements:** badge counts must reflect authoritative server-side cart/wishlist state (not just localStorage) once a user is identified (guest session ID or logged-in user ID). Cart/wishlist must persist across devices when authenticated and merge on login.

### 5.2 Home Page
1. **Hero** — full-viewport (`100svh`) background image with slow Ken Burns zoom, gradient overlay, kicker "Curated for Considered Living", H1 "Objects of *Quiet Beauty*", supporting paragraph, primary CTA "Shop Now" → `/products`, animated "Scroll" indicator.
2. **Featured Collection** — split layout: large image (first/featured collection) + copy + "Shop {Collection}" CTA. Featured collection should be configurable by admin (flag on collection).
3. **Latest Products** — "Just Arrived / Latest Products" heading, "View All" link, responsive grid of the 4 most-recently-added products (each card: image w/ hover secondary image swap, hover wishlist heart, "New"/"Featured" tag badge, name, short description, price).
4. **Collections ("Browse By / Collections")** — asymmetric masonry grid (12-col grid: 7+5, 4+4+4, 12 wide) of the first 6 collections with image, name, description, hover zoom.
5. **About teaser** — centered pull-quote style headline, supporting paragraph, "Read Our Story" outline button → `/about`.
6. **Instagram/social strip** — "@maisonhome" heading + 6-image square grid linking to Instagram, hover overlay icon.
7. **Footer** (see §5.7).
- All sections use IntersectionObserver-driven fade/slide-in reveal animations (mirroring current Framer Motion `whileInView`), respecting `prefers-reduced-motion`.

### 5.3 Product Listing Page (`/products`)
- Query-param driven filtering: `?collection=<slug>` pre-filters; combinable with:
  - **Sort**: Newest, Price Low→High, Price High→Low, (add: Best Selling, Alphabetical).
  - **Filter facets** (NEW for production): collection/category, price range, material, availability (in stock only), tags (New/Featured/Seasonal).
  - **Search** keyword box (NEW) with debounced query.
- Grid of product cards identical to home page card component; pagination or infinite scroll (NEW — current site loads full list client-side; production needs server-side pagination for catalog scale).
- Empty state when filters produce no results.
- Breadcrumb (Home / Shop).

### 5.4 Product Detail Page (`/product/:slug`)
- Image gallery (primary + alternates; current data model supports up to 2 images per product — production should support N images + zoom + video).
- Product name, price, short + long description, **materials**, **dimensions**, collection tag.
- Quantity selector, **Add to Bag**, **Add to Wishlist** (heart toggle).
- Stock/availability indicator (NEW — not present today; required for production: "In Stock", "Low Stock", "Out of Stock — Notify Me").
- "You May Also Like" — related products from same collection (current site logic: same-collection products, excluding self, limit 4).
- Structured data (schema.org `Product`, `Offer`, `AggregateRating` once reviews exist) for SEO.
- **NEW for production:** customer reviews & ratings, size/variant selection (if applicable per product), estimated delivery date, share buttons.

### 5.5 Cart (`/cart`)
- Empty state: icon, "Your Bag is Empty", copy, "Start Shopping" CTA.
- Line items: thumbnail, name (linked to PDP), truncated description, unit price, quantity stepper, remove button.
- "Continue Shopping" link back to `/products`.
- Order summary panel (sticky on desktop): Subtotal, Shipping (flat **$25**, **free over $500** — current business rule to preserve), Total, "Proceed to Checkout" CTA.
- **Production requirements:** cart persisted server-side (per session/user), real-time inventory validation before checkout, promo/discount code field (NEW), tax estimate line (NEW — required for real commerce).

### 5.6 Checkout (`/checkout`)
- Current live behavior: **not a real payment checkout** — a banner reads *"Online checkout coming soon. Please submit your order request below and we'll contact you to complete your purchase."* Form collects Contact Info (first/last name, email, phone), Shipping Address (street, city, postal code, country), Order Notes, and on submit shows a success toast, clears cart, redirects home — **no actual order is persisted, no payment is taken, no email is sent** (mocked with a 1.5s delay).
- **Production requirement (critical gap to close):** Replace this with a real, PCI-compliant checkout:
  1. Contact & shipping form (same fields + address line 2, state/province, phone required for carrier).
  2. Shipping method selection (Standard/Express) with computed rates.
  3. Order summary with tax calculation (e.g., via Stripe Tax or TaxJar) and discount code application.
  4. **Payment via Stripe Elements/Payment Intents** (card, Apple Pay, Google Pay).
  5. Order confirmation page with order number, summary, and "what happens next" info.
  6. Transactional emails: order confirmation, shipping confirmation w/ tracking, delivery, and abandoned cart (nice-to-have).
  7. Guest checkout + optional account creation at end of flow.
  8. Full audit trail: order stored in DB with status lifecycle (`pending_payment → paid → fulfilling → shipped → delivered → cancelled/refunded`).

### 5.7 About Page (`/about`)
- Hero: kicker "Our Story", H1 "Curating Beauty *for Living*", subtext, full-bleed image.
- Centered philosophy statement (large serif pull-quote).
- "The Beginning / A Personal Quest for Meaning" split section (image + 2 paragraphs of brand history).
- "Beauty lies in the imperfection of things made by hand" — full-bleed image quote section.
- "From Workshop to Home / Our Approach" split section (image + 2 paragraphs).
- "Our Values" — 3-column: **Craftsmanship (01)**, **Sustainability (02)**, **Slow Living (03)**, each with a short description.
- 3-image editorial strip.
- Full-bleed CTA section: "Have a Question?" + "Get in Touch" mailto CTA (`hello@maison.com`).
- **Production requirement:** replace `mailto:` with a real contact form → backend endpoint → ticketing/email (e.g., Resend/SendGrid + optional Helpdesk integration).

### 5.8 Footer (global)
- Newsletter signup (email input + submit) — **must integrate with a real ESP** (Klaviyo/Mailchimp/Resend Audiences) with double opt-in and unsubscribe compliance (CAN-SPAM/GDPR).
- Columns: **Collections** (first 6), **Explore** (Shop All, Our Story, Shopping Bag), **Support** (Shipping & Returns, Care Guide, FAQ — currently placeholder `#` links, need real content pages), **Contact** (`hello@maison.com`, Mon–Fri 9am–6pm CET).
- Bottom bar: copyright, Privacy Policy / Terms of Service / Cookie Policy (currently placeholder — need real legal pages + cookie consent banner for compliance).

### 5.9 404 Page
- "404" numeral, "Page Not Found", copy, "Return Home" + "Browse Products" buttons. Keep as-is.

---

## 6. Data Model (current, extracted from client bundle)

### 6.1 Collections (8 total)
`lighting`, `ceramics`, `furniture`, `textiles`, `objects` (Objects & Vases), `seasonal` (Seasonal Collection), `new` (New Arrivals), `gifts` (Curated Gifts) — each has `id`, `name`, `slug`, `description`, `image`, `heroImage`.

### 6.2 Products (13 sample SKUs)
| Slug | Name | Collection | Price (USD) | Flags |
|---|---|---|---|---|
| arc-pendant-light | Arc Pendant Light | lighting | 485 | featured |
| orb-table-lamp | Orb Table Lamp | lighting | 295 | new |
| large-sculptural-vessel | Large Sculptural Vessel | ceramics | 320 | featured |
| everyday-serving-bowl | Everyday Serving Bowl | ceramics | 145 | — |
| harvest-dining-table | Harvest Dining Table | furniture | 2,850 | featured |
| woven-lounge-chair | Woven Lounge Chair | furniture | 1,450 | new |
| heritage-linen-throw | Heritage Linen Throw | textiles | 195 | — |
| hand-felted-wool-cushion | Hand-Felted Wool Cushion | textiles | 165 | — |
| sculptural-bud-vase | Sculptural Bud Vase | objects | 85 | — |
| forge-candleholder-set | Forge Candleholder Set | objects | 245 | featured |
| winter-hearth-candle | Winter Hearth Candle | seasonal | 65 | — |
| honed-marble-tray | Honed Marble Tray | new | 175 | new |
| curated-gift-box | Curated Gift Box | gifts | 225 | — |

Each product also has: `description`, `longDescription`, `materials`, `dimensions`, `images[]`.

This is **hardcoded, in-memory sample data with no persistence, no inventory, no variants, and no real images (Unsplash stock photography)** — all of which must be replaced by a real database and asset pipeline.

### 6.3 Production Data Model (proposed, Postgres/Drizzle)

```
users(id, email, password_hash, first_name, last_name, phone, role[customer|admin], created_at)
addresses(id, user_id, label, line1, line2, city, state, postal_code, country, is_default)
collections(id, slug, name, description, image_url, hero_image_url, is_featured, sort_order, created_at)
products(id, slug, name, short_description, long_description, materials, dimensions,
         collection_id, price_cents, currency, compare_at_price_cents, is_new, is_featured,
         status[draft|active|archived], seo_title, seo_description, created_at, updated_at)
product_images(id, product_id, url, alt, sort_order)
product_variants(id, product_id, sku, name, price_delta_cents, inventory_qty)  -- future-proofing
inventory(product_id/variant_id, quantity_on_hand, quantity_reserved)
carts(id, user_id NULLABLE, session_token, created_at, updated_at)
cart_items(id, cart_id, product_id, variant_id NULLABLE, quantity, unit_price_cents)
wishlists(id, user_id, created_at)
wishlist_items(id, wishlist_id, product_id)
orders(id, order_number, user_id NULLABLE, email, status, subtotal_cents, shipping_cents,
       tax_cents, discount_cents, total_cents, currency, shipping_address_id, billing_address_id,
       payment_intent_id, notes, created_at, updated_at)
order_items(id, order_id, product_id, variant_id NULLABLE, name_snapshot, price_cents_snapshot, quantity)
discount_codes(id, code, type[percent|fixed], value, min_subtotal_cents, expires_at, max_redemptions, times_redeemed)
reviews(id, product_id, user_id, rating, title, body, created_at, is_approved)
newsletter_subscribers(id, email, subscribed_at, unsubscribed_at, source)
contact_messages(id, name, email, subject, message, created_at, status)
```

---

## 7. Functional Requirements — New Backend Capabilities

### 7.1 Authentication & Accounts
- Email/password signup & login (bcrypt/argon2 hashing), email verification, password reset flow.
- OAuth (Google) as stretch goal.
- Session via secure httpOnly cookies (JWT or database sessions).
- Guest checkout supported; guest orders linkable to an account by email match + verification.
- Account dashboard: profile, saved addresses, order history with statuses, wishlist.

### 7.2 Catalog & Search
- Server-rendered product listing & PDP with ISR/SSR for SEO.
- Full-text/keyword search (Postgres `tsvector` or external like Algolia/Meilisearch for scale).
- Faceted filtering (collection, price range, tags, availability).
- Inventory tracking with oversell protection at checkout.

### 7.3 Cart & Pricing
- Server-authoritative cart (DB-backed), merge guest cart into user cart on login.
- Shipping rule engine: flat $25, free ≥ $500 subtotal (configurable in admin rather than hardcoded).
- Discount code engine (percentage/fixed, expiry, usage caps, min-subtotal rules).
- Tax calculation via 3rd-party tax API by shipping destination.

### 7.4 Checkout & Payments
- Stripe Payment Intents (cards + wallets), 3-D Secure support, webhook handling for `payment_intent.succeeded/failed`.
- Idempotent order creation tied to a successful payment.
- Refunds & partial refunds from admin, triggering Stripe refund API + order status update.
- Automated transactional emails (Resend/SendGrid/Postmark) for order confirmation, shipping, delivery, refund.

### 7.5 Order Management (Admin)
- Orders list with filters (status, date range, search by customer/order #).
- Order detail: line items, customer info, payment status, fulfillment status, ability to add tracking number & mark shipped (triggers customer email), issue refund, add internal notes.
- Basic analytics: revenue over time, top products, low-stock alerts.

### 7.6 Content & Marketing
- CMS-lite for About page copy/images and Support pages (or a simple admin content editor / MDX-driven pages) so non-engineers can edit copy.
- Newsletter integration (double opt-in, unsubscribe link, GDPR-compliant consent record).
- Contact form → stored + emailed to `hello@maison.com` inbox, with spam protection (honeypot + rate limiting; optionally hCaptcha).
- Cookie consent banner + preference center (EU compliance) given cross-site tracking/newsletter usage.

### 7.7 Notifications
- Transactional email templates (branded, matching design system: cream/terracotta/serif).
- Optional SMS notifications for shipping updates (Twilio) — stretch.

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Largest Contentful Paint < 2.5s on 4G for Home/PDP.
- Images served via responsive `srcset`/`sizes` + a CDN/image-optimization pipeline (Next.js `<Image>` or Cloudinary/Imgix) — replacing raw hot-linked Unsplash URLs.
- Route-level code splitting; product listing paginated server-side (not client-loaded full array as today).
- Lighthouse Performance/Accessibility/SEO/Best Practices scores ≥ 90.

### 8.2 SEO
- Server-rendered (Next.js App Router) pages with per-page metadata, Open Graph/Twitter cards, canonical URLs, sitemap.xml, robots.txt.
- Structured data: `Organization`, `Product`, `BreadcrumbList`.
- Human-readable slugs (already present in data model) preserved.

### 8.3 Accessibility
- WCAG 2.1 AA: semantic landmarks, keyboard-navigable mega-menu & mobile menu, focus states, alt text on all images, sufficient color contrast for terracotta-on-cream text/buttons (audit required — current terracotta on cream is borderline for small text and should be checked/adjusted), `prefers-reduced-motion` support for all scroll/hero animations.

### 8.4 Security & Compliance
- HTTPS everywhere, secure cookies, CSRF protection on state-changing routes, input validation/sanitization (Zod) on all API routes.
- PCI compliance via Stripe Elements (no raw card data touches our servers).
- Rate limiting on auth, checkout, newsletter, and contact endpoints.
- GDPR/CCPA: cookie consent, data export/delete request handling, clear privacy policy content (not placeholder).

### 8.5 Reliability & Observability
- Structured logging, error tracking (Sentry), uptime monitoring, `/api/health` endpoint (DB connectivity check).
- Automated DB backups & point-in-time recovery.
- Staging environment mirroring production; CI pipeline running typecheck/build/tests before deploy.

### 8.6 Scalability
- Stateless app servers behind autoscaling; DB connection pooling (PgBouncer/Neon-style pooling).
- Caching layer (CDN edge caching for static/catalog pages, Redis for session/cart if needed at scale).

---

## 9. Tech Stack Recommendation

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | SSR/ISR for SEO + fast DX, matches current tool constraints |
| Styling | Tailwind CSS + design tokens matching existing palette | 1:1 visual parity with current Tailwind-based build |
| ORM/DB | Drizzle ORM + PostgreSQL | Matches required project stack |
| Auth | NextAuth.js / Lucia / custom JWT sessions | Email+password, OAuth-ready |
| Payments | Stripe (Payment Intents + Webhooks + Tax) | Industry standard, PCI-compliant |
| Email | Resend or Postmark | Transactional email templates |
| Media | Cloudinary/Next Image + S3-compatible storage | Replace hotlinked Unsplash images with owned, optimized assets |
| Search | Postgres full-text (Phase 1) → Meilisearch/Algolia (Phase 2) | Start simple, scale later |
| Animations | Framer Motion (already used in current build) | Preserve current motion design |
| Testing | Vitest/Jest + Playwright (e2e) | Unit + checkout flow E2E coverage |
| Monitoring | Sentry + Vercel/host analytics | Error and performance visibility |

---

## 10. Milestones / Phasing

**Phase 0 — Parity Clone (this deliverable):** Static/self-contained recreation of the current landing page visuals & client-side interactions (done — see accompanying HTML file).

**Phase 1 — MVP Full-Stack (4–6 weeks):**
- DB schema + seed of real catalog (collections/products/images).
- SSR Home, Products (with pagination/filtering), PDP, Cart, real Stripe Checkout, Order confirmation, transactional emails.
- Basic auth (signup/login/guest checkout), account order history.
- Admin: product & order CRUD.

**Phase 2 — Growth Features (3–4 weeks):**
- Discount codes, tax integration, reviews & ratings, wishlist persistence, search facets, newsletter ESP integration, legal/support content pages, cookie consent.

**Phase 3 — Optimization (ongoing):**
- Performance tuning, A/B testing on hero/CTAs, personalization (recently viewed, recommended products), analytics dashboards, SEO content expansion, internationalization groundwork.

---

## 11. Acceptance Criteria (Definition of Done for Phase 1)

1. A visitor can browse Home → Collections → PDP → add to cart → checkout with a real credit card via Stripe → receive an order confirmation email — end to end, with the order visible in the admin panel and persisted in Postgres.
2. Cart and wishlist persist correctly for both guest (cookie/session-based) and authenticated users, and merge on login.
3. All current visual sections (Hero, Featured Collection, Latest Products, Collections grid, About teaser, Instagram strip, Footer, mobile menu, mega-menu) are reproduced pixel-close to the source design with responsive behavior at mobile/tablet/desktop breakpoints.
4. Lighthouse scores ≥ 90 across Performance/Accessibility/Best Practices/SEO on Home and PDP.
5. `npm run build` succeeds, `/api/health` returns healthy DB status, and core flows are covered by Playwright E2E tests (browse → cart → checkout happy path; auth signup/login).
6. No placeholder legal/support links remain — all resolve to real content pages.

---

## 12. Appendix — Gaps Identified in the Live Reference Site

- Checkout does **not** process payment; it only submits a "request" and clears the cart client-side with no persistence — must be replaced with real payments/order storage.
- Newsletter form and contact ("Get in Touch" `mailto:`) are non-functional beyond a UI stub.
- Footer legal links (Privacy/Terms/Cookies) and support links (Shipping & Returns/Care Guide/FAQ) are placeholder `#` anchors.
- No authentication, no account/order history, no real inventory, no search, no reviews.
- Product/category imagery is hot-linked from Unsplash (not owned/optimized assets) — a legal/performance risk for production.
- Cart/wishlist state lives only in browser memory/localStorage (via a Zustand-like store) — lost across devices and cleared on cache clear.
