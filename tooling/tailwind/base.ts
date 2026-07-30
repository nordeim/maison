/**
 * Maison — Shared Tailwind CSS v4 Base Configuration
 *
 * Per nextjs16-react19-tailwindv4-trpcv11-drizzle-better-auth skill §9.5/§13.6:
 * Tailwind v4 is CSS-first. The canonical design tokens live in
 * `apps/web/src/app/globals.css` under the `@theme` directive. This file
 * is intentionally minimal — it only declares content paths and keeps a
 * small `fontFamily` reference for any non-CSS consumer (e.g. Storybook).
 *
 * Do NOT duplicate `@theme` tokens here — that causes drift between the
 * CSS-first source of truth and the JS config. If a token is needed in JS,
 * import it from the CSS variables instead.
 */

import type { Config } from 'tailwindcss';

export const maisonBase: Omit<Config, 'content'> = {
  theme: {
    extend: {
      // fontFamily is kept as a JS reference for non-CSS consumers (Storybook,
      // tests). All other tokens (colors, spacing, fontSize, borderRadius,
      // transitions, keyframes, animation) are CSS-first in globals.css @theme.
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Omit<Config, 'content'>;
