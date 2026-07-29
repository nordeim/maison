# PRD & PAD Update Plan — Alignment with MAISON Design Guide v2

**Date:** 2026-07-29
**Source of truth:** `MAISON_Design_Guide.md` (derived from `public/landing.html` in `maison_landing_page_mockup_v2.zip`)
**Targets:** `Project_Requirements_Document.md` (PRD v1.0) and `Project_Architecture_Document.md` (PAD v1.0)
**Goal:** Reconcile every design-system, motion, color, typography, component, and section-listing discrepancy between the v1.0 documents and the v2 landing page mockup.

---

## 1. Discrepancy Audit Summary

A side-by-side audit of the v1.0 PRD/PAD against the v2 landing page (captured in the design guide) revealed **47 specific discrepancies** across 6 categories. The categories, with counts:

| Category | Discrepancies | Severity |
|---|---|---|
| Color tokens | 3 | High — wrong hex values would break the palette |
| Motion / animation | 11 | High — missing animations would lose signature interactions |
| Component library | 7 | Medium — missing components would under-spec the build |
| Homepage section listing | 6 | High — wrong section count and order |
| Initial product catalog | 1 | Low — annotation needed, not deletion |
| Responsive breakpoints | 3 | Medium — would cause wrong layout reflows |
| Typography details | 4 | Medium — missing italic emphasis treatment |
| Spacing & layout | 5 | Medium — missing shadow tokens, wrong radii |
| Companion doc references | 2 | Low — filename updates |
| Strategic position claims | 2 | Medium — anti-generic claims contradict the v2 design |
| Visual treatments | 3 | Medium — paper grain, sepia filter, mesh glow undocumented |
| **Total** | **47** | |

---

## 2. PRD Update Plan (Project_Requirements_Document.md)

### 2.1 Header & Companion Document References (§1.4, top-of-doc metadata)

**Current:**
```
**Companion Documents:** `docs/landing_page_unified.html` (visual reference), `PROJECT-ARCHITECTURE.md`...
```

**Updated:**
```
**Companion Documents:** `docs/maison_landing_page_mockup_v2.zip` (visual reference, extracted to `public/landing.html`), `MAISON_Design_Guide.md` (canonical design system reference), `PROJECT-ARCHITECTURE.md`...
```

Also update §1.1 Product Vision paragraph that references `docs/landing_page_unified.html` → `docs/maison_landing_page_mockup_v2.zip` (extracted as `public/landing.html`).

### 2.2 Strategic Position (§4.1)

**Current anti-generic commitments:**
> "No bento grids, no L/R hero split, no mesh gradients, no glassmorphism, no purple/indigo."

**Problem:** The v2 landing page **does** use:
- A bento grid for the Categories section (4×2 with `grid-template-areas`)
- A mesh gradient (mesh-glow) behind the Philosophy section
- Glassmorphism on the sticky header (`backdrop-filter: blur(12px)`) and hero spotlight card (`backdrop-filter: blur(6px)`)

**Updated anti-generic commitments:**
> "No L/R hero split (hero is full-bleed with floating spotlight card instead), no purple/indigo, no neon accents, no boxed card inputs on light backgrounds. Bento grids are permitted only for category navigation (one per page). Mesh gradients are permitted only as decorative atmosphere behind editorial sections (max one per page). Glassmorphism is permitted only on sticky chrome (header) and floating cards (hero spotlight, bag panel) — never on primary content surfaces."

### 2.3 Color Tokens (§4.3)

**Three corrections to the color table:**

| Token | Current (v1.0) | Corrected (v2) | Reason |
|---|---|---|---|
| `--muted` | `#8a8178` | `#786f66` | Hex mismatch — landing v2 uses warmer muted |
| `--sage` | `#8b9a82` | `#7e8f72` | Hex mismatch — landing v2 uses deeper sage |
| `--sage-soft` | (missing) | `#dfe4d6` | New token — used in mesh-glow background |

**WCAG contrast row updates:**
- `--muted` on `--bg`: was 4.6:1, recalculate for `#786f66` on `#faf8f5` ≈ 4.8:1 (still AA)
- `--sage` on `--bg`: was 3.5:1, recalculate for `#7e8f72` ≈ 3.7:1 (large text only — unchanged rule)
- Add row for `--sage-soft` (decorative only, no contrast requirement)

