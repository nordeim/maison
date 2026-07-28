## **MAISON — Full-Featured E-Commerce Website**

### Project Requirements Document v1.0

**Document Date:** July 26, 2026  
**Product Name:** Maison (Scandi Haven Shop)  
**Document Owner:** Product Team  
**Status:** Draft for Review

---

## 1. Executive Summary

### 1.1 Product Vision

Maison is a premium e-commerce platform for curated Scandinavian-inspired home goods and lifestyle products. The platform embodies the philosophy of "considered living"—offering handcrafted objects that prioritize material integrity, artisan craftsmanship, and timeless design over mass production.

### 1.2 Business Objectives

| Objective            | Metric                 | Target               |
| -------------------- | ---------------------- | -------------------- |
| Revenue Generation   | Monthly GMV            | $50K within 6 months |
| Customer Acquisition | New customers/month    | 500+                 |
| Conversion Rate      | Visitor-to-purchase    | ≥ 2.5%               |
| Average Order Value  | AOV                    | ≥ $275               |
| Customer Retention   | Repeat purchase rate   | ≥ 30%                |
| Brand Engagement     | Newsletter subscribers | 10K within 12 months |

### 1.3 Target Audience

- **Primary:** Design-conscious adults aged 28–55, urban/suburban, HHI $80K+
- **Secondary:** Interior design professionals, gift shoppers, architecture enthusiasts
- **Psychographics:** Values sustainability, craftsmanship, minimalism; willing to invest in quality over quantity

---

## 2. Design System & Brand Identity

### 2.1 Typography

| Role               | Font Family        | Weights                    | Usage                            |
| ------------------ | ------------------ | -------------------------- | -------------------------------- |
| Headings / Display | Cormorant Garamond | 400, 500, 600, 700, italic | H1–H6, product names, logo       |
| Body / UI          | Inter              | 300, 400, 500, 600         | Paragraphs, labels, buttons, nav |

### 2.2 Color Palette (HSL Design Tokens)

| Token                  | HSL Value           | Usage                              |
| ---------------------- | ------------------- | ---------------------------------- |
| `--background`         | `hsl(40, 33%, 97%)` | Page background (warm cream)       |
| `--foreground`         | `hsl(30, 10%, 15%)` | Primary text, footer bg (charcoal) |
| `--primary`            | `hsl(18, 45%, 45%)` | CTAs, accents, badges (terracotta) |
| `--primary-foreground` | `hsl(40, 33%, 97%)` | Text on primary                    |
| `--secondary`          | `hsl(30, 15%, 85%)` | Secondary elements                 |
| `--muted`              | `hsl(30, 10%, 90%)` | Muted backgrounds                  |
| `--muted-foreground`   | `hsl(30, 8%, 45%)`  | Secondary text                     |
| `--accent`             | `hsl(35, 40%, 92%)` | Hover states, highlights           |
| `--border`             | `hsl(30, 15%, 88%)` | Borders, dividers                  |
| `--linen`              | `hsl(35, 25%, 93%)` | Section backgrounds                |
| `--warm-taupe`         | `hsl(30, 15%, 75%)` | Scrollbar, subtle accents          |

**Dark Mode Support:** Full dark theme with inverted tokens (background: `hsl(30, 10%, 10%)`, foreground: `hsl(40, 20%, 90%)`, primary: `hsl(18, 50%, 55%)`)

### 2.3 Spacing & Layout

- **Container widths:** Narrow (64rem), Wide (80rem), Full (1600px)
- **Base spacing unit:** 4px (Tailwind scale)
- **Section padding:** 5rem (mobile) / 7–8rem (desktop)
- **Border radius:** 0.25rem (deliberately minimal/square aesthetic)
- **Grid system:** 12-column CSS Grid for collections; 4-column for products

### 2.4 Animation & Motion

| Animation             | Duration   | Easing                               | Usage                    |
| --------------------- | ---------- | ------------------------------------ | ------------------------ |
| Ken Burns (hero zoom) | 20s        | ease-out                             | Hero background          |
| Fade In Up            | 0.8–1s     | cubic-bezier(0.25, 0.46, 0.45, 0.94) | Scroll reveals           |
| Parallax              | Continuous | Linear                               | Hero on scroll           |
| Image hover scale     | 1–1.2s     | ease-out                             | Product/collection cards |
| Link underline        | 0.5s       | cubic-bezier(0, 0, 0.2, 1)           | Nav links                |
| Button shine          | 0.5s       | cubic-bezier(0, 0, 0.2, 1)           | CTA hover                |
| Stagger delay         | 0.1s/item  | —                                    | Grid item reveals        |

