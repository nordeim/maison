import { describe, it, expect } from "vitest";
import { site } from "./site";

describe("site config", () => {
  it("has required brand fields", () => {
    expect(site.name).toBe("Maison");
    expect(site.tagline).toContain("Quiet Beauty");
  });

  it("has navigation links", () => {
    expect(site.nav.links.length).toBeGreaterThan(0);
    expect(site.nav.links.some((l) => l.href === "/products")).toBe(true);
  });

  it("has footer columns", () => {
    expect(site.footer.columns.length).toBeGreaterThanOrEqual(3);
  });
});
