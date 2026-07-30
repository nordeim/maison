/**
 * Maison — Scroll reveal trigger (Client Component)
 *
 * Mounts the `useScrollReveal` hook so that `.reveal` elements (e.g.
 * ProductCard) get the `visible` class added when they enter the viewport.
 *
 * Without this component, `.reveal` elements stay at `opacity: 0` forever
 * because the hook is never called. This was the root cause of the
 * "/products shows blank screen" defect (v11 V11-1).
 *
 * Per REMEDIATION_PLAN_v11 Task 1.1.
 */

'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

export function ScrollRevealTrigger() {
  useScrollReveal();
  return null;
}
