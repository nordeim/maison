/**
 * Maison — Seed fixtures: 13 products
 *
 * Matches the products rendered in docs/landing_page_unified.html
 * and documented in docs/PRD_unified.md §15.2.
 * Images use Unsplash URLs (same as the landing page mockup).
 */

import type { NewProduct } from "../../schema";

export const seedProducts: NewProduct[] = [
  {
    slug: "arc-pendant-light",
    name: "Arc Pendant Light",
    collectionId: undefined, // resolved at seed time via slug lookup
    priceCents: 48500,
    currency: "USD",
    shortDescription: "A graceful arc of hand-bent brass and linen.",
    longDescription:
      "The Arc Pendant Light is a study in restraint — a single hand-bent brass arc suspended from a natural Belgian linen cord. The shade diffuses light softly, casting warmth downward without glare. Each piece is bent by hand at our Aalborg workshop, so no two arcs are identical.",
    materials: "Solid brass, natural Belgian linen",
    dimensions: "H 32cm × W 42cm × D 42cm",
    weightGrams: 2200,
    featured: true,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "orb-table-lamp",
    name: "Orb Table Lamp",
    priceCents: 29500,
    shortDescription: "Mouth-blown glass meets sculptural bronze.",
    longDescription:
      "The Orb Table Lamp pairs a mouth-blown opal glass orb with a solid bronze base. The glass is blown by a third-generation glassblower in Småland; the bronze is cast and hand-finished in Gothenburg. The result is a lamp that feels both ancient and modern.",
    materials: "Mouth-blown glass, solid bronze",
    dimensions: "H 38cm × W 22cm",
    weightGrams: 3100,
    featured: false,
    isNew: true,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "berg-floor-lamp",
    name: "Berg Floor Lamp",
    priceCents: 62000,
    shortDescription: "Aged brass and rice paper — a quiet sentinel.",
    longDescription:
      "The Berg Floor Lamp stands at 1.6 metres, its aged brass stem anchored by a hand-folded rice paper shade. The paper softens the bulb's light into a warm, diffuse glow that fills a corner without dominating it. Designed to age gracefully — the brass deepens, the paper yellows slightly, and the lamp becomes more itself over time.",
    materials: "Aged brass, rice paper shade",
    dimensions: "H 160cm × W 35cm",
    weightGrams: 5400,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "large-sculptural-vessel",
    name: "Large Sculptural Vessel",
    priceCents: 32000,
    shortDescription: "Hand-thrown stoneware with natural ash glaze.",
    longDescription:
      "A large sculptural vessel thrown on the wheel by ceramicist Lars Berg in Gothenburg. The natural ash glaze is created from wood-fired kiln ash — each firing produces a unique palette of greys, greens, and ambers. No two vessels are alike. The maker's mark is pressed into the base.",
    materials: "High-fire stoneware, natural ash glaze",
    dimensions: "H 48cm × W 28cm",
    weightGrams: 4200,
    featured: true,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "everyday-serving-bowl",
    name: "Everyday Serving Bowl",
    priceCents: 14500,
    shortDescription: "Simple forms for daily rituals.",
    longDescription:
      "The Everyday Serving Bowl is exactly that — a bowl you'll reach for every day. Thrown in two weights (individual and family), the stoneware is finished with a food-safe matte glaze that resists staining and develops a soft patina with use. Dishwasher and microwave safe.",
    materials: "Stoneware, food-safe glaze",
    dimensions: "H 9cm × W 20cm",
    weightGrams: 800,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "harvest-dining-table",
    name: "Harvest Dining Table",
    priceCents: 285000,
    shortDescription: "Solid white oak, natural oil finish — built for generations.",
    longDescription:
      "The Harvest Dining Table is made from a single slab of FSC-certified white oak, finished with raw linseed oil that deepens the grain and protects the surface. The trestle base is joined with traditional mortise-and-tenon joints — no metal fasteners. Seats 8 comfortably. Made to order, 8–10 week lead time.",
    materials: "Solid white oak, natural oil finish",
    dimensions: "L 240cm × W 95cm × H 75cm",
    weightGrams: 85000,
    featured: true,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "halden-linen-armchair",
    name: "Halden Linen Armchair",
    priceCents: 89000,
    shortDescription: "Solid oak frame, washed linen — the chair you'll keep for decades.",
    longDescription:
      "The Halden Armchair is the piece that started Maison. Founder Mette Sørensen designed it in 1998 for her own living room: a solid oak frame, hand-tied springs, and washed Belgian linen. Twenty-seven years later, it remains our bestseller — and the chair softens beautifully with use, gathering the small marks of a life lived around it.",
    materials: "Solid oak, washed Belgian linen (sand)",
    dimensions: "W 78cm × D 82cm × H 74cm",
    weightGrams: 14000,
    featured: false,
    isNew: false,
    isBestseller: true,
    isActive: true,
  },
  {
    slug: "solside-oak-table",
    name: "SolSide Oak Table",
    priceCents: 54000,
    shortDescription: "Solid FSC oak side table, linseed finish.",
    longDescription:
      "A compact side table for the chair that needs a home. Solid FSC oak with a linseed oil finish that's easy to refresh at home. The through-tenon joinery is visible — a deliberate detail that celebrates the maker's craft.",
    materials: "Solid FSC oak, linseed finish",
    dimensions: "W 45cm × D 45cm × H 52cm",
    weightGrams: 6200,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "washed-linen-throw",
    name: "Washed Linen Throw",
    priceCents: 19500,
    shortDescription: "100% washed European linen — softens with every wash.",
    longDescription:
      "A heavy-weight linen throw, woven in Belgium from flax grown in Normandy. Pre-washed for immediate softness; continues to soften with each wash. The sand tone pairs with any interior. Generously sized for sofa or bed.",
    materials: "100% washed European linen, sand tone",
    dimensions: "130cm × 180cm",
    weightGrams: 900,
    featured: false,
    isNew: false,
    isBestseller: true,
    isActive: true,
  },
  {
    slug: "hand-felted-wool-cushion",
    name: "Hand-Felted Wool Cushion",
    priceCents: 16500,
    shortDescription: "New Zealand wool, linen back — tactile and warm.",
    longDescription:
      "A cushion cover hand-felted from New Zealand wool, backed with Belgian linen. The felt has a natural irregularity that signals a human hand. Insert not included (we recommend a 50cm down insert).",
    materials: "100% New Zealand wool, linen back",
    dimensions: "50cm × 50cm",
    weightGrams: 600,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "sculptural-bud-vase",
    name: "Sculptural Bud Vase",
    priceCents: 8500,
    shortDescription: "Stoneware, matte white glaze — for a single stem.",
    longDescription:
      "A small bud vase for a single stem — a quiet still-life on a windowsill or shelf. The matte white glaze has a soft, almost chalky texture that catches light beautifully. Each vase is wheel-thrown, so dimensions vary slightly.",
    materials: "Stoneware, matte white glaze",
    dimensions: "H 18cm × W 8cm",
    weightGrams: 400,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "winter-hearth-candle",
    name: "Winter Hearth Candle",
    priceCents: 6500,
    shortDescription: "Soy wax, cotton wick, stoneware vessel — seasonal.",
    longDescription:
      "A seasonal candle with notes of cedar, smoke, and beeswax. Poured in small batches into a reusable stoneware vessel (hand-thrown — when the candle is done, the vessel becomes a small cup). Cotton wick, natural soy wax, 50-hour burn time.",
    materials: "Soy wax, cotton wick, stoneware vessel",
    dimensions: "H 8cm × W 8cm",
    weightGrams: 350,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: "curated-gift-box",
    name: "Curated Gift Box",
    priceCents: 22500,
    shortDescription: "Stoneware, soy candle, linen, wooden box — ready to give.",
    longDescription:
      "A thoughtfully curated gift box: a hand-thrown stoneware bud vase, a Winter Hearth candle, a sand-toned linen coaster, and a small oak wedge — all nested in a reusable pine box tied with linen twine. Includes a handwritten note (add your message at checkout).",
    materials: "Stoneware, soy candle, linen, wooden box",
    dimensions: "Box: 30cm × 20cm × 12cm",
    weightGrams: 1800,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
];

/**
 * Map of product slug → collection slug (for resolving collectionId at seed time).
 */
export const productCollectionMap: Record<string, string> = {
  "arc-pendant-light": "lighting",
  "orb-table-lamp": "lighting",
  "berg-floor-lamp": "lighting",
  "large-sculptural-vessel": "ceramics",
  "everyday-serving-bowl": "ceramics",
  "harvest-dining-table": "furniture",
  "halden-linen-armchair": "furniture",
  "solside-oak-table": "furniture",
  "washed-linen-throw": "textiles",
  "hand-felted-wool-cushion": "textiles",
  "sculptural-bud-vase": "objects",
  "winter-hearth-candle": "seasonal",
  "curated-gift-box": "gifts",
};

/**
 * Map of product slug → image URLs (primary + alternate for hover-swap).
 */
export const productImagesMap: Record<string, string[]> = {
  "arc-pendant-light": [
    "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80",
    "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&q=80",
  ],
  "orb-table-lamp": [
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
  ],
  "berg-floor-lamp": [
    "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&q=80",
    "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80",
  ],
  "large-sculptural-vessel": [
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80",
  ],
  "everyday-serving-bowl": [
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80",
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
  ],
  "harvest-dining-table": [
    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  ],
  "halden-linen-armchair": [
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80",
  ],
  "solside-oak-table": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80",
  ],
  "washed-linen-throw": [
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
  ],
  "hand-felted-wool-cushion": [
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80",
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
  ],
  "sculptural-bud-vase": [
    "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80",
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80",
  ],
  "winter-hearth-candle": [
    "https://images.unsplash.com/photo-1602028923579-99e1f9d8d4f0?w=600&q=80",
    "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80",
  ],
  "curated-gift-box": [
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&q=80",
    "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&q=80",
  ],
};