### 2.5 Component Library

- **Buttons:** Primary (dark bg), Outline (bordered), with shine hover effect
- **Cards:** Product card (4:5 aspect), Collection card (3:4 or 16:9)
- **Badges:** "New" (dark), "Featured" (terracotta)
- **Navigation:** Sticky header with blur backdrop, mega dropdown
- **Inputs:** Minimal border, focus state with border color transition

---

## 3. Site Architecture & Page Inventory

### 3.1 Sitemap

```
/ (Homepage)
├── /products (Shop All / Product Listing)
│   └── /products?collection={slug} (Filtered by collection)
├── /product/{slug} (Product Detail Page)
├── /collections (Collections Overview)
├── /about (About / Our Story)
├── /cart (Shopping Bag)
├── /checkout (Checkout Flow)
├── /account (Customer Account)
│   ├── /account/orders
│   ├── /account/wishlist
│   └── /account/settings
├── /contact (Contact Us)
├── /faq (FAQ)
├── /shipping-returns (Shipping & Returns Policy)
├── /care-guide (Product Care Guide)
├── /privacy-policy
├── /terms-of-service
└── /cookie-policy
```

### 3.2 Page Descriptions

#### 3.2.1 Homepage (`/`)

**Sections (in order):**

1. **Hero** — Full-viewport (100svh) with parallax background, ken-burns animation, tagline, headline, description, CTA button, scroll indicator
2. **Featured Collection** — Split layout (image 4:5 + text), highlights one collection (e.g., Lighting)
3. **Latest Products** — 4-column responsive grid, first 4 products, linen textured background
4. **Collections Grid** — Asymmetric 12-col grid (7+5, 4+4+4, 12), 6 collections with hover overlays
5. **About Statement** — Centered text block, linen background, CTA to /about
6. **Instagram Feed** — 6-column square grid, hover overlay with Instagram icon
7. **Footer** — Newsletter signup, 4-column links, copyright bar

#### 3.2.2 Product Listing Page (`/products`)

- Filterable by collection (query param)
- Sort options: Featured, Newest, Price (low→high, high→low)
- Responsive grid: 1/2/3/4 columns
- Collection hero banner when filtered
- Product count display
- Pagination or infinite scroll

#### 3.2.3 Product Detail Page (`/product/{slug}`)

- Image gallery with thumbnails (2+ images per product)
- Product name, price, collection tag
- Long description
- Materials & dimensions
- Add to Cart / Add to Wishlist
- Related products (same collection, max 4)
- Breadcrumb navigation

#### 3.2.4 Shopping Bag (`/cart`)

- Line items with image, name, price, quantity selector
- Remove item
- Subtotal calculation
- Proceed to Checkout CTA
- Continue Shopping link
- Empty state with CTA

#### 3.2.5 Checkout (`/checkout`)

- Multi-step: Shipping → Payment → Review → Confirmation
- Guest checkout + account checkout
- Address form with validation
- Payment integration (Stripe)
- Order summary sidebar
- Promo code field

#### 3.2.6 About Page (`/about`)

- Brand story narrative
- Artisan/maker profiles
- Sustainability commitments
- Behind-the-scenes imagery
- Values section

---

## 4. Functional Requirements

### 4.1 Product Catalog

| ID    | Requirement                                                                   | Priority |
| ----- | ----------------------------------------------------------------------------- | -------- |
| P-001 | Display products with name, price, description, images, materials, dimensions | P0       |
| P-002 | Support multiple images per product with hover-swap on cards                  | P0       |
| P-003 | Tag products as "New" or "Featured" with visual badges                        | P0       |
| P-004 | Associate products with collections (one-to-many)                             | P0       |
| P-005 | Filter products by collection via URL query params                            | P0       |
| P-006 | Sort products by featured, newest, price ascending/descending                 | P1       |
| P-007 | Related products recommendation (same collection)                             | P1       |
| P-008 | Product search with autocomplete                                              | P2       |
| P-009 | Quick view modal from listing page                                            | P2       |

### 4.2 Shopping Cart

