/**
 * Maison — Default OpenGraph image
 */

import { ImageResponse } from '@vercel/og';

import { site } from '@maison/config';

export const runtime = 'edge';
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #faf8f5 0%, #f3efe8 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
        color: '#1f1b17',
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#a86b4a',
          marginBottom: 24,
        }}
      >
        {site.tagline}
      </div>
      <div style={{ fontSize: 96, fontWeight: 500, letterSpacing: '0.16em' }}>MAISON</div>
      <div
        style={{
          fontSize: 24,
          color: '#4a433b',
          marginTop: 16,
          fontStyle: 'italic',
        }}
      >
        Curated for considered living
      </div>
    </div>,
    { ...size },
  );
}