### 2.4 Spacing & Layout (§4.4)

**Add shadow token system** (missing entirely from v1.0):

```css
--shadow-sm: 0 1px 3px rgba(31,27,23,0.04);    /* header scrolled */
--shadow-md: 0 8px 24px rgba(31,27,23,0.08);   /* card hover, button hover */
--shadow-lg: 0 24px 60px rgba(31,27,23,0.14);  /* toast, mobile nav */
--shadow-xl: 0 40px 100px rgba(31,27,23,0.20); /* hero spotlight, bag panel */
```

**Correct border radius claim:**

Current: "Border radius: 2px (--radius-sm), 4px (--radius-md), 8px (--radius-lg only for hero badges)"

Corrected: "Border radius: 0px for cards and buttons (deliberately square — editorial convention), 50% for icon buttons and social icons, 0px for badges and tags. The page has no rounded rectangles except circular icon buttons. This is a deliberate aesthetic — sharp corners reinforce the 'considered, not cozy' brand voice."

**Add gutter and container tokens** (already correct in v1.0 — confirmed):
- `--container: 1280px` ✓
- `--container-narrow: 760px` ✓
- `--gutter: clamp(20px, 5vw, 64px)` ✓

**Add section padding variants:**
- Default section: `clamp(64px, 9vw, 120px)` ✓ (already in v1.0)
- Philosophy section: `clamp(80px, 11vw, 140px)` (new — extra breathing room for manifesto)
- Statement ticker: `2.75rem 0` (new — short typographic break)
- Newsletter: `clamp(64px, 9vw, 110px)` (new — slightly less than default)

### 2.5 Motion & Animation (§4.5)

**Replace entire motion table** with the comprehensive v2 inventory:

| Animation | Duration | Easing | Usage | Reduced-Motion Fallback |
|---|---|---|---|---|
| Ken Burns (hero bg) | 26s | ease-in-out, alternate infinite | Hero background image | Disabled (static image) |
| Hero headline line-up | 1s + 0.15s stagger | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero H1 line-by-line rise | Instant (no transform) |
| Hero fade-up | 0.9s + delays (0.15s/0.65s/0.8s/1.05s) | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero eyebrow, desc, CTAs, spotlight | Instant (opacity 1) |
| Brand marquee | 38s | linear infinite | Brand promises strip | Disabled (static, wraps) |
| Statement ticker | 32s | linear infinite | Italic serif phrases | Disabled (static, wraps) |
| Testimonials marquee | 46s | linear infinite (pauses on hover) | Testimonial cards | Disabled (static, wraps) |
| Scroll hint bob | 2.4s | ease-in-out infinite | Hero scroll-down chevron | Disabled |
| Scroll reveal (translate) | 0.9s | `cubic-bezier(0.16, 1, 0.3, 1)` | `.reveal` elements via IntersectionObserver | Instant (no transform) |
| Scroll reveal (scale) | 0.8s | `cubic-bezier(0.16, 1, 0.3, 1)` | `.reveal-pop` elements | Instant (no transform) |
| Stagger delay | 0.08s/step (max 4 steps) | — | Grid item reveals via `data-delay` | Removed |
| Image hover scale | 1.0–1.2s | `cubic-bezier(0.22, 1, 0.36, 1)` | Product cards, category cards, philosophy images | Disabled |
| Image sepia reset | 0.6s | `cubic-bezier(0.22, 1, 0.36, 1)` | All imagery on hover | Disabled |
| Button hover translate | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Primary CTA bg + arrow shift | Color change only |
| Link underline | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Nav links, footer links | Instant |
| Material card lift | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Material cards translateY -4px | Disabled |
| Material top bar scale | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | 3px accent bar scaleX 0→1 | Instant |
| Toast slide-up | 0.45s | `cubic-bezier(0.22, 1, 0.36, 1)` | Add-to-cart confirmation | Instant |
| Bag panel slide-up | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` | Floating bag panel | Instant |
| Cart badge bump | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` | Cart count scale 1→1.6→1 | Disabled |
| Scroll progress bar | 0.08s linear update | linear | 2px gradient bar at top | Still updates (no motion sickness) |
| Custom cursor dot | instant (rAF) | — | 6px clay dot follows mouse | Disabled entirely |
| Custom cursor ring | lerp 0.18 factor (rAF) | — | 34px ring trails dot, expands to 68px on interactive hover | Disabled entirely |
| Magnetic button | rAF, inline style | — | Buttons translate 0.18× X, 0.35× Y of cursor offset | Disabled |
| Hero parallax | rAF, inline style | — | Hero bg translates ±14px based on cursor | Disabled |

