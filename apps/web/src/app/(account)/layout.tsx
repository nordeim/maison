/**
 * Maison — Account layout (auth guard — Layer 2)
 *
 * Per PROJECT-ARCHITECTURE.md §6.3: this is the actual security boundary
 * for the account route group. proxy.ts only checks cookie existence
 * (optimistic redirect); this layout validates the session via DB.
 *
 * If no valid session: redirect to /auth/sign-in.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@maison/auth';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/auth/sign-in?callbackUrl=/account');
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.25rem' }}>
      <aside style={{ marginBottom: '2rem' }}>
        <p className="eyebrow">Account</p>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400 }}>
          Hello,{' '}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- users.name is nullable in the DB; Better Auth's inferred type lies here */}
          <em style={{ color: '#a86b4a' }}>{session.user.name ?? session.user.email}</em>
        </h1>
      </aside>

      <nav
        style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '3rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5ddd1',
          flexWrap: 'wrap',
        }}
      >
        <a
          href="/account"
          style={{
            fontSize: '0.875rem',
            color: '#1f1b17',
            borderBottom: '1px solid #1f1b17',
            paddingBottom: '2px',
          }}
        >
          Dashboard
        </a>
        <a href="/account/orders" style={{ fontSize: '0.875rem', color: '#4a433b' }}>
          Orders
        </a>
        <a href="/account/wishlist" style={{ fontSize: '0.875rem', color: '#4a433b' }}>
          Wishlist
        </a>
        <a href="/account/loyalty" style={{ fontSize: '0.875rem', color: '#4a433b' }}>
          Loyalty
        </a>
        <a href="/account/addresses" style={{ fontSize: '0.875rem', color: '#4a433b' }}>
          Addresses
        </a>
        <a href="/account/settings" style={{ fontSize: '0.875rem', color: '#4a433b' }}>
          Settings
        </a>
      </nav>

      {children}
    </div>
  );
}
