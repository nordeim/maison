/**
 * Maison — Global 404 page
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p className="eyebrow">404 — Page not found</p>
      <h1
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 400,
          marginBottom: '1.5rem',
        }}
      >
        This page has <em style={{ color: '#a86b4a' }}>wandered off</em>.
      </h1>
      <p style={{ maxWidth: '48ch', color: '#4a433b', marginBottom: '2rem' }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you
        back to something beautiful.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          padding: '0.95rem 1.75rem',
          background: '#a86b4a',
          color: '#faf8f5',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Return home
      </Link>
    </main>
  );
}