**Add easing token definitions:**
```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);     /* primary */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* entrances */
--dur-fast: 0.25s;
--dur: 0.45s;
--dur-slow: 0.9s;
```

### 2.6 Component Library (§4.6)

**Add 5 missing components to the table:**

| Component | Source | Customisation |
|---|---|---|
| Custom Cursor (dot + ring) | Custom (vanilla JS + CSS) | Desktop fine-pointer only; 6px clay dot + 34px ring with 0.18 lerp; expands to 68px on interactive hover; ring border shifts to 55% bg opacity on dark sections |
| Magnetic Button Wrapper | Custom (vanilla JS) | Applies to `.magnetic` class on buttons; translates 0.18× X-offset, 0.35× Y-offset on mousemove; resets on mouseleave |
| Scroll Progress Bar | Custom (vanilla JS + CSS) | 2px fixed top bar; gradient clay→gold; width updates on scroll via passive listener |
| Floating Bag Panel | Custom (Radix Dialog base optional) | Fixed bottom-right; `min(320px, calc(100vw - 2rem))`; slides up from `translateY(140%)`; auto-hides after 5s; shows product thumb + name + price + count + "View Bag" link |
| Statement Ticker | Custom (CSS marquee) | Italic serif phrases; alternates solid clay and outlined (`-webkit-text-stroke: 1px var(--ink-2)`); 32s linear infinite; `aria-hidden="true"` |

**Also document 3 visual treatments as components (or add to §4.4):**

| Treatment | Implementation |
|---|---|
| Paper Grain Noise | `body::before` fixed overlay; SVG `feTurbulence baseFrequency=0.9 numOctaves=3`; opacity 0.035; z-index 9990; `pointer-events: none` |
| Sepia Photo Filter | All product/category/philosophy/journal images: `filter: sepia(0.22) saturate(1.05) hue-rotate(-6deg)`; resets to `sepia(0) saturate(1)` on hover |
| Mesh Glow | `.mesh-glow` absolute-positioned 640px circle; `filter: blur(90px)`; opacity 0.35; sage-soft + gold radial gradients; positioned behind Philosophy section |

### 2.7 Homepage Sections (§6.1)

**Current:** 15 sections listed
**Updated:** 17 sections (added Statement Ticker + Hero Spotlight Card as standalone item)

**Corrected section list (matching `public/landing.html` exactly):**

