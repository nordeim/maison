/**
 * Maison — Journal index page (stub — Phase 2)
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Notes on slow living, craft, and the stories behind our makers.',
};

export default function JournalPage() {
  return (
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '5rem 1.25rem' }}>
      <div style={{ marginBottom: '3rem' }}>
        <p className="eyebrow">From the Journal</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 400 }}>
          Notes on <em style={{ color: '#a86b4a' }}>slow living</em>.
        </h1>
      </div>
      <p style={{ color: '#8a8178', textAlign: 'center', padding: '4rem 0' }}>
        Journal articles — Phase 2 (Sanity CMS integration).
      </p>
    </main>
  );
}
