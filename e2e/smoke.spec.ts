/**
 * Maison — E2E smoke test
 *
 * Verifies the homepage loads and the basic hero is visible.
 * Phase 1: expand to full checkout flow, admin CRUD, auth flows.
 */

import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads with hero", async ({ page }) => {
    await page.goto("/");

    // Hero title should be visible
    await expect(page.locator("h1")).toContainText("Objects of");
    await expect(page.locator("h1")).toContainText("Quiet Beauty");

    // CTA should link to products
    const cta = page.getByRole("link", { name: /shop the collection/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/products");
  });

  test("products page loads", async ({ page }) => {
    await page.goto("/products");

    // Should have a heading (either "All Pieces" or a collection name)
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/auth/sign-in");

    await expect(page.locator("h1")).toContainText("Sign in");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("unauthenticated user redirected from /account to sign-in", async ({ page }) => {
    await page.goto("/account");

    // Should redirect to /auth/sign-in (proxy.ts cookie check)
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("unauthenticated user redirected from /admin to sign-in", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });
});
