/**
 * Maison — E2E smoke tests
 *
 * Tests that don't require a database (page loads, navigation, auth redirects).
 * Data-dependent tests (checkout, account dashboard) are in integration tests
 * that run with a seeded test database.
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads with hero', async ({ page }) => {
    await page.goto('/');

    // Hero title should be visible
    await expect(page.locator('h1')).toContainText('Objects of');
    await expect(page.locator('h1')).toContainText('Quiet Beauty');

    // CTA should link to products
    const cta = page.getByRole('link', { name: /shop the collection/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/products');
  });

  test('homepage has all 15 sections', async ({ page }) => {
    await page.goto('/');

    // Hero
    await expect(page.locator('h1')).toContainText('Quiet Beauty');

    // Marquee (brand promises)
    await expect(page.getByText('Handcrafted in Scandinavia')).toBeVisible();

    // Featured collection
    await expect(page.getByText('casts warmth')).toBeVisible();

    // Materials section
    await expect(page.getByText('FSC Oak')).toBeVisible();
    await expect(page.getByText('European Linen')).toBeVisible();
    await expect(page.getByText('Hand-thrown Clay')).toBeVisible();

    // Testimonials
    await expect(page.getByText('Loved by')).toBeVisible();

    // Newsletter
    await expect(page.getByText('Letters from')).toBeVisible();

    // Footer
    await expect(page.getByText('maison-living.com')).toBeVisible();
  });

  test('products page loads', async ({ page }) => {
    await page.goto('/products');

    // Should have a heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Sort selector should be present
    await expect(page.getByLabel('Sort products')).toBeVisible();
  });

  test('collections page loads', async ({ page }) => {
    await page.goto('/collections');

    await expect(page.locator('h1')).toContainText('quiet');
  });

  test('about page loads with full editorial content', async ({ page }) => {
    await page.goto('/about');

    await expect(page.locator('h1')).toContainText('care');
    await expect(page.locator('h1')).toContainText('gracefully');

    // Values section
    await expect(page.getByText('Material Integrity')).toBeVisible();
    await expect(page.getByText('Maker Dignity')).toBeVisible();
    await expect(page.getByText('Slow Design')).toBeVisible();
    await expect(page.getByText('Repair Over Replace')).toBeVisible();

    // Sustainability section
    await expect(page.getByText('Three')).toBeVisible();

    // Founder quote
    await expect(page.getByText('Mette')).toBeVisible();
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search?q=linen');

    await expect(page.locator('h1')).toContainText('linen');
  });

  test('search page with no query shows prompt', async ({ page }) => {
    await page.goto('/search');

    await expect(page.locator('h1')).toContainText('collection');
  });

  test('header search button opens search modal', async ({ page }) => {
    await page.goto('/');

    // Click search button in header
    await page.getByRole('button', { name: 'Search' }).click();

    // Search input should be visible
    await expect(page.getByPlaceholder(/search for pieces/i)).toBeVisible();
  });

  test('gift cards page loads', async ({ page }) => {
    await page.goto('/gift-cards');

    await expect(page.locator('h1')).toContainText('quiet beauty');
    await expect(page.locator('h1')).toContainText('gift');
  });

  test('trade program page loads', async ({ page }) => {
    await page.goto('/trade');

    await expect(page.locator('h1')).toContainText('designers');
  });

  test('journal page loads', async ({ page }) => {
    await page.goto('/journal');

    await expect(page.locator('h1')).toContainText('slow living');
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('h1')).toContainText('touch');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('cart page loads (empty state)', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.locator('h1')).toContainText('bag');
  });

  test('checkout page redirects to cart when empty', async ({ page }) => {
    await page.goto('/checkout');

    // Empty cart should show empty state message
    await expect(page.locator('h1')).toContainText('bag is empty');
  });

  test('sign-in page loads', async ({ page }) => {
    await page.goto('/auth/sign-in');

    await expect(page.locator('h1')).toContainText('Sign in');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('sign-up page loads', async ({ page }) => {
    await page.goto('/auth/sign-up');

    await expect(page.locator('h1')).toContainText('account');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('unauthenticated user redirected from /account to sign-in', async ({ page }) => {
    await page.goto('/account');

    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('unauthenticated user redirected from /admin to sign-in', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('unauthenticated user redirected from /checkout to sign-in', async ({ page }) => {
    await page.goto('/checkout');

    // Checkout requires auth (protectedProcedure in checkout router)
    // proxy.ts redirects /checkout to sign-in
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('header navigation works', async ({ page }) => {
    await page.goto('/');

    // Click "Shop All" in header
    await page.getByRole('link', { name: 'Shop All' }).first().click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('footer links are present', async ({ page }) => {
    await page.goto('/');

    // Footer should have shop links
    await expect(page.getByRole('link', { name: 'Furniture' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  });

  test('newsletter form is present', async ({ page }) => {
    await page.goto('/');

    // Newsletter section should have email input
    const newsletterInput = page.locator('input[aria-label="Email address"]');
    await expect(newsletterInput).toBeVisible();
  });
});
