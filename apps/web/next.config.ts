import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

// ── Bundle analyzer (enabled via ANALYZE=true) ────────────────────
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // ── Hide X-Powered-By header (security: don't leak framework) ──
  poweredByHeader: false,

  // ── Transpile workspace packages (source resolution) ───────────
  // Turbopack doesn't respect custom `exports` conditions like
  // `@maison/source`. By listing packages here, Turbopack resolves
  // to source and transpiles it inline — no separate tsc --build step.
  transpilePackages: [
    '@maison/auth',
    '@maison/api',
    '@maison/db',
    '@maison/config',
    '@maison/ui',
    '@maison/email',
    '@maison/payments',
  ],

  // ── Server external packages (Next.js 16 top-level, was experimental) ──
  serverExternalPackages: [
    '@neondatabase/serverless',
    'drizzle-orm',
    'better-auth',
    '@sanity/client',
    'stripe',
    'resend',
  ],

  // ── Experimental features ──────────────────────────────────────
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // ── Logging ────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // ── Images ─────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Cloudflare Images CDN
      { protocol: 'https', hostname: 'imagedelivery.net', pathname: '/**' },
      // Cloudflare R2 (direct storage access)
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      // Sanity CDN (product images, blog images)
      { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' },
      // Unsplash (seed data — replace with Cloudflare in production)
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Security Headers ───────────────────────────────────────────
  // Per PROJECT-ARCHITECTURE.md §6.1. These are the PRODUCTION CSP
  // (proxy.ts response headers are dropped on Vercel + Next.js 16.2).
  headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: https://imagedelivery.net https://cdn.sanity.io https://images.unsplash.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com wss: https://*.sentry.io https://*.posthog.com",
              'frame-src https://js.stripe.com',
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://api.stripe.com",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },

  // ── Rewrites ───────────────────────────────────────────────────
  rewrites() {
    return [
      // PostHog reverse proxy (privacy-friendly analytics)
      {
        source: '/_analytics/static/:path*',
        destination: 'https://app.posthog.com/static/:path*',
      },
      {
        source: '/_analytics/:path*',
        destination: 'https://app.posthog.com/:path*',
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
