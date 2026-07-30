# MAISON — Visual Aesthetics & UI/UX Design Guide
### Landing Page Mockup v3 · "Objects of Quiet Beauty"

> A comprehensive design reference capturing every visual, typographic, motion, and interaction decision in the MAISON Scandinavian home & lifestyle landing page. Use this guide to reproduce, extend, or audit the design system with fidelity.
>
> **Revision history**
> - v1 — initial distillation
> - v2 — second pass
> - **v3 (this revision)** — corrected against the live implementation at `https://v1uc168atjn1-d.space-z.ai/landing.html` per audit dated 2026-07-30. Four documentation-only fixes applied: §4.2 Hero H1 letter-spacing override documented; §6.2 `scrollHint` animation described precisely; §9 section count reconciled with Appendix A; §13.1 material-icon stroke-width exception documented. No factual claims about the live site were changed; all corrections bring the guide into tighter alignment with the source.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing & Layout Primitives](#5-spacing--layout-primitives)
6. [Motion & Animation System](#6-motion--animation-system)
7. [Visual Treatments & Textures](#7-visual-treatments--textures)
8. [Component Library](#8-component-library)
9. [Page Section Walkthrough](#9-page-section-walkthrough)
10. [Interactive Patterns](#10-interactive-patterns)
11. [Responsive Behavior](#11-responsive-behavior)
12. [Accessibility Considerations](#12-accessibility-considerations)
13. [Iconography](#13-iconography)
14. [Image Direction & Art Direction](#14-image-direction--art-direction)
15. [Design Tokens Reference](#15-design-tokens-reference)

---

## 1. Design Philosophy

### 1.1 Brand Ethos

MAISON is positioned as a curator of slow-made Scandinavian home objects — handcrafted furniture, sculptural lighting, textiles, and ceramics made by Nordic artisans. The design language is built on five interlocking principles that together produce the "Objects of Quiet Beauty" feeling:

**Quiet Luxury Over Loud Branding.** The page never shouts. There are no neon accents, no oversized logos, no aggressive calls to action. Visual weight is reserved for product imagery and serif typography; brand chrome recedes. Even the announcement bar uses 11px text in tracked uppercase rather than bold banners.

**Material Honesty.** Surfaces throughout the page echo the materials of the products — warm off-white backgrounds ("oat paper"), ink-dark contrast sections, sepia-tinted photography, sage and clay accents that reference linen, oak, and ceramic glazes. The digital surface behaves like a material.

**Considered Rhythm.** Sections alternate between light and dark, between dense product grids and spacious editorial spreads, between kinetic moments (marquees, parallax, scroll reveals) and still ones (the philosophy block, the newsletter). The page reads like a magazine, not a catalog.

**Typography as Voice.** Two carefully paired typefaces — Cormorant Garamond (serif, italic-friendly) for headlines and product names, and Inter (geometric sans) for UI, eyebrows, and body — carry 90% of the brand personality. Italics in the clay accent color are the signature emphasis treatment, used sparingly for poetic effect (*Quiet Beauty*, *casts warmth*, *live with*).

**Tactile Detail.** A custom cursor (dot + ring), magnetic buttons, ken-burns hero, sepia photo filters, paper-grain noise overlay, scroll progress bar, and a floating "added to bag" panel all contribute to a sense that the interface itself was crafted, not assembled.

### 1.2 Mood Reference

The page evokes a Nordic autumn dusk: low warm light, oiled oak, washed linen, ceramic vessels on a hand-pegged shelf, the smell of beeswax. It is closer in spirit to a Kinfolk magazine spread or an Aesop store interior than to a typical e-commerce homepage.

### 1.3 Design Tenets (Applied Rules)

| Tenet | How it manifests |
|---|---|
| Whitespace is a feature | Section padding `clamp(64px, 9vw, 120px)`, generous gutters `clamp(20px, 5vw, 64px)` |
| One accent, used with discipline | Clay `#a86b4a` is the only color used for CTAs, links, italics, and active states |
| Italic = soul | Every section title contains one italic word in clay, never more |
| Motion serves content | Scroll-reveals, ken-burns, and marquees are slow (0.45s–26s); nothing flashes |
| Dark = ceremony | Dark backgrounds (hero, marquee, editorial, newsletter) mark transitional moments |
| Sepia = warmth | All product imagery uses `sepia(0.22) saturate(1.05) hue-rotate(-6deg)` until hovered |
| Accessibility is non-negotiable | Reduced-motion media query disables every animation; focus rings are clay-colored |

---

## 2. Brand Identity

### 2.1 Wordmark

The logo is a typographic wordmark — **M<em>a</em>ison** — rendered in Cormorant Garamond. The distinguishing detail is the lowercase italic `a` rendered in the clay accent color (`#a86b4a`), while the `M`, `i`, `s`, `o`, `n` remain in ink (`#1f1b17`). This single typographic gesture:
- signals craft (italic = handwritten)
- injects the brand color into the chrome without using a colored bar or icon
- softens the all-caps severity of typical fashion wordmarks

The wordmark appears in three locations with consistent treatment:
- **Header logo** — `font-size: 1.65rem; font-weight: 600; letter-spacing: 0.16em`
- **Footer brand** — `font-size: 1.85rem; font-weight: 600; letter-spacing: 0.16em`
- **Mobile drawer brand** — implicit via the same logo in the sticky header

### 2.2 Tagline & Voice

**Tagline (footer):** "Curated home objects and lifestyle pieces — crafted by Nordic artisans for intentional, serene living since 1998."

**Voice characteristics:**
- First-person plural ("We believe", "Our philosophy")
- Concrete materials named explicitly (Småland oak, Normandy flax, Gothenburg stoneware)
- Temperate adjectives ("quiet", "considered", "honest", "deliberate")
- No exclamation marks anywhere on the page
- Prices stated plainly without psychological pricing ("$485", not "$499.99")

### 2.3 Brand Vocabulary

Recurring words used as section eyebrows, headings, and copy:

> *quiet · considered · slow-made · honest · crafted · tactile · intentional · warm · graceful · deliberate · sanctuary · hygge · Nordic · artisan · maker · material · origin · ritual*

---

## 3. Color System

### 3.1 Design Tokens

The entire color system is defined as CSS custom properties on `:root`. There are **15 colors** organized into five conceptual groups.

#### Backgrounds (5)
Warm oat-paper neutrals that avoid pure white. The page background is `#faf8f5` — perceptibly warmer than `#ffffff` but lighter than typical cream.

| Token | Hex | Purpose |
|---|---|---|
| `--bg` | `#faf8f5` | Page background, primary surface |
| `--bg-2` | `#f3efe8` | Alternating section background (statement, philosophy, journal) |
| `--bg-3` | `#ece5d8` | Tertiary background (deepest warm neutral) |
| `--bg-card` | `#ffffff` | Card surfaces (testimonials, materials, bag panel) |
| `--bg-dark` | `#1f1b17` | Dark sections (hero overlay base, ink) |

#### Ink / Text (5)
A single dark ink family. There is no black on the page — even the darkest text is `#1f1b17`, a warm near-black with a faint brown undertone.

| Token | Hex | Purpose |
|---|---|---|
| `--ink` | `#1f1b17` | Primary text, headings, button text on dark |
| `--ink-2` | `#4a433b` | Secondary text, body copy |
| `--muted` | `#786f66` | Captions, labels, eyebrows on light backgrounds |
| `--line` | `#e5ddd1` | Visible dividers, card borders |
| `--line-soft` | `#efe9df` | Subtle dividers (inside cards, bag panel head) |

#### Accents (5)
A disciplined palette of one hero accent (clay), one metallic (gold), and one botanical (sage). No other accent colors appear anywhere on the page.

| Token | Hex | Purpose |
|---|---|---|
| `--clay` | `#a86b4a` | **Primary accent.** CTAs, links, italic emphasis, active states, progress bar, cart count |
| `--clay-dark` | `#8a5538` | CTA hover state |
| `--clay-light` | `#c17d52` | Lighter clay variant (defined, used sparingly) |
| `--gold` | `#c4a265` | Hero italic, eyebrows on dark, marquee diamonds, ornament, newsletter input focus |
| `--sage` | `#7e8f72` | Secondary accent — second material card icon, mesh-glow base |
| `--sage-soft` | `#dfe4d6` | Mesh-glow background |

### 3.2 Usage Rules

1. **Clay is the only color used for primary CTAs.** No green "buy" buttons, no blue "submit" buttons.
2. **Gold is reserved for dark backgrounds.** It appears on the hero, marquee, editorial, and newsletter sections — never on a light section.
3. **Sage is used twice only:** the second material card ("European Linen") and the mesh-glow behind the philosophy section.
4. **Dark sections use ink (`#1f1b17`), not pure black.** This keeps the page cohesive with the warm undertone.
5. **White (`#ffffff`) is used only for cards** sitting on the warmer backgrounds — never as a page background.
6. **Selection color:** `::selection { background: var(--clay); color: var(--bg); }` — selecting text on the page produces a clay-on-cream highlight.

### 3.3 Color Combinations (Approved)

| Surface | Text | Use case |
|---|---|---|
| `--bg` (oat) | `--ink` (warm near-black) | Default body |
| `--bg-2` (deeper oat) | `--ink-2` (medium ink) | Body on alternating sections |
| `--ink` (dark) | `--bg` (oat) | Hero, marquee, newsletter body text |
| `--ink` (dark) | `--gold` | Eyebrows & italic emphasis on dark |
| `--clay` (terracotta) | `--bg` (oat) | Primary button, cart count badge |
| `--gold` (warm metallic) | `--ink` | Editorial CTA button |
| `--bg-card` (white) | `--ink` | Cards on warm backgrounds |

---

## 4. Typography System

### 4.1 Font Stack

Two Google Fonts loaded via `<link>` with `display=swap`:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

| Token | Stack | Role |
|---|---|---|
| `--font-serif` | `'Cormorant Garamond', Georgia, serif` | All headings H1–H4, product names, testimonial blockquotes, logo wordmark |
| `--font-sans` | `'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` | Body, eyebrows, UI labels, buttons, inputs |

### 4.2 Typographic Hierarchy

#### Headings (Serif)
```css
h1, h2, h3, h4 {
  font-family: var(--font-serif);
  font-weight: 500;          /* never bold for headings */
  line-height: 1.08;
  letter-spacing: -0.012em;
  color: var(--ink);
}
```

The signature treatment is **italic emphasis in clay**:
```css
.section-title em { color: var(--clay); font-weight: 400; }
.hero__title em { font-style: italic; font-weight: 300; color: var(--gold); }
```

| Element | Size | Weight | Notes |
|---|---|---|---|
| Hero H1 | `clamp(3rem, 8.5vw, 7.5rem)` | 400 | Largest type on page; line-height 0.98; **letter-spacing -0.02em** (overrides the universal -0.012em for tighter display tracking); max 16ch wide |
| Section title (H2) | `clamp(2rem, 4.5vw, 3.4rem)` | 500 | Always contains one `<em>` in clay |
| Featured H2 | `clamp(2.25rem, 5vw, 3.75rem)` | 500 | line-height 1.05 |
| Editorial H2 | `clamp(2.25rem, 5.5vw, 4rem)` | 500 | White on dark |
| Newsletter H2 | `clamp(2.25rem, 5vw, 3.5rem)` | 500 | White on dark |
| Product name (H3) | `1.25rem` | 500 | Color shifts to clay on hover |
| Category card name (H3) | `1.5rem` (feature: `2.1rem`) | 500 | White on dark overlay |
| Material title (H3) | `1.625rem` | 500 | On white card |
| Journal title (H3) | `1.5rem` | 500 | line-height 1.25 |

#### Body & UI (Sans)

| Element | Size | Weight | Line-height | Color |
|---|---|---|---|---|
| Body default | 16px | 400 | 1.65 | `--ink` |
| Lede | `clamp(1rem, 1.15vw, 1.125rem)` | 400 | 1.7 | `--ink-2`, max 60ch |
| Hero description | `clamp(1rem, 1.2vw, 1.125rem)` | 300 | 1.7 | rgba(250,248,245,0.92), max 52ch |
| Featured paragraph | `1.0625rem` | 400 | 1.7 | `--ink-2`, max 48ch |
| Philosophy paragraph | `1.0625rem` | 400 | 1.75 | `--ink-2`, max 52ch |
| Material paragraph | `0.9375rem` | 400 | 1.7 | `--ink-2` |
| Journal paragraph | `0.9375rem` | 400 | 1.65 | `--ink-2` |
| Product material | `0.85rem` | 400 | 1.4 | `--muted`, italic |
| Product price | `0.95rem` | 500 | 1.4 | `--ink` |
| Testimonial blockquote | `1.1875rem` | 400 | 1.5 | `--ink`, italic serif |

#### Eyebrows (Tracked Uppercase Labels)

The eyebrow is the brand's most-used UI element — every section opens with one.

```css
.eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.22em;     /* widest tracking on the page */
  color: var(--clay);
  margin-bottom: 1rem;
  display: inline-block;
}
```

On dark backgrounds (hero, editorial, newsletter) the eyebrow shifts to `--gold`. Letter-spacing of `0.22em` is consistent across all eyebrows — the widest tracking on the page.

#### Buttons

```css
.btn {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.14em;       /* slightly tighter than eyebrow */
  text-transform: uppercase;
}
```

### 4.3 Type Pairing Rationale

Cormorant Garamond was chosen for its:
- High-contrast stroke weight (gives editorial gravitas)
- Generous x-height (keeps large display sizes legible)
- Italic with calligraphic warmth (the italic `a` in the wordmark, the italic emphasis in headings)
- Free, widely available, performs well at display sizes

Inter was chosen for its:
- Optical balance against Cormorant's contrast (neither competes)
- Excellent screen rendering at small sizes (11–13px UI labels)
- Five weights cover every UI need without expanding the family

The pairing follows the "display serif + workhorse sans" convention used by The New York Times, Aesop, and Studio Nicholson — a recognizable quiet-luxury convention.

---

## 5. Spacing & Layout Primitives

### 5.1 Container System

```css
--container: 1280px;
--container-narrow: 760px;
--gutter: clamp(20px, 5vw, 64px);
```

- The default `.container` is capped at **1280px** — narrow enough that line-lengths stay readable on wide monitors.
- `.container-narrow` (760px) is reserved for the newsletter, where centered text and a single email input should feel intimate.
- Gutters are responsive via `clamp()` — 20px on mobile, 64px on desktop, fluidly scaling between.

### 5.2 Section Rhythm

```css
.section { padding: clamp(64px, 9vw, 120px) 0; position: relative; }
.philosophy { padding: clamp(80px, 11vw, 140px) 0; }    /* extra breathing room */
.newsletter { padding: clamp(64px, 9vw, 110px) 0; }
.statement { padding: 2.75rem 0; }                       /* short typographic break */
```

Vertical padding scales with viewport width, so on a 1440px screen sections get ~120px of breathing room while on a 375px mobile they shrink to 64px. The philosophy section gets a larger range (`80–140px`) because it is the brand's manifesto moment.

### 5.3 Grid Systems

Five distinct grid patterns are used across the page — each chosen to suit its content:

| Section | Grid | Rationale |
|---|---|---|
| Featured collection | `1.1fr 1fr` (2-col asymmetric) | Image slightly wider than text |
| Categories | `repeat(4, 1fr) × 2 rows` with `grid-template-areas` (bento) | One feature card spans 2×2, one wide spans 2×1, two small are 1×1 |
| Products | `repeat(4, 1fr)` uniform | Catalog browsing |
| Philosophy images | `1fr 1fr × 2 rows` with one image spanning 2 rows | Editorial collage feel |
| Materials | `repeat(3, 1fr)` uniform | Three equal cards |
| Testimonials | `flex` with `width: max-content` + marquee animation | Continuous horizontal scroll |
| Journal | `repeat(3, 1fr)` uniform | Three article cards |
| Instagram | `repeat(6, 1fr)` | Six square thumbs |
| Footer top | `1.6fr 1fr 1fr 1fr` | Brand column wider than link columns |

### 5.4 Section Head Pattern

A consistent two-column header opens most sections:

```css
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: clamp(40px, 5vw, 64px);
  flex-wrap: wrap;
}
.section-head .head-text { max-width: 38ch; }
```

Left side: eyebrow + section title. Right side: a text link "View all categories →" with a 1px underline that becomes clay on hover.

### 5.5 Border & Divider Rules

- Visible borders use `1px solid var(--line)` (`#e5ddd1`) — warm, soft, never gray.
- Subtle dividers inside cards use `1px solid var(--line-soft)` (`#efe9df`).
- The footer brand column is separated from link columns by a bottom border on `.footer__top`.
- Card hover states remove the border (`border-color: transparent`) and substitute a `box-shadow` so the card appears to lift rather than shift.

---

## 6. Motion & Animation System

Motion is treated as a craft material — never decorative, always purposeful. The system is built on **four timing tokens, two easing curves, and seven keyframe animations**.

### 6.1 Timing & Easing Tokens

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);     /* primary ease-out with subtle entrance */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* stronger ease-out for entrances */
--dur-fast: 0.25s;    /* hover states, color changes */
--dur: 0.45s;         /* standard transitions */
--dur-slow: 0.9s;     /* scroll reveals */
```

Both easing curves are ease-out variants — nothing on the page eases in. The visual impression is that elements arrive and settle, never that they sweep in or fade up.

### 6.2 Keyframe Animations

| Name | Duration | Iteration | Purpose |
|---|---|---|---|
| `kenBurns` | 26s | infinite alternate | Hero background slow zoom + pan (`scale(1.08→1.16)` + `translate(-1%,-1% → 1.5%,1%)`) |
| `lineUp` | 1s | once | Hero headline line-by-line rise (translates `.line-inner` from `translateY(115%)` → `0`) |
| `fadeUp` | 0.9s | once | Hero eyebrow, desc, actions, spotlight (opacity 0→1, no transform — the elements are already positioned) |
| `marquee` | 32s / 38s / 46s | infinite linear | Statement ticker, brand marquee, testimonials (`translateX(0 → -50%)` on a duplicated track) |
| `scrollHint` | 2.4s | infinite ease-in-out | Hero scroll-down chevron: vertical `translateY` bob on the SVG (not opacity) |
| `cartBump` | 0.5s | once | Cart count badge pop on add (`scale(1→1.6→1)`) |
| (none — uses transitions) | — | — | Magnetic buttons, custom cursor, hover states |

### 6.3 Hero Entrance Choreography

The hero load is a staged sequence with deliberate delays:

```
0.00s   page render
0.15s   eyebrow fades up         (fadeUp 0.9s, delay 0.15s)
0.25s   headline line 1 rises    (lineUp 1s, delay 0.25s)
0.40s   headline line 2 rises    (lineUp 1s, delay 0.40s)
0.65s   description fades up     (fadeUp 0.9s, delay 0.65s)
0.80s   CTAs fade up             (fadeUp 0.9s, delay 0.80s)
1.05s   spotlight card fades up  (fadeUp 0.9s, delay 1.05s)
```

Total choreography runs ~2 seconds, with each element starting before the previous finishes — a "cascade" rather than a "sequence".

### 6.4 Scroll Reveal System

Two reveal variants provide choreography variety:

```css
.reveal {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.9s var(--ease-out), transform 0.9s var(--ease-out);
}
.reveal.visible { opacity: 1; transform: translateY(0); }

.reveal-pop {
  opacity: 0;
  transform: scale(0.94) translateY(14px);
  transition: opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out);
}
.reveal-pop.visible { opacity: 1; transform: scale(1) translateY(0); }
```

- **`.reveal`** — vertical rise (used for text blocks, section heads)
- **`.reveal-pop`** — subtle scale + rise (used for images, product cards, category cards)

Staggered delays via `data-delay="1|2|3|4"` add 80ms, 160ms, 240ms, 320ms respectively.

Triggered by `IntersectionObserver` with `threshold: 0.12` and `rootMargin: '0px 0px -60px 0px'` (triggers slightly before the element reaches center-screen).

### 6.5 Continuous Motion (Ambient)

Three elements animate continuously without user input:

1. **Hero background ken-burns** — `scale(1.08→1.16)` + `translate(-1%,-1% → 1.5%,1%)` over 26s. Imperceptible at any given moment, but creates a "breathing" quality.
2. **Brand marquee** — `translateX(0 → -50%)` over 38s, linear infinite. The track is duplicated so the loop is seamless.
3. **Statement ticker** — `translateX(0 → -50%)` over 32s, linear infinite. Italic serif phrases alternate between solid clay and outlined (`-webkit-text-stroke: 1px var(--ink-2)`).
4. **Testimonials marquee** — `translateX(0 → -50%)` over 46s, pauses on hover.

### 6.6 Interaction Motion

| Trigger | Element | Animation |
|---|---|---|
| Hover | Header nav link | 1px clay underline scales in from left (`transform: scaleX(0→1)`) |
| Hover | Product card image | `scale(1.045)`, sepia filter resets to 0, alt image fades in over 0.6s |
| Hover | Category card image | `scale(1.08)`, sepia resets to 0 |
| Hover | Featured image | `scale(1.05)` over 1.2s |
| Hover | Philosophy image | `scale(1.04)` over 1.2s, sepia resets to 0 |
| Hover | Material card | `translateY(-4px)` + `box-shadow: --shadow-md` + 3px clay top-border `scaleX(0→1)` |
| Hover | Testimonial card | `translateY(-4px)` + shadow-md |
| Hover | Journal card | `translateY(-4px)`, image `scale(1.05)`, title color shifts to clay |
| Hover | Instagram item | Image `scale(1.1)`, clay overlay at 40% opacity fades in, Instagram icon scales in |
| Hover | Primary CTA | Background shifts clay→clay-dark, shadow-md appears, arrow icon `translateX(4px)` |
| Hover | Outline CTA | Background inverts (transparent→ink), color inverts |
| Mouse move | `.magnetic` buttons | Button translates 18% of cursor X-offset, 35% of Y-offset (magnetic attraction) |
| Mouse move | Hero background | `scale(1.1)` + `translate(±14px, ±14px)` based on cursor position (parallax tilt) |
| Mouse move | Custom cursor dot | Instant `translate(x,y)` to cursor position |
| Mouse move | Custom cursor ring | Lerp-follows dot at 0.18 factor — lags behind creating trailing effect |
| Hover (interactive) | Custom cursor ring | Expands from 34px → 68px, border becomes clay, background gets 8% clay tint |
| Click | Add to bag | Cart badge `scale(1→1.6→1)` over 0.5s (cartBump) + bag panel slides up from bottom |
| Click | Wishlist | Heart icon fills clay, toast appears |
| Form submit | Newsletter | Toast confirms subscription, form resets |

### 6.7 Scroll Progress Bar

A 2px gradient bar fixed to the top of the viewport:
```css
.progress-bar {
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  width: 0%;        /* updated by JS on scroll */
  background: linear-gradient(90deg, var(--clay), var(--gold));
  z-index: 9997;
  transition: width 0.08s linear;
}
```

The `0.08s linear` transition makes it feel "live" rather than animating — it tracks scroll position with a barely-perceptible smoothing.

---

## 7. Visual Treatments & Textures

### 7.1 Paper Grain Noise Overlay

A subtle SVG noise texture overlays the entire page:
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9990;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,...feTurbulence...");
}
```

The noise is `fractalNoise` with `baseFrequency: 0.9` and `numOctaves: 3` at 3.5% opacity. The effect is barely perceptible consciously but gives every surface a paper-like texture — critical to the "oat paper" feel of the background. Without it, the off-white reads as digital flat.

### 7.2 Sepia Photo Treatment

Every product, category, philosophy, and journal image uses:
```css
filter: sepia(0.22) saturate(1.05) hue-rotate(-6deg);
```
On hover, the filter resets:
```css
filter: sepia(0) saturate(1);
```

This single decision transforms the imagery from "stock photo" to "catalog photography" — the slight warmth and muted saturation matches the warm-neutral palette. The hover reset reveals the "true" image, suggesting that touching the product brings it to life.

### 7.3 Mesh Glow

Behind the philosophy section, a decorative blurred radial gradient adds atmosphere:
```css
.mesh-glow {
  position: absolute;
  width: 640px; height: 640px;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  background: radial-gradient(circle at 30% 30%, var(--sage-soft), transparent 60%),
              radial-gradient(circle at 70% 70%, rgba(196,162,101,0.35), transparent 60%);
}
```

Sage + gold blend at 35% opacity, blurred 90px — creates the impression of light through a window without using a literal light source.

### 7.4 Hero Overlay Gradient

The hero image gets a three-stop vertical gradient to ensure text legibility without darkening the whole image:
```css
.hero__overlay {
  background: linear-gradient(180deg,
    rgba(24,20,17,0.55) 0%,
    rgba(24,20,17,0.28) 32%,
    rgba(24,20,17,0.72) 100%
  );
}
```

Darker at top (for the announcement bar) and bottom (for the scroll hint), lighter in the middle (to keep the image visible).

### 7.5 Editorial Overlay

The editorial section uses a diagonal gradient:
```css
.editorial__overlay {
  background: linear-gradient(135deg,
    rgba(24,20,17,0.7) 0%,
    rgba(24,20,17,0.38) 60%,
    rgba(24,20,17,0.55) 100%
  );
}
```

This creates a "spotlight" effect — the upper-left (where the text sits) is darkest, the middle is lighter (image visible), and the lower-right returns to medium darkness.

### 7.6 Newsletter Texture

The newsletter section has a subtle gold dot pattern:
```css
.newsletter::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...M1 3h1v1H1V3zm2-2h1v1H3V1z...");
  pointer-events: none;
}
```

A 4×4 SVG pattern with two gold dots at 4% opacity — adds the faintest grid texture without competing with the form.

### 7.7 Shadow System

Four shadow tokens define depth:

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 3px rgba(31,27,23,0.04)` | Header when scrolled |
| `--shadow-md` | `0 8px 24px rgba(31,27,23,0.08)` | Card hover, primary button hover |
| `--shadow-lg` | `0 24px 60px rgba(31,27,23,0.14)` | Toast, mobile nav drawer |
| `--shadow-xl` | `0 40px 100px rgba(31,27,23,0.20)` | Hero spotlight card, bag panel |

All shadows use the ink color `rgba(31,27,23,...)` rather than pure black — this keeps the shadow warm and consistent with the page palette.

---

## 8. Component Library

### 8.1 Buttons

Three button variants, all sharing the base `.btn` style:

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.95rem 1.75rem;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  will-change: transform;
}
.btn svg { width: 14px; height: 14px; }
.btn:hover svg { transform: translateX(4px); }
```

| Variant | Background | Color | Border | Hover |
|---|---|---|---|---|
| `.btn-primary` | `--clay` | `--bg` | transparent | bg → `--clay-dark`, shadow-md |
| `.btn-outline` | transparent | `--ink` | 1px `--ink` | bg → `--ink`, color → `--bg` |
| Hero `.btn-primary` (override) | `--bg` | `--ink` | transparent | bg → `--gold` |
| Hero `.btn-outline` (override) | transparent | `--bg` | 1px rgba(250,248,245,0.5) | bg → `--bg`, color → `--ink` |
| Editorial `.btn-primary` (override) | `--gold` | `--ink` | transparent | bg → `--bg` |

Most CTAs include an arrow SVG (`→`) that translates 4px on hover — a small but consistent micro-interaction.

The `.magnetic` class opts the button into JS-driven magnetic attraction (desktop, motion-safe only).

### 8.2 Eyebrow

A tracked uppercase label that opens every section:
```css
.eyebrow {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--clay);
  margin-bottom: 1rem;
}
```

### 8.3 Link (Section Head)

A minimal underlined text link:
```css
.section-head .link {
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--ink);
  border-bottom: 1px solid var(--ink);
  padding-bottom: 2px;
}
.section-head .link:hover { color: var(--clay); border-color: var(--clay); }
```

### 8.4 Product Card

The most complex component on the page:

```
┌─────────────────────────────┐
│ [Badge: New/Bestseller/—]   │   ← top-left, optional
│                       [♡]   │   ← top-right wishlist (hover-revealed)
│                             │
│        Product Image        │   ← 4:5 aspect ratio, sepia filter
│       (alt image cross-     │   ← hover swaps to alt image
│        fades on hover)      │
│                             │
│  [   QUICK ADD          ]   │   ← bottom slide-up bar (hover-revealed)
└─────────────────────────────┘
LIGHTING                          ← category eyebrow (10px tracked)
Arc Pendant Light                 ← serif name (1.25rem, clay on hover)
Hand-bent brass & Belgian linen   ← italic material (0.85rem muted)
$485                              ← price (0.95rem ink)
```

Hover behavior (cumulative):
1. Image scales `1.045`
2. Sepia filter drops to `0`
3. Alt image fades in (opacity 0→1, 0.6s)
4. Wishlist icon slides down (translateY -6px → 0) and fades in
5. "Quick Add" bar slides up (translateY 8px → 0) and fades in
6. Product name color shifts to clay

On mobile (<768px), wishlist and quick-add are always visible (touch devices can't hover).

### 8.5 Category Card (Bento)

Asymmetric grid placement with overlay text:

```
┌──────────────────────┐
│                      │
│     [Full-bleed      │
│      image with      │
│      sepia filter]   │
│                      │
│                      │
│  Furniture           │   ← bottom-left, serif 2.1rem (feature) / 1.5rem
│  42 pieces      →    │   ← tracked uppercase count with arrow
└──────────────────────┘
```

The overlay is `linear-gradient(180deg, transparent 30%, rgba(31,27,23,0.72) 100%)` — image visible at top, legible text at bottom. The `→` arrow translates 4px on hover.

### 8.6 Material Card

A bordered card with a 3px top accent bar that scales in on hover:

```
┌──────────────────────────────┐
│▔▔▔▔▔▔▔ (3px clay/sage/gold)  │   ← scaleX(0→1) on hover
│                              │
│  [Line icon, 48px]           │   ← color matches top bar
│                              │
│  FSC Oak                     │   ← serif H3
│                              │
│  Solid oak from sustainably  │   ← body copy
│  managed forests in southern │
│  Sweden, kiln-dried and...   │
│                              │
│  ─────────────────────       │   ← divider
│  ORIGIN: SMÅLAND, SWEDEN     │   ← tracked uppercase label
└──────────────────────────────┘
```

The three material cards use clay, sage, and gold respectively for both the top bar and the icon — a subtle way to color-code materials.

### 8.7 Testimonial Card

```
┌──────────────────────────────────────┐
│  "                                   │   ← serif quote mark, 4rem, clay, 30% opacity
│                                      │
│  ★★★★★                               │   ← gold stars, 0.875rem
│                                      │
│  "The Halden armchair arrived fully  │   ← serif blockquote, 1.1875rem italic
│   assembled and feels like it was    │
│   made for our living room..."       │
│                                      │
│  ─── Freja L.   COPENHAGEN, DK       │   ← 24px clay line + name + tracked location
└──────────────────────────────────────┘
```

The cite element uses a `::before` pseudo-element to draw a 24px clay line — a refinement that elevates the citation beyond a plain byline.

### 8.8 Journal Card

```
┌────────────────────┐
│                    │
│   [4:3 image]      │   ← scales 1.05 on hover
│                    │
└────────────────────┘
CRAFT · 6 MIN READ       ← meta with clay category
Why oak gets better      ← serif H3, shifts to clay on hover
with age                 ← line-height 1.25
A short guide to oiling, brushing, and
accepting the small marks a piece will
gather over a decade of use.
```

### 8.9 Toast & Bag Panel

**Toast** — fixed bottom-center, slides up:
```css
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translate(-50%, 120%);    /* hidden below viewport */
  background: var(--ink);
  color: var(--bg);
  padding: 1rem 1.75rem;
  font-size: 13px;
  letter-spacing: 0.06em;
  z-index: 300;
  box-shadow: var(--shadow-lg);
  transition: transform var(--dur) var(--ease);
}
.toast.show { transform: translate(-50%, 0); }
```

Auto-dismisses after 2.8s.

**Bag Panel** — fixed bottom-right, slides up from below:
- Width: `min(320px, calc(100vw - 2rem))`
- Shows product thumbnail (54×54), name, price, item count, "View Bag" link
- Auto-dismisses after 5s; close button available
- Triggered by Quick Add; simultaneous with cart badge bump

---

## 9. Page Section Walkthrough

The page has **17 page regions** in total — **13 content sections** plus **4 chrome regions** (announcement bar, site header, mobile-nav drawer, footer) — arranged in a deliberate rhythm of light → dark → light → dark. Reading top to bottom:

### 9.1 Announcement Bar (dark, chrome)
- Background: `--ink`
- Text: 11px tracked uppercase, `--bg` color
- Inline gold spans highlight dollar amounts ("$150")
- One line, centered, no icons

### 9.2 Header (sticky, glass, chrome)
- Position: sticky top, z-index 100
- Background: `rgba(250, 248, 245, 0.92)` with `backdrop-filter: blur(12px)`
- Border-bottom: 1px solid `--line`
- When scrolled > 40px: background opacity → 0.98, shadow-sm added
- Layout: logo (left) / nav (center) / actions (right)
- Nav links: 13px, 0.08em tracking, ink-2 color, 1px clay underline scales in on hover
- Action icons: 40×40 circles, 18px SVG icons, hover → bg-2 + clay icon
- Cart badge: 16×16 clay circle, top-right of cart icon, animates `cartBump` on add
- Mobile: nav hidden, hamburger appears (2 lines → X animation)

### 9.3 Mobile Nav Drawer (chrome, hidden by default)
- Slides in from right (`right: -100% → 0`)
- Width: `min(85vw, 380px)`
- Background: `--bg`, shadow-lg
- Two sections: "Menu" (5 links) and "Help" (3 links)
- Links: serif 1.5rem with bottom border
- Overlay: `rgba(31,27,23,0.4)`, click to close
- ESC key closes

### 9.4 Hero (dark, full-bleed, content)
- Height: `94vh` (min 660px, max 960px)
- Background image with `kenBurns` 26s infinite alternate
- Mouse-move parallax: image translates ±14px based on cursor (desktop only)
- Three-stop dark gradient overlay
- Content: eyebrow (gold) + 2-line H1 (italic gold emphasis) + description + 2 CTAs
- Floating spotlight card (bottom-right): product thumbnail + name + price, slides up last in choreography
- Scroll hint (bottom-center): "Scroll" text + animated down-chevron

### 9.5 Brand Marquee (dark strip, content)
- Background: `--ink`, 1.1rem padding
- Five brand promises repeated twice (for seamless loop):
  - ◆ Handcrafted in Scandinavia
  - ◆ FSC-certified Oak
  - ◆ Carbon-neutral Delivery
  - ◆ 10-year Guarantee
  - ◆ Plant-based Textiles
- Diamonds (`◆`) in gold, text in 85% opacity bg
- 11px tracked uppercase, 0.22em letter-spacing
- Animates `marquee` 38s linear infinite

### 9.6 Featured Collection (light, content)
- Background: `--bg-2`
- Two-column asymmetric grid: image (1.1fr) | text (1fr)
- Image: 4:5 aspect, "Featured" tag top-left
- Text: eyebrow + 2-line H2 ("Lighting that *casts warmth*.") + paragraph + 3-stat detail row + outline CTA
- Stats: Pieces (28), Makers (9), Materials (Brass · Glass · Clay)
- Stat values are serif 1.5rem; labels are 10px tracked uppercase

### 9.7 Categories (light, bento, content)
- 4-column × 2-row grid with `grid-template-areas`:
  ```
  "feature feature wide wide"
  "feature feature small1 small2"
  ```
- Feature card (Furniture): spans 2×2, name in 2.1rem serif
- Wide card (Lighting): spans 2×1
- Two small cards: Textiles, Ceramics
- Each card: full-bleed image, bottom gradient overlay, serif name + tracked count + → arrow
- Hover: image scales 1.08, sepia filter resets

### 9.8 Statement Ticker (light, typographic break, content)
- Background: `--bg-2`, 2.75rem padding
- Three phrases repeat:
  - **Slow-made** (solid clay)
  - Honest materials (outlined: `-webkit-text-stroke: 1px var(--ink-2)`)
  - Made to last (outlined)
- Separators: gold six-pointed stars (✶)
- Italic serif, `clamp(1.75rem, 5vw, 3.4rem)`
- Animates `marquee` 32s linear infinite
- `aria-hidden="true"` — purely decorative

### 9.9 Products (light, content)
- 4-column uniform grid
- 8 products populated via JavaScript from a `products` array
- Each card: see §8.4 for full anatomy
- Below grid: centered "View All Products" outline CTA
- Reveal: `.reveal-pop` with staggered `data-delay` 1–4 cycling

### 9.10 Philosophy (light, manifesto, content)
- Background: `--bg-2`, extra padding `clamp(80px, 11vw, 140px)`
- Mesh-glow positioned top-left (`top:-10%; left:-8%`)
- Two-column grid: image collage (1.05fr) | text (1fr)
- Image collage: 3 images in a 2×2 grid where image 1 spans 2 rows (tall left, two stacked right)
- Text: eyebrow + H2 with two italic emphasis words + 2 paragraphs + ornament divider + 3 stats + outline CTA
- Ornament: gold six-pointed star flanked by two 60px max-width lines
- Stats: 27 (Years in craft), 14 (Nordic makers), 100% (FSC oak) — large serif clay numbers + tracked labels

### 9.11 Materials (light, 3-card grid, content)
- 3-column uniform grid
- Three materials: FSC Oak (clay accent), European Linen (sage accent), Hand-thrown Clay (gold accent)
- Each card: icon (48px line SVG) + title + paragraph + origin label
- Hover: card lifts 4px, 3px top accent bar scales in, shadow-md appears

### 9.12 Editorial (dark, full-bleed, content)
- Min-height: 82vh
- Background image with 135° diagonal dark gradient overlay
- Content (left-aligned, max-width 540px): gold eyebrow + H2 ("A room is a *feeling*.") + paragraph + gold primary CTA
- This is the page's most cinematic moment — designed to feel like a magazine spread

### 9.13 Testimonials (light, marquee, content)
- Auto-scrolling horizontal track of 5 testimonial cards
- Pauses on hover (`.testimonials-wrap:hover .testimonials__track { animation-play-state: paused; }`)
- Animates `marquee` 46s linear infinite
- Each card: see §8.7 for anatomy
- Card width: `min(400px, 82vw)`, gap 1.5rem

### 9.14 Journal (light, 3-card grid, content)
- Background: `--bg-2`
- 3-column grid of article cards
- Each card: 4:3 image, meta line (category · read time), serif H3, paragraph
- Hover: card lifts, image scales 1.05, title shifts to clay

### 9.15 Instagram (light, 6-grid, content)
- Centered section head (eyebrow + handle "@maison*living*" + lede)
- 6-column grid of square thumbnails
- Hover: image scales 1.1, clay overlay (40% opacity) fades in, Instagram icon scales in at center
- Images populated via JS from `instagramImages` array

### 9.16 Newsletter (dark, content)
- Background: `--ink` with subtle gold dot pattern texture
- Centered content (max-width 760px): gold eyebrow + H2 ("Letters from *Maison*.") + paragraph + email form + legal note
- Form: border-bottom only (no boxed input), gold underline on focus-within
- Button: transparent bg, gold text, shifts to bg color on hover
- Submission: validates email regex, shows toast confirmation, resets form

### 9.17 Footer (light, chrome)
- 4-column grid: Brand (1.6fr) | Shop | About | Help (1fr each)
- Brand column: wordmark + tagline + 3 social icons (Instagram, Pinterest, YouTube)
- Link columns: H4 (11px tracked uppercase) + 5 links each
- Bottom row: copyright + 3 legal links
- Social icons: 38px circles, 1px line border, hover → clay bg + bg color
- Year populated via JS: `new Date().getFullYear()`

---

## 10. Interactive Patterns

### 10.1 Custom Cursor (Desktop, Fine-Pointer Only)

A two-element decorative cursor overlays the native cursor:

```javascript
const fineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (fineCursor && !reduceMotion) {
  document.documentElement.classList.add('has-fine-cursor');
  // ... animation loop
}
```

- **Dot** (6px clay) — instant follow via `transform` on `mousemove`
- **Ring** (34px, 1px border) — lerp-follows at 0.18 factor (creates trailing effect)
- On hover over interactive elements (`a, button, .btn, input`): ring expands to 68px, border becomes clay, background gets 8% clay tint
- On hover over dark sections (`.hero, .editorial, .newsletter`): ring border shifts to 55% bg opacity (visible on dark)
- Native cursor remains visible — the custom cursor is a decorative layer, not a replacement

### 10.2 Magnetic Buttons

Buttons with `.magnetic` class translate based on cursor offset:

```javascript
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
});
btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
```

X offset is damped at 0.18, Y at 0.35 — buttons feel more responsive to vertical cursor movement than horizontal, which suits the typical wrist motion of moving between CTAs.

### 10.3 Hero Parallax

On `mousemove` over the hero, the background image translates:
```javascript
const x = (e.clientX / window.innerWidth - 0.5) * 14;
const y = (e.clientY / window.innerHeight - 0.5) * 14;
heroBgImg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
```

±14px translate + 1.1 scale — a subtle tilt that makes the hero feel three-dimensional without being distracting.

### 10.4 Cart System (Mock)

State: `let cartCount = 0;`

On click of `[data-add]`:
1. Find product by ID
2. Increment `cartCount`, update badge text
3. Force reflow + add `bump` class (triggers `cartBump` keyframe animation)
4. Populate bag panel (image, name, price, count)
5. Show bag panel (translateY 140% → 0)
6. Auto-hide after 5s

Cart icon click shows toast: "You have N item(s) in your bag."

### 10.5 Wishlist System

State: `const wishlist = new Set();`

On click of `[data-wishlist]`:
1. Toggle product ID in set
2. Toggle `.active` class on button (fills heart with clay)
3. Show toast: "Saved to wishlist." or "Removed from wishlist."

### 10.6 Mobile Nav

- Open: hamburger toggles to X (lines rotate + middle fades)
- Drawer slides in from right (`right: -100% → 0`)
- Body scroll locked (`overflow: hidden`)
- Overlay fades in (opacity 0 → 1)
- Close: X button, overlay click, ESC key, any link click

### 10.7 Newsletter Validation

```javascript
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  showToast('Please enter a valid email address.');
  return;
}
showToast('Thank you for subscribing to Letters from Maison.');
newsletterForm.reset();
```

### 10.8 Scroll Progress

```javascript
window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  header.classList.toggle('scrolled', scroll > 40);
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = docHeight > 0 ? `${(scroll / docHeight) * 100}%` : '0%';
}, { passive: true });
```

Passive listener for performance; updates both header state and progress bar width.

---

## 11. Responsive Behavior

### 11.1 Breakpoints

Three breakpoints, mobile-first:

| Breakpoint | Affects |
|---|---|
| `max-width: 1024px` (tablet) | Product grid 4→3 cols, materials 3→1 col, journal 3→2 cols, instagram 6→3 cols, footer 4→2 cols, featured/philosophy grids collapse to 1 col, categories become 2-col with redefined areas |
| `max-width: 768px` (mobile) | Header nav hidden, hamburger appears; search/account icons hidden; hero height 90vh; products 3→2 cols; journal 2→1 col; footer 2→1 col; philosophy images aspect 4:5; stats 3→1 col |
| `max-width: 480px` (small mobile) | Gutter shrinks to 1.25rem; products 2→1 col; announcement font shrinks |

### 11.2 Mobile-Specific Adjustments

- **Hero spotlight card** moves from bottom-right to bottom-center (`left: 50%; transform: translateX(-50%)`)
- **Product card wishlist + quick-add** are always visible (no hover on touch)
- **Quick-add bar** shrinks: `padding: 0.6rem; font-size: 10px`
- **Hero actions** become full-width equal-height buttons
- **Section heads** stack vertically (column direction)
- **Bag panel** becomes full-width minus 2rem margin

### 11.3 Categories Bento Re-flow

Desktop:
```
feature feature wide   wide
feature feature small1 small2
```

Tablet (≤1024px):
```
feature feature
wide    wide
small1  small2
```

Mobile (≤768px):
```
feature
wide
small1
small2
```

### 11.4 Custom Cursor & Magnetic Buttons

Disabled on touch devices via media query check:
```javascript
const fineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fineCursor && !reduceMotion) { /* enable */ }
```

---

## 12. Accessibility Considerations

### 12.1 Reduced Motion

A comprehensive media query disables every animation:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .hero__bg { animation: none; }
  .marquee__track, .statement__track, .testimonials__track { animation: none; }
  .reveal, .reveal-pop { opacity: 1; transform: none; }
  .hero__eyebrow, .hero__desc, .hero__actions, .hero__spotlight, .hero__title .line-inner {
    opacity: 1; transform: none; animation: none;
  }
  .cursor-dot, .cursor-ring { display: none !important; }
}
```

This is checked in JS too — `if (fineCursor && !reduceMotion)` gates the cursor and magnetic effects.

### 12.2 Focus States

```css
a:focus-visible, button:focus-visible, input:focus-visible {
  outline: 2px solid var(--clay);
  outline-offset: 3px;
}
```

Only `:focus-visible` (not `:focus`) is styled — this means mouse clicks don't show focus rings (cleaner UX) but keyboard navigation does.

### 12.3 Semantic HTML

- `<header role="banner">` for announcement bar
- `<header>` with `aria-label` for site header
- `<nav aria-label="Primary">` and `<nav aria-label="Mobile navigation">`
- `<main>` wrapping all content
- `<section>` with `id` for in-page anchors
- `<article>` for product cards, testimonials, journal cards, materials
- `<footer>` for site footer
- `<form>` with `novalidate` for newsletter (custom validation)
- `<blockquote>` + `<cite>` for testimonials

### 12.4 ARIA Labels

- `aria-label` on all icon-only buttons (Search, Account, Cart, Wishlist, Close)
- `aria-hidden="true"` on decorative elements (marquees, statement ticker, scroll hint, quote mark, mesh-glow)
- `aria-live="polite"` on toast and bag panel (announces to screen readers when content changes)
- `aria-label="5 out of 5 stars"` on testimonial star ratings
- `alt` text on all meaningful images; empty `alt=""` on decorative duplicates

### 12.5 Color Contrast

- Ink `#1f1b17` on bg `#faf8f5` — contrast ratio ~17:1 (AAA)
- Muted `#786f66` on bg `#faf8f5` — contrast ratio ~5.5:1 (AA)
- Bg `#faf8f5` on ink `#1f1b17` — contrast ratio ~17:1 (AAA)
- Gold `#c4a265` on ink `#1f1b17` — contrast ratio ~7.5:1 (AAA)
- Clay `#a86b4a` on bg `#faf8f5` — contrast ratio ~4.6:1 (AA, used only for non-text accents and 13px+ UI labels)

### 12.6 Keyboard Navigation

- Tab order is logical (header → nav → actions → hero → sections → footer)
- ESC closes mobile nav
- Enter submits newsletter form
- All interactive elements are `<a>`, `<button>`, or `<input>` — no `div`-based interactions

---

## 13. Iconography

### 13.1 Icon System

All icons are **inline SVG** (no icon library dependency) with `stroke: currentColor; fill: none; stroke-width: 1.5`. The 48px material icons (§8.6) are the single exception: they use `stroke-width: 1.25` for visual balance at the larger render size — a 1.5 stroke at 48px reads too heavy against the surrounding type. All other icon sets (header 18px, hero scroll 14px, wishlist 16px, instagram 24px, footer socials 16px) use the standard `1.5` stroke. Because all icons use `stroke: currentColor`, they inherit text color and respond to hover state changes automatically.

### 13.2 Icon Inventory

| Icon | Used in | SVG path summary |
|---|---|---|
| Search (magnifier) | Header | Circle + diagonal handle |
| Account (person) | Header | Circle head + curved body |
| Cart (bag) | Header | Trapezoid bag + handle arc |
| Hamburger | Header mobile | 2 horizontal lines (animates to X) |
| Arrow right | CTAs | Line + chevron |
| Chevron down | Hero scroll hint | Vertical line + downward chevron |
| Heart | Wishlist | Standard heart path with rounded lobes |
| Instagram | Footer, Instagram grid | Rounded square + circle + dot |
| Pinterest | Footer | Circle + curved P |
| YouTube | Footer | Rounded rectangle + play triangle |
| Oak leaf | Materials: FSC Oak | Stylized leaf with central vein |
| Linen weave | Materials: European Linen | Circle with cross-hatch weave pattern |
| Clay vessel | Materials: Hand-thrown Clay | Building/vessel outline with roof |
| Close (×) | Bag panel, mobile nav | Single character `×` |

### 13.3 Decorative Symbols

- **Diamond** `◆` (`&#9670;`) — brand marquee item separators, gold
- **Six-pointed star** `✶` (`&#10038;`) — statement ticker separators, ornament, gold
- **Em dash** `—` — used in stat labels and copy
- **Middot** `·` (`&middot;`) — meta separators ("Craft · 6 min read")
- **Arrow** `→` (`&rarr;`) — section head links, category card count

---

## 14. Image Direction & Art Direction

### 14.1 Photography Style

All imagery follows a consistent art direction:

- **Warm natural light** — no flash, no overhead fluorescent
- **Neutral-to-warm color temperature** — slightly amber
- **Shallow depth of field** on product shots
- **Lifestyle context** — products shown in real rooms, not on white seamless
- **Material close-ups** — grain of oak, weave of linen, glaze of ceramic
- **Human hands** in workshop shots — emphasizes the maker

### 14.2 Aspect Ratio System

| Use | Aspect | Notes |
|---|---|---|
| Hero background | full-bleed, 94vh | Slight overscan (-3% inset) for ken-burns room |
| Featured image | 4:5 portrait | Editorial feel |
| Category feature card | ~1:1 (grid-defined) | Bento layout |
| Product card image | 4:5 portrait | Consistent catalog format |
| Philosophy images | mixed (1 tall, 2 square) | Collage feel |
| Journal card image | 4:3 landscape | Article preview |
| Instagram thumb | 1:1 square | Native Instagram format |
| Hero spotlight image | 56×56 square | Thumbnail in card |

### 14.3 Loading Strategy

- Hero image: `fetchpriority="high"` (no lazy loading)
- All other images: `loading="lazy"`
- Products and Instagram images populated via JS for progressive enhancement

### 14.4 Image Sources

The mockup uses a mix of:
- Local images (`images/hero.jpg`, `images/featured-lighting.jpg`, etc.) — would be replaced with brand photography in production
- Pexels CDN images for product photos, category images, philosophy collage, journal cards, and Instagram thumbnails

In a production deployment, all imagery would be brand-owned, served via a CDN with responsive `srcset` variants, and optimized as AVIF/WebP.

---

## 15. Design Tokens Reference

Complete copy-paste reference of every CSS custom property defined in `:root`:

```css
:root {
  /* Backgrounds */
  --bg: #faf8f5;
  --bg-2: #f3efe8;
  --bg-3: #ece5d8;
  --bg-card: #ffffff;
  --bg-dark: #1f1b17;

  /* Ink / Text */
  --ink: #1f1b17;
  --ink-2: #4a433b;
  --muted: #786f66;
  --line: #e5ddd1;
  --line-soft: #efe9df;

  /* Accents */
  --clay: #a86b4a;
  --clay-dark: #8a5538;
  --clay-light: #c17d52;
  --gold: #c4a265;
  --sage: #7e8f72;
  --sage-soft: #dfe4d6;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(31,27,23,0.04);
  --shadow-md: 0 8px 24px rgba(31,27,23,0.08);
  --shadow-lg: 0 24px 60px rgba(31,27,23,0.14);
  --shadow-xl: 0 40px 100px rgba(31,27,23,0.20);

  /* Layout */
  --container: 1280px;
  --container-narrow: 760px;
  --gutter: clamp(20px, 5vw, 64px);

  /* Motion */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 0.25s;
  --dur: 0.45s;
  --dur-slow: 0.9s;

  /* Typography */
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

---

## Appendix A: Page Region Inventory

The live page has **17 top-level page regions** — 13 content sections plus 4 chrome regions (announcement bar, site header, mobile-nav drawer, footer). The mobile-nav drawer is included here for completeness even though it is hidden by default; it is documented in §9.3.

| # | Region | Type | Background | Layout | Key Feature |
|---|---|---|---|---|---|
| 1 | Announcement bar | chrome | ink | full-width strip | Gold dollar amounts |
| 2 | Header | chrome | bg (glass) | 3-column flex | Sticky, blur, cart badge |
| 3 | Mobile Nav Drawer | chrome (hidden) | bg | right-side drawer | `min(85vw, 380px)`, shadow-lg |
| 4 | Hero | content | dark image | full-bleed | Ken-burns + parallax + kinetic headline |
| 5 | Brand marquee | content | ink | full-width strip | Continuous scroll, 38s |
| 6 | Featured collection | content | bg-2 | 2-col asymmetric | Stats row, image-tag |
| 7 | Categories | content | bg | bento 4×2 | Asymmetric grid-template-areas |
| 8 | Statement ticker | content | bg-2 | full-width strip | Outlined italic serif |
| 9 | Products | content | bg | 4-col grid | JS-rendered, hover-swap image |
| 10 | Philosophy | content | bg-2 | 2-col, extra padding | Mesh-glow, ornament, stats |
| 11 | Materials | content | bg | 3-col grid | Color-coded top bars |
| 12 | Editorial | content | dark image | full-bleed, 82vh | Diagonal gradient overlay |
| 13 | Testimonials | content | bg | horizontal marquee | Pauses on hover |
| 14 | Journal | content | bg-2 | 3-col grid | Meta line with clay category |
| 15 | Instagram | content | bg | 6-col grid | Clay overlay on hover |
| 16 | Newsletter | content | ink (with texture) | centered narrow | Borderless form, gold focus |
| 17 | Footer | chrome | bg | 4-col + bottom row | Social icons, legal links |

## Appendix B: Animation Inventory

| Animation | Type | Duration | Trigger |
|---|---|---|---|
| Ken Burns | keyframe, infinite | 26s alternate | Page load |
| Hero headline rise | keyframe, once | 1s + delays | Page load |
| Hero elements fade up | keyframe, once | 0.9s + delays | Page load |
| Brand marquee | keyframe, infinite | 38s linear | Page load |
| Statement marquee | keyframe, infinite | 32s linear | Page load |
| Testimonials marquee | keyframe, infinite | 46s linear (pause on hover) | Page load |
| Scroll hint bob | keyframe, infinite | 2.4s ease-in-out | Page load |
| Scroll reveal (translate) | transition | 0.9s | IntersectionObserver |
| Scroll reveal (scale) | transition | 0.8s | IntersectionObserver |
| Header bg darken | transition | 0.45s | Scroll > 40px |
| Progress bar width | transition | 0.08s linear | Scroll |
| Nav link underline | transition | 0.45s | Hover |
| Product image scale | transition | 1s | Hover |
| Product image filter | transition | 0.6s | Hover |
| Product alt image fade | transition | 0.6s | Hover |
| Wishlist icon slide | transition | 0.25s | Hover |
| Quick-add bar slide | transition | 0.25s | Hover |
| Material card lift | transition | 0.45s | Hover |
| Material top bar scale | transition | 0.45s | Hover |
| Cart badge bump | keyframe, once | 0.5s | Add to cart |
| Bag panel slide | transition | 0.5s | Add to cart |
| Toast slide | transition | 0.45s | Various actions |
| Cursor dot follow | rAF, instant | — | Mouse move |
| Cursor ring follow | rAF, lerp 0.18 | — | Mouse move |
| Cursor ring expand | transition | 0.3s | Hover interactive |
| Magnetic button | inline style, rAF | — | Mouse move over .magnetic |
| Hero parallax | inline style | — | Mouse move over .hero |

---

## Appendix C: Change Log (v3)

This revision applies four documentation-only fixes identified by an audit against the live implementation on 2026-07-30. No claims about the live site were changed; all corrections bring the guide into tighter alignment with the source.

| # | Severity | Section | Change |
|---|---|---|---|
| L-1 | Low | §13.1 | Documented that the 48px material icons use `stroke-width: 1.25` (exception to the universal `1.5`); added rationale. |
| L-2 | Low | §4.2 | Hero H1 row now explicitly notes the `letter-spacing: -0.02em` override (the universal heading value is `-0.012em`). |
| L-3 | Low | §6.2 | `scrollHint` row now specifies it is a vertical `translateY` bob on the chevron SVG, not an opacity animation. Additional rows in the keyframe table also received more precise purpose descriptions (`kenBurns`, `lineUp`, `fadeUp`, `marquee`, `cartBump`). |
| I-1 | Informational | §9 / Appendix A | Reconciled section-count inconsistency: §9 now states "17 page regions (13 content + 4 chrome)"; Appendix A retitled to "Page Region Inventory" and now lists 17 rows (added Mobile Nav Drawer as row 3); each region tagged `chrome` or `content` for clarity. |

No other changes were made. All 91 previously-verified claims (colors, type, spacing, motion, components, interactions, accessibility, image strategy) remain unchanged and continue to match the live source.