1. **Announcement bar** — ink bg, 11px tracked uppercase, gold `$150` highlight, free shipping + gift wrap + 30-day returns
2. **Sticky header** — Logo (M<em>a</em>ison), nav (Shop All, Collections, Our Story, Journal, Contact), search/account/cart icons (40px circles), cart badge with bump animation, mobile hamburger → X
3. **Hero** — Full-bleed 94vh (min 660px, max 960px), Ken Burns image (26s), 3-stop dark gradient overlay, eyebrow (gold) + 2-line H1 ("Objects of *Quiet Beauty*" — italic gold) + description + dual CTA, mousemove parallax (±14px), scroll indicator (animated chevron)
4. **Hero Spotlight Card** — Floating bottom-right product card (`min(240px, 32vw)`), glass bg + blur(6px), thumbnail + signature piece name + price, fades up last in hero choreography (1.05s delay)
5. **Brand marquee** — ink bg, 5 brand promises duplicated for seamless loop, gold diamonds (◆), 38s linear infinite
6. **Featured Collection** — bg-2, 2-col asymmetric (1.1fr image | 1fr text), 4:5 image with "Featured" tag, stats row (28 pieces, 9 makers, Brass · Glass · Clay), outline CTA
7. **Categories** — bento grid 4×2 with `grid-template-areas: "feature feature wide wide" / "feature feature small1 small2"`, 4 cards (Furniture 42, Lighting 28, Textiles 36, Ceramics 24), gradient overlays, hover scale 1.08 + sepia reset
8. **Statement Ticker** — bg-2, 2.75rem padding, 3 italic serif phrases alternating solid clay + outlined, gold star (✶) separators, 32s linear infinite, `aria-hidden`
9. **Featured Products** — 4-col grid, 8 products populated via JS, hover-swap alt image, badges (New/Bestseller/Featured), wishlist heart (hover-revealed desktop, always visible mobile), quick-add bar (hover-revealed desktop, always visible mobile), sepia filter, staggered reveal-pop
10. **Philosophy** — bg-2, extra padding `clamp(80px, 11vw, 140px)`, mesh-glow top-left, 2-col (1.05fr image collage | 1fr text), 3-image collage (1 tall + 2 stacked), H2 with 2 italic emphasis words, ornament divider (gold star + 60px lines), 3 stats (27 years, 14 makers, 100% FSC), outline CTA
11. **Materials** — 3-col grid, 3 cards color-coded (FSC Oak=clay, European Linen=sage, Hand-thrown Clay=gold), 48px line SVG icons, 3px top accent bar (scaleX 0→1 on hover), origin metadata footer
12. **Editorial (Hygge Edit)** — full-bleed 82vh, dark image with 135° diagonal gradient overlay, gold eyebrow + H2 ("A room is a *feeling*."), gold primary CTA
13. **Testimonials** — horizontal marquee (NOT 3-column grid), 5 testimonial cards, 46s linear infinite (pauses on hover), each card: 4rem clay quote mark, gold stars, italic serif blockquote, 24px clay line + name + tracked location
14. **Journal** — bg-2, 3-col grid, 3 article cards, 4:3 image, meta line (category · read time), serif H3 (clay on hover), excerpt
15. **Instagram** — 6-col square grid (populated via JS), hover: image scale 1.1 + 40% clay overlay + Instagram icon scale-in, centered section head with handle "@maison*living*"
16. **Newsletter** — ink bg with gold dot pattern texture, centered narrow (760px), gold eyebrow + H2 ("Letters from *Maison*."), borderless form (border-bottom only, gold on focus-within), privacy note
17. **Footer** — 4-col grid (1.6fr brand | 1fr Shop | 1fr About | 1fr Help), wordmark + tagline + 3 social icons, bottom row (copyright with dynamic year + 3 legal links)

**Update implementation notes:**
- Hero height: 92vh → **94vh** (min 660px, max 960px)
- Hero image: add `kenBurns 26s` (was 24s), add mousemove parallax
- Add: "Statement ticker is `aria-hidden='true'` — purely decorative typographic break"
- Add: "Testimonials use horizontal marquee (46s linear infinite, pauses on hover) — not a static grid"
- Add: "Hero spotlight card uses `backdrop-filter: blur(6px)` and `box-shadow: var(--shadow-xl)`"

### 2.8 Initial Product Catalog (§15.2)

**Keep all 13 SKUs** (these are seeding data for the full catalog), but **annotate which 8 appear on the homepage**.

Add column "On Homepage" to the table:

| Product | Collection | Price | Materials | Badges | On Homepage |
|---|---|---|---|---|---|
| Arc Pendant Light | Lighting | $485 | Solid brass, natural Belgian linen | Featured | ✅ |
| Orb Table Lamp | Lighting | $295 | Mouth-blown glass, solid bronze | New | ✅ |
| Berg Floor Lamp | Lighting | $620 | Aged brass, rice paper shade | — | ✅ |
| Large Sculptural Vessel | Ceramics | $320 | High-fire stoneware, natural ash glaze | New | ✅ |
| Everyday Serving Bowl | Ceramics | $145 | Stoneware, food-safe glaze | — | ✅ |
| Harvest Dining Table | Furniture | $2,850 | Solid white oak, natural oil finish | Featured | — |
| Halden Linen Armchair | Furniture | $890 | Solid oak, washed linen (sand) | Bestseller | ✅ |
| SolSide Oak Table | Furniture | $540 | Solid FSC oak, linseed finish | — | ✅ |
| Washed Linen Throw | Textiles | $195 | 100% washed European linen | Bestseller | ✅ |
| Hand-Felted Wool Cushion | Textiles | $165 | 100% New Zealand wool, linen back | — | — |
| Sculptural Bud Vase | Objects | $85 | Stoneware, matte white glaze | — | — |
| Winter Hearth Candle | Seasonal | $65 | Soy wax, cotton wick, stoneware vessel | — | — |
| Curated Gift Box | Gifts | $225 | Stoneware, soy candle, linen, wooden box | — | — |

