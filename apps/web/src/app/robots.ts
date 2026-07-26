/**
 * Maison — robots.txt
 *
 * Allows all public routes, blocks /admin, /account, /api.
 */

import type { MetadataRoute } from "next";
import { site } from "@maison/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/checkout", "/cart"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
