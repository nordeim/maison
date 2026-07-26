/**
 * Maison — Materials section (3-col grid with SVG icons)
 */

const MATERIALS = [
  {
    name: "FSC Oak",
    description: "Solid oak from sustainably managed forests in southern Sweden, kiln-dried and finished with raw linseed oil. Each board is selected for grain character and structural integrity, then hand-finished by our cabinetmakers.",
    origin: "Småland, Sweden",
    icon: '<path d="M12 2v20M5 8l7-6 7 6M5 16l7 6 7-6" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    name: "European Linen",
    description: "Flax grown in Normandy, woven in Belgium. Naturally antibacterial, biodegradable, and softened with each wash — a fabric that becomes more beautiful the more it is lived with, never less.",
    origin: "Normandy & Flanders",
    icon: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke-linecap="round"/>',
  },
  {
    name: "Hand-thrown Clay",
    description: "Stoneware fired at 1240°C in a wood kiln by ceramicist Lars Berg in Gothenburg — no two pieces alike. Each vessel carries the maker's mark, the kiln's breath, and the small irregularities that signal a human hand.",
    origin: "Gothenburg, Sweden",
    icon: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" stroke-linecap="round" stroke-linejoin="round"/>',
  },
];

export function Materials() {
  return (
    <section style={{ padding: "clamp(64px, 9vw, 120px) 0" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div style={{ marginBottom: "clamp(40px, 5vw, 64px)" }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>Made to Last</span>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 500 }}>
            Materials we <em style={{ color: "var(--clay)", fontStyle: "italic", fontWeight: 400 }}>trust</em>.
          </h2>
        </div>
        <div className="mat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
          {MATERIALS.map((mat) => (
            <div key={mat.name} style={{ padding: "2.5rem 2rem", border: "1px solid var(--line)", background: "var(--bg-card)", transition: "transform 0.45s var(--ease-maison), box-shadow 0.45s var(--ease-maison)", position: "relative", overflow: "hidden" }}>
              <div style={{ width: 48, height: 48, color: "var(--clay)", marginBottom: "1.5rem" }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" style="width:100%;height:100%">${mat.icon}</svg>` }} />
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.625rem", fontWeight: 500, marginBottom: "0.75rem" }}>{mat.name}</h3>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "var(--ink-2)" }}>{mat.description}</p>
              <p style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--line-soft)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>
                <strong style={{ color: "var(--ink-2)", fontWeight: 500 }}>Origin:</strong> {mat.origin}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { .mat-grid { grid-template-columns: 1fr !important; gap: 1rem !important; } }`}</style>
    </section>
  );
}
