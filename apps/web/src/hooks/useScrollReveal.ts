/**
 * Maison — Scroll reveal hook
 *
 * Uses IntersectionObserver to add the `visible` class to `.reveal` elements
 * when they enter the viewport. Respects prefers-reduced-motion.
 *
 * V12 fix: IntersectionObserver doesn't reliably fire for elements already
 * in the viewport on page load when the observer is set up in useEffect
 * after hydration. Added a fallback check via requestAnimationFrame that
 * manually adds `visible` to any `.reveal` elements already in the viewport.
 *
 * V14 fix: The effect had an empty dependency array [], so it only ran once
 * on mount. When users navigate between collection filter pages via <Link>
 * (client-side navigation), new .reveal elements render but never get
 * observed — staying at opacity:0 (blank page). Added `pathname` dependency
 * so the effect re-runs on every route change, re-observing new elements.
 */

'use client';

import { useEffect } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

export function useScrollReveal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Make all reveal elements visible immediately
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
      observer.observe(el);
    });

    // Fallback: IntersectionObserver may not fire for elements already in
    // the viewport on page load (timing issue with useEffect after hydration).
    // Use requestAnimationFrame to check after the first paint and manually
    // add `visible` to any `.reveal` elements that are already in view.
    requestAnimationFrame(() => {
      const viewportHeight = window.innerHeight;
      document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Element is in viewport if its top is above the bottom margin
        // (accounting for the -60px rootMargin) and its bottom is below the top
        if (rect.top < viewportHeight - 60 && rect.bottom > 0) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      });
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname, searchParams]);
}
