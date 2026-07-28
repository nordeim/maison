/**
 * Maison — robots.txt
 *
 * Allows all public routes, blocks /admin, /account, /api.
 */

import { site } from '@maison/config';

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/account', '/api', '/checkout', '/cart'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