| ID    | Requirement                                          | Priority |
| ----- | ---------------------------------------------------- | -------- |
| C-001 | Add/remove items to cart                             | P0       |
| C-002 | Adjust item quantities                               | P0       |
| C-003 | Real-time subtotal calculation                       | P0       |
| C-004 | Cart badge count in header                           | P0       |
| C-005 | Persist cart across sessions (localStorage + server) | P0       |
| C-006 | Cart drawer/slide-out panel                          | P1       |
| C-007 | Free shipping threshold indicator                    | P2       |

### 4.3 Wishlist

| ID    | Requirement                              | Priority |
| ----- | ---------------------------------------- | -------- |
| W-001 | Toggle products in/out of wishlist       | P0       |
| W-002 | Wishlist badge in header                 | P0       |
| W-003 | Wishlist page with grid view             | P1       |
| W-004 | Move wishlist item to cart               | P1       |
| W-005 | Persist wishlist for authenticated users | P1       |

### 4.4 Checkout & Payments

| ID     | Requirement                                               | Priority |
| ------ | --------------------------------------------------------- | -------- |
| CK-001 | Multi-step checkout flow (Shipping → Payment → Review)    | P0       |
| CK-002 | Stripe payment integration (cards, Apple Pay, Google Pay) | P0       |
| CK-003 | Order confirmation page with order number                 | P0       |
| CK-004 | Email confirmation sent on order placement                | P0       |
| CK-005 | Guest checkout support                                    | P0       |
| CK-006 | Promo/discount code application                           | P1       |
| CK-007 | Shipping method selection (standard/express)              | P1       |
| CK-008 | Tax calculation by region                                 | P1       |
| CK-009 | Address book for returning customers                      | P2       |

### 4.5 User Accounts

| ID    | Requirement                         | Priority |
| ----- | ----------------------------------- | -------- |
| U-001 | Email/password registration & login | P0       |
| U-002 | OAuth login (Google, Apple)         | P1       |
| U-003 | Order history with status tracking  | P1       |
| U-004 | Saved addresses                     | P1       |
| U-005 | Wishlist persistence                | P1       |
| U-006 | Password reset flow                 | P0       |
| U-007 | Account deletion (GDPR)             | P1       |

### 4.6 CMS & Content

| ID      | Requirement                                       | Priority |
| ------- | ------------------------------------------------- | -------- |
| CMS-001 | Admin panel for product CRUD operations           | P0       |
| CMS-002 | Collection management (create, edit, reorder)     | P0       |
| CMS-003 | Homepage section management (featured collection) | P1       |
| CMS-004 | Blog/editorial content management                 | P2       |
| CMS-005 | Image upload with automatic optimization          | P0       |
| CMS-006 | SEO metadata management per page                  | P1       |

### 4.7 Newsletter & Marketing

| ID    | Requirement                                        | Priority |
| ----- | -------------------------------------------------- | -------- |
| M-001 | Email capture form in footer                       | P0       |
| M-002 | Integration with email service (Mailchimp/Klaviyo) | P1       |
| M-003 | Welcome email sequence for new subscribers         | P2       |
| M-004 | Abandoned cart email flow                          | P2       |
| M-005 | Instagram feed integration                         | P1       |

---

## 5. Technical Architecture

### 5.1 Recommended Tech Stack

| Layer                  | Technology                    | Rationale                                            |
| ---------------------- | ----------------------------- | ---------------------------------------------------- |
| **Frontend Framework** | React 18+ with TypeScript     | Component architecture, ecosystem, SSR support       |
| **Meta-Framework**     | Next.js 14+ (App Router)      | SSR/SSG for SEO, image optimization, API routes      |
| **Styling**            | Tailwind CSS + CSS Variables  | Matches existing design token system                 |
| **Animation**          | Framer Motion                 | Matches existing scroll-reveal and parallax patterns |
| **State Management**   | Zustand or React Context      | Cart/wishlist state, lightweight                     |
| **E-Commerce Backend** | Medusa.js or Shopify Hydrogen | Headless commerce, product/order management          |
| **Database**           | PostgreSQL (via Supabase)     | Relational data, auth included                       |
| **Payments**           | Stripe                        | Industry standard, multi-currency                    |
| **CMS**                | Sanity.io or Strapi           | Headless CMS for content management                  |
| **Image CDN**          | Cloudinary or imgix           | On-the-fly optimization, responsive images           |
| **Email**              | Resend + React Email          | Transactional emails                                 |
| **Analytics**          | Plausible or GA4 + Hotjar     | Privacy-friendly analytics + heatmaps                |
| **Hosting**            | Vercel                        | Next.js optimized, edge functions                    |
| **Search**             | Algolia (optional)            | Faceted product search                               |

