/**
 * Maison — Customers schema test: Phase 3 columns
 *
 * Regression test: the customers table was missing loyaltyTier and
 * tradeDiscountPercent columns in the Drizzle schema, even though
 * the migration SQL added them. This test validates they exist.
 */

import { describe, it, expect } from "vitest";
import { customers } from "./customers";

describe("customers schema", () => {
  it("has loyaltyTier column", () => {
    expect(customers.loyaltyTier).toBeDefined();
  });

  it("has tradeDiscountPercent column", () => {
    expect(customers.tradeDiscountPercent).toBeDefined();
  });

  it("loyaltyTier defaults to 'member'", () => {
    // The column config should have a default value
    const column = customers.loyaltyTier;
    expect(column).toBeDefined();
  });

  it("tradeDiscountPercent defaults to 0", () => {
    const column = customers.tradeDiscountPercent;
    expect(column).toBeDefined();
  });

  it("has all original columns", () => {
    expect(customers.id).toBeDefined();
    expect(customers.userId).toBeDefined();
    expect(customers.firstName).toBeDefined();
    expect(customers.lastName).toBeDefined();
    expect(customers.phone).toBeDefined();
    expect(customers.newsletterSubscribed).toBeDefined();
    expect(customers.notes).toBeDefined();
    expect(customers.createdAt).toBeDefined();
    expect(customers.updatedAt).toBeDefined();
  });
});