**Add note below the table:**
> The 8 products marked ✅ are rendered on the homepage Featured Products section (matching `public/landing.html`). The remaining 5 are seeded for the PLP `/products` page launch and are not shown on the homepage. Hero spotlight card features the Arc Pendant Light ($485).

### 2.9 Responsive Breakpoints (§16.1, §16.2)

**Current breakpoints:** Mobile <640px / Tablet 640–1023px / Desktop 1024–1439px / Wide ≥1440px
**Landing v2 breakpoints:** max-width 1024px / 768px / 480px

**Updated breakpoint table:**

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile (small) | ≤ 480px | Single column, hamburger drawer, 1.25rem gutter, announcement font shrinks to 10px |
| Mobile | 481–768px | 2-col product grid, hero 90vh min 560px, hero spotlight centered, journal 1-col, stats 1-col |
| Tablet | 769–1024px | 3-col product grid, materials 1-col, journal 2-col, instagram 3-col, footer 2-col, featured/philosophy collapse to 1-col, categories 2-col with redefined bento areas |
| Desktop | ≥ 1025px | Full 4-col products, 4-col bento categories, 3-col materials/journal, 6-col instagram, 4-col footer, asymmetric featured/philosophy |
| Wide | ≥ 1440px | Container capped at 1280px, section padding maxes out at 120px (or 140px for philosophy) |

**Updated responsive behaviors (§16.2):**

Add the following missing behaviors:

- **Categories bento re-flow:**
  - Desktop (≥1025px): `"feature feature wide wide" / "feature feature small1 small2"`
  - Tablet (≤1024px): `"feature feature" / "wide wide" / "small1 small2"`
  - Mobile (≤768px): `"feature" / "wide" / "small1" / "small2"` (4 stacked rows)