### 5.2 Data Models

```typescript
// Product
interface Product {
  id: string;
  name: string;
  slug: string;
  collection: string; // collection ID
  price: number; // in cents
  compareAtPrice?: number;
  description: string;
  longDescription: string;
  materials: string;
  dimensions: string;
  images: ProductImage[];
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  stockQuantity: number;
  weight: number; // grams, for shipping
  seoTitle?: string;
  seoDescription?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

// Collection
interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  heroImage: string;
  sortOrder: number;
  productCount: number;
}

// CartItem
interface CartItem {
  productId: string;
  quantity: number;
  addedAt: DateTime;
}

// Order
interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  createdAt: DateTime;
}

// Customer
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  wishlist: string[]; // product IDs
  orders: string[]; // order IDs
  newsletterSubscribed: boolean;
  createdAt: DateTime;
}
```

### 5.3 API Endpoints (REST)

| Method | Endpoint                  | Description                                    |
| ------ | ------------------------- | ---------------------------------------------- |
| GET    | `/api/products`           | List products (with filters, sort, pagination) |
| GET    | `/api/products/:slug`     | Get single product                             |
| GET    | `/api/collections`        | List all collections                           |
| GET    | `/api/collections/:slug`  | Get collection with products                   |
| POST   | `/api/cart`               | Create/update cart                             |
| GET    | `/api/cart/:id`           | Get cart contents                              |
| POST   | `/api/checkout`           | Initiate checkout session                      |
| POST   | `/api/orders`             | Create order                                   |
| GET    | `/api/orders/:id`         | Get order details                              |
| POST   | `/api/auth/register`      | Register new customer                          |
| POST   | `/api/auth/login`         | Authenticate customer                          |
| POST   | `/api/newsletter`         | Subscribe to newsletter                        |
| GET    | `/api/related/:productId` | Get related products                           |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric                         | Target                   |
| ------------------------------ | ------------------------ |
| Largest Contentful Paint (LCP) | < 2.0s                   |
| First Input Delay (FID)        | < 100ms                  |
| Cumulative Layout Shift (CLS)  | < 0.1                    |
| Time to Interactive (TTI)      | < 3.0s                   |
| Lighthouse Score (Performance) | ≥ 90                     |
| Image format                   | WebP/AVIF with fallbacks |
| JavaScript bundle (initial)    | < 200KB gzipped          |

### 6.2 Accessibility (WCAG 2.1 AA)

- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigable (focus management, skip links)
- Color contrast ratio ≥ 4.5:1 for text
- Alt text on all images
- Reduced motion support (`prefers-reduced-motion`)
- Screen reader compatible cart/checkout flow
- Focus-visible outlines on all interactive elements

### 6.3 SEO

- Server-side rendering for all public pages
- Structured data (JSON-LD) for products, breadcrumbs, organization
- Dynamic meta tags per page
- XML sitemap auto-generation
- Canonical URLs
- Open Graph & Twitter Card meta tags
- Image alt text and descriptive filenames
- Core Web Vitals optimization

### 6.4 Security

- HTTPS enforced (HSTS)
- CSRF protection on all forms
- Input sanitization and validation
- Rate limiting on API endpoints
- PCI DSS compliance via Stripe (no card data touches server)
- Secure session management (httpOnly cookies)
- Content Security Policy headers
- Regular dependency vulnerability scanning

### 6.5 Scalability

- CDN for static assets and images
- Edge caching for product listings
- Database connection pooling
- Horizontal scaling readiness
- Support for 10K+ concurrent users
- Image lazy loading and responsive srcsets

---

## 7. Product Catalog (Initial Data)

### 7.1 Collections (8)

| Collection          | Slug           | Description                                   |
| ------------------- | -------------- | --------------------------------------------- |
| Lighting            | `lighting`     | Sculptural forms that cast warmth and shadow  |
| Ceramics            | `ceramics`     | Handcrafted vessels shaped by patient hands   |
| Furniture           | `furniture`    | Timeless pieces built for generations         |
| Textiles            | `textiles`     | Natural fibers woven with intention           |
| Objects & Vases     | `objects`      | Curated details that complete a space         |
| Seasonal Collection | `seasonal`     | Limited pieces inspired by the changing light |
| New Arrivals        | `new-arrivals` | The latest additions to our collection        |
| Curated Gifts       | `gifts`        | Thoughtfully selected pieces for giving       |

