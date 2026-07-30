/**
 * Maison — About page (full editorial)
 *
 * Brand story narrative, founder/maker profile, sustainability commitments,
 * values section, behind-the-scenes imagery.
 *
 * Per PRD §6.6.
 */

import Image from 'next/image';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Maison — curated home objects crafted by Nordic artisans since 1998. Our philosophy, our makers, our commitment to slow design.',
};

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          color: 'var(--bg)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="https://images.pexels.com/photos/38428357/pexels-photo-38428357.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1600"
            alt="Maison workshop"
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(135deg, rgba(31,27,23,0.7) 0%, rgba(31,27,23,0.4) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 'var(--container)',
            margin: '0 auto',
            padding: '4rem var(--gutter)',
            width: '100%',
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '1rem',
              }}
            >
              Our Philosophy
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontWeight: 400,
                lineHeight: 1.05,
                color: 'var(--bg)',
              }}
            >
              Objects made with{' '}
              <em
                style={{
                  color: 'var(--gold)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                }}
              >
                care
              </em>
              , <br />
              materials that age{' '}
              <em
                style={{
                  color: 'var(--gold)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                }}
              >
                gracefully
              </em>
              .
            </h1>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section style={{ padding: 'clamp(64px, 9vw, 120px) 0' }}>
        <div
          style={{
            maxWidth: 'var(--container-narrow)',
            margin: '0 auto',
            padding: '0 var(--gutter)',
          }}
        >
          <p
            style={{
              fontSize: '1.25rem',
              lineHeight: 1.8,
              color: 'var(--ink-2)',
              marginBottom: '1.5rem',
            }}
          >
            Maison began in 1998, in a small workshop in Aalborg, Denmark. Founder Mette Sørensen
            was looking for furniture she couldn&apos;t find elsewhere: honest, restrained, and
            built to outlast trends. She started with a single chair — the Halden — made from solid
            oak and washed Belgian linen.
          </p>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.75,
              color: 'var(--ink-2)',
              marginBottom: '1.5rem',
            }}
          >
            Twenty-seven years later, we work with a collective of fourteen Nordic craftspeople —
            sourcing FSC-certified oak from Småland, plant-fibred linen from Normandy, and low-fire
            clay from Gothenburg. Every piece carries the maker&apos;s mark. Every order passes
            through our hands before it reaches yours.
          </p>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.75,
              color: 'var(--ink-2)',
              marginBottom: '1.5rem',
            }}
          >
            We believe in the beauty of slow living — in objects made with care, materials that age
            gracefully, and spaces that invite pause. This is not a marketing position. It is the
            only way we know how to work.
          </p>
        </div>
      </section>

      {/* Values */}
      <section
        style={{
          padding: 'clamp(64px, 9vw, 120px) 0',
          background: 'var(--bg-2)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container)',
            margin: '0 auto',
            padding: '0 var(--gutter)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
              Our Values
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                fontWeight: 500,
              }}
            >
              Four{' '}
              <em
                style={{
                  color: 'var(--clay)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                commitments
              </em>
              .
            </h2>
          </div>
          <div
            className="values-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2rem',
            }}
          >
            {[
              {
                num: '01',
                title: 'Material Integrity',
                body: 'We use only solid wood, natural fibers, and hand-mixed glazes. No veneers, no MDF, no synthetic fabrics. Materials should be honest — and they should age beautifully.',
              },
              {
                num: '02',
                title: 'Maker Dignity',
                body: "We pay our makers fairly and publish their names. Every piece carries the maker's mark. We visit every workshop, every year. Craft is not a commodity.",
              },
              {
                num: '03',
                title: 'Slow Design',
                body: "Our lead times are 1–12 weeks by design. We don't keep inventory — we make to order. This reduces waste and ensures every piece is made with intention, not haste.",
              },
              {
                num: '04',
                title: 'Repair Over Replace',
                body: 'Every Maison piece comes with a 10-year guarantee. We provide care guides, replacement parts, and repair services. Objects should be kept, not discarded.',
              },
            ].map((v) => (
              <div
                key={v.num}
                style={{
                  padding: '2.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--line)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '3rem',
                    fontWeight: 500,
                    color: 'var(--clay)',
                    opacity: 0.3,
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {v.num}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    marginBottom: '0.75rem',
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--ink-2)',
                  }}
                >
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .values-grid { grid-template-columns: 1fr !important; gap: 1rem !important; } }`}</style>
      </section>

      {/* Maker profile */}
      <section style={{ padding: 'clamp(64px, 9vw, 120px) 0' }}>
        <div
          className="maker-grid"
          style={{
            maxWidth: 'var(--container)',
            margin: '0 auto',
            padding: '0 var(--gutter)',
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: 'clamp(2.5rem, 6vw, 5rem)',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              aspectRatio: '4 / 5',
              overflow: 'hidden',
            }}
          >
            <Image
              src="https://images.pexels.com/photos/13712877/pexels-photo-13712877.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=800"
              alt="Mette Sørensen in the Aalborg workshop"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
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
              Founder
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 500,
                marginBottom: '1.5rem',
              }}
            >
              Mette{' '}
              <em
                style={{
                  color: 'var(--clay)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                Sørensen
              </em>
            </h2>
            <blockquote
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.375rem',
                fontStyle: 'italic',
                lineHeight: 1.5,
                color: 'var(--ink)',
                marginBottom: '1.5rem',
                borderLeft: '2px solid var(--clay)',
                paddingLeft: '1.5rem',
              }}
            >
              &quot;I started Maison because I couldn&apos;t find furniture I wanted to live with.
              Everything was either beautiful but fragile, or durable but ugly. I wanted both — and
              I knew the only way to get it was to make it myself.&quot;
            </blockquote>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.75,
                color: 'var(--ink-2)',
                marginBottom: '1rem',
              }}
            >
              Mette trained as a cabinetmaker in Copenhagen before opening her workshop in Aalborg
              in 1998. Twenty-seven years later, she still designs every piece in the collection and
              personally selects every board of oak that enters the workshop.
            </p>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.75,
                color: 'var(--ink-2)',
              }}
            >
              Today, Maison works with fourteen craftspeople across Denmark, Sweden, and Norway —
              but the philosophy hasn&apos;t changed: make less, make it better, make it to last.
            </p>
          </div>
        </div>
        <style>{`@media (max-width: 1024px) { .maker-grid { grid-template-columns: 1fr !important; gap: 2rem !important; } }`}</style>
      </section>

      {/* Sustainability */}
      <section
        style={{
          padding: 'clamp(64px, 9vw, 120px) 0',
          background: 'var(--bg-2)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container)',
            margin: '0 auto',
            padding: '0 var(--gutter)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
              Sustainability
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
                fontWeight: 500,
              }}
            >
              Three{' '}
              <em
                style={{
                  color: 'var(--clay)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                commitments
              </em>{' '}
              to the earth.
            </h2>
          </div>
          <div
            className="sustain-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Materials',
                body: '100% FSC-certified oak from sustainably managed forests in Småland. Belgian linen from flax grown without irrigation. Stoneware fired in wood kilns. No synthetics, no greenwashing.',
              },
              {
                title: 'Packaging',
                body: 'Plastic-free packaging: recycled cardboard, shredded linen offcuts for padding, and natural twine. Every order is wrapped by hand. Our packaging is compostable or recyclable.',
              },
              {
                title: 'Carbon',
                body: 'Carbon-neutral delivery via offset programs (verified by Gold Standard). We ship by sea when possible, never air. Our workshop runs on 100% renewable electricity.',
              },
            ].map((s) => (
              <div
                key={s.title}
                style={{
                  padding: '2rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--line)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    marginBottom: '0.75rem',
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--ink-2)',
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 768px) { .sustain-grid { grid-template-columns: 1fr !important; gap: 1rem !important; } }`}</style>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(64px, 9vw, 120px) 0', textAlign: 'center' }}>
        <div
          style={{
            maxWidth: 'var(--container-narrow)',
            margin: '0 auto',
            padding: '0 var(--gutter)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              marginBottom: '1.5rem',
            }}
          >
            Browse the{' '}
            <em
              style={{
                color: 'var(--clay)',
                fontStyle: 'italic',
                fontWeight: 400,
              }}
            >
              collection
            </em>
            .
          </h2>
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: 'var(--ink-2)',
              marginBottom: '2rem',
            }}
          >
            Every piece in our collection is made to order by one of our fourteen Nordic
            craftspeople. Take your time — these are objects designed to be lived with for decades.
          </p>
          <a
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.95rem 1.75rem',
              background: 'var(--clay)',
              color: 'var(--bg)',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Shop the Collection
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
