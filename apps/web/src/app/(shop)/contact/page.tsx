/**
 * Maison — Contact page (stub — Phase 1)
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Maison team.',
};

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 1.25rem' }}>
      <p className="eyebrow">Contact</p>
      <h1
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          marginBottom: '1rem',
        }}
      >
        Get in <em style={{ color: '#a86b4a' }}>touch</em>
      </h1>
      <p style={{ color: '#4a433b', marginBottom: '2rem' }}>
        Questions about a piece, a commission, or a trade inquiry? Write to us — we read every
        email.
      </p>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Your name"
          style={{
            padding: '0.75rem',
            border: '1px solid #e5ddd1',
            background: '#ffffff',
            fontSize: 16,
          }}
        />
        <input
          type="email"
          placeholder="Your email"
          style={{
            padding: '0.75rem',
            border: '1px solid #e5ddd1',
            background: '#ffffff',
            fontSize: 16,
          }}
        />
        <textarea
          placeholder="Your message"
          rows={6}
          style={{
            padding: '0.75rem',
            border: '1px solid #e5ddd1',
            background: '#ffffff',
            fontSize: 16,
            resize: 'vertical',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.95rem 1.75rem',
            background: '#a86b4a',
            color: '#faf8f5',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Send Message
        </button>
      </form>

      <p style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#8a8178' }}>
        hello@maison-living.com · Stockholm &amp; Copenhagen · Mon–Fri, 9am–6pm CET
      </p>
    </main>
  );
}
