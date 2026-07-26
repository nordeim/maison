/**
 * Maison — Marquee (brand promises strip)
 */

const ITEMS = [
  "Handcrafted in Scandinavia",
  "FSC-certified Oak",
  "Carbon-neutral Delivery",
  "10-year Guarantee",
  "Plant-based Textiles",
];

export function Marquee() {
  const allItems = [...ITEMS, ...ITEMS];
  return (
    <div style={{ background: "var(--bg-dark)", color: "var(--bg)", padding: "1.1rem 0", overflow: "hidden" }} aria-hidden="true">
      <div style={{ display: "flex", gap: "3rem", whiteSpace: "nowrap", width: "max-content", animation: "marquee 38s linear infinite" }}>
        {allItems.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.875rem", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(250,248,245,0.85)" }}>
            <span style={{ color: "var(--gold)", fontSize: 8 }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
