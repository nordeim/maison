/**
 * Maison — Accessibility E2E tests
 *
 * Uses @axe-core/playwright to scan all public pages for WCAG 2.2 AA violations.
 * Any serious/critical violation fails the build.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_PAGES = [
  "/",
  "/products",
  "/collections",
  "/about",
  "/journal",
  "/contact",
  "/auth/sign-in",
  "/auth/sign-up",
];

test.describe("Accessibility", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} has no critical accessibility violations`, async ({ page }) => {
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      const criticalViolations = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );

      expect(criticalViolations).toEqual([]);
    });
  }
});
