/**
 * Maison — Dynamic XML sitemap
 *
 * Generates /sitemap.xml with all public routes + dynamic product/collection URLs.
 */

import { site } from '@maison/config';

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${site.url}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${site.url}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${site.url}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${site.url}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${site.url}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Phase 1: fetch products and collections from DB and add dynamic URLs
  // const products = await api().products.list({ limit: 1000 });
  // const productRoutes = products.items.map(p => ({
  //   url: `${site.url}/products/${p.slug}`,
  //   lastModified: new Date(),
  //   changeFrequency: "weekly" as const,
  //   priority: 0.8,
  // }));

  return [...staticRoutes];
}