- **Hero spotlight card:** Desktop = bottom-right floating; Mobile = bottom-center (`left: 50%; transform: translateX(-50%)`)
- **Product card hover elements:** Desktop = hover-revealed wishlist + quick-add; Mobile = always visible (touch can't hover)
- **Custom cursor + magnetic buttons:** Disabled on touch via `(hover: hover) and (pointer: fine)` media query check
- **Statement ticker:** Marquee animation runs on all viewports (no static fallback for mobile)
- **Testimonials marquee:** Same — runs on all viewports, pauses on hover (desktop) or tap (mobile, via `:active` pseudo-class)

### 2.10 Accessibility (§16.3)

**Add the following missing items:**

- Custom cursor is decorative only — native cursor remains visible; cursor disabled entirely under `prefers-reduced-motion`
- Focus-visible outline is `2px solid var(--clay)` with `3px offset` (not the default blue)
- `aria-live="polite"` on toast and bag panel (announces cart additions to screen readers)
- `aria-hidden="true"` on all decorative animated elements (marquees, statement ticker, scroll hint, mesh glow, quote marks)
- Statement ticker and brand marquee content is duplicated in DOM for seamless loop — both copies are `aria-hidden`
- Mobile nav drawer: focus trap when open, focus restored to trigger button on close, ESC key closes

---

## 3. PAD Update Plan (Project_Architecture_Document.md)

### 3.1 Header & Companion Document References

**Current:**
```
**Companion Document:** [`docs/PRD_unified.md`](./docs/PRD_unified.md)
```

**Updated:**
```
**Companion Documents:** [`docs/PRD_unified.md`](./docs/PRD_unified.md), [`docs/MAISON_Design_Guide.md`](./docs/MAISON_Design_Guide.md) (canonical design system reference), [`docs/maison_landing_page_mockup_v2.zip`](./docs/maison_landing_page_mockup_v2.zip) (extracts to `public/landing.html`)
```

### 3.2 Typographic System (§5.1)

**Add italic emphasis treatment row** (missing from v1.0):

| Pattern | Implementation | Usage |
|---|---|---|
| Italic emphasis in headings | `<em>` tag, color shifts to `--clay` (light sections) or `--gold` (dark sections), font-weight drops to 300–400 | Every section title contains exactly one italic word — never more. Examples: "Objects of *Quiet Beauty*", "Lighting that *casts warmth*", "A room is a *feeling*" |
| Eyebrow color shift | `--clay` on light backgrounds, `--gold` on dark backgrounds (hero, editorial, newsletter) | Tracked uppercase labels (11px, 0.22em letter-spacing) |

**Add full type scale table** (currently only 6 rows; expand to match design guide §4.2):

Include Hero H1, Section title, Featured H2, Editorial H2, Newsletter H2, Product name, Category card name, Material title, Journal title, Body default, Lede, Hero description, Featured paragraph, Philosophy paragraph, Material paragraph, Journal paragraph, Product material, Product price, Testimonial blockquote, Eyebrow, Button — with size, weight, line-height, color, max-width.

### 3.3 Color Tokens (§5.2)

**Apply same 3 corrections as PRD §4.3:**
- `--muted`: `#8a8178` → `#786f66`
- `--sage`: `#8b9a82` → `#7e8f72`
- Add `--sage-soft`: `#dfe4d6`

**Update WCAG contrast ratios** in the table to match the corrected hex values (recalculate for `#786f66` and `#7e8f72`).

**Add color usage rules section:**
1. Clay is the only color used for primary CTAs (no green "buy" buttons, no blue "submit" buttons)
2. Gold is reserved for dark backgrounds (hero, marquee, editorial, newsletter — never on light sections)
3. Sage is used twice only: second material card icon + mesh-glow base
4. Dark sections use ink (`#1f1b17`), not pure black
5. White (`#ffffff`) is used only for cards on warm backgrounds — never as page background
6. `::selection` is clay bg + bg color text

### 3.4 Component Primitives (§5.3)

**Add 5 missing rows to the component table** (same as PRD §4.6):

| Component | Base | Variants | Customisation |
|---|---|---|---|
| Custom Cursor | Custom (vanilla JS + CSS) | `dot` (6px clay), `ring` (34px, expands to 68px on interactive) | Desktop fine-pointer only; lerp 0.18; border shifts on dark sections; disabled under reduced-motion |
| Magnetic Button | Custom (vanilla JS wrapper) | Applies `.magnetic` class | Translates 0.18× X, 0.35× Y of cursor offset; resets on mouseleave; desktop motion-safe only |
| Scroll Progress Bar | Custom (CSS + passive scroll listener) | — | 2px fixed top; `linear-gradient(90deg, var(--clay), var(--gold))`; z-index 9997 |
| Floating Bag Panel | Custom (Radix Dialog base optional) | — | Fixed bottom-right; `min(320px, calc(100vw - 2rem))`; auto-hides 5s; `aria-live="polite"` |
| Statement Ticker | Custom (CSS marquee) | — | Italic serif; solid clay + outlined alternation; 32s linear infinite; `aria-hidden` |

### 3.5 Motion / Animation (§5.4)

**Replace the entire motion table** with the comprehensive 24-row inventory from PRD §4.5 (the PRD and PAD motion tables must be identical).

**Add easing token definitions** and **rAF-based animation patterns**:

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--dur-fast: 0.25s;
--dur: 0.45s;
--dur-slow: 0.9s;
```

**Add JS-side animation patterns** (for the engineering reference):

| Pattern | Implementation | File |
|---|---|---|
| IntersectionObserver scroll reveal | `threshold: 0.12`, `rootMargin: '0px 0px -60px 0px'`, adds `.visible` class, unobserves after | `apps/web/src/hooks/use-scroll-reveal.ts` |
| Cursor lerp loop | `requestAnimationFrame`, `ringX += (mouseX - ringX) * 0.18` | `apps/web/src/components/cursor.tsx` |
| Magnetic button | `mousemove` listener on `.magnetic`, sets `btn.style.transform` | `apps/web/src/components/magnetic.tsx` |
| Hero parallax | `mousemove` on `.hero`, sets `heroBgImg.style.transform = scale(1.1) translate(x, y)` | `apps/web/src/components/hero.tsx` |
| Scroll progress | passive `scroll` listener, sets `progressBar.style.width` | `apps/web/src/components/scroll-progress.tsx` |
| Cart bump | force reflow + toggle `.bump` class to retrigger keyframe | `apps/web/src/components/cart-button.tsx` |

### 3.6 Add §5.5 — Visual Treatments & Textures (NEW SECTION)

**Add new subsection** between 5.4 and 6:

```markdown
### 5.5 Visual Treatments & Textures

The v2 landing page employs five non-color visual treatments that materially
affect the perceived quality of the surface. Each must be ported to the
production build.

#### 5.5.1 Paper Grain Noise Overlay

A fixed full-viewport SVG noise texture applied via `body::before`:

\`\`\`css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9990;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,...feTurbulence baseFrequency=0.9 numOctaves=3...");
}
\`\`\`

Implementation: inline SVG data URI in `packages/ui/src/tokens/textures.css`.
The noise is `fractalNoise` at 3.5% opacity — gives every surface a paper-like
texture critical to the "oat paper" feel.

#### 5.5.2 Sepia Photo Treatment

All product, category, philosophy, and journal images use:

\`\`\`css
filter: sepia(0.22) saturate(1.05) hue-rotate(-6deg);
\`\`\`

On hover, the filter resets to `sepia(0) saturate(1)`. Implementation: utility
class `.img-sepia` in `packages/ui/src/styles/photo-filter.css`, applied via
the `<Image>` component wrapper.

#### 5.5.3 Mesh Glow

Decorative blurred radial gradient behind the Philosophy section:

\`\`\`css
.mesh-glow {
  position: absolute;
  width: 640px; height: 640px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  background: radial-gradient(circle at 30% 30%, var(--sage-soft), transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(196,162,101,0.35), transparent 60%);
}
\`\`\`

Implementation: `<MeshGlow>` component in `packages/ui/src/components/mesh-glow.tsx`,
positioned via props. Max one per page (anti-generic commitment).

#### 5.5.4 Gradient Overlays

Two overlay gradients for full-bleed image sections:

| Overlay | Stops | Use |
|---|---|---|
| Hero | `linear-gradient(180deg, rgba(24,20,17,0.55) 0%, rgba(24,20,17,0.28) 32%, rgba(24,20,17,0.72) 100%)` | Hero section |
| Editorial | `linear-gradient(135deg, rgba(24,20,17,0.7) 0%, rgba(24,20,17,0.38) 60%, rgba(24,20,17,0.55) 100%)` | Hygge Edit section |
| Category card | `linear-gradient(180deg, transparent 30%, rgba(31,27,23,0.72) 100%)` | Category cards |

#### 5.5.5 Shadow System

Four shadow tokens (defined in §5.2 — confirm cross-reference):
`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`. All use
`rgba(31,27,23,...)` (warm ink) rather than pure black.
```

### 3.7 Add §5.6 — Interaction Patterns (NEW SECTION)

**Add new subsection** documenting the math and choreography:

```markdown
### 5.6 Interaction Patterns (Math & Choreography)

The v2 landing page employs four JS-driven interaction patterns. Each has
specific math that must be preserved.

#### 5.6.1 Custom Cursor Lerp

\`\`\`typescript
// apps/web/src/components/cursor.tsx
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});
function animateRing() {
  ringX += (mouseX - ringX) * 0.18;  // ← critical lerp factor
  ringY += (mouseY - ringY) * 0.18;
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateRing);
}
\`\`\`

The 0.18 lerp factor creates a 5–8 frame trailing effect. Higher = snappier,
lower = soupier. Do not change without A/B testing.

#### 5.6.2 Magnetic Button Math

\`\`\`typescript
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
  // X damped at 0.18, Y at 0.35 — buttons feel more responsive to vertical
  // cursor movement (suits typical wrist motion between CTAs)
});
\`\`\`

#### 5.6.3 Hero Parallax

\`\`\`typescript
document.querySelector('.hero').addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 14;   // ±7px
  const y = (e.clientY / window.innerHeight - 0.5) * 14;  // ±7px
  heroBgImg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
});
\`\`\`

±14px total range — subtle enough to feel three-dimensional without being
distracting. The 1.1 scale ensures no edges show during translate.

#### 5.6.4 Hero Entrance Choreography

Staged fade/line-up sequence with cumulative delays:

\`\`\`
0.00s   page render
0.15s   eyebrow fades up         (fadeUp 0.9s, delay 0.15s)
0.25s   headline line 1 rises    (lineUp 1s, delay 0.25s)
0.40s   headline line 2 rises    (lineUp 1s, delay 0.40s)
0.65s   description fades up     (fadeUp 0.9s, delay 0.65s)
0.80s   CTAs fade up             (fadeUp 0.9s, delay 0.80s)
1.05s   spotlight card fades up  (fadeUp 0.9s, delay 1.05s)
\`\`\`

Total runtime ~2s. Each element starts before the previous finishes —
a "cascade" rather than a "sequence". Implemented via CSS animation-delay
(no JS coordination needed).
```

### 3.8 Glossary Addition (§13)

**Add 8 new terms** to the glossary:

| Term | Definition |
|---|---|
| Ken Burns | Slow zoom-and-pan effect on a static image, named after documentary filmmaker Ken Burns. Used on hero bg (26s alternate infinite). |
| Lerp | Linear interpolation. `value += (target - value) * factor`. Used for cursor ring trailing effect (factor 0.18). |
| Magnetic button | Button that translates slightly toward the cursor on mousemove, creating a "magnetic" attraction. Damped at 0.18× X, 0.35× Y. |
| Mesh glow | Blurred radial gradient(s) used as decorative atmosphere. Sage-soft + gold blend at 35% opacity, blurred 90px. |
| Paper grain | SVG fractalNoise texture overlaid at 3.5% opacity to give digital surfaces a paper-like feel. |
| Sepia reset | Image filter `sepia(0.22) saturate(1.05) hue-rotate(-6deg)` that drops to `sepia(0) saturate(1)` on hover. |
| Spotlight card | Floating product card overlapping the hero, breaking the centered-text cliché. Uses glass bg + blur(6px). |
| Statement ticker | Horizontal marquee of italic serif phrases alternating solid clay and outlined (`-webkit-text-stroke`). 32s linear infinite. |

---

## 4. Execution Order

The updates will be applied in this order to minimize risk:

1. **Copy** original PRD and PAD from `/upload/` to `/download/` as working copies
2. **Update PRD §1.4** — companion doc references (low risk, textual)
3. **Update PRD §4.1** — strategic position anti-generic claims (medium risk, reframes constraints)
4. **Update PRD §4.3** — color token corrections (high risk, hex values)
5. **Update PRD §4.4** — spacing, shadows, radii (medium risk, additive)
6. **Update PRD §4.5** — motion table replacement (high risk, large change)
7. **Update PRD §4.6** — component library additions (medium risk, additive)
8. **Update PRD §6.1** — homepage section list (high risk, structural)
9. **Update PRD §15.2** — product catalog annotation (low risk, additive column)
10. **Update PRD §16.1, §16.2, §16.3** — responsive + accessibility (medium risk)
11. **Update PAD §5.1** — typography (medium risk, additive)
12. **Update PAD §5.2** — color tokens (high risk, must match PRD)
13. **Update PAD §5.3** — component primitives (medium risk, additive)
14. **Update PAD §5.4** — motion table (high risk, must match PRD)
15. **Insert PAD §5.5** — visual treatments (new section, additive)
16. **Insert PAD §5.6** — interaction patterns (new section, additive)
17. **Update PAD §13** — glossary additions (low risk, additive)
18. **Verify** cross-document consistency (color tokens match, motion tables match, section counts align)

---

## 5. Verification Checklist (Post-Update)

After applying all updates, verify:

- [ ] PRD §4.3 color tokens match PAD §5.2 color tokens exactly (15 tokens, same hex values)
- [ ] PRD §4.5 motion table matches PAD §5.4 motion table (24 rows)
- [ ] PRD §6.1 lists 17 homepage sections; PAD references the same count
- [ ] PRD §15.2 has 13 SKUs with "On Homepage" column showing 8 ✅ marks
- [ ] PRD §16.1 breakpoints match landing v2 (1024 / 768 / 480)
- [ ] PAD §5.5 (Visual Treatments) and §5.6 (Interaction Patterns) are new sections
- [ ] All references to `docs/landing_page_unified.html` updated to `docs/maison_landing_page_mockup_v2.zip` (or `public/landing.html`)
- [ ] `MAISON_Design_Guide.md` referenced as canonical design system source in both documents
- [ ] No remaining `#8a8178` (old muted) or `#8b9a82` (old sage) anywhere in either document
- [ ] No remaining "24s" Ken Burns reference (should be 26s everywhere)
- [ ] No remaining "92vh" hero reference (should be 94vh)
- [ ] No remaining "3-column" testimonials reference (should be horizontal marquee)
- [ ] Strategic position no longer claims "no bento grids" or "no mesh gradients" (v2 uses both)

---

*End of update plan. Execution follows.*
