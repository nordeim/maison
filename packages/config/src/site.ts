/**
 * Maison — Site configuration
 *
 * Single source of truth for brand metadata, navigation, and footer links.
 * Consumed by apps/web layout, sitemap, SEO, and marketing components.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: 'instagram' | 'pinterest' | 'youtube';
}

export const site = {
  name: 'Maison',
  legalName: 'Maison Living',
  tagline: 'Objects of Quiet Beauty',
  description:
    'Handcrafted home goods, sculptural lighting, and tactile lifestyle pieces — curated for considered living. Made by Nordic artisans from solid oak, linen, and clay.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://maison.jesspete.shop',
  locale: 'en_US',
  themeColor: '#faf8f5',

  contact: {
    email: 'hello@maison-living.com',
    studio: 'Stockholm & Copenhagen',
    hours: 'Mon–Fri, 9am–6pm CET',
  },

  nav: {
    links: [
      { label: 'Shop All', href: '/products' },
      { label: 'Collections', href: '/collections' },
      { label: 'Our Story', href: '/about' },
      { label: 'Journal', href: '/journal' },
      { label: 'Contact', href: '/contact' },
    ] satisfies NavLink[],
  },

  footer: {
    tagline:
      'Curated home objects and lifestyle pieces — crafted by Nordic artisans for intentional, serene living since 1998.',
    columns: [
      {
        title: 'Shop',
        links: [
          { label: 'Furniture', href: '/products?collection=furniture' },
          { label: 'Lighting', href: '/products?collection=lighting' },
          { label: 'Textiles', href: '/products?collection=textiles' },
          { label: 'Ceramics', href: '/products?collection=ceramics' },
          { label: 'Gift Cards', href: '/products?collection=gifts' },
        ],
      },
      {
        title: 'About',
        links: [
          { label: 'Our Story', href: '/about' },
          { label: 'Sustainability', href: '/about#sustainability' },
          { label: 'Materials', href: '/about#materials' },
          { label: 'Journal', href: '/journal' },
          { label: 'Press', href: '/about#press' },
        ],
      },
      {
        title: 'Help',
        links: [
          { label: 'Shipping & Returns', href: '/shipping-returns' },
          { label: 'Material Care Guide', href: '/care-guide' },
          { label: 'Artisan Traceability', href: '/about#traceability' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ] satisfies FooterColumn[],
    socials: [
      {
        label: 'Instagram',
        href: 'https://instagram.com/maisonliving',
        icon: 'instagram',
      },
      {
        label: 'Pinterest',
        href: 'https://pinterest.com/maisonliving',
        icon: 'pinterest',
      },
      {
        label: 'YouTube',
        href: 'https://youtube.com/@maisonliving',
        icon: 'youtube',
      },
    ] satisfies SocialLink[],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Cookie Preferences', href: '/cookie-policy' },
    ] satisfies NavLink[],
  },

  shipping: {
    freeShippingThresholdCents: 15000, // $150.00
    currency: 'USD',
    currencySymbol: '$',
    standardDeliveryDays: '5–7',
    expressDeliveryDays: '2–3',
    whiteGloveWeeks: '2',
  },

  analytics: {
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  },
} as const;

export type SiteConfig = typeof site;
