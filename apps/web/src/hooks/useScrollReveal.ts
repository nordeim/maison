/**
 * Maison — Scroll reveal hook
 *
 * Uses IntersectionObserver to add the `visible` class to `.reveal` elements
 * when they enter the viewport. Respects prefers-reduced-motion.
 */

'use client';

import { useEffect } from 'react';

export function useScrollReveal() {
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

    document.querySelectorAll('.reveal').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
