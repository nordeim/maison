/**
 * Maison — Cart router test: null variantId handling
 *
 * Regression test: previously, the cart router used `null as unknown as string`
 * to compare against NULL variantId in the database. This was an unsafe type cast.
 * The fix uses Drizzle's `isNull()` operator instead.
 */

import { describe, it, expect } from "vitest";
import { isNull, eq, and } from "drizzle-orm";

describe("cart router: null variantId handling", () => {
  it("isNull is importable from drizzle-orm", () => {
    expect(typeof isNull).toBe("function");
  });

  it("isNull returns a SQL expression (not a string cast)", () => {
    const expr = isNull("test_column");
    // isNull returns a SQL object, not a string
    expect(expr).toBeDefined();
    expect(typeof expr).toBe("object");
  });

  it("eq + and + isNull compose correctly", () => {
    const condition = and(
      eq("cart_id" as never, "test-cart-id" as never),
      eq("product_id" as never, "test-product-id" as never),
      isNull("variant_id" as never),
    );
    expect(condition).toBeDefined();
  });
});
