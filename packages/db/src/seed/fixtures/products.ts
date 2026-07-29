/**
 * Maison — Seed fixtures: 20 products (13 original + 7 UAT additions)
 *
 * Matches the products rendered in docs/landing_page_unified.html
 * and documented in docs/MAISON_PRD_v1.2.md §15.2.
 * Images use Pexels URLs (borrowed from reference mockup for UAT).
 */

import type { NewProduct } from '../../schema';

export const seedProducts: NewProduct[] = [
  {
    slug: 'arc-pendant-light',
    name: 'Arc Pendant Light',
    collectionId: undefined, // resolved at seed time via slug lookup
    priceCents: 48500,
    currency: 'USD',
    shortDescription: 'A graceful arc of hand-bent brass and linen.',
    longDescription:
      'The Arc Pendant Light is a study in restraint — a single hand-bent brass arc suspended from a natural Belgian linen cord. The shade diffuses light softly, casting warmth downward without glare. Each piece is bent by hand at our Aalborg workshop, so no two arcs are identical.',
    materials: 'Solid brass, natural Belgian linen',
    dimensions: 'H 32cm × W 42cm × D 42cm',
    weightGrams: 2200,
    featured: true,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'orb-table-lamp',
    name: 'Orb Table Lamp',
    priceCents: 29500,
    shortDescription: 'Mouth-blown glass meets sculptural bronze.',
    longDescription:
      'The Orb Table Lamp pairs a mouth-blown opal glass orb with a solid bronze base. The glass is blown by a third-generation glassblower in Småland; the bronze is cast and hand-finished in Gothenburg. The result is a lamp that feels both ancient and modern.',
    materials: 'Mouth-blown glass, solid bronze',
    dimensions: 'H 38cm × W 22cm',
    weightGrams: 3100,
    featured: false,
    isNew: true,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'berg-floor-lamp',
    name: 'Berg Floor Lamp',
    priceCents: 62000,
    shortDescription: 'Aged brass and rice paper — a quiet sentinel.',
    longDescription:
      "The Berg Floor Lamp stands at 1.6 metres, its aged brass stem anchored by a hand-folded rice paper shade. The paper softens the bulb's light into a warm, diffuse glow that fills a corner without dominating it. Designed to age gracefully — the brass deepens, the paper yellows slightly, and the lamp becomes more itself over time.",
    materials: 'Aged brass, rice paper shade',
    dimensions: 'H 160cm × W 35cm',
    weightGrams: 5400,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'large-sculptural-vessel',
    name: 'Large Sculptural Vessel',
    priceCents: 32000,
    shortDescription: 'Hand-thrown stoneware with natural ash glaze.',
    longDescription:
      "A large sculptural vessel thrown on the wheel by ceramicist Lars Berg in Gothenburg. The natural ash glaze is created from wood-fired kiln ash — each firing produces a unique palette of greys, greens, and ambers. No two vessels are alike. The maker's mark is pressed into the base.",
    materials: 'High-fire stoneware, natural ash glaze',
    dimensions: 'H 48cm × W 28cm',
    weightGrams: 4200,
    featured: true,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'everyday-serving-bowl',
    name: 'Everyday Serving Bowl',
    priceCents: 14500,
    shortDescription: 'Simple forms for daily rituals.',
    longDescription:
      "The Everyday Serving Bowl is exactly that — a bowl you'll reach for every day. Thrown in two weights (individual and family), the stoneware is finished with a food-safe matte glaze that resists staining and develops a soft patina with use. Dishwasher and microwave safe.",
    materials: 'Stoneware, food-safe glaze',
    dimensions: 'H 9cm × W 20cm',
    weightGrams: 800,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'harvest-dining-table',
    name: 'Harvest Dining Table',
    priceCents: 285000,
    shortDescription: 'Solid white oak, natural oil finish — built for generations.',
    longDescription:
      'The Harvest Dining Table is made from a single slab of FSC-certified white oak, finished with raw linseed oil that deepens the grain and protects the surface. The trestle base is joined with traditional mortise-and-tenon joints — no metal fasteners. Seats 8 comfortably. Made to order, 8–10 week lead time.',
    materials: 'Solid white oak, natural oil finish',
    dimensions: 'L 240cm × W 95cm × H 75cm',
    weightGrams: 85000,
    featured: true,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'halden-linen-armchair',
    name: 'Halden Linen Armchair',
    priceCents: 89000,
    shortDescription: "Solid oak frame, washed linen — the chair you'll keep for decades.",
    longDescription:
      'The Halden Armchair is the piece that started Maison. Founder Mette Sørensen designed it in 1998 for her own living room: a solid oak frame, hand-tied springs, and washed Belgian linen. Twenty-seven years later, it remains our bestseller — and the chair softens beautifully with use, gathering the small marks of a life lived around it.',
    materials: 'Solid oak, washed Belgian linen (sand)',
    dimensions: 'W 78cm × D 82cm × H 74cm',
    weightGrams: 14000,
    featured: false,
    isNew: false,
    isBestseller: true,
    isActive: true,
  },
  {
    slug: 'solside-oak-table',
    name: 'SolSide Oak Table',
    priceCents: 54000,
    shortDescription: 'Solid FSC oak side table, linseed finish.',
    longDescription:
      "A compact side table for the chair that needs a home. Solid FSC oak with a linseed oil finish that's easy to refresh at home. The through-tenon joinery is visible — a deliberate detail that celebrates the maker's craft.",
    materials: 'Solid FSC oak, linseed finish',
    dimensions: 'W 45cm × D 45cm × H 52cm',
    weightGrams: 6200,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'washed-linen-throw',
    name: 'Washed Linen Throw',
    priceCents: 19500,
    shortDescription: '100% washed European linen — softens with every wash.',
    longDescription:
      'A heavy-weight linen throw, woven in Belgium from flax grown in Normandy. Pre-washed for immediate softness; continues to soften with each wash. The sand tone pairs with any interior. Generously sized for sofa or bed.',
    materials: '100% washed European linen, sand tone',
    dimensions: '130cm × 180cm',
    weightGrams: 900,
    featured: false,
    isNew: false,
    isBestseller: true,
    isActive: true,
  },
  {
    slug: 'hand-felted-wool-cushion',
    name: 'Hand-Felted Wool Cushion',
    priceCents: 16500,
    shortDescription: 'New Zealand wool, linen back — tactile and warm.',
    longDescription:
      'A cushion cover hand-felted from New Zealand wool, backed with Belgian linen. The felt has a natural irregularity that signals a human hand. Insert not included (we recommend a 50cm down insert).',
    materials: '100% New Zealand wool, linen back',
    dimensions: '50cm × 50cm',
    weightGrams: 600,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'sculptural-bud-vase',
    name: 'Sculptural Bud Vase',
    priceCents: 8500,
    shortDescription: 'Stoneware, matte white glaze — for a single stem.',
    longDescription:
      'A small bud vase for a single stem — a quiet still-life on a windowsill or shelf. The matte white glaze has a soft, almost chalky texture that catches light beautifully. Each vase is wheel-thrown, so dimensions vary slightly.',
    materials: 'Stoneware, matte white glaze',
    dimensions: 'H 18cm × W 8cm',
    weightGrams: 400,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'winter-hearth-candle',
    name: 'Winter Hearth Candle',
    priceCents: 6500,
    shortDescription: 'Soy wax, cotton wick, stoneware vessel — seasonal.',
    longDescription:
      'A seasonal candle with notes of cedar, smoke, and beeswax. Poured in small batches into a reusable stoneware vessel (hand-thrown — when the candle is done, the vessel becomes a small cup). Cotton wick, natural soy wax, 50-hour burn time.',
    materials: 'Soy wax, cotton wick, stoneware vessel',
    dimensions: 'H 8cm × W 8cm',
    weightGrams: 350,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'curated-gift-box',
    name: 'Curated Gift Box',
    priceCents: 22500,
    shortDescription: 'Stoneware, soy candle, linen, wooden box — ready to give.',
    longDescription:
      'A thoughtfully curated gift box: a hand-thrown stoneware bud vase, a Winter Hearth candle, a sand-toned linen coaster, and a small oak wedge — all nested in a reusable pine box tied with linen twine. Includes a handwritten note (add your message at checkout).',
    materials: 'Stoneware, soy candle, linen, wooden box',
    dimensions: 'Box: 30cm × 20cm × 12cm',
    weightGrams: 1800,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  // ── UAT additions (7 products for broader test coverage) ──────────
  {
    slug: 'linen-bed-throw-stripe',
    name: 'Striped Linen Bed Throw',
    collectionId: undefined,
    priceCents: 24500,
    currency: 'USD',
    shortDescription: 'Oversized stonewashed linen throw with woven stripes.',
    longDescription:
      'An oversized, stonewashed European linen throw with a subtle woven stripe pattern. Perfect for draping across the foot of a bed or over a reading armchair. The linen softens with every wash, developing a lived-in quality that only improves with age.',
    materials: '100% stonewashed European linen',
    dimensions: '140cm × 200cm',
    weightGrams: 850,
    featured: false,
    isNew: true,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'oak-wall-shelf',
    name: 'Floating Oak Wall Shelf',
    collectionId: undefined,
    priceCents: 18500,
    currency: 'USD',
    shortDescription: 'Minimalist floating shelf in solid FSC oak.',
    longDescription:
      'A clean, floating wall shelf in solid FSC-certified oak with a hidden bracket system. The shelf appears to hover against the wall — no visible hardware. Finished with raw linseed oil to preserve the natural grain. Holds up to 15kg evenly distributed.',
    materials: 'Solid FSC oak, steel bracket (hidden)',
    dimensions: 'L 60cm × D 22cm × H 3cm',
    weightGrams: 1800,
    featured: false,
    isNew: true,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'ceramic-dinner-plates-set',
    name: 'Stoneware Dinner Plates (Set of 4)',
    collectionId: undefined,
    priceCents: 16500,
    currency: 'USD',
    shortDescription: 'Set of 4 hand-thrown stoneware dinner plates.',
    longDescription:
      'A set of four hand-thrown stoneware dinner plates, each slightly unique in its rim profile and glaze pooling. The matte ash glaze reveals the warmth of the clay beneath. Dishwasher and microwave safe. Made in our Gothenburg ceramics studio.',
    materials: 'High-fire stoneware, ash glaze',
    dimensions: 'Ø 26cm × H 2.5cm (each)',
    weightGrams: 1200,
    featured: false,
    isNew: false,
    isBestseller: true,
    isActive: true,
  },
  {
    slug: 'brass-candle-holder',
    name: 'Solid Brass Candle Holder',
    collectionId: undefined,
    priceCents: 7500,
    currency: 'USD',
    shortDescription: 'Minimalist solid brass candle holder for taper candles.',
    longDescription:
      'A weighted, solid brass candle holder with a softly brushed finish. Designed for standard taper candles. The brass develops a natural patina over time — embrace the aging or polish to restore the original lustre. Felt base protects surfaces.',
    materials: 'Solid brass, brushed finish',
    dimensions: 'Ø 8cm × H 10cm',
    weightGrams: 480,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'wool-floor-cushion',
    name: 'Hand-Felted Wool Floor Cushion',
    collectionId: undefined,
    priceCents: 19500,
    currency: 'USD',
    shortDescription: 'Spacious floor cushion in hand-felted New Zealand wool.',
    longDescription:
      'A generously sized floor cushion hand-felted from 100% New Zealand wool. The natural lanolin makes it naturally stain-resistant. The cover is removable for dry cleaning. Perfect for casual seating, meditation, or as a footrest. Available in sand and charcoal.',
    materials: '100% New Zealand wool, cotton lining',
    dimensions: '65cm × 65cm × 15cm',
    weightGrams: 2200,
    featured: false,
    isNew: true,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'oak-cutting-board',
    name: 'Oak Cutting Board with Handle',
    collectionId: undefined,
    priceCents: 9500,
    currency: 'USD',
    shortDescription: 'Solid oak cutting board with cutout handle.',
    longDescription:
      'A solid FSC oak cutting board with a practical cutout handle for hanging or carrying. Finished with food-safe linseed oil. The end-grain surface is gentle on knives and self-heals with use. Each board is unique in its grain pattern.',
    materials: 'Solid FSC oak, food-safe linseed oil finish',
    dimensions: 'L 42cm × W 24cm × H 2cm',
    weightGrams: 900,
    featured: false,
    isNew: false,
    isBestseller: false,
    isActive: true,
  },
  {
    slug: 'linen-apron',
    name: 'Washed Linen Apron',
    collectionId: undefined,
    priceCents: 6500,
    currency: 'USD',
    shortDescription: 'Full-length linen apron with adjustable straps.',
    longDescription:
      'A full-length apron in stonewashed European linen with adjustable neck and waist straps. Two front pockets. The linen softens with each wash. Made for daily use in the kitchen, studio, or workshop. Unisex sizing.',
    materials: '100% washed European linen',
    dimensions: 'One size (adjustable)',
    weightGrams: 350,
    featured: false,
    isNew: true,
    isBestseller: false,
    isActive: true,
  },
];

/**
 * Map of product slug → collection slug (for resolving collectionId at seed time).
 */
export const productCollectionMap: Record<string, string> = {
  'arc-pendant-light': 'lighting',
  'orb-table-lamp': 'lighting',
  'berg-floor-lamp': 'lighting',
  'large-sculptural-vessel': 'ceramics',
  'everyday-serving-bowl': 'ceramics',
  'harvest-dining-table': 'furniture',
  'halden-linen-armchair': 'furniture',
  'solside-oak-table': 'furniture',
  'washed-linen-throw': 'textiles',
  'hand-felted-wool-cushion': 'textiles',
  'sculptural-bud-vase': 'objects',
  'winter-hearth-candle': 'seasonal',
  'curated-gift-box': 'gifts',
  // UAT additions
  'linen-bed-throw-stripe': 'textiles',
  'oak-wall-shelf': 'furniture',
  'ceramic-dinner-plates-set': 'ceramics',
  'brass-candle-holder': 'objects',
  'wool-floor-cushion': 'textiles',
  'oak-cutting-board': 'objects',
  'linen-apron': 'textiles',
};

/**
 * Map of product slug → image URLs (primary + alternate for hover-swap).
 */
export const productImagesMap: Record<string, string[]> = {
  'arc-pendant-light': [
    'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'orb-table-lamp': [
    'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'berg-floor-lamp': [
    'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'large-sculptural-vessel': [
    'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/5754097/pexels-photo-5754097.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'everyday-serving-bowl': [
    'https://images.pexels.com/photos/13712877/pexels-photo-13712877.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'harvest-dining-table': [
    'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'halden-linen-armchair': [
    'https://images.pexels.com/photos/2082090/pexels-photo-2082090.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/23471276/pexels-photo-23471276.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'solside-oak-table': [
    'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/22743854/pexels-photo-22743854.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'washed-linen-throw': [
    'https://images.pexels.com/photos/31034512/pexels-photo-31034512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/31034508/pexels-photo-31034508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'hand-felted-wool-cushion': [
    'https://images.pexels.com/photos/31034508/pexels-photo-31034508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/31034512/pexels-photo-31034512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'sculptural-bud-vase': [
    'https://images.pexels.com/photos/5754116/pexels-photo-5754116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'winter-hearth-candle': [
    'https://images.pexels.com/photos/8311558/pexels-photo-8311558.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/5754116/pexels-photo-5754116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'curated-gift-box': [
    'https://images.pexels.com/photos/36299919/pexels-photo-36299919.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/5754116/pexels-photo-5754116.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  // UAT additions
  'linen-bed-throw-stripe': [
    'https://images.pexels.com/photos/31034512/pexels-photo-31034512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/31034508/pexels-photo-31034508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'oak-wall-shelf': [
    'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/22743854/pexels-photo-22743854.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'ceramic-dinner-plates-set': [
    'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/5754097/pexels-photo-5754097.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'brass-candle-holder': [
    'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/13712877/pexels-photo-13712877.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'wool-floor-cushion': [
    'https://images.pexels.com/photos/31034508/pexels-photo-31034508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/31034512/pexels-photo-31034512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
  'oak-cutting-board': [
    'https://images.pexels.com/photos/22743854/pexels-photo-22743854.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
    'https://images.pexels.com/photos/29559667/pexels-photo-29559667.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600',
  ],
  'linen-apron': [
    'https://images.pexels.com/photos/31034512/pexels-photo-31034512.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
    'https://images.pexels.com/photos/4053188/pexels-photo-4053188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=600',
  ],
};
