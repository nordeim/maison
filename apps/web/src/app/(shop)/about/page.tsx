/**
 * Maison — About page (stub — Phase 2)
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Maison — curated home objects crafted by Nordic artisans since 1998.",
};

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 1.25rem" }}>
      <p className="eyebrow">Our Philosophy</p>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 400, marginBottom: "2rem" }}>
        Objects made with <em style={{ color: "#a86b4a" }}>care</em>, materials that age{" "}
        <em style={{ color: "#a86b4a" }}>gracefully</em>.
      </h1>
      <p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "#4a433b", marginBottom: "1.5rem" }}>
        We believe that the objects we surround ourselves with should tell stories, age beautifully,
        and bring quiet joy to daily rituals. Every piece in our collection passes through our hands
        before it reaches yours — we visit workshops, meet makers, and learn the story behind each object.
      </p>
      <p style={{ fontSize: "1.125rem", lineHeight: 1.7, color: "#4a433b", marginBottom: "1.5rem" }}>
        Born out of Nordic design traditions, Maison partners with independent European artisans who
        honor slow craftsmanship, natural materials, and timeless function.
      </p>
      <p style={{ color: "#8a8178", marginTop: "2rem" }}>
        Full about page (founder profile, sustainability commitments, maker stories) — Phase 2.
      </p>
    </main>
  );
}
