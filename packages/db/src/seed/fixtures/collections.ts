/**
 * Maison — Seed fixtures: 8 collections
 *
 * Matches the collections rendered in docs/landing_page_unified.html
 * and documented in docs/PRD_unified.md §15.1.
 */

import type { NewCollection } from '../../schema';

export const seedCollections: NewCollection[] = [
  {
    slug: 'lighting',
    name: 'Lighting',
    description: 'Sculptural forms that cast warmth and shadow.',
    sortOrder: 0,
    isActive: true,
    seoTitle: 'Lighting — Sculptural Forms that Cast Warmth | Maison',
    seoDescription:
      'Handcrafted pendant lights, table lamps, and floor lights — mouth-blown, hand-bent, and wheel-thrown by Nordic makers.',
  },
  {
    slug: 'ceramics',
    name: 'Ceramics',
    description: 'Handcrafted vessels shaped by patient hands.',
    sortOrder: 1,
    isActive: true,
    seoTitle: 'Ceramics — Hand-thrown Stoneware Vessels | Maison',
    seoDescription:
      'High-fire stoneware with natural ash glazes, hand-thrown by ceramicists in Gothenburg and Aalborg.',
  },
  {
    slug: 'furniture',
    name: 'Furniture',
    description: 'Timeless pieces built for generations.',
    sortOrder: 2,
    isActive: true,
    seoTitle: 'Furniture — Solid Oak & Walnut Pieces | Maison',
    seoDescription:
      'Solid FSC oak and walnut furniture, built by Nordic cabinetmakers to outlast trends.',
  },
  {
    slug: 'textiles',
    name: 'Textiles',
    description: 'Natural fibers woven with intention.',
    sortOrder: 3,
    isActive: true,
    seoTitle: 'Textiles — Belgian Linen & New Zealand Wool | Maison',
    seoDescription:
      'Washed European linen throws, hand-felted wool cushions, and natural fibers woven with intention.',
  },
  {
    slug: 'objects',
    name: 'Objects & Vases',
    description: 'Curated details that complete a space.',
    sortOrder: 4,
    isActive: true,
  },
  {
    slug: 'seasonal',
    name: 'Seasonal Collection',
    description: 'Limited pieces inspired by the changing light.',
    sortOrder: 5,
    isActive: true,
  },
  {
    slug: 'new-arrivals',
    name: 'New Arrivals',
    description: 'The latest additions to our collection.',
    sortOrder: 6,
    isActive: true,
  },
  {
    slug: 'gifts',
    name: 'Curated Gifts',
    description: 'Thoughtfully selected pieces for giving.',
    sortOrder: 7,
    isActive: true,
  },
];
