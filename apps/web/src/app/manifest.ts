/**
 * Maison — PWA manifest
 */

import type { MetadataRoute } from "next";
import { site } from "@maison/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    shortName: site.name,
    description: site.description,
    startUrl: "/",
    display: "standalone",
    backgroundColor: site.themeColor,
    themeColor: site.themeColor,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
