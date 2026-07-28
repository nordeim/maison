/**
 * Maison — Testimonials (3-col quote cards)
 */

const TESTIMONIALS = [
  {
    quote:
      'The Halden armchair arrived fully assembled and feels like it was made for our living room. Three years in and it has only softened beautifully — every mark tells a story.',
    name: 'Freja L.',
    location: 'Copenhagen, DK',
  },
  {
    quote:
      'I waited six months for the Berg floor lamp and would do it again. The light is warm, the brass has aged like a heirloom. Maison is the rare shop that respects patience.',
    name: 'Henry W.',
    location: 'Portland, US',
  },
  {
    quote:
      'Customer service replaced a chipped ceramic bowl without question. You can tell this is a company that stands behind what they make — and the people who make it.',
    name: 'Sofia M.',
    location: 'Stockholm, SE',
  },
];

export function Testimonials() {
  return (
    <section style={{ padding: 'clamp(64px, 9vw, 120px) 0' }}>
      <div
        style={{
          maxWidth: 'var(--container)',
          margin: '0 auto',
          padding: '0 var(--gutter)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '2rem',
            marginBottom: 'clamp(40px, 5vw, 64px)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--clay)',
                marginBottom: '1rem',
              }}
            >
              From Our Home to Yours
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                fontWeight: 500,
              }}
            >
              Loved by{' '}
              <em
                style={{
                  color: 'var(--clay)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                2,400+
              </em>{' '}
              homes.
            </h2>
          </div>
          <a
            href="#"
            style={{
              fontSize: 13,
              color: 'var(--ink)',
              borderBottom: '1px solid var(--ink)',
              paddingBottom: '2px',
              whiteSpace: 'nowrap',
            }}
          >
            Read all reviews →
          </a>
        </div>
        <div
          className="test-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: '2.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--line)',
                transition:
                  'transform 0.45s var(--ease-maison), box-shadow 0.45s var(--ease-maison)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '4rem',
                  lineHeight: 0.6,
                  color: 'var(--clay)',
                  opacity: 0.3,
                  marginBottom: '1rem',
                }}
              >
                &quot;
              </span>
              <div
                style={{
                  color: 'var(--gold)',
                  letterSpacing: '0.15em',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                ★★★★★
              </div>
              <blockquote
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.1875rem',
                  lineHeight: 1.5,
                  color: 'var(--ink)',
                  marginBottom: '1.75rem',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                {t.quote}
              </blockquote>
              <cite
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontStyle: 'normal',
                }}
              >
                <span style={{ width: 24, height: 1, background: 'var(--clay)' }} />
                <strong
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    fontSize: '0.95rem',
                  }}
                >
                  {t.name}
                </strong>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                  }}
                >
                  {t.location}
                </span>
              </cite>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { .test-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
