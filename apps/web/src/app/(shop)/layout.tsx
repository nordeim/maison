/**
 * Maison — Shop layout
 *
 * Wraps all public storefront pages with:
 *  - AnnouncementBar (promotional strip)
 *  - Header (sticky nav + cart)
 *  - {children} (the page content)
 *  - Footer (links + socials)
 *
 * The CartProvider and CartDrawer are in the root layout (available everywhere).
 * ScrollRevealTrigger mounts the useScrollReveal hook so .reveal elements
 * (e.g. ProductCard) become visible when scrolled into view.
 *
 * V15 fix: ScrollRevealTrigger uses useSearchParams() (V14 fix for collection
 * filter navigation), which requires a Suspense boundary for static page
 * prerendering. Without Suspense, the build fails with:
 *   "useSearchParams() should be wrapped in a suspense boundary at page /cart"
 */

import { Suspense } from 'react';

import { AnnouncementBar } from '@/components/shop/AnnouncementBar';
import { Footer } from '@/components/shop/Footer';
import { Header } from '@/components/shop/Header';
import { ScrollRevealTrigger } from '@/components/shop/ScrollRevealTrigger';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <ScrollRevealTrigger />
      </Suspense>
    </>
  );
}
