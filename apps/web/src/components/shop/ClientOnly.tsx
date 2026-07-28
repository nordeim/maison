/**
 * Maison — ClientOnly boundary.
 *
 * Renders its children only after client hydration. On the server and during
 * the first client render pass, it renders the optional fallback (or nothing).
 *
 * Why this exists:
 *   Some Client Components call hooks that are illegal in the server render
 *   pass. The specific trigger here is Better Auth's `useSession()` from
 *   `better-auth/react`, which calls `useRef` indirectly via `useStore`. When
 *   such a component is server-rendered, Turbopack selects React's
 *   `react-server` export condition for the bundled chunk, where `useRef` is a
 *   null stub → `Cannot read properties of null (reading 'useRef')` at runtime.
 *
 *   `next/dynamic({ ssr: false })` would solve this, but Next.js 16 forbids
 *   `ssr: false` inside Server Components. `ClientOnly` is a Client Component
 *   itself, so it can be used from a Server Component, and it defers the
 *   children render to the client pass only.
 *
 * `useSyncExternalStore` is the SSR-safe hydration primitive: its third
 * argument (`getServerSnapshot`) returns `false` on the server, so children
 * are not rendered during SSR, and swap in once the client hydrates.
 *
 * Pattern alignment: Stillwater reference avoids SSR-rendering any
 * `useSession` component entirely; this helper gives Maison the same property
 * without rewriting the component's internals. See Maison CLAUDE.md
 * (Debugging Triage) + Stillwater SKILL Lesson 89 / line 4330.
 */

'use client';

import { useSyncExternalStore } from 'react';

import type { ReactNode } from 'react';

const emptySubscribe = () => noopUnsubscribe;

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

// `useSyncExternalStore` requires a subscribe fn, but `ClientOnly` has no
// real external store — the snapshot is constant per environment. This
// no-op unsubscribe satisfies the API without owning any subscription.
function noopUnsubscribe() {
  /* no-op */
}

export interface ClientOnlyProps {
  children: ReactNode;
  /** Rendered during SSR and first client render. Defaults to null. */
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isHydrated = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  return isHydrated ? children : fallback;
}