### 7.2 Products (13 Initial SKUs)

| Product                  | Collection      | Price  | Materials                                      | Badges   |
| ------------------------ | --------------- | ------ | ---------------------------------------------- | -------- |
| Arc Pendant Light        | Lighting        | $485   | Solid brass, natural Belgian linen             | Featured |
| Orb Table Lamp           | Lighting        | $295   | Mouth-blown glass, solid bronze                | New      |
| Large Sculptural Vessel  | Ceramics        | $320   | High-fire stoneware, natural ash glaze         | Featured |
| Everyday Serving Bowl    | Ceramics        | $145   | Stoneware, food-safe glaze                     | —        |
| Harvest Dining Table     | Furniture       | $2,850 | Solid white oak, natural oil finish            | Featured |
| Woven Lounge Chair       | Furniture       | $1,450 | Solid walnut, natural paper cord               | New      |
| Heritage Linen Throw     | Textiles        | $195   | 100% Belgian linen                             | —        |
| Hand-Felted Wool Cushion | Textiles        | $165   | 100% New Zealand wool, linen back              | —        |
| Sculptural Bud Vase      | Objects & Vases | $85    | Stoneware, matte white glaze                   | —        |
| Forge Candleholder Set   | Objects & Vases | $245   | Solid forged brass                             | Featured |
| Winter Hearth Candle     | Seasonal        | $65    | Natural soy wax, cotton wick, stoneware vessel | —        |
| Honed Marble Tray        | New Arrivals    | $175   | Carrara marble                                 | New      |
| Curated Gift Box         | Curated Gifts   | $225   | Stoneware, soy candle, linen, wooden box       | —        |

---

## 8. User Stories & Acceptance Criteria

### 8.1 Browsing & Discovery

**US-01:** As a visitor, I want to browse products by collection so I can find items that match my interest.

- **AC:** Clicking a collection in nav/footer/grid navigates to filtered product list
- **AC:** Collection hero banner displays collection name, description, and image
- **AC:** Product count updates dynamically based on filter
- **AC:** URL reflects active filter (`/products?collection=lighting`)

**US-02:** As a visitor, I want to see product details so I can make an informed purchase decision.

- **AC:** PDP displays all product images in a gallery
- **AC:** Long description, materials, and dimensions are visible
- **AC:** Price is prominently displayed
- **AC:** Related products from same collection shown below

### 8.2 Purchase Flow

**US-03:** As a customer, I want to add items to my bag and checkout securely.

- **AC:** "Add to Bag" button on PDP adds item with quantity selector
- **AC:** Cart badge updates immediately
- **AC:** Cart page shows all items with editable quantities
- **AC:** Checkout collects shipping, payment, and confirms order
- **AC:** Confirmation page shows order number and summary
- **AC:** Confirmation email sent within 60 seconds

### 8.3 Account & Loyalty

**US-04:** As a returning customer, I want to save my wishlist and view order history.

- **AC:** Wishlist persists across sessions when logged in
- **AC:** Order history shows all past orders with status
- **AC:** Can reorder from order history
- **AC:** Can manage saved addresses

---

## 9. Responsive Design Specifications

| Breakpoint | Width       | Layout Changes                                  |
| ---------- | ----------- | ----------------------------------------------- |
| Mobile     | < 640px     | Single column, hamburger menu, stacked grids    |
| Tablet     | 640–1023px  | 2-column product grid, side-by-side featured    |
| Desktop    | 1024–1439px | 4-column products, full nav, 12-col collections |
| Wide       | ≥ 1440px    | Max-width containers, increased spacing         |

### Key Responsive Behaviors:

- **Header:** Logo + hamburger (mobile) → Logo + full nav + icons (desktop)
- **Hero:** Stacked text (mobile) → Bottom-left aligned (desktop)
- **Products:** 1-col → 2-col → 4-col
- **Collections:** Stacked → Asymmetric 12-col grid
- **Instagram:** 3-col → 6-col
- **Footer:** Stacked → 4-column grid

---

## 10. Analytics & Tracking

### 10.1 Events to Track

