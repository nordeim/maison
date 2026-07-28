/**
 * Maison — Root layout
 *
 * Loads fonts via next/font (self-hosted, no Google Fonts CDN).
 * Wraps app in TRPCProvider for client-side tRPC calls.
 * Server Components use the server caller (src/lib/trpc/server.ts) directly.
 */

import { Cormorant_Garamond, Inter } from 'next/font/google';

import { site } from '@maison/config';

import type { Metadata } from 'next';

import { CartDrawer } from '@/components/shop/CartDrawer';
import { CartProvider } from '@/components/shop/CartProvider';
import { TRPCProvider } from '@/lib/trpc/client';

import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif-loaded',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    'Scandinavian home goods',
    'handcrafted furniture',
    'Nordic design',
    'considered living',
    'slow living',
    'artisan ceramics',
    'linen textiles',
  ],
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <TRPCProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
