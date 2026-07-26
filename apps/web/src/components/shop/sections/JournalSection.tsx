/**
 * Maison — Journal section (3-col article cards)
 */

const ARTICLES = [
  { slug: "why-oak-gets-better-with-age", category: "Craft", readTime: "6 min read", title: "Why oak gets better with age", excerpt: "A short guide to oiling, brushing, and accepting the small marks a piece will gather over a decade of use.", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&q=80" },
  { slug: "lighting-a-room-for-autumn", category: "Home", readTime: "4 min read", title: "Lighting a room for autumn", excerpt: "Three small changes — lamp height, bulb temperature, layering — that shift how a room feels at dusk.", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=700&q=80" },
  { slug: "day-in-the-aalborg-workshop", category: "People", readTime: "8 min read", title: "A day in the Aalborg workshop", excerpt: "We spend a morning with founder Mette and her team as they finish the autumn run of dining chairs.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80" },
];

export function JournalSection() {
  return (
    <section style={{ padding: "clamp(64px, 9vw, 120px) 0", background: "var(--bg-2)" }}>
      <div style={{ maxWidth: "var(--container)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2rem", marginBottom: "clamp(40px, 5vw, 64px)", flexWrap: "wrap" }}>
          <div>
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--clay)", marginBottom: "1rem" }}>From the Journal</span>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 500 }}>
              Notes on <em style={{ color: "var(--clay)", fontStyle: "italic", fontWeight: 400 }}>slow living</em>.
            </h2>
          </div>
          <a href="/journal" style={{ fontSize: 13, color: "var(--ink)", borderBottom: "1px solid var(--ink)", paddingBottom: "2px", whiteSpace: "nowrap" }}>All journal entries →</a>
        </div>
        <div className="jour-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
          {ARTICLES.map((a) => (
            <a key={a.slug} href={`/journal/${a.slug}`} style={{ display: "block", transition: "transform 0.45s var(--ease-maison)" }}>
              <div style={{ aspectRatio: "4 / 3", overflow: "hidden", marginBottom: "1.5rem", background: "var(--bg-2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 1s var(--ease-maison)" }} />
              </div>
              <p style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>
                <span style={{ color: "var(--clay)" }}>{a.category}</span> · {a.readTime}
              </p>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.25, marginBottom: "0.75rem", transition: "color 0.25s ease" }}>{a.title}</h3>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "var(--ink-2)" }}>{a.excerpt}</p>
            </a>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { .jour-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 768px) { .jour-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
