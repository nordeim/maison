# Scandi Haven — Full-Featured E-Commerce Website

### Project Requirements Document (PRD)

**Version:** 1.0 | **Date:** July 2025 | **Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [Target Audience](#3-target-audience)
4. [Information Architecture & Sitemap](#4-information-architecture--sitemap)
5. [Page-by-Page Requirements](#5-page-by-page-requirements)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Design System & Brand Guidelines](#8-design-system--brand-guidelines)
9. [Technical Architecture](#9-technical-architecture)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Content Requirements](#11-content-requirements)
12. [SEO & Performance](#12-seo--performance)
13. [Accessibility (WCAG 2.1 AA)](#13-accessibility-wcag-21-aa)
14. [Analytics & Tracking](#14-analytics--tracking)
15. [Launch Phases & Milestones](#15-launch-phases--milestones)
16. [Risks & Mitigations](#16-risks--mitigations)
17. [Appendix](#17-appendix)

---

## 1. Executive Summary

**Scandi Haven** is a direct-to-consumer e-commerce brand specialising in curated Scandinavian home goods — furniture, lighting, textiles, and decorative objects. The website will serve as the primary sales channel and brand touchpoint, embodying Nordic design principles of simplicity, warmth, and functionality.

This PRD defines the requirements for building a **production-ready, full-featured e-commerce website** based on the existing landing page design. The site must deliver a premium shopping experience while maintaining the minimalist, intentional aesthetic that defines the brand.

---

## 2. Goals & Success Metrics

### Business Goals

| Goal                       | KPI                     | Target (6 months post-launch) |
| -------------------------- | ----------------------- | ----------------------------- |
| Generate online revenue    | Monthly revenue         | $50,000                       |
| Build brand awareness      | Monthly unique visitors | 80,000                        |
| Convert browsers to buyers | Conversion rate         | 2.5%+                         |
| Encourage repeat purchases | Returning customer rate | 30%+                          |
| Grow email list            | Newsletter subscribers  | 10,000                        |
| Establish social proof     | Average product rating  | 4.5+ stars                    |

### User Goals

- Discover and purchase Scandinavian home products effortlessly
- Understand the brand story, material sourcing, and sustainability practices
- Get inspired by curated collections and styling content
- Trust the brand through transparency, reviews, and quality guarantees

---

## 3. Target Audience

### Primary Persona: "Design-Conscious Homeowner"

- **Age:** 28–45
- **Income:** $60K–$150K household
- **Behaviour:** Researches before buying; values quality over quantity; shops online 2–3× per month
- **Motivation:** Creating a beautiful, intentional home environment
- **Pain Points:** Overwhelmed by mass-market options; distrusts quality claims; wants curation

### Secondary Persona: "Gift Buyer"

- **Age:** 25–55
- **Behaviour:** Shops for housewarming, wedding, and holiday gifts; values beautiful packaging
- **Motivation:** Finding unique, high-quality gifts with minimal effort

### Tertiary Persona: "Interior Design Professional"

- **Behaviour:** Purchases in volume; needs trade pricing; requires specification sheets
- **Motivation:** Sourcing reliable, aesthetically consistent products for client projects

---

## 4. Information Architecture & Sitemap

```
Home (/)
├── Shop
│   ├── All Products (/shop)
│   ├── Furniture (/shop/furniture)
│   │   ├── Chairs & Seating
│   │   ├── Tables
│   │   ├── Storage & Shelving
│   │   └── Sofas & Benches
│   ├── Lighting (/shop/lighting)
│   │   ├── Pendant Lights
│   │   ├── Table Lamps
│   │   ├── Floor Lamps
│   │   └── Wall Sconces
│   ├── Textiles (/shop/textiles)
│   │   ├── Throws & Blankets
│   │   ├── Cushions & Pillows
│   │   ├── Rugs
│   │   └── Curtains
│   ├── Home Decor (/shop/decor)
│   │   ├── Vases & Vessels
│   │   ├── Candles & Holders
│   │   ├── Wall Art
│   │   └── Mirrors
│   └── Product Detail (/shop/[category]/[slug])
│
├── Collections (/collections)
│   ├── New Arrivals
│   ├── Bestsellers
│   ├── Seasonal Collections
│   └── Gift Guides
│
├── Our Story (/about)
│   ├── Brand Story
│   ├── Sustainability
│   ├── Artisan Partners
│   └── Press
│
├── Journal (/journal)
│   ├── Journal Listing
│   └── Journal Article (/journal/[slug])
│
├── Trade Program (/trade)
│
├── Contact (/contact)
│
├── Cart (/cart)
│
├── Checkout (/checkout)
│   ├── Shipping
│   ├── Payment
│   └── Confirmation
│
├── Account (/account)
│   ├── Login / Register
│   ├── Dashboard
│   ├── Orders
│   ├── Addresses
│   ├── Wishlist
│   └── Settings
│
├── Search (/search)
│
├── Legal
│   ├── Privacy Policy (/privacy)
│   ├── Terms of Service (/terms)
│   ├── Shipping Policy (/shipping)
│   └── Returns & Exchanges (/returns)
│
└── Footer (persistent)
    ├── Newsletter signup
    ├── Social links
    └── Support links
```

---

## 5. Page-by-Page Requirements

### 5.1 Homepage (`/`)

**Purpose:** Brand introduction, hero showcase, curated product discovery, trust building.

| Section            | Description                                                                                                   | Priority |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | -------- |
| Announcement Bar   | Promotional message (free shipping threshold, seasonal offers). Dismissible.                                  | P1       |
| Sticky Header      | Logo, main nav, search, account, cart with count badge. Transparent on hero, solid on scroll.                 | P1       |
| Hero Section       | Full-bleed image/video with headline, subheadline, and dual CTAs (primary + outline). Responsive grid layout. | P1       |
| Marquee Strip      | Infinite-scrolling marquee with brand values / USPs. Dark background.                                         | P2       |
| Category Grid      | 4-card grid (Furniture, Lighting, Textiles, Decor) with image overlays and product counts.                    | P1       |
| Featured Products  | 4-column product grid with badges (New, Bestseller), quick-add hover action, price, category.                 | P1       |
| Brand Story Band   | Full-width split layout — image left, story text + CTA right. Dark background.                                | P1       |
| Testimonials       | 3-card grid with star ratings, quotes, and customer info.                                                     | P2       |
| Value Propositions | 4-column icon grid (Scandinavian Origin, Quality Guaranteed, Free Shipping, Easy Returns).                    | P1       |
| Newsletter         | Email capture form with consent text.                                                                         | P1       |
| Instagram Feed     | 6-image grid from @scandihaven. Hover overlays with "View" action.                                            | P2       |
| Footer             | 4-column layout (brand + 3 link groups), bottom bar with copyright + social icons.                            | P1       |

### 5.2 Category / Shop Page (`/shop/[category]`)

| Feature                      | Description                                                                                                   | Priority |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| Breadcrumb Navigation        | Home > Shop > [Category]                                                                                      | P1       |
| Category Header              | Title, description, hero image (optional)                                                                     | P1       |
| Filter Sidebar / Drawer      | Filters: Category, Price Range, Material, Colour, Size, Availability, New/On Sale                             | P1       |
| Sort Dropdown                | Relevance, Price (Low-High, High-Low), Newest, Bestselling, Rating                                            | P1       |
| Product Grid                 | Responsive grid (4-col desktop, 2-col tablet, 1-col mobile). Cards with image, name, price, badge, quick-add. | P1       |
| Pagination / Infinite Scroll | Load more or paginated. 24 products per page default.                                                         | P1       |
| Active Filter Pills          | Removable chips showing active filters above grid.                                                            | P1       |
| Empty State                  | Friendly message + clear filters CTA when no results.                                                         | P1       |

### 5.3 Product Detail Page (`/shop/[category]/[slug]`)

| Feature           | Description                                                                                     | Priority |
| ----------------- | ----------------------------------------------------------------------------------------------- | -------- |
| Image Gallery     | Primary image + thumbnails. Click to zoom. Swipeable on mobile. Support 5-8 images per product. | P1       |
| Product Info      | Name, price, SKU, short description, rating summary                                             | P1       |
| Variant Selector  | Size / Colour / Material options with visual swatches. Out-of-stock variants greyed out.        | P1       |
| Quantity Selector | +/- stepper with min 1, max configurable                                                        | P1       |
| Add to Cart       | Primary CTA. Sticky on mobile.                                                                  | P1       |
| Wishlist Toggle   | Heart icon to add/remove from wishlist                                                          | P1       |
| Accordion Details | Expandable sections: Description, Materials & Care, Dimensions, Shipping & Returns              | P1       |
| Trust Badges      | Warranty, shipping, sustainability icons                                                        | P1       |
| Reviews Section   | Star distribution bar, review cards with photos, helpful voting, write-a-review form            | P2       |
| Related Products  | "You may also like" — 4-product carousel                                                        | P1       |
| Recently Viewed   | Persist across session                                                                          | P2       |
| Social Share      | Share to Pinterest, Facebook, Twitter/X                                                         | P2       |
| Size Guide Modal  | Interactive size guide with diagram (for applicable products)                                   | P2       |
| Stock Indicator   | "Only X left" when stock < 5. "Out of stock" with email-notify option.                          | P1       |

### 5.4 Cart Page (`/cart`)

| Feature                    | Description                                                                    | Priority |
| -------------------------- | ------------------------------------------------------------------------------ | -------- |
| Line Items                 | Product image, name, variant, quantity stepper, unit price, line total, remove | P1       |
| Cart Summary               | Subtotal, estimated shipping, estimated tax, order total                       | P1       |
| Promo Code Input           | Apply/discount code field with validation                                      | P1       |
| Free Shipping Progress Bar | Visual indicator: "You're $X away from free shipping"                          | P1       |
| Continue Shopping Link     | Return to shop                                                                 | P1       |
| Checkout CTA               | Prominent "Proceed to Checkout" button                                         | P1       |
| Cross-Sell                 | "Frequently bought together" suggestions below cart                            | P2       |
| Empty Cart State           | Illustration + "Your cart is empty" + Shop CTA                                 | P1       |
| Mini Cart (Drawer)         | Slide-in cart from header icon. View items, subtotal, checkout link.           | P1       |

### 5.5 Checkout (`/checkout`)

| Feature                  | Description                                                                            | Priority |
| ------------------------ | -------------------------------------------------------------------------------------- | -------- |
| Guest Checkout           | No account required. Option to create account post-purchase.                           | P1       |
| Step 1: Contact          | Email, phone (optional). Newsletter opt-in.                                            | P1       |
| Step 2: Shipping Address | Full address form with autocomplete (Google Places).                                   | P1       |
| Step 3: Shipping Method  | Standard / Express options with prices and delivery estimates.                         | P1       |
| Step 4: Payment          | Credit/Debit card (Stripe), Apple Pay, Google Pay, PayPal, Klarna/Affirm (BNPL).       | P1       |
| Order Review             | Summary sidebar (persistent on desktop): items, totals, address, shipping method       | P1       |
| Discount Code            | Apply at checkout                                                                      | P1       |
| Order Confirmation       | Thank you page with order number, summary, estimated delivery, "Continue Shopping" CTA | P1       |
| Confirmation Email       | Transactional email sent immediately with order details                                | P1       |
| Trust Signals            | SSL badge, secure payment icons, return policy link                                    | P1       |

### 5.6 Account (`/account`)

| Feature          | Description                                                                | Priority |
| ---------------- | -------------------------------------------------------------------------- | -------- |
| Authentication   | Email + password login. Social login (Google, Apple). Magic link option.   | P1       |
| Registration     | Name, email, password. Newsletter opt-in.                                  | P1       |
| Dashboard        | Greeting, quick links (orders, wishlist, addresses)                        | P1       |
| Order History    | List of orders with status, date, total. Click for detail. Reorder option. | P1       |
| Order Detail     | Order status timeline, items, tracking link, invoice download              | P1       |
| Address Book     | Add/edit/delete shipping and billing addresses. Set default.               | P1       |
| Wishlist         | Saved products grid. Move to cart. Share wishlist.                         | P2       |
| Account Settings | Update name, email, password. Delete account (GDPR).                       | P1       |
| Password Reset   | Email-based reset flow                                                     | P1       |

### 5.7 Journal / Blog (`/journal`)

| Feature         | Description                                                                                        | Priority |
| --------------- | -------------------------------------------------------------------------------------------------- | -------- |
| Article Listing | Grid with featured image, title, excerpt, date, category, reading time                             | P2       |
| Article Detail  | Rich content (text, images, embedded products, video). Author bio. Social share. Related articles. | P2       |
| Category Filter | Filter by topic (Styling Tips, Behind the Scenes, Material Guide, etc.)                            | P2       |
| Product Linking | Inline "Shop this look" product cards within articles                                              | P2       |

### 5.8 Search (`/search`)

| Feature             | Description                                                                                | Priority |
| ------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Search Bar          | Accessible from header. Full-screen overlay on mobile.                                     | P1       |
| Autocomplete        | Product suggestions, category suggestions, recent searches as user types (debounced 300ms) | P1       |
| Search Results Page | Product grid + "Did you mean?" suggestions + filter/sort options                           | P1       |
| No Results          | Friendly message with suggested categories and popular products                            | P1       |
| Search Analytics    | Track popular searches, zero-result queries, conversion from search                        | P2       |

### 5.9 About / Our Story (`/about`)

| Feature                | Description                                                   | Priority |
| ---------------------- | ------------------------------------------------------------- | -------- |
| Brand Story            | Rich narrative with imagery. Founding story, mission, values. | P1       |
| Sustainability Section | Material sourcing, certifications, environmental commitments  | P1       |
| Artisan Partners       | Featured maker profiles with images and stories               | P2       |
| Press / Media Kit      | Press mentions, downloadable brand assets                     | P2       |

### 5.10 Contact (`/contact`)

| Feature          | Description                                          | Priority |
| ---------------- | ---------------------------------------------------- | -------- |
| Contact Form     | Name, email, subject dropdown, message. CAPTCHA.     | P1       |
| Contact Info     | Email address, phone (optional), physical address    | P1       |
| FAQ Section      | Expandable accordion with common questions           | P1       |
| Live Chat Widget | Third-party chat integration (e.g., Intercom, Tidio) | P2       |

---

## 6. Functional Requirements

### 6.1 Product Management (Admin)

| ID       | Requirement                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------ |
| FR-PM-01 | Create, read, update, delete (CRUD) products with rich content                                   |
| FR-PM-02 | Support multiple product variants (size, colour, material) with individual pricing and inventory |
| FR-PM-03 | Bulk product import/export via CSV                                                               |
| FR-PM-04 | Product tagging (New, Bestseller, Sale, Limited Edition)                                         |
| FR-PM-05 | Product image management with automatic optimisation and responsive sizing                       |
| FR-PM-06 | Inventory tracking with low-stock alerts                                                         |
| FR-PM-07 | Product scheduling (publish at future date)                                                      |
| FR-PM-08 | SEO fields per product (meta title, description, slug, canonical URL)                            |
| FR-PM-09 | Related product configuration (manual or automatic)                                              |
| FR-PM-10 | Product review moderation (approve, reject, respond)                                             |

### 6.2 Order Management

| ID       | Requirement                                                      |
| -------- | ---------------------------------------------------------------- |
| FR-OM-01 | Order list with filters (status, date range, customer, value)    |
| FR-OM-02 | Order detail view with full timeline and actions                 |
| FR-OM-03 | Update order status (Pending → Processing → Shipped → Delivered) |
| FR-OM-04 | Partial fulfillment support                                      |
| FR-OM-05 | Generate and email shipping labels with tracking numbers         |
| FR-OM-06 | Refund processing (full and partial)                             |
| FR-OM-07 | Order notes (internal, customer-visible)                         |
| FR-OM-08 | Export orders to CSV                                             |
| FR-OM-09 | Automated order confirmation and status update emails            |

### 6.3 Cart & Checkout

| ID       | Requirement                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| FR-CC-01 | Persistent cart (survives session close for logged-in users; 30-day cookie for guests) |
| FR-CC-02 | Cart item count in header badge                                                        |
| FR-CC-03 | Real-time inventory validation before checkout                                         |
| FR-CC-04 | Promo/coupon code system (percentage, fixed amount, free shipping)                     |
| FR-CC-05 | Automatic tax calculation based on shipping address                                    |
| FR-CC-06 | Shipping rate calculation (real-time carrier rates or flat-rate rules)                 |
| FR-CC-07 | Free shipping threshold with progress bar                                              |
| FR-CC-08 | Guest checkout (no forced account creation)                                            |
| FR-CC-09 | Address autocomplete (Google Places API)                                               |
| FR-CC-10 | Multiple payment methods (cards, wallets, BNPL)                                        |
| FR-CC-11 | 3D Secure / SCA compliance                                                             |
| FR-CC-12 | Abandoned cart recovery emails (1hr, 24hr, 72hr)                                       |
| FR-CC-13 | Order confirmation page + email                                                        |

### 6.4 User Accounts

| ID       | Requirement                                            |
| -------- | ------------------------------------------------------ |
| FR-UA-01 | Registration with email verification                   |
| FR-UA-02 | Login with email/password, Google OAuth, Apple Sign-In |
| FR-UA-03 | Password reset via email                               |
| FR-UA-04 | Profile management (name, email, password)             |
| FR-UA-05 | Address book (CRUD with default setting)               |
| FR-UA-06 | Order history with tracking                            |
| FR-UA-07 | Wishlist                                               |
| FR-UA-08 | Account deletion (GDPR compliance)                     |

### 6.5 Search & Discovery

| ID       | Requirement                                                         |
| -------- | ------------------------------------------------------------------- |
| FR-SD-01 | Full-text search across products, collections, and journal articles |
| FR-SD-02 | Autocomplete with debounced suggestions                             |
| FR-SD-03 | Faceted filtering (category, price, material, colour, availability) |
| FR-SD-04 | Sort by relevance, price, date, popularity, rating                  |
| FR-SD-05 | Search analytics tracking                                           |

### 6.6 Content Management

| ID       | Requirement                                              |
| -------- | -------------------------------------------------------- |
| FR-CM-01 | WYSIWYG editor for journal articles and static pages     |
| FR-CM-02 | Media library with image optimisation                    |
| FR-CM-03 | Collection management (manual and rule-based)            |
| FR-CM-04 | Homepage section management (reorder, toggle visibility) |
| FR-CM-05 | Navigation menu management                               |
| FR-CM-06 | Announcement bar content management                      |
| FR-CM-07 | SEO metadata management per page                         |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric                         | Target                                     |
| ------------------------------ | ------------------------------------------ |
| Lighthouse Performance Score   | ≥ 90                                       |
| Largest Contentful Paint (LCP) | < 2.5s                                     |
| First Input Delay (FID)        | < 100ms                                    |
| Cumulative Layout Shift (CLS)  | < 0.1                                      |
| Time to First Byte (TTFB)      | < 600ms                                    |
| Image format                   | WebP/AVIF with fallback                    |
| Image lazy loading             | All below-fold images                      |
| Code splitting                 | Route-based                                |
| CDN                            | Global edge delivery for all static assets |

### 7.2 Scalability

- Handle 500 concurrent users at launch
- Scale to 5,000 concurrent users within 12 months
- Database queries optimised for catalogues up to 10,000 SKUs
- Auto-scaling infrastructure (serverless or container-based)

### 7.3 Security

| Requirement             | Detail                                                |
| ----------------------- | ----------------------------------------------------- |
| HTTPS                   | Enforced site-wide with HSTS                          |
| PCI DSS                 | Level 1 compliance via payment processor (Stripe)     |
| Data encryption         | At rest (AES-256) and in transit (TLS 1.3)            |
| CSRF protection         | All forms token-protected                             |
| XSS prevention          | Content Security Policy headers, output encoding      |
| Rate limiting           | On login, registration, API endpoints                 |
| GDPR / CCPA             | Cookie consent banner, data export, right to deletion |
| Regular security audits | Quarterly penetration testing                         |

### 7.4 Reliability

- 99.9% uptime SLA
- Automated database backups (daily, 30-day retention)
- Disaster recovery plan with RTO < 4 hours, RPO < 1 hour
- Health monitoring with alerting (PagerDuty / Slack)

### 7.5 Browser & Device Support

| Browser          | Minimum Version |
| ---------------- | --------------- |
| Chrome           | Last 2 versions |
| Firefox          | Last 2 versions |
| Safari           | 15+             |
| Edge             | Last 2 versions |
| Samsung Internet | Last 2 versions |
| iOS Safari       | 15+             |

| Device        | Breakpoint      |
| ------------- | --------------- |
| Mobile        | 320px – 480px   |
| Tablet        | 481px – 768px   |
| Small Desktop | 769px – 1024px  |
| Desktop       | 1025px – 1280px |
| Large Desktop | 1281px+         |

---

## 8. Design System & Brand Guidelines

### 8.1 Typography

| Role               | Font               | Weight             | Size Scale        |
| ------------------ | ------------------ | ------------------ | ----------------- |
| Display / Headings | Cormorant Garamond | 300, 400, 500      | 2.8rem – 1.6rem   |
| Body               | DM Sans            | 300, 400, 500, 600 | 1rem – 0.78rem    |
| UI / Labels        | DM Sans            | 500, 600           | 0.85rem – 0.65rem |

### 8.2 Colour Palette

| Token              | Hex       | Usage                 |
| ------------------ | --------- | --------------------- |
| `--bg`             | `#f8f6f1` | Page background       |
| `--bg-warm`        | `#f0ece4` | Alternate section bg  |
| `--bg-card`        | `#ffffff` | Cards, modals         |
| `--bg-dark`        | `#1a1a1a` | Dark sections, footer |
| `--accent`         | `#c4a265` | Primary accent (gold) |
| `--accent-hover`   | `#b08d4e` | Accent hover state    |
| `--text-primary`   | `#2c2c2c` | Primary text          |
| `--text-secondary` | `#5a5650` | Secondary text        |
| `--text-muted`     | `#8a847a` | Tertiary / captions   |
| `--text-inverse`   | `#f8f6f1` | Text on dark bg       |
| `--border`         | `#ddd8ce` | Standard borders      |
| `--border-light`   | `#ece8e0` | Subtle borders        |

### 8.3 Spacing Scale

Use an 8px base grid: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`

### 8.4 Border Radius

| Token         | Value | Usage                    |
| ------------- | ----- | ------------------------ |
| `--radius-sm` | 4px   | Buttons, inputs          |
| `--radius-md` | 8px   | Cards                    |
| `--radius-lg` | 12px  | Modals, large containers |

### 8.5 Shadows

| Token         | Value                         | Usage             |
| ------------- | ----------------------------- | ----------------- |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)`  | Subtle elevation  |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.06)` | Cards on hover    |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.08)` | Dropdowns, modals |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.1)` | Hero elements     |

### 8.6 Motion

- **Default transition:** `0.3s cubic-bezier(0.25, 0.1, 0.25, 1)`
- **Page load animations:** Staggered fade-up (0.6s, 0.1s increments)
- **Hover states:** Subtle scale (1.02–1.05), letter-spacing shifts on CTAs
- **Scroll-triggered:** IntersectionObserver with 15% threshold
- **Reduced motion:** Respect `prefers-reduced-motion` media query

### 8.7 Photography Style

- Natural lighting, muted warm tones
- Lifestyle shots showing products in real homes
- Minimal styling — products speak for themselves
- Consistent colour grading across all images

---

## 9. Technical Architecture

### 9.1 Recommended Tech Stack

| Layer                 | Technology                                         | Rationale                                               |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| **Frontend**          | Next.js 14+ (App Router)                           | SSR/SSG for SEO, React ecosystem, image optimisation    |
| **Styling**           | Tailwind CSS + CSS Modules                         | Utility-first for speed, modules for complex components |
| **State**             | Zustand + React Query                              | Lightweight client state + server state caching         |
| **Backend / CMS**     | Sanity.io or Strapi                                | Headless CMS for products, content, and media           |
| **E-commerce Engine** | Medusa.js or Shopify (Headless via Storefront API) | Cart, checkout, inventory, orders                       |
| **Payments**          | Stripe                                             | Industry standard, extensive payment method support     |
| **Search**            | Algolia or Meilisearch                             | Fast, typo-tolerant, faceted search                     |
| **Hosting**           | Vercel (frontend) + Railway/AWS (backend)          | Edge delivery, serverless scaling                       |
| **CDN**               | Vercel Edge Network / Cloudflare                   | Global asset delivery                                   |
| **Email**             | Resend / SendGrid                                  | Transactional + marketing emails                        |
| **Analytics**         | GA4 + Mixpanel                                     | Web analytics + product analytics                       |
| **Error Tracking**    | Sentry                                             | Real-time error monitoring                              |
| **CI/CD**             | GitHub Actions                                     | Automated testing, preview deployments                  |

### 9.2 API Design

RESTful API with the following key resources:

```
/api/products          GET (list, search, filter)
/api/products/:slug    GET (detail)
/api/collections       GET (list)
/api/collections/:slug GET (detail + products)
/api/cart              GET, POST, PUT, DELETE
/api/cart/items        POST, PUT, DELETE
/api/checkout          POST
/api/orders            GET (authenticated)
/api/orders/:id        GET (authenticated)
/api/auth/register     POST
/api/auth/login        POST
/api/auth/logout       POST
/api/auth/me           GET
/api/wishlist          GET, POST, DELETE
/api/reviews           GET, POST
/api/search            GET
/api/newsletter        POST
/api/pages/:slug       GET (static pages)
/api/journal           GET (articles)
/api/journal/:slug     GET (article detail)
```

### 9.3 Database Schema (Key Entities)

```
Product
├── id, slug, name, description, richDescription
├── category_id (FK)
├── basePrice, compareAtPrice
├── tags[] (new, bestseller, sale, limited)
├── status (draft, active, archived)
├── seo_title, seo_description, seo_canonical
├── created_at, updated_at

ProductVariant
├── id, product_id (FK)
├── name (e.g., "Oak / Large")
├── sku, price, compareAtPrice
├── inventory_quantity
├── options: { size: "Large", material: "Oak", colour: "Natural" }
├── images[]

ProductImage
├── id, product_id (FK), variant_id (FK, nullable)
├── url, alt_text, sort_order
├── width, height

Category
├── id, slug, name, description
├── parent_id (nullable, for subcategories)
├── image_url, seo_*

Collection
├── id, slug, name, description
├── type (manual, automated)
├── rules[] (for automated)
├── products[] (for manual)

Customer
├── id, email, first_name, last_name
├── password_hash
├── addresses[] (has_many)
├── wishlist_items[]
├── created_at

Address
├── id, customer_id (FK)
├── type (shipping, billing)
├── line1, line2, city, state, postal_code, country
├── is_default

Order
├── id, customer_id (FK, nullable for guest)
├── status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
├── shipping_address_id (FK)
├── billing_address_id (FK)
├── subtotal, shipping_cost, tax, discount, total
├── coupon_code (nullable)
├── tracking_number, tracking_url
├── notes
├── created_at, updated_at

OrderItem
├── id, order_id (FK)
├── product_id (FK), variant_id (FK)
├── name, variant_name, sku
├── quantity, unit_price, line_total
├── image_url

Cart
├── id, customer_id (FK, nullable), session_id
├── coupon_code
├── created_at, updated_at

CartItem
├── id, cart_id (FK)
├── product_id (FK), variant_id (FK)
├── quantity

Review
├── id, product_id (FK), customer_id (FK)
├── rating (1-5), title, body
├── status (pending, approved, rejected)
├── helpful_count
├── images[]
├── created_at

JournalArticle
├── id, slug, title, excerpt, body (rich text)
├── author, category, reading_time
├── featured_image, seo_*
├── published_at

Coupon
├── id, code, type (percentage, fixed, free_shipping)
├── value, minimum_order
├── usage_limit, usage_count
├── valid_from, valid_until
```

### 9.4 Image Strategy

- Store original images at full resolution in cloud storage (S3/R2)
- Serve optimised variants via CDN with on-the-fly transformation (e.g., Vercel Image Optimization, Cloudinary, or imgix)
- Generate: WebP, AVIF, JPEG fallback
- Responsive srcset: 320w, 640w, 960w, 1280w, 1920w
- Lazy load all below-fold images
- Blur-up placeholder for hero/above-fold images
- Aspect ratios: 3:4 (products), 16:9 (hero), 1:1 (instagram)

---

## 10. Third-Party Integrations

| Service                         | Purpose                                            | Priority |
| ------------------------------- | -------------------------------------------------- | -------- |
| **Stripe**                      | Payment processing, subscriptions                  | P1       |
| **Algolia**                     | Product search, autocomplete, analytics            | P1       |
| **Google Analytics 4**          | Web analytics, conversion tracking                 | P1       |
| **Meta Pixel**                  | Facebook/Instagram ad tracking                     | P2       |
| **Klaviyo**                     | Email marketing, abandoned cart flows, newsletters | P1       |
| **Google Places API**           | Address autocomplete in checkout                   | P2       |
| **AfterShip**                   | Shipment tracking page                             | P2       |
| **Judge.me / Yotpo**            | Product reviews with photos                        | P1       |
| **Klarna / Affirm**             | Buy Now, Pay Later                                 | P2       |
| **Instagram Basic Display API** | Feed widget on homepage                            | P2       |
| **Sentry**                      | Error tracking and monitoring                      | P1       |
| **Vercel Analytics**            | Core Web Vitals monitoring                         | P2       |
| **Cloudflare**                  | CDN, DDoS protection, WAF                          | P1       |
| **Tidio / Intercom**            | Live chat support                                  | P3       |

---

## 11. Content Requirements

### 11.1 Product Content Per SKU

| Content Type          | Requirement                                                        |
| --------------------- | ------------------------------------------------------------------ |
| Product Name          | Concise, evocative (e.g., "Eira Lounge Chair")                     |
| Short Description     | 1–2 sentences, benefit-focused                                     |
| Rich Description      | 100–300 words covering design intent, materials, craftsmanship     |
| Materials & Care      | Bulleted list of materials, care instructions                      |
| Dimensions            | W × D × H in cm and inches                                         |
| Images                | Minimum 4 per product; lifestyle + white background + detail shots |
| Weight & Package Info | For shipping calculation                                           |
| SEO Metadata          | Title (60 chars), Description (155 chars), URL slug                |

### 11.2 Photography Guidelines

- **Hero images:** 1920×1080 minimum, cinematic composition
- **Product images:** 2000×2667 (3:4 ratio), consistent background across category
- **Lifestyle images:** Natural settings, warm colour grading, minimal props
- **Category images:** 1200×1600 (3:4 ratio), atmospheric mood shots
- **Journal images:** 1600×900 (16:9), editorial quality

### 11.3 Copy Tone of Voice

- **Warm** but not casual
- **Confident** but not boastful
- **Descriptive** but concise
- **Inviting** — makes the reader feel like they're discovering something special
- Avoid superlatives, exclamation marks, and pushy sales language
- Use sensory language: textures, warmth, light, materiality

---

## 12. SEO & Performance

### 12.1 Technical SEO

| Requirement                | Detail                                                                  |
| -------------------------- | ----------------------------------------------------------------------- |
| SSR/SSG                    | All public pages server-rendered or statically generated                |
| Sitemap                    | Auto-generated XML sitemap, submitted to Google Search Console          |
| Robots.txt                 | Properly configured to allow crawling of public pages, block admin      |
| Canonical URLs             | Self-referencing canonicals on all pages                                |
| Structured Data            | Product (JSON-LD), Organization, BreadcrumbList, FAQPage, Article       |
| Open Graph + Twitter Cards | Full meta tags for social sharing                                       |
| Clean URLs                 | Descriptive slugs (e.g., `/shop/furniture/eira-lounge-chair`)           |
| Internal Linking           | Cross-links between related products, collections, and journal articles |
| Hreflang                   | If multi-language (future phase)                                        |
| 301 Redirects              | Managed redirect map for any URL changes                                |

### 12.2 Performance Optimisation

- Code splitting by route
- Tree shaking unused JavaScript
- Critical CSS inlining for above-fold content
- Font subsetting (only load used character sets)
- Preconnect to critical third-party origins
- Service worker for offline browsing (PWA-ready, optional)
- Image CDN with automatic format negotiation
- Database query caching with Redis
- Edge caching for static pages

---

## 13. Accessibility (WCAG 2.1 AA)

| Requirement         | Detail                                                        |
| ------------------- | ------------------------------------------------------------- |
| Semantic HTML       | Proper heading hierarchy, landmark roles, semantic elements   |
| Keyboard Navigation | All interactive elements focusable and operable via keyboard  |
| Focus Indicators    | Visible focus ring on all focusable elements                  |
| Colour Contrast     | Minimum 4.5:1 for normal text, 3:1 for large text             |
| Alt Text            | Descriptive alt text on all meaningful images                 |
| ARIA Labels         | On icon buttons, form inputs, dynamic content                 |
| Screen Reader       | Tested with VoiceOver (macOS/iOS) and NVDA (Windows)          |
| Reduced Motion      | Respect `prefers-reduced-motion`; disable animations when set |
| Form Labels         | All inputs associated with visible labels                     |
| Error Messages      | Clear, specific, announced to screen readers                  |
| Skip Navigation     | "Skip to main content" link                                   |
| Touch Targets       | Minimum 44×44px on mobile                                     |

---

## 14. Analytics & Tracking

### 14.1 Key Events to Track

| Event               | Category   | Parameters                          |
| ------------------- | ---------- | ----------------------------------- |
| `page_view`         | Navigation | page_path, page_title               |
| `product_view`      | E-commerce | item_id, item_name, price, category |
| `add_to_cart`       | E-commerce | item_id, item_name, price, quantity |
| `remove_from_cart`  | E-commerce | item_id, quantity                   |
| `begin_checkout`    | E-commerce | value, items[], coupon              |
| `add_shipping_info` | E-commerce | shipping_tier                       |
| `add_payment_info`  | E-commerce | payment_type                        |
| `purchase`          | E-commerce | transaction_id, value, items[]      |
| `search`            | Discovery  | search_term, results_count          |
| `filter_used`       | Discovery  | filter_type, filter_value           |
| `newsletter_signup` | Engagement | source                              |
| `wishlist_add`      | Engagement | item_id                             |
| `review_submit`     | Engagement | product_id, rating                  |

### 14.2 Dashboards

- **Revenue Dashboard:** Daily/weekly/monthly revenue, AOV, conversion rate, revenue by category
- **Product Performance:** Bestsellers, slow movers, review ratings, wishlist popularity
- **Customer Journey:** Funnel from landing → browse → add to cart → checkout → purchase
- **Marketing Attribution:** UTM tracking, channel performance, ROAS
- **Search Analytics:** Popular queries, zero-result queries, search conversion rate

---

## 15. Launch Phases & Milestones

### Phase 1: MVP (Weeks 1–8)

**Goal:** Launch a functional, beautiful e-commerce store.

| Milestone                                   | Target     |
| ------------------------------------------- | ---------- |
| Design system finalised                     | Week 2     |
| Homepage + all marketing pages built        | Week 4     |
| Product catalog loaded (100+ SKUs)          | Week 5     |
| Cart + Checkout flow complete               | Week 6     |
| Payment integration (Stripe) live           | Week 6     |
| User accounts + order management            | Week 7     |
| QA, accessibility audit, performance tuning | Week 8     |
| **LAUNCH**                                  | **Week 8** |

### Phase 2: Growth Features (Weeks 9–14)

| Feature                                | Target  |
| -------------------------------------- | ------- |
| Product reviews (Judge.me integration) | Week 9  |
| Abandoned cart email flows (Klaviyo)   | Week 10 |
| Search with autocomplete (Algolia)     | Week 10 |
| Journal / Blog section                 | Week 11 |
| Wishlist feature                       | Week 12 |
| BNPL integration (Klarna)              | Week 12 |
| Instagram feed integration             | Week 13 |
| Trade program page                     | Week 14 |

### Phase 3: Optimisation (Weeks 15–20)

| Feature                              | Target  |
| ------------------------------------ | ------- |
| A/B testing framework                | Week 15 |
| Personalised product recommendations | Week 16 |
| Advanced analytics dashboards        | Week 17 |
| Loyalty / rewards program            | Week 18 |
| Multi-currency support               | Week 19 |
| International shipping zones         | Week 20 |
| PWA / Mobile app exploration         | Week 20 |

---

## 16. Risks & Mitigations

| Risk                                       | Likelihood | Impact | Mitigation                                                                                  |
| ------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------- |
| Product images don't match brand aesthetic | Medium     | High   | Hire photographer with Nordic aesthetic portfolio; create detailed shot list and mood board |
| Payment integration delays                 | Low        | High   | Use Stripe's pre-built checkout as fallback; test early                                     |
| Low initial traffic                        | High       | Medium | Pre-launch email waitlist; influencer seeding; Pinterest marketing                          |
| Inventory sync issues                      | Medium     | High   | Real-time inventory webhook from CMS; oversell protection with buffer stock                 |
| Site performance on image-heavy pages      | Medium     | Medium | Aggressive image optimisation pipeline; CDN; lazy loading; Lighthouse CI in pipeline        |
| Scope creep delaying launch                | High       | High   | Strict MVP scope; ruthlessly prioritise P1 features; defer P2/P3                            |
| SEO poor at launch                         | Medium     | Medium | Technical SEO checklist; pre-launch content (10+ journal articles); structured data         |
| Accessibility gaps                         | Medium     | High   | Include accessibility review in QA phase; automated a11y testing in CI                      |

---

## 17. Appendix

### A. Competitive Analysis Reference

| Competitor  | Strength to Note                                        |
| ----------- | ------------------------------------------------------- |
| HAY         | Strong brand consistency, excellent product photography |
| Menu (Audo) | Beautiful storytelling, editorial journal content       |
| Frama       | Immersive brand experience, scent + home integration    |
| Hem         | Configurable products, strong use of colour             |
| Nordic Nest | Wide catalogue, effective filtering and search          |

### B. Content Checklist for Launch

- [ ] 100+ product listings with 4+ images each
- [ ] All category pages with descriptions and hero images
- [ ] Brand story / About page
- [ ] Sustainability page
- [ ] Shipping & Returns policy page
- [ ] Privacy Policy and Terms of Service (legal-reviewed)
- [ ] FAQ page (minimum 15 questions)
- [ ] 5+ journal articles published
- [ ] All email templates designed and tested (confirmation, shipping, abandoned cart)
- [ ] Social media profiles created and linked

### C. Email Templates Required

1. **Welcome Email** — Post-registration
2. **Order Confirmation** — Post-purchase
3. **Shipping Confirmation** — When order ships
4. **Delivery Confirmation** — When order delivered
5. **Review Request** — 7 days post-delivery
6. **Abandoned Cart (1hr)** — Gentle reminder
7. **Abandoned Cart (24hr)** — Add social proof
8. **Abandoned Cart (72hr)** — Optional discount offer
9. **Newsletter** — Weekly/bi-weekly
10. **Back in Stock** — When sold-out item restocks
11. **Password Reset** — Account recovery

---

_This PRD is a living document. Update as requirements evolve during discovery, design, and development phases._
