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
 */

import { AnnouncementBar } from "@/components/shop/AnnouncementBar";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
