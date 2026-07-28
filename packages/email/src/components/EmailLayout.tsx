/**
 * Maison — Email layout
 *
 * Shared wrapper for all transactional emails.
 * Uses inline styles (email clients don't support external CSS).
 * Brand-aligned: warm cream background, charcoal text, terracotta accents.
 */

import type { ReactNode } from 'react';

interface EmailLayoutProps {
  children: ReactNode;
  preview?: string;
}

export function EmailLayout({ children, preview }: EmailLayoutProps) {
  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        backgroundColor: '#faf8f5',
        color: '#1f1b17',
        margin: 0,
        padding: '40px 20px',
      }}
    >
      {preview ? (
        <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{preview}</div>
      ) : null}
      <table
        align="center"
        width="600"
        cellPadding={0}
        cellSpacing={0}
        style={{
          backgroundColor: '#ffffff',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '40px',
        }}
      >
        <tbody>
          <tr>
            <td>
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '32px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid #e5ddd1',
                }}
              >
                <h1
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '28px',
                    fontWeight: 500,
                    letterSpacing: '0.16em',
                    color: '#1f1b17',
                    margin: 0,
                  }}
                >
                  MAISON
                </h1>
                <p
                  style={{
                    fontFamily: '-apple-system, sans-serif',
                    fontSize: '11px',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: '#8a8178',
                    margin: '8px 0 0',
                  }}
                >
                  Objects of Quiet Beauty
                </p>
              </div>
              {children}
              <div
                style={{
                  marginTop: '40px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e5ddd1',
                  textAlign: 'center',
                  fontFamily: '-apple-system, sans-serif',
                  fontSize: '12px',
                  color: '#8a8178',
                  lineHeight: 1.65,
                }}
              >
                <p style={{ margin: '0 0 8px' }}>Maison Living — Stockholm &amp; Copenhagen</p>
                <p style={{ margin: 0 }}>
                  <a href="https://maison-living.com" style={{ color: '#a86b4a' }}>
                    maison-living.com
                  </a>
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