| Event               | Trigger                | Properties                    |
| ------------------- | ---------------------- | ----------------------------- |
| `page_view`         | Any page load          | path, referrer, utm params    |
| `product_view`      | PDP loaded             | product_id, collection, price |
| `add_to_cart`       | Add to bag clicked     | product_id, price, quantity   |
| `remove_from_cart`  | Item removed           | product_id                    |
| `begin_checkout`    | Checkout started       | cart_value, item_count        |
| `purchase`          | Order confirmed        | order_id, total, items        |
| `wishlist_add`      | Heart clicked          | product_id                    |
| `newsletter_signup` | Form submitted         | source (footer/popup)         |
| `collection_view`   | Collection page loaded | collection_slug               |
| `search`            | Search performed       | query, results_count          |

### 10.2 Dashboards

- Real-time revenue dashboard
- Conversion funnel (view → cart → checkout → purchase)
- Top products by revenue and views
- Traffic sources and campaign performance
- Customer cohort retention analysis

---

## 11. Release Plan

### Phase 1 — MVP (Weeks 1–6)

- [x] Design system implementation
- [ ] Homepage (all sections)
- [ ] Product listing with collection filter
- [ ] Product detail page
- [ ] Shopping cart (localStorage)
- [ ] Basic checkout with Stripe
- [ ] Order confirmation + email
- [ ] Responsive design (all breakpoints)
- [ ] Basic SEO (meta tags, sitemap)
- [ ] Analytics integration

### Phase 2 — Growth (Weeks 7–12)

- [ ] User accounts (register, login, OAuth)
- [ ] Wishlist persistence
- [ ] Order history
- [ ] CMS admin panel
- [ ] Newsletter integration (Klaviyo)
- [ ] Product search
- [ ] Promo codes
- [ ] Shipping calculator
- [ ] About page + editorial content

### Phase 3 — Optimization (Weeks 13–18)

- [ ] Abandoned cart emails
- [ ] Product reviews
- [ ] Advanced analytics dashboards
- [ ] A/B testing framework
- [ ] Performance optimization (edge caching)
- [ ] Multi-currency support
- [ ] Loyalty/rewards program
- [ ] Instagram shop integration

---

## 12. Success Metrics & KPIs

| KPI                   | Baseline | 3-Month Target | 6-Month Target |
| --------------------- | -------- | -------------- | -------------- |
| Monthly Revenue       | $0       | $15K           | $50K           |
| Conversion Rate       | —        | 1.5%           | 2.5%           |
| Average Order Value   | —        | $250           | $275           |
| Cart Abandonment Rate | —        | < 75%          | < 65%          |
| Email Open Rate       | —        | 35%            | 40%            |
| Return Customer Rate  | —        | 15%            | 30%            |
| Page Load Time (p95)  | —        | < 2.5s         | < 2.0s         |
| NPS Score             | —        | 40+            | 50+            |

---

## 13. Risks & Mitigations

| Risk                      | Impact | Likelihood | Mitigation                                           |
| ------------------------- | ------ | ---------- | ---------------------------------------------------- |
| Low initial traffic       | High   | High       | SEO investment, paid social, influencer partnerships |
| Payment processing issues | High   | Low        | Stripe fallback, thorough testing                    |
| Image loading performance | Medium | Medium     | CDN, lazy loading, WebP/AVIF, srcsets                |
| Inventory sync issues     | Medium | Medium     | Real-time stock checks, oversell prevention          |
| Scope creep               | Medium | High       | Strict phase gating, MVP-first mindset               |
| Mobile UX gaps            | Medium | Medium     | Mobile-first design, device testing matrix           |

---

## 14. Appendices

### A. Competitive References

- Hay Design (hay.dk)
- Muuto (muuto.com)
- Ferm Living (fermliving.com)
- Aesop (aesop.com) — for brand storytelling
- Kinfolk Shop — for editorial commerce

### B. Browser Support Matrix

| Browser             | Minimum Version |
| ------------------- | --------------- |
| Chrome              | Last 2 versions |
| Firefox             | Last 2 versions |
| Safari              | 15+             |
| Edge                | Last 2 versions |
| Mobile Safari (iOS) | 15+             |
| Chrome for Android  | Last 2 versions |

### C. Third-Party Services

| Service    | Purpose             | Tier      |
| ---------- | ------------------- | --------- |
| Stripe     | Payments            | Essential |
| Vercel     | Hosting/Deployment  | Essential |
| Cloudinary | Image CDN           | Essential |
| Resend     | Transactional Email | Essential |
| Klaviyo    | Marketing Email     | Growth    |
| Algolia    | Search              | Growth    |
| Hotjar     | UX Analytics        | Growth    |
| Sentry     | Error Monitoring    | Essential |

---

_End of Document_
