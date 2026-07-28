/**
 * Maison — Shared Tailwind CSS v4 Base Configuration
 *
 * Design Philosophy: "Editorial Calm" — Warm Cream + Terracotta palette
 * Anti-Generic enforcement: NO purple gradients, NO Inter-only, NO generic grids.
 *
 * NOTE: In Tailwind v4, most configuration moves to CSS (@theme directive in
 * apps/web/src/app/globals.css). This file exports JS-accessible tokens for
 * use in tests, Storybook, and non-CSS consumers.
 *
 * Aligned with docs/landing_page_unified.html design tokens.
 */

import type { Config } from 'tailwindcss';

export const maisonBase: Omit<Config, 'content'> = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      colors: {
        cream: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#ece5d8',
        },
        ink: {
          900: '#1f1b17',
          700: '#4a433b',
          500: '#8a8178',
        },
        clay: {
          900: '#8a5538',
          700: '#a86b4a',
          500: '#c17d52',
          100: '#f7ede8',
        },
        gold: {
          DEFAULT: '#c4a265',
        },
        sage: {
          DEFAULT: '#8b9a82',
        },
        line: {
          DEFAULT: '#e5ddd1',
          soft: '#efe9df',
        },
      },

      spacing: {
        px: '1px',
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '32px',
        '8': '48px',
        '9': '64px',
        '10': '96px',
        '11': '128px',
        '12': '192px',
      },

      maxWidth: {
        content: '1280px',
        narrow: '760px',
        wide: '1440px',
      },

      fontSize: {
        hero: ['clamp(3rem, 8.5vw, 7.5rem)', { lineHeight: '0.98' }],
        'display-xl': ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.05' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.4rem)', { lineHeight: '1.08' }],
        'heading-lg': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2' }],
        'heading-md': ['1.25rem', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.65' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
        label: ['0.6875rem', { lineHeight: '1.4' }],
      },

      borderRadius: {
        none: '0',
        sm: '2px',
        DEFAULT: '4px',
        md: '4px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        full: '9999px',
      },

      transitionTimingFunction: {
        gentle: 'cubic-bezier(0.16, 1, 0.3, 1)',
        maison: 'cubic-bezier(0.22, 1, 0.36, 1)',
        breathe: 'cubic-bezier(0.45, 0, 0.55, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        instant: '100ms',
        quick: '150ms',
        fast: '250ms',
        standard: '450ms',
        slow: '800ms',
        crawl: '900ms',
      },

      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.08) translate(-1%, -1%)' },
          '100%': { transform: 'scale(1.18) translate(1.5%, 1%)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        reveal: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(6px)', opacity: '1' },
        },
      },

      animation: {
        marquee: 'marquee 38s linear infinite',
        'ken-burns': 'ken-burns 24s ease-in-out infinite alternate',
        'fade-in': 'fade-in 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        reveal: 'reveal 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scroll-hint': 'scroll-hint 2.4s ease-in-out infinite',
      },
    },
  },

  plugins: [],
} satisfies Omit<Config, 'content'>;
