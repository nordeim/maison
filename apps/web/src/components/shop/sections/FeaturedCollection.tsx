/**
 * Maison — Featured Collection (editorial split)
 */

import Image from "next/image";

export function FeaturedCollection() {
  return (
    <section style={{ padding: "clamp(64px, 9vw, 120px) 0", background: "var(--bg-2)" }}>
      <div className="featured-grid" style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "0 var(--gutter)", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "clamp(2.5rem, 6vw, 6rem)", alignItems: "center" }}>
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4 / 5" }}>
          <Image src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80" alt="Sculptural Arc Pendant Light in hand-bent brass and linen" fill sizes="(max-width: 1024px) 100vw, 50vw" style={{ objectFit: "cover", transition: "transform 1.2s var(--ease-maison)" }} />
          <span style={{ position: "absolute", top: "1.5rem", left: "1.5rem", background: "var(--bg)", color: "var(--ink)", padding: "0.5rem 1rem", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500 }}>Featured</span>
        </div>
        <div>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>Featured Collection</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 500, marginBottom: "1.5rem", lineHeight: 1.05 }}>
            Lighting that<br />
            <em style={{ color: "var(--clay)", fontWeight: 400, fontStyle: "italic" }}>casts warmth</em>.
          </h2>
          <p style={{ fontSize: "1.0625rem", lineHeight: 1.7, color: "var(--ink-2)", marginBottom: "2rem", maxWidth: "48ch" }}>
            Sculptural forms that cast warmth and shadow — each piece mouth-blown, hand-bent, or wheel-thrown by Nordic makers who shape light as carefully as they shape material. Discover pendants, table lamps, and floor lights designed to transform any space into a sanctuary of warm, deliberate glow.
          </p>
          <div style={{ display: "flex", gap: "2.5rem", marginBottom: "2.5rem", paddingTop: "1.75rem", borderTop: "1px solid var(--line)" }}>
            <div><span style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Pieces</span><strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>28</strong></div>
            <div><span style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Makers</span><strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>9</strong></div>
            <div><span style={{ display: "block", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.3rem" }}>Materials</span><strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500 }}>Brass · Glass · Clay</strong></div>
          </div>
          <a href="/products?collection=lighting" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", padding: "0.95rem 1.75rem", border: "1px solid var(--ink)", color: "var(--ink)", fontSize: 13, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", transition: "all 0.45s var(--ease-maison)" }}>
            Shop Lighting
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </a>
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { .featured-grid { grid-template-columns: 1fr !important; gap: 3rem !important; } }`}</style>
    </section>
  );
}
